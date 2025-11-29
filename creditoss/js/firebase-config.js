/**
 * 🔥 CONFIGURACIÓN DE FIREBASE
 * 
 * Este archivo contiene la configuración de Firebase para el proyecto Créditos Express.
 * Aquí inicializamos Firestore (base de datos) y Cloud Messaging (notificaciones).
 */

// ============================================
// 📝 PASO 1: Configuración de Firebase
// ============================================
// NOTA: Reemplazarás este objeto con TU configuración de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyASAYKw1zzg82qhbW9aP3FOO5P1XsXC3sk",
  authDomain: "creditos-d0fee.firebaseapp.com",
  projectId: "creditos-d0fee",
  storageBucket: "creditos-d0fee.firebasestorage.app",
  messagingSenderId: "121632110240",
  appId: "1:121632110240:web:2ce1408dc14797026afbc5",
  measurementId: "G-DVJNRER492"
};

// ============================================
// 🚀 PASO 2: Inicializar Firebase
// ============================================
console.log('🔥 Inicializando Firebase...');

// Inicializar la app de Firebase
const app = firebase.initializeApp(firebaseConfig);
console.log('✅ Firebase App inicializada:', app.name);

// ============================================
// 💾 PASO 3: Inicializar Firestore Database
// ============================================
const db = firebase.firestore();
console.log('✅ Firestore Database conectada');

// Configuración adicional de Firestore (opcional)
// Habilitar persistencia offline
db.enablePersistence()
  .then(() => {
    console.log('✅ Persistencia offline habilitada');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Persistencia solo funciona en una pestaña a la vez');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ El navegador no soporta persistencia offline');
    }
  });

// ============================================
// 🔔 PASO 4: Inicializar Cloud Messaging
// ============================================
const messaging = firebase.messaging();
console.log('✅ Firebase Cloud Messaging inicializado');

// VAPID Key (la obtendremos después de la consola Firebase)
const VAPID_KEY = 'BOHC1jOyOOVYoD_dKIJ29SgZGYJQxobPJJwTPjDB_FbOQEiFyLh2YAkP5xkcX3MqsDLduicB7X197LOjF4-UOug';

// ============================================
// 🎯 PASO 5: Exportar instancias para uso global
// ============================================
window.firebaseApp = app;
window.db = db;
window.messaging = messaging;
window.VAPID_KEY = VAPID_KEY;

console.log('🎉 Firebase completamente configurado y listo para usar!');

// ============================================
// 🔍 Función de utilidad: Verificar conexión
// ============================================
window.verificarConexionFirebase = async function () {
  try {
    // Intentar leer un documento de prueba
    const testDoc = await db.collection('_test').doc('connection').get();
    console.log('✅ Conexión a Firebase Firestore: EXITOSA');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Firebase:', error);
    return false;
  }
};

// ============================================
// 📊 Estado de Firebase
// ============================================
window.estadoFirebase = function () {
  console.log('📊 Estado de Firebase:');
  console.log('  - App:', window.firebaseApp ? '✅ Inicializada' : '❌ No inicializada');
  console.log('  - Firestore:', window.db ? '✅ Conectada' : '❌ No conectada');
  console.log('  - Messaging:', window.messaging ? '✅ Listo' : '❌ No disponible');
  console.log('  - VAPID Key:', window.VAPID_KEY !== 'TU_VAPID_KEY_AQUI' ? '✅ Configurada' : '⚠️ Pendiente');
};
