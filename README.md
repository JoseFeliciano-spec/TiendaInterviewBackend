## TiendaInterviewBackend

**Enlace de la API:** [https://tiendainterviewbackend.onrender.com](https://tiendainterviewbackend.onrender.com)
**Enlace de la DOCUMENTACIÓN DE SWAGGER:** [https://tiendainterviewbackend.onrender.com/docs](https://tiendainterviewbackend.onrender.com/docs)

## Descripción

Un sistema robusto de gestión de un ecommerce con transacciones construido con NestJS, diseñado para manejar la gestión de productos, movimientos de stock y notificaciones de bajo stock. El sistema ayuda a los administradores a mantener registros precisos del inventario con características como validación de SKU único, seguimiento de movimientos de stock y notificaciones automatizadas para situaciones de bajo stock.

## Características

- **Gestión de Productos**
  - Ver productos
  - Seguimiento de stock
  
- **Control de Movimientos de Stock**
  - Seguimiento de entradas y salidas de inventario junto con sus transacciones con métodos de PAGO
  - Actualizaciones automáticas de stock
  - Prevención de reducciones inválidas de stock
  
- **Notificaciones de Stock Bajo**
  - Alertas automatizadas para stock bajo (5 unidades o menos)
  - Sistema de notificaciones basado en eventos
  - Registro de notificaciones

## Estructura de Carpetas

El proyecto sigue una arquitectura modular, con una clara separación de responsabilidades, inspirada en parte por Domain-Driven Design (DDD). A continuación, se describe la estructura principal del directorio `src`:

- `src/`: Contiene todo el código fuente de la aplicación.
  - `main.ts`: El punto de entrada de la aplicación. Inicializa el servidor NestJS y configura módulos globales.
  - `app.module.ts`: El módulo raíz de la aplicación que importa otros módulos de características.
  - `context/`: Esta es la carpeta principal que organiza la lógica de negocio en diferentes dominios o contextos.
    - `auth/`: Contiene toda la lógica relacionada con la autenticación y autorización de usuarios.
      - `application/`: Casos de uso o servicios de aplicación.
      - `domain/`: Entidades, modelos de dominio, y lógica de negocio central para la autenticación.
      - `infrastructure/`: Controladores (endpoints HTTP), DTOs, guards, strategies (JWT), y adaptadores para la capa de autenticación.
    - `product/`: Contiene toda la lógica relacionada con la gestión de productos.
      - `application/`: Casos de uso para productos (crear, leer, actualizar, eliminar).
      - `domain/`: Entidades de producto, lógica de negocio específica de productos.
      - `infrastructure/`: Controladores, DTOs, y posiblemente repositorios o adaptadores para productos.
    - `shared/`: Módulos, utilidades, o código que es compartido entre diferentes contextos/dominios.
      - `guards/`: Guards de autenticación globales o compartidos.
      - `response/`: Estructuras de respuesta estandarizadas.
- `test/`: Contiene los archivos de pruebas.
  - `app.e2e-spec.ts`: Pruebas end-to-end para la aplicación.
  - `jest-e2e.json`: Configuración de Jest para pruebas e2e.
- `package.json`: Define los metadatos del proyecto, scripts (npm run start, test, etc.) y dependencias.
- `nest-cli.json`: Archivo de configuración para NestJS CLI.
- `.env` (No versionado): Archivo para almacenar variables de entorno locales (debe ser creado a partir de `.env.example` o las instrucciones del README).

## Reglas de Negocio

1. **Registro de Productos**
   - Cada producto debe tener un SKU único
   - Campos requeridos: SKU, nombre, precio, stock inicial
   - SKUs duplicados resultan en respuesta 409 Conflict

2. **Movimiento de Stock**
   - Todos los movimientos de entrada y salida deben ser registrados
   - Las salidas de stock requieren stock suficiente disponible
   - El stock del producto se actualiza automáticamente con los movimientos
   - Reducciones inválidas de stock retornan 400 Bad Request

3. **Notificaciones de Stock Bajo**
   - El sistema monitorea niveles de stock continuamente
   - Se emite evento de dominio para situaciones de stock bajo
   - Las notificaciones se registran en la tabla `notificaciones`

## Requisitos Técnicos

- Node.js
- NestJS
- PostgreSQL
- TypeScript

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/JoseFeliciano-spec/FeliInventoryBackend
   ```

2. Instalar dependencias:
   ```bash
   cd FeliInventoryBackend
   npm install
   npx prisma generate -> Correr migraciones
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env` con las configuraciones necesarias
      ```env
      JWT_SECRET=your_strong_secret_here # IMPORTANTE: Cambia esto por una cadena aleatoria segura y única.
      WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
      WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOasdsdasdt7
      WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsnyasdasdasd7Y37tKqFWg
      WOMPI_INTEGRITY_KEY=stagtest_integrity_asdasdasdasdnAIBuqayW70XpUqJS4qf4STYiISd89Fp
      WOMPI_EVENTS_KEY=stagtest_events_2PDUmhMywUkvb1LvxYnayFasdasdbmofT7wasdasdasd39N
      DATABASE_URL="postgresql://postgres:postgresgatohd@<host>/tiendadb?schema=public"
      ```

5. Iniciar la aplicación:
   ```bash
   npm run start
   ```

## Pruebas

Ejecutar suite de pruebas:
```bash
npm run test
```

## Documentación

La documentación detallada de la API, generada con Swagger, está disponible en [https://tiendainterviewbackend.onrender.com/docs](https://tiendainterviewbackend.onrender.com/docs) cuando la aplicación está en ejecución, o en el enlace proporcionado en la parte superior de este README.

## Contribuir

1. Haz un fork del repositorio
2. Crea tu rama de características
3. Haz commit de tus cambios
4. Haz push a la rama
5. Crea un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
