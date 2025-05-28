import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WompiTokenRequest {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface WompiTokenResponse {
  id: string;
  created_at: string;
  brand: string;
  name: string;
  last_four: string;
  bin: string;
  exp_year: string;
  exp_month: string;
  card_holder: string;
  expires_at: string;
}

export interface WompiTransactionRequest {
  amount: number; // En centavos según especificaciones
  currency: string;
  customerEmail: string;
  reference: string;
  paymentSourceId: string;
  sessionId?: string;
}

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;
  private readonly eventsKey: string;

  constructor(private readonly configService: ConfigService) {
    // ✅ API Keys exactas del test según search result [1]
    this.baseUrl =
      this.configService.get('WOMPI_API_URL');
    this.publicKey =
      this.configService.get('WOMPI_PUBLIC_KEY');
    this.privateKey =
      this.configService.get('WOMPI_PRIVATE_KEY');
    this.integrityKey =
      this.configService.get('WOMPI_INTEGRITY_KEY');
    this.eventsKey =
      this.configService.get('WOMPI_EVENTS_KEY');

    this.logger.log(
      'WompiService initialized with fetch() API according to test specifications',
    );
  }

  // ✅ 1. Tokenizar tarjeta según documentación oficial POST /v1/tokens/cards
  async tokenizeCard(data: WompiTokenRequest): Promise<{
    success: boolean;
    data?: WompiTokenResponse;
    error?: string;
  }> {
    try {
      this.logger.log(`🔒 Tokenizing card for holder: ${data.cardHolder}`);

      const payload = {
        number: data.cardNumber.replace(/\s/g, ''), // Remover espacios
        cvc: data.cvv,
        exp_month: data.expiryMonth.padStart(2, '0'), // String de 2 dígitos
        exp_year: data.expiryYear, // 2 dígitos según documentación
        card_holder: data.cardHolder.trim(),
      };

      console.log(payload);

      this.logger.log('📤 Sending tokenization request to Wompi...');

      // ✅ Usar fetch() directamente según search result [2]
      const response = await fetch(`${this.baseUrl}/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`, // ✅ LLAVE PÚBLICA para tokenización
          'User-Agent': 'WompiTestApp/1.0.0',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response) {
        this.logger.error(
          `❌ Tokenization failed: ${responseData.error?.reason}`,
        );
        return {
          success: false,
          error: responseData.error?.reason || 'Tokenization failed',
        };
      }

      this.logger.log(
        `✅ Card tokenized successfully: ${responseData.data?.id}`,
      );

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      this.logger.error(`❌ Error tokenizing card: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ✅ 2. Crear transacción según search result [2]
  async createTransaction(data: WompiTransactionRequest): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      this.logger.log(
        `💳 Creating Wompi transaction: ${data.reference} - Amount: ${data.amount / 100} pesos`,
      );


      const responseKey = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WompiTestApp/1.0.0',
        },
      });

      const keysPrivate = await responseKey.json();

      const presigned_acceptance = keysPrivate?.data?.presigned_acceptance?.acceptance_token;

      const presigned_personal_data_auth =  keysPrivate?.data?.presigned_personal_data_auth?.acceptance_token;

      /* var cadenaConcatenada =
        'sk8-438k4-xmxm392-sn2m2490000COPprod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6'; */

      const cadenaConcatenada = `${data?.reference}${data?.amount}${data?.currency}${this.integrityKey}`;
      //Ejemplo
      const encondedText = new TextEncoder().encode(cadenaConcatenada);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      console.log(hashHex);

      const payload = {
        amount_in_cents: data.amount,
        currency: data.currency || 'COP',
        customer_email: data.customerEmail,
        reference: data.reference,
        signature: hashHex,
        acceptance_token:presigned_acceptance,
        accept_personal_auth:presigned_personal_data_auth,
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: data.paymentSourceId, // ✅ Usar token
        },
      };

      console.log(payload);

      // ✅ Usar fetch() directamente según search result [2]
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`, // ✅ LLAVE PRIVADA para transacciones
          'User-Agent': 'WompiTestApp/1.0.0',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log(responseData?.error?.messages);

      if (!response.ok) {
        this.logger.error(
          `❌ Transaction creation failed: ${responseData.error?.reason}`,
        );
        return {
          success: false,
          error: responseData.error?.reason || 'Transaction creation failed',
        };
      }

      this.logger.log(
        `✅ Wompi transaction created: ${responseData.data.id} - Status: ${responseData.data.status}`,
      );

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      this.logger.error(`❌ Transaction creation error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ✅ 3. Método combinado para compatibilidad con código existente
  async createPaymentSource(data: {
    cardNumber: string;
    cardHolder: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    customerEmail: string;
  }): Promise<{
    success: boolean;
    data?: { id: string; [key: string]: any };
    error?: string;
  }> {
    try {
      this.logger.log(
        `🔄 Creating payment source (tokenization) for: ${data.customerEmail}`,
      );

      // ✅ Tokenizar la tarjeta
      const tokenResult = await this.tokenizeCard({
        cardNumber: data.cardNumber,
        cardHolder: data.cardHolder,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
      });

      if (!tokenResult.success || !tokenResult.data) {
        return {
          success: false,
          error: `Tokenization error: ${tokenResult.error}`,
        };
      }

      // ✅ Devolver el token como "payment source" para compatibilidad
      return {
        success: true,
        data: {
          id: tokenResult.data.id, // El token ES la "payment source"
          type: 'TOKEN',
          brand: tokenResult.data.brand,
          last_four: tokenResult.data.last_four,
          card_holder: tokenResult.data.card_holder,
          expires_at: tokenResult.data.expires_at,
        },
      };
    } catch (error) {
      this.logger.error(
        `❌ Error in payment source creation: ${error.message}`,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ✅ 4. Verificar estado de transacción
  async getTransactionStatus(transactionId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      this.logger.log(`🔍 Getting transaction status for: ${transactionId}`);

      const response = await fetch(
        `${this.baseUrl}/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
            'User-Agent': 'WompiTestApp/1.0.0',
          },
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error?.reason || 'Failed to get transaction',
        };
      }

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ✅ Métodos de utilidad según search result [2]
  detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'unknown' {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleanNumber)) {
      return 'visa';
    }

    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
      return 'mastercard';
    }

    return 'unknown';
  }

  validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (
      !/^\d+$/.test(cleanNumber) ||
      cleanNumber.length < 13 ||
      cleanNumber.length > 19
    ) {
      return false;
    }

    // Algoritmo de Luhn
    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  formatAmountToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  formatAmountFromCents(amountInCents: number): number {
    return amountInCents / 100;
  }

  getPublicConfig(): {
    publicKey: string;
    baseUrl: string;
    jsLibraryUrl: string;
  } {
    return {
      publicKey: this.publicKey,
      baseUrl: this.baseUrl,
      jsLibraryUrl: 'https://cdn.wompi.co/libs/js/v1.js',
    };
  }
}
