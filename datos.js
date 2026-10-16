/* ==========================================================================
   Capa de datos: sincroniza las cuentas del club con Supabase.
   --------------------------------------------------------------------------
   QUE HACE
   Si configuras SUPABASE (abajo), las cuentas se guardan tambien en la base de
   datos de internet. Eso permite que el coordinador vea las mismas familias
   desde CUALQUIER celular o computador.

   SI NO CONFIGURAS SUPABASE
   Todo funciona igual, pero solo en este navegador (como antes).

   COMO CONFIGURAR (2 minutos)
   1. Entra a https://supabase.com/dashboard y crea un proyecto gratuito.
   2. Abre "Project Settings" -> "API" y copia:
        - Project URL
        - la llave "anon public"
   3. Pega esos dos valores abajo, entre comillas.
   4. En el panel de Supabase ve a "SQL Editor", crea una consulta nueva y pega
      el contenido del archivo TABLA.sql de esta carpeta. Dale "Run".

   Este archivo NO se sube a GitHub (esta en .gitignore).
   ========================================================================== */

var CONFIG_SUPABASE = {
  url: "",   // <- pega aqui, ej: "https://abcdefgh.supabase.co"
  key: ""    // <- pega aqui, la llave anon public
};

/* --------------------------------------------------------------------------
   Utilidades
   -------------------------------------------------------------------------- */
function datosHabilitados() {
  return !!(CONFIG_SUPABASE.url && CONFIG_SUPABASE.key);
}

function apiSupabase(ruta, opciones) {
  var config = opciones || {};
  return fetch(CONFIG_SUPABASE.url + "/rest/v1/" + ruta, {
    method: config.method || "GET",
    headers: {
      "apikey": CONFIG_SUPABASE.key,
      "Authorization": "Bearer " + CONFIG_SUPABASE.key,
      "Content-Type": "application/json",
      "Prefer": config.prefer || "return=representation"
    },
    body: config.body ? JSON.stringify(config.body) : undefined
  }).then(function (r) {
    if (!r.ok) throw new Error("Supabase respondio " + r.status);
    if (r.status === 204) return null;
    return r.json();
  });
}

/* Clave unica por familia, para poder actualizarla sin duplicar */
function idLocal() {
  try {
    var guardado = localStorage.getItem("cvp_id_cliente");
    if (guardado) return guardado;
    var nuevo = "cli_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("cvp_id_cliente", nuevo);
    return nuevo;
  } catch (e) {
    return "cli_sin_id";
  }
}

/* --------------------------------------------------------------------------
   Descargar las familias desde Supabase y guardarlas en este navegador.
   Se llama al abrir la pagina.
   -------------------------------------------------------------------------- */
function sincronizarDesdeSupabase() {
  if (!datosHabilitados()) {
    return Promise.resolve({ ok: false, motivo: "Supabase no configurado" });
  }
  return apiSupabase("familias?select=datos")
    .then(function (filas) {
      if (!filas || !filas.length) return { ok: true, bajada: 0 };

      var remotas = filas.map(function (f) { return f.datos; })
                         .filter(function (d) { return d && d.email; });

      var locales = JSON.parse(localStorage.getItem("cvp_users") || "[]");

      /* Se combinan: la version mas reciente de cada correo gana */
      var porCorreo = {};
      locales.forEach(function (u) { porCorreo[u.email] = u; });
      remotas.forEach(function (u) {
        var local = porCorreo[u.email];
        if (!local || (u.actualizado || "") > (local.actualizado || "")) {
          porCorreo[u.email] = u;
        }
      });

      var todas = Object.keys(porCorreo).map(function (k) { return porCorreo[k]; });
      localStorage.setItem("cvp_users", JSON.stringify(todas));
      return { ok: true, bajada: remotas.length, total: todas.length };
    })
    .catch(function (e) {
      console.warn("No se pudo sincronizar desde Supabase:", e.message);
      return { ok: false, motivo: e.message };
    });
}

/* --------------------------------------------------------------------------
   Subir una cuenta a Supabase.
   `usuario` es el objeto completo de una familia.
   -------------------------------------------------------------------------- */
function subirASupabase(usuario) {
  if (!datosHabilitados() || !usuario || !usuario.email) {
    return Promise.resolve({ ok: false });
  }
  var datos = JSON.parse(JSON.stringify(usuario));
  datos.actualizado = new Date().toISOString();
  datos.origen = idLocal();

  /* La clave del correo identifica la fila, para poder sobrescribir */
  var cuerpo = {
    correo: datos.email,
    nombre: datos.nombre || datos.name || "",
    rol: datos.role || "familia",
    datos: datos
  };

  return apiSupabase("familias?on_conflict=correo", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: cuerpo
  }).then(function () {
    return { ok: true };
  }).catch(function (e) {
    console.warn("No se pudo subir la cuenta a Supabase:", e.message);
    return { ok: false, motivo: e.message };
  });
}

/* --------------------------------------------------------------------------
   Subir todas las cuentas de golpe (por ejemplo al restaurar un respaldo).
   -------------------------------------------------------------------------- */
function subirTodasASupabase(usuarios) {
  if (!datosHabilitados() || !usuarios || !usuarios.length) {
    return Promise.resolve({ ok: false });
  }
  var familias = usuarios.filter(function (u) { return u && u.email; });
  return Promise.all(familias.map(subirASupabase))
    .then(function (r) {
      return { ok: true, subidas: r.filter(function (x) { return x.ok; }).length };
    });
}

/* Estado para mostrarlo en la interfaz */
function estadoDeSincronia() {
  return datosHabilitados()
    ? { activo: true, url: CONFIG_SUPABASE.url }
    : { activo: false, url: "" };
}