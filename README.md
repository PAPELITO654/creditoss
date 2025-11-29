# Créditos Express - PWA

Progressive Web App para gestión de créditos con notificaciones push en tiempo real usando Firebase.

## Descripción

Aplicación web que permite gestionar clientes y cuentas de crédito. Funciona como una app nativa, se puede instalar en cualquier dispositivo y envía notificaciones automáticas cuando hay cambios en la base de datos.

## Características

- Instalable como app nativa
- Funciona sin internet (modo offline)
- Notificaciones push en tiempo real
- Base de datos en tiempo real con Firebase
- Dashboard para gestionar clientes y cuentas

## Configuración de Push Notifications

La app usa Firebase Cloud Messaging para las notificaciones. La configuración está en `js/firebase-config.js` con las credenciales del proyecto Firebase y la VAPID Key para autenticación.

El Service Worker en `firebase-messaging-sw.js` maneja las notificaciones cuando el navegador está cerrado, permitiendo que funcionen en segundo plano.

## Vinculación con Base de Datos

Cuando un usuario activa las notificaciones, se genera un token único (FCM Token) que se guarda en Firestore. Este token permite enviar notificaciones específicas a cada usuario.

El sistema usa listeners de Firestore que detectan cambios automáticamente. Cuando se crea o modifica un cliente o cuenta, se envía una notificación sin necesidad de programarla manualmente.

## Tecnologías

- HTML5, CSS3, JavaScript
- Bootstrap 5
- Firebase (Firestore, Cloud Messaging)
- Service Workers para PWA

## Instalación

1. Clonar el repositorio
2. Configurar Firebase en `js/firebase-config.js`
3. Activar Firestore Database en Firebase Console
4. Generar VAPID Key en Firebase Cloud Messaging
5. Servir con cualquier servidor web (XAMPP, Apache, etc.)

## Uso

Abrir la aplicación, hacer clic en "Activar Notificaciones Push" y aceptar el permiso. Luego usar el dashboard para crear clientes y cuentas. Las notificaciones se envían automáticamente.



