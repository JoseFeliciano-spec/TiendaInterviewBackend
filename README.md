# Proyecto de Gestión de Tareas en NestJS (FELITAKS)

**Enlace de la API:** [https://todo-backend-nest-jjq1.onrender.com](https://todo-backend-nest-jjq1.onrender.com)
**Enlace de la DOCUMENTACIÓN DE SWAGGER:** [https://todo-backend-nest-jjq1.onrender.com](https://todo-backend-nest-jjq1.onrender.com/docs)

## Descripción

Este proyecto es una API de gestión de tareas construida con **NestJS**, diseñada para ofrecer funcionalidades básicas de creación, actualización, eliminación y consulta de tareas. El objetivo de este sistema es facilitar a los usuarios la organización de sus tareas, permitiendo asignarles estados y fechas de vencimiento. La API sigue el enfoque de arquitectura limpia y utiliza prácticas recomendadas para garantizar la escalabilidad y mantenibilidad del código.

## Características

- **Registro de Usuarios**: Permite la creación de nuevos usuarios con validación de datos.
- **Autenticación**: Implementa un sistema de inicio de sesión que asegura el acceso a los recursos protegidos.
- **Gestión de Tareas**: Permite crear, leer, actualizar y eliminar tareas.
- **Validaciones**: Utiliza `class-validator` para garantizar que los datos enviados en las solicitudes cumplan con los requisitos establecidos.

## Endpoints

#### Registro de Usuario

- **POST** `/v1/user/register`
  - **Descripción**: Crea un nuevo usuario en el sistema.
  - **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "name": "John Doe",
      "password": "yourpassword"
    }
    ```
  - **Response**:
    - **201**: Usuario creado exitosamente.
    - **400**: Error en la creación del usuario.

#### Inicio de Sesión

- **POST** `/v1/user/login`
  - **Descripción**: Inicia sesión de un usuario existente.
  - **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "yourpassword"
    }
    ```
  - **Response**:
    - **200**: Inicio de sesión exitoso.
    - **401**: Credenciales inválidas.

#### Gestión de Tareas

- **POST** `/tasks`
  - **Descripción**: Crear una nueva tarea.
  - **Request Body**:
    ```json
    {
      "title": "Hacer la compra",
      "description": "Comprar frutas y verduras",
      "status": "pending",
      "dueDate": "2024-10-30T12:00:00Z"
    }
    ```
  - **Response**:
    - **201**: Tarea creada exitosamente.
    - **400**: Error en la creación de la tarea.

- **GET** `/tasks`
  - **Descripción**: Listar todas las tareas del usuario autenticado.
  - **Response**:
    - **200**: Retorna una lista de tareas.

- **GET** `/tasks/:id`
  - **Descripción**: Ver los detalles de una tarea específica.
  - **Response**:
    - **200**: Retorna los detalles de la tarea especificada.
    - **404**: Tarea no encontrada.

- **PUT** `/tasks/:id`
  - **Descripción**: Editar una tarea.
  - **Request Body**:
    ```json
    {
      "title": "Hacer la compra",
      "description": "Comprar frutas y verduras y lácteos",
      "status": "in-progress",
      "dueDate": "2024-10-30T12:00:00Z"
    }
    ```
  - **Response**:
    - **200**: Tarea actualizada exitosamente.
    - **400**: Error en la actualización de la tarea.

- **DELETE** `/tasks/:id`
  - **Descripción**: Eliminar una tarea.
  - **Response**:
    - **204**: Tarea eliminada exitosamente.
    - **400**: Error en la eliminación de la tarea.
    - **404**: Tarea no encontrada.

## Variables de Entorno

Para ejecutar el proyecto, es necesario configurar las siguientes variables de entorno en un archivo `.env` en la raíz del proyecto:

```plaintext
JWT_SECRET=todo-list
KEY_MONGO=Prueba
 ```

# Proyecto de Gestión de Tareas

Este proyecto utiliza NestJS para la gestión de la autenticación y la conexión a la base de datos MongoDB. Asegúrate de tener configurado tu entorno de desarrollo para utilizar las variables de entorno correctamente.

## Requisitos

- Node.js >= 14.x
- NestJS >= 8.x
- MongoDB o cualquier base de datos compatible

## Instalación

1. Clona el repositorio:

   ```bash
     git clone https://github.com/tu-usuario/tu-repositorio.git
    ```

2. Instala las dependencias:

   ```'bash
     cd tu-repositorio
     npm install
    ```

3. Configura las variables de entorno en un archivo '.env'.

4. Inicia la aplicación:

   ```bash
   npm run start
   ```

## Conclusión

Este proyecto de gestión de tareas es un buen ejemplo de cómo construir aplicaciones escalables y mantenibles usando NestJS. La implementación puede servir como base para desarrollos futuros y ampliaciones de funcionalidades.
