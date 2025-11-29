/**
 * 💾 FIREBASE DATABASE - OPERACIONES CRUD
 * 
 * Este archivo contiene todas las funciones para interactuar con Firestore.
 * Incluye operaciones CRUD para los módulos de Clientes y Cuentas.
 */

// ============================================
// 👥 MÓDULO 1: CLIENTES
// ============================================

/**
 * Obtener todos los clientes en tiempo real
 * @param {function} callback - Función que se ejecuta cada vez que hay cambios
 */
window.obtenerClientesEnTiempoReal = function (callback) {
    console.log('👥 Escuchando cambios en clientes...');

    if (!window.db) {
        console.error('❌ Error: Firestore (window.db) no está inicializado.');
        if (callback) callback([]);
        return;
    }

    let primeraCarga = true;

    return db.collection('clientes').onSnapshot((snapshot) => {
        const clientes = [];
        snapshot.forEach((doc) => {
            clientes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Clientes obtenidos: ${clientes.length}`);
        if (callback) callback(clientes);

        // 🔔 Lógica de Notificaciones Automáticas
        if (primeraCarga) {
            primeraCarga = false;
            return;
        }

        snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            if (change.type === 'added') {
                if (window.enviarNotificacion) {
                    window.enviarNotificacion({
                        titulo: '🎉 Nuevo Cliente Registrado',
                        cuerpo: `${data.nombreCliente} se ha unido al sistema`,
                        icono: 'icons/icon-192x192.png',
                        tag: 'nuevo-cliente',
                        data: { url: '/creditoss/' }
                    });
                }
            } else if (change.type === 'modified') {
                if (window.enviarNotificacion) {
                    window.enviarNotificacion({
                        titulo: '✏️ Cliente Actualizado',
                        cuerpo: `Datos actualizados para ${data.nombreCliente}`,
                        icono: 'icons/icon-192x192.png',
                        tag: 'cliente-actualizado',
                        data: { url: '/creditoss/' }
                    });
                }
            }
        });
    }, (error) => {
        console.error('❌ Error al obtener clientes en tiempo real:', error);
        if (callback) callback([]);
        if (error.code === 'permission-denied') {
            console.warn('⚠️ Permiso denegado para acceder a clientes.');
        }
    });
};

/**
 * Crear un nuevo cliente
 * @param {object} clienteData - Datos del cliente {nombreCliente, numero}
 */
window.crearCliente = async function (clienteData) {
    try {
        console.log('➕ Creando nuevo cliente:', clienteData);

        const docRef = await db.collection('clientes').add({
            nombreCliente: clienteData.nombreCliente,
            numero: parseInt(clienteData.numero),
            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
            activo: true
        });

        console.log('✅ Cliente creado con ID:', docRef.id);
        // La notificación se maneja automáticamente en el listener obtenerClientesEnTiempoReal
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error al crear cliente:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Actualizar un cliente existente
 * @param {string} clienteId - ID del cliente
 * @param {object} nuevosDatos - Nuevos datos {nombreCliente?, numero?}
 */
window.actualizarCliente = async function (clienteId, nuevosDatos) {
    try {
        console.log(`✏️ Actualizando cliente ${clienteId}:`, nuevosDatos);

        const updateData = {
            ...nuevosDatos,
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (updateData.numero) {
            updateData.numero = parseInt(updateData.numero);
        }

        await db.collection('clientes').doc(clienteId).update(updateData);

        console.log('✅ Cliente actualizado exitosamente');
        return { success: true };
    } catch (error) {
        console.error('❌ Error al actualizar cliente:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Eliminar un cliente
 * @param {string} clienteId - ID del cliente a eliminar
 */
window.eliminarCliente = async function (clienteId) {
    try {
        console.log(`🗑️ Eliminando cliente ${clienteId}...`);

        // Primero eliminar todas las subcuentas
        const cuentasSnapshot = await db.collection('clientes').doc(clienteId).collection('cuentas').get();
        const batch = db.batch();
        cuentasSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Luego eliminar el cliente
        await db.collection('clientes').doc(clienteId).delete();

        console.log('✅ Cliente eliminado exitosamente');
        return { success: true };
    } catch (error) {
        console.error('❌ Error al eliminar cliente:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// 💳 MÓDULO 2: CUENTAS
// ============================================

/**
 * Obtener cuentas de un cliente en tiempo real
 * @param {string} clienteId - ID del cliente
 * @param {function} callback - Función que se ejecuta cada vez que hay cambios
 */
window.obtenerCuentasEnTiempoReal = function (clienteId, callback) {
    console.log(`💳 Escuchando cambios en cuentas del cliente ${clienteId}...`);
    let primeraCarga = true;

    return db.collection('clientes').doc(clienteId).collection('cuentas')
        .orderBy('fechaHora', 'desc')
        .onSnapshot((snapshot) => {
            const cuentas = [];
            snapshot.forEach((doc) => {
                cuentas.push({
                    id: doc.id,
                    clienteId: clienteId,
                    ...doc.data()
                });
            });

            console.log(`✅ Cuentas obtenidas: ${cuentas.length}`);
            callback(cuentas);

            // 🔔 Lógica de Notificaciones Automáticas
            if (primeraCarga) {
                primeraCarga = false;
                return;
            }

            snapshot.docChanges().forEach((change) => {
                const data = change.doc.data();
                if (change.type === 'added') {
                    if (window.enviarNotificacion) {
                        window.enviarNotificacion({
                            titulo: '💰 Nueva Transacción',
                            cuerpo: `Monto: $${data.monto} (${data.tipo})`,
                            icono: 'icons/icon-192x192.png',
                            tag: 'nueva-cuenta',
                            data: { clienteId: clienteId, cuentaId: change.doc.id }
                        });
                    }
                }
            });

        }, (error) => {
            console.error('❌ Error al obtener cuentas:', error);
        });
};

/**
 * Obtener TODAS las cuentas de TODOS los clientes
 * @param {function} callback - Función que se ejecuta cada vez que hay cambios
 */
window.obtenerTodasLasCuentas = async function (callback) {
    console.log('💳 Obteniendo todas las cuentas...');
    // Esta función es más compleja para tiempo real global sin backend, 
    // por simplicidad usamos la implementación bajo demanda o iterativa.
    try {
        const clientesSnapshot = await db.collection('clientes').get();
        const todasLasCuentas = [];

        for (const clienteDoc of clientesSnapshot.docs) {
            const cuentasSnapshot = await clienteDoc.ref.collection('cuentas').get();

            cuentasSnapshot.forEach((cuentaDoc) => {
                todasLasCuentas.push({
                    id: cuentaDoc.id,
                    clienteId: clienteDoc.id,
                    nombreCliente: clienteDoc.data().nombreCliente,
                    ...cuentaDoc.data()
                });
            });
        }

        console.log(`✅ Total de cuentas obtenidas: ${todasLasCuentas.length}`);
        callback(todasLasCuentas);
        return todasLasCuentas;
    } catch (error) {
        console.error('❌ Error al obtener todas las cuentas:', error);
        return [];
    }
};

/**
 * Crear una nueva cuenta para un cliente
 * @param {string} clienteId - ID del cliente
 * @param {object} cuentaData - Datos de la cuenta {monto}
 */
window.crearCuenta = async function (clienteId, cuentaData) {
    try {
        console.log(`➕ Creando nueva cuenta para cliente ${clienteId}:`, cuentaData);

        const docRef = await db.collection('clientes').doc(clienteId).collection('cuentas').add({
            monto: parseFloat(cuentaData.monto),
            fechaHora: firebase.firestore.FieldValue.serverTimestamp(),
            tipo: cuentaData.tipo || 'deposito'
        });

        console.log('✅ Cuenta creada con ID:', docRef.id);
        // La notificación se maneja automáticamente en el listener
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error al crear cuenta:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Actualizar una cuenta existente
 * @param {string} clienteId - ID del cliente
 * @param {string} cuentaId - ID de la cuenta
 * @param {object} nuevosDatos - Nuevos datos {monto?, tipo?}
 */
window.actualizarCuenta = async function (clienteId, cuentaId, nuevosDatos) {
    try {
        console.log(`✏️ Actualizando cuenta ${cuentaId} del cliente ${clienteId}:`, nuevosDatos);

        const updateData = { ...nuevosDatos };

        if (updateData.monto) {
            updateData.monto = parseFloat(updateData.monto);
        }

        await db.collection('clientes').doc(clienteId).collection('cuentas').doc(cuentaId).update(updateData);

        console.log('✅ Cuenta actualizada exitosamente');
        return { success: true };
    } catch (error) {
        console.error('❌ Error al actualizar cuenta:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Eliminar una cuenta
 * @param {string} clienteId - ID del cliente
 * @param {string} cuentaId - ID de la cuenta a eliminar
 */
window.eliminarCuenta = async function (clienteId, cuentaId) {
    try {
        console.log(`🗑️ Eliminando cuenta ${cuentaId} del cliente ${clienteId}...`);

        await db.collection('clientes').doc(clienteId).collection('cuentas').doc(cuentaId).delete();

        console.log('✅ Cuenta eliminada exitosamente');
        return { success: true };
    } catch (error) {
        console.error('❌ Error al eliminar cuenta:', error);
        return { success: false, error: error.message };
    }
};

// ============================================
// 📊 FUNCIONES DE UTILIDAD
// ============================================

/**
 * Obtener estadísticas generales
 */
window.obtenerEstadisticas = async function () {
    try {
        const clientesSnapshot = await db.collection('clientes').get();
        let totalCuentas = 0;
        let totalMonto = 0;

        for (const clienteDoc of clientesSnapshot.docs) {
            const cuentasSnapshot = await clienteDoc.ref.collection('cuentas').get();
            totalCuentas += cuentasSnapshot.size;

            cuentasSnapshot.forEach((cuentaDoc) => {
                totalMonto += cuentaDoc.data().monto || 0;
            });
        }

        return {
            totalClientes: clientesSnapshot.size,
            totalCuentas: totalCuentas,
            totalMonto: totalMonto
        };
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        return null;
    }
};

console.log('✅ Módulo firebase-db.js cargado correctamente');
