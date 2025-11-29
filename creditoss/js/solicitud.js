(function(){
  // Utilidad: mostrar alertas
  function showAlert(msg, type='info'){
    let box = document.getElementById('solicitudInfo');
    if(!box){
      box = document.createElement('div');
      box.id = 'solicitudInfo';
      box.className = `alert alert-${type}`;
      const container = document.querySelector('#solicitar .container, main .container') || document.body;
      container.insertBefore(box, container.firstChild);
    }
    box.className = `alert alert-${type}`;
    box.textContent = msg;
  }
  function showSuccessToast(message){
    try{
      var toastEl = document.getElementById('solicitudToast');
      if (!toastEl) return; // si no existe el toast en esta página, no hacer nada
      var body = toastEl.querySelector('.toast-body');
      if (body) body.textContent = message;
      var toast = new (window.bootstrap && window.bootstrap.Toast ? window.bootstrap.Toast : function(){ return { show: function(){} }; })(toastEl, { delay: 4000 });
      if (toast && typeof toast.show === 'function') toast.show();
    }catch(e){ /* noop */ }
  }

  async function getJSON(url){
    const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    return res.json();
  }
  async function postJSON(url, data){
    const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data), credentials: 'same-origin', cache: 'no-store' });
    const json = await res.json().catch(()=>({ error: 'Respuesta inválida' }));
    if (!res.ok) {
      json.status = res.status;
    }
    return json;
  }

  async function submitSolicitud(e){
    e.preventDefault();
    const formEl = e.target.closest('form');
    const submitBtn = formEl ? formEl.querySelector('button[type="submit"]') : null;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; }

    // No forzar login: proceder aun sin sesión
    try{
      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const tipo_credito = document.getElementById('tipo_credito').value;
      const monto = parseFloat(document.getElementById('monto').value);
      const ingresos_mensuales = document.getElementById('ingresos_mensuales').value;
      const motivo = document.getElementById('motivo') ? document.getElementById('motivo').value.trim() : '';

      if (!nombre || !email || !telefono || !tipo_credito || isNaN(monto) || !ingresos_mensuales){
        showAlert('Completa todos los campos del formulario', 'warning');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Solicitar Crédito'; }
        return;
      }

      const r = await postJSON('api/solicitudes.php', {
        nombre, email, telefono, tipo_credito, monto, ingresos_mensuales, motivo
      });
      if (r && r.ok){
        showAlert('Solicitud enviada correctamente. Te notificaremos al ser aceptada.', 'success');
        showSuccessToast('Tu solicitud fue enviada con éxito.');
        if (formEl) { formEl.reset(); }
      } else {
        // Si por alguna razón devuelve 401, sugerir login pero NO bloquear
        if (r && (r.status === 401 || r.error === 'No autenticado')) {
          showAlert('Para ver el estado, inicia sesión.', 'info');
        } else {
          showAlert((r && r.error) || 'No se pudo enviar la solicitud', 'danger');
        }
      }
    }catch(e){
      showAlert('Error de red al enviar la solicitud', 'danger');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Solicitar Crédito'; }
    }
  }

  document.addEventListener('DOMContentLoaded', async function(){
    const form = document.querySelector('#solicitar form.custom-form');
    if (form){
      form.addEventListener('submit', submitSolicitud);
    }
  });
})();