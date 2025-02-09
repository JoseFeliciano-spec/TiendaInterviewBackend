# Sistema de Gestión de Inventario en NestJS (FeliInventory)

**Enlace de la API:** [https://feliinventorybackend.onrender.com](https://feliinventorybackend.onrender.com)
**Enlace de la DOCUMENTACIÓN DE SWAGGER:** [https://feliinventorybackend.onrender.com/docs](https://feliinventorybackend.onrender.com/docs)

## Descripción

Un sistema robusto de gestión de inventario construido con NestJS, diseñado para manejar la gestión de productos, movimientos de stock y notificaciones de bajo stock. El sistema ayuda a los administradores a mantener registros precisos del inventario con características como validación de SKU único, seguimiento de movimientos de stock y notificaciones automatizadas para situaciones de bajo stock.

## Características

- **Gestión de Productos**
  - Crear, leer, actualizar y eliminar productos
  - Validación de SKU único
  - Seguimiento de stock
  
- **Control de Movimientos de Stock**
  - Seguimiento de entradas y salidas de inventario
  - Actualizaciones automáticas de stock
  - Prevención de reducciones inválidas de stock
  
- **Notificaciones de Stock Bajo**
  - Alertas automatizadas para stock bajo (5 unidades o menos)
  - Sistema de notificaciones basado en eventos
  - Registro de notificaciones

## Endpoints de la API

### Productos

#### Crear Producto
- **POST** `/v1/products`
  - Crea un nuevo producto con SKU único
  - Cuerpo de la Solicitud:
    ```json
    {
      "name": "Laptop Dell XPS 13",
      "sku": "DELL-XPS13-2024",
      "price": 1299.99,
      "stock": 50
    }
    ```
  - Respuestas:
    - 201: Producto creado exitosamente
    - 409: SKU ya existe

#### Obtener Todos los Productos
- **GET** `/v1/products`
  - Recupera todos los productos
  - Respuesta: 200 OK con lista de productos

#### Actualizar Producto
- **PUT** `/v1/products/{id}`
  - Actualiza un producto existente
  - Cuerpo de la Solicitud:
    ```json
    {
      "id": "605c72e1582d32001520b451",
      "name": "Laptop Dell XPS 13",
      "sku": "DELL-XPS13-2024",
      "price": 1299.99,
      "stock": 50
    }
    ```
  - Respuesta: 200 OK

#### Eliminar Producto
- **DELETE** `/v1/products/{id}`
  - Elimina un producto
  - Respuesta: 200 OK

### Movimientos de Stock

#### Crear Movimiento de Stock
- **POST** `/v1/stock-movements`
  - Registra entrada o salida de stock
  - Cuerpo de la Solicitud:
    ```json
    {
      "productId": "507f1f77bcf86cd799439011",
      "type": "entrada",
      "quantity": 50
    }
    ```
  - Respuestas:
    - 201: Movimiento registrado exitosamente
    - 400: Stock insuficiente para movimiento de salida

#### Obtener Todos los Movimientos
- **GET** `/v1/stock-movements`
  - Lista todos los movimientos de stock
  - Respuesta: 200 OK con lista de movimientos

#### Obtener Movimiento Individual
- **GET** `/v1/stock-movements/{id}`
  - Recupera detalles de un movimiento específico
  - Respuesta: 200 OK

#### Actualizar Movimiento
- **PUT** `/v1/stock-movements/{id}`
  - Actualiza detalles del movimiento
  - Cuerpo de la Solicitud:
    ```json
    {
      "productId": "507f1f77bcf86cd799439011",
      "type": "entrada",
      "quantity": 50
    }
    ```
  - Respuesta: 200 OK

#### Eliminar Movimiento
- **DELETE** `/v1/stock-movements/{id}`
  - Elimina registro de movimiento
  - Respuesta: 200 OK

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
   - Activa notificación cuando el stock llega a ≤ 5 unidades
   - Se emite evento de dominio para situaciones de stock bajo
   - Las notificaciones se registran en la tabla `notificaciones`

## Requisitos Técnicos

- Node.js
- NestJS
- MongoDB
- TypeScript

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/gestion-inventario.git
   ```

2. Instalar dependencias:
   ```bash
   cd gestion-inventario
   npm install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env` con las configuraciones necesarias
      ```bash
     KEY_MONGO = <TU CLAVE DE MONGO>
    JWT_SECRET = todo-lis
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

La documentación de la API está disponible en `/docs` cuando la aplicación está en ejecución.

## Contribuir

1. Haz un fork del repositorio
2. Crea tu rama de características
3. Haz commit de tus cambios
4. Haz push a la rama
5. Crea un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
