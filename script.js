/* ==========================================================================
   Club de Voleibol Pensilvania - Funciones
   ========================================================================== */

(function () {
  "use strict";

  /* Activa los estilos de animación solo cuando hay JavaScript disponible */
  document.documentElement.classList.add("js");

  /* Utilidades */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function showToast(message) {
    var toast = $("#toast");
    var msg = $("#toast-message");
    if (!toast) return;
    msg.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  /* Año actual en el pie de página */
  var yearEl = $("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Encabezado: sombra al hacer scroll y menu movil
  ------------------------------------------------------------------ */
  var header = $("#site-header");

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuToggle = $(".menu-toggle");
  var mainNav = $("#main-nav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    $$(".main-nav a", mainNav).forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Resalta el enlace activo segun la seccion visible */
  var navLinks = $$(".nav-link");
  var sections = $$("main section[id]");
  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach(function (section) { sectionObserver.observe(section); });

  /* ------------------------------------------------------------------
     Animacion de aparicion al hacer scroll
  ------------------------------------------------------------------ */
  var animateTargets = $$(
    ".section-heading, .hero-copy, .hero-visual, .category-card, .belief-card, " +
    ".schedule-selector, .schedule-detail, .news-card, .gallery-tile, " +
    ".portal-copy, .portal-preview, .contact-copy, .contact-form-wrap"
  );
  animateTargets.forEach(function (el) { el.setAttribute("data-animate", ""); });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  animateTargets.forEach(function (el) { revealObserver.observe(el); });

  /* ------------------------------------------------------------------
     Categorias: seleccion y boton lleva a horarios
  ------------------------------------------------------------------ */
  var categoryCards = $$(".category-card");

  categoryCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var category = card.getAttribute("data-category");
      categoryCards.forEach(function (c) {
        c.classList.toggle("is-selected", c === card);
        c.setAttribute("aria-pressed", c === card ? "true" : "false");
      });
      selectSchedule(category, true);
    });
  });

  /* ------------------------------------------------------------------
     Horarios: datos oficiales por categoria
     Una misma categoria puede tener una hora distinta cada dia,
     por eso cada una guarda una lista de sesiones.
  ------------------------------------------------------------------ */
  var scheduleData = {
    mini: {
      title: "Mini",
      badge: "6 a 8 años",
      sessions: [
        ["Miércoles", "4:00 - 5:15 p. m."],
        ["Jueves", "4:00 - 5:15 p. m."]
      ]
    },
    preinfantil: {
      title: "Pre infantil",
      badge: "9 a 11 años",
      sessions: [
        ["Martes", "4:30 - 6:15 p. m."],
        ["Viernes", "5:00 - 6:30 p. m."]
      ]
    },
    infjuvenilF: {
      title: "Infantil - Juvenil",
      badge: "12 a 17 años · Femenina",
      sessions: [
        ["Martes", "7:10 - 9:45 p. m."],
        ["Jueves", "5:45 - 8:45 p. m."],
        ["Sábado", "9:45 a. m. - 12:45 p. m."]
      ]
    },
    infjuvenilM: {
      title: "Infantil - Juvenil",
      badge: "12 a 17 años · Masculina",
      sessions: [
        ["Martes", "7:10 - 10:30 p. m."],
        ["Jueves", "7:00 - 10:30 p. m."],
        ["Sábado", "11:00 a. m. - 1:45 p. m."]
      ]
    },
    mayorF: {
      title: "Mayor",
      badge: "18 años en adelante · Femenina",
      sessions: [
        ["Lunes", "6:10 - 9:10 p. m."],
        ["Miércoles", "6:10 - 9:10 p. m."],
        ["Viernes", "7:10 - 9:45 p. m."]
      ]
    },
    mayorM: {
      title: "Mayor",
      badge: "18 años en adelante · Masculina",
      sessions: [
        ["Lunes", "7:30 - 10:30 p. m."],
        ["Miércoles", "7:30 - 10:30 p. m."],
        ["Viernes", "7:30 - 10:30 p. m."]
      ]
    }
  };

  var scheduleTabs = $$(".schedule-tab");
  var scheduleTitle = $("#schedule-title");
  var scheduleBadge = $("#schedule-badge");
  var scheduleSessions = $("#schedule-sessions");

  function selectSchedule(category, scrollTo) {
    var data = scheduleData[category];
    if (!data) return;

    if (scheduleTitle) scheduleTitle.textContent = data.title;
    if (scheduleBadge) scheduleBadge.textContent = data.badge;

    /* Se dibuja la lista de dias con la hora de cada uno */
    if (scheduleSessions) {
      scheduleSessions.innerHTML = "";
      data.sessions.forEach(function (row) {
        var item = document.createElement("div");
        item.className = "schedule-session";

        var day = document.createElement("span");
        day.className = "schedule-session-day";
        day.textContent = row[0];

        var hour = document.createElement("span");
        hour.className = "schedule-session-hour";
        hour.textContent = row[1];

        item.appendChild(day);
        item.appendChild(hour);
        scheduleSessions.appendChild(item);
      });
    }

    scheduleTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-schedule-category") === category;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (scrollTo) {
      var target = $("#entrenamientos");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* Dibuja la primera categoria al cargar la pagina */
  if (scheduleTabs.length) {
    selectSchedule(scheduleTabs[0].getAttribute("data-schedule-category"), false);
  }

  scheduleTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      selectSchedule(tab.getAttribute("data-schedule-category"), false);
    });
  });

  /* ------------------------------------------------------------------
     Noticias: filtros
  ------------------------------------------------------------------ */
  var filterPills = $$(".filter-pill");
  var newsCards = $$(".news-card");

  filterPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      filterPills.forEach(function (p) { p.classList.remove("is-active"); });
      pill.classList.add("is-active");

      var filter = pill.getAttribute("data-news-filter");
      newsCards.forEach(function (card) {
        var category = card.getAttribute("data-news-category");
        var show = filter === "all" || category === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ------------------------------------------------------------------
     Galeria: visor de imagen ampliada
  ------------------------------------------------------------------ */
  var galleryTiles = $$(".gallery-tile");
  var lightbox = $("#lightbox");
  var lightboxImage = $("#lightbox-image");
  var lightboxCaption = $("#lightbox-caption");

  galleryTiles.forEach(function (tile) {
    tile.addEventListener("click", function () {
      var full = tile.getAttribute("data-full-image");
      var caption = tile.getAttribute("data-caption") || "";
      if (lightboxImage) lightboxImage.src = full;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightbox) lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  var lightboxClose = $("[data-close-lightbox]");
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ------------------------------------------------------------------
     Datos de ejemplo de una familia: inscripcion, dos mensualidades
     y uniforme. Suman $340.000, igual que el panel delunks.
  ------------------------------------------------------------------ */
  function buildDemoPayments(email) {
    /* Se vary slight para que no se vean todas las familias iguales */
    var semilla = 0;
    for (var i = 0; i < email.length; i++) semilla += email.charCodeAt(i);
    var mes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
               "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var abrev = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
                 "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    var cuota = 85000 + (semilla % 3) * 5000;
    var uniforme = 120000 + (semilla % 2) * 10000;
    var primero = 7 + (semilla % 3);

    /* Si la cuenta cae muy tarde en el ano, la cuota pendiente pasa
       a enero del ano siguiente para no salirse del arreglo */
    function cuotaMes(offset) {
      var idx = primero + offset;
      var anio = 2026;
      while (idx > 11) { idx -= 12; anio += 1; }
      return { nombre: mes[idx], abrev: abrev[idx], anio: anio };
    }

    var m1 = cuotaMes(0);
    var m2 = cuotaMes(1);
    var m3 = cuotaMes(2);

    return [
      { concept: "Inscripción 2026", date: "15 ENE 2026", type: "Inscripción", amount: 50000, status: "Pagada" },
      { concept: "Uniforme 2026", date: "10 FEB 2026", type: "Materiales", amount: uniforme, status: "Pagada" },
      { concept: m1.nombre + " " + m1.anio, date: "05 " + m1.abrev + " " + m1.anio, type: "Mensualidad", amount: cuota, status: "Pagada" },
      { concept: m2.nombre + " " + m2.anio, date: "05 " + m2.abrev + " " + m2.anio, type: "Mensualidad", amount: cuota, status: "Pagada" },
      { concept: m3.nombre + " " + m3.anio, date: "05 " + m3.abrev + " " + m3.anio, type: "Mensualidad", amount: cuota, status: "Pendiente" }
    ];
  }

  function totalPagado(user) {
    return (user.payments || [])
      .filter(function (p) { return p.status === "Pagada"; })
      .reduce(function (suma, p) { return suma + p.amount; }, 0);
  }

  function totalPendiente(user) {
    return (user.payments || [])
      .filter(function (p) { return p.status === "Pendiente"; })
      .reduce(function (suma, p) { return suma + p.amount; }, 0);
  }

  function formatear(valor) {
    return "$ " + valor.toLocaleString("es-CO");
  }

  /* ------------------------------------------------------------------
     Clave temporal legible para entregar al padre.
     Evita 0/O y 1/l para que se pueda dictar sin confusiones.
     Usa crypto para que dosFamilies nunca reciban la misma clave.
  ------------------------------------------------------------------ */
  var LETRAS = "ABCDEFGHJKMNPQRSTUVWXYZ";
  var NUMEROS = "23456789";

  function generarClaveTemporal() {
    var clave = "";
    var i;

    /* Llaves de numeros aleatorios de 0 a 99, para no depender de Date.now() */
    var tieneCrypto = typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues;

    if (tieneCrypto) {
      var buffer = new Uint8Array(6);
      window.crypto.getRandomValues(buffer);
      for (i = 0; i < 3; i++) clave += LETRAS.charAt(buffer[i] % LETRAS.length);
      clave += "-";
      for (i = 3; i < 6; i++) clave += NUMEROS.charAt(buffer[i] % NUMEROS.length);
      return clave;
    }

    /* Respaldo por si el navegador no tiene crypto */
    for (i = 0; i < 3; i++) clave += LETRAS.charAt(Math.floor(Math.random() * LETRAS.length));
    clave += "-";
    for (i = 0; i < 3; i++) clave += NUMEROS.charAt(Math.floor(Math.random() * NUMEROS.length));
    return clave;
  }

  /* ------------------------------------------------------------------
     Panel de la coordinacion
  ------------------------------------------------------------------ */
  var adminView = $("#modal-admin-view");
  var adminStats = $("#admin-stats");
  var adminList = $("#admin-list");
  var adminTeam = $("#admin-team");

  function showAdmin() {
    if (loginView) loginView.hidden = true;
    if (registerView) registerView.hidden = true;
    if (dashboardView) dashboardView.hidden = true;
    if (adminView) adminView.hidden = false;
    renderAdmin();
    if (portalModal) portalModal.setAttribute("aria-labelledby", "dashboard-user-name");
  }

  function renderAdmin() {
    if (!adminStats || !adminList) return;

    var todos = getUsers();
    var familias = todos.filter(function (u) { return u.role !== "admin"; });
    var equipo = todos.filter(function (u) { return u.role === "admin"; });

    var pagado = familias.reduce(function (s, u) { return s + totalPagado(u); }, 0);
    var pendiente = familias.reduce(function (s, u) { return s + totalPendiente(u); }, 0);
    var alDia = familias.filter(function (u) { return totalPendiente(u) === 0; }).length;

    adminStats.innerHTML = "";
    [
      ["Cuentas de familias", String(familias.length)],
      ["Accesos de coordinación", String(equipo.length)],
      ["Total pagado", formatear(pagado)],
      ["Por cobrar", formatear(pendiente)]
    ].forEach(function (fila) {
      var div = document.createElement("div");
      var small = document.createElement("small");
      small.textContent = fila[0];
      var strong = document.createElement("strong");
      strong.textContent = fila[1];
      div.appendChild(small);
      div.appendChild(strong);
      adminStats.appendChild(div);
    });

    adminList.innerHTML = "";
    adminTeam.innerHTML = "";

    if (!familias.length) {
      var vacio = document.createElement("p");
      vacio.className = "admin-empty";
      vacio.textContent = "Todavía no hay cuentas de familias registradas.";
      adminList.appendChild(vacio);
      return;
    }

    if (!equipo.length) {
      var vacioEq = document.createElement("p");
      vacioEq.className = "admin-empty";
      vacioEq.textContent = "No hay accesos de coordinación.";
      adminTeam.appendChild(vacioEq);
    } else {
      equipo.forEach(function (u) {
        var chip = document.createElement("div");
        chip.className = "admin-team-chip";

        var datos = document.createElement("span");
        var nom = document.createElement("b");
        nom.textContent = u.name;
        var mail = document.createElement("small");
        mail.textContent = u.email;
        datos.appendChild(nom);
        datos.appendChild(mail);

        chip.appendChild(datos);
        adminTeam.appendChild(chip);
      });
    }

    familias.forEach(function (user, indice) {
      var item = document.createElement("div");
      item.className = "admin-item";

      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "admin-item-head";
      boton.setAttribute("aria-expanded", "false");

      var info = document.createElement("span");
      info.className = "admin-item-info";
      var nombre = document.createElement("b");
      nombre.textContent = user.name;
      var correo = document.createElement("small");
      correo.textContent = user.email;
      info.appendChild(nombre);
      info.appendChild(correo);

      var cifras = document.createElement("span");
      cifras.className = "admin-item-numbers";
      var movements = document.createElement("em");
      movements.textContent = (user.payments || []).length + " movimientos";
      var pagadoEl = document.createElement("strong");
      pagadoEl.textContent = formatear(totalPagado(user));
      cifras.appendChild(movements);
      cifras.appendChild(pagadoEl);

      boton.appendChild(info);
      boton.appendChild(cifras);
      item.appendChild(boton);

      var detalle = document.createElement("div");
      detalle.className = "admin-item-detail";
      detalle.hidden = true;

      (user.payments || []).forEach(function (p) {
        var fila = document.createElement("div");
        fila.className = "admin-payment";

        var etiqueta = document.createElement("span");
        var nombreP = document.createElement("b");
        nombreP.textContent = p.concept;
        var sub = document.createElement("small");
        sub.textContent = p.date + " · " + p.type;
        etiqueta.appendChild(nombreP);
        etiqueta.appendChild(sub);

        var monto = document.createElement("strong");
        monto.textContent = formatear(p.amount);

        var estado = document.createElement("span");
        estado.className = "admin-payment-state is-" + (p.status === "Pagada" ? "paid" : "pending");
        estado.textContent = p.status;

        fila.appendChild(etiqueta);
        fila.appendChild(monto);
        fila.appendChild(estado);
        detalle.appendChild(fila);
      });

      var pie = document.createElement("p");
      pie.className = "admin-item-total";
      pie.textContent = "Total pagado: " + formatear(totalPagado(user)) +
                        "  ·  Pendiente: " + formatear(totalPendiente(user));
      detalle.appendChild(pie);

      /* Restablecer clave: la coordinación genera una clave temporal y
         se la entrega al padre por WhatsApp. Las contraseñas nunca se muestran. */
      var acciones = document.createElement("div");
      acciones.className = "admin-reset";

      var btnReset = document.createElement("button");
      btnReset.type = "button";
      btnReset.className = "admin-reset-button";
      btnReset.textContent = "Restablecer contraseña";

      var cajaReset = document.createElement("div");
      cajaReset.className = "admin-reset-box";
      cajaReset.hidden = true;

      btnReset.addEventListener("click", function () {
        var claveNueva = generarClaveTemporal();
        var lista = getUsers();
        var persona = lista.find(function (x) { return x.email === user.email; });
        if (!persona) return;
        persona.pass = hashPassword(claveNueva);
        persona.claveTemporal = true;
        persona.passwordChangedAt = new Date().toISOString();
        saveUsers(lista);

        cajaReset.innerHTML = "";
        var linea = document.createElement("p");
        linea.className = "admin-reset-note";
        linea.textContent = "Clave temporal de " + persona.name + ":";
        var clave = document.createElement("strong");
        clave.className = "admin-reset-clave";
        clave.textContent = claveNueva;
        var aviso = document.createElement("small");
        aviso.className = "admin-reset-aviso";
        aviso.textContent = "Entrégasela al padre por WhatsApp y pídele que la cambie.";
        cajaReset.appendChild(linea);
        cajaReset.appendChild(clave);
        cajaReset.appendChild(aviso);
        cajaReset.hidden = false;
        /* No se llama renderAdmin() aqui: se borraria la caja recien creada */
        showToast("Clave temporal generada para " + persona.name);
      });

      acciones.appendChild(btnReset);
      acciones.appendChild(cajaReset);
      detalle.appendChild(acciones);

      item.appendChild(detalle);
      adminList.appendChild(item);

      boton.addEventListener("click", function () {
        var abierto = boton.getAttribute("aria-expanded") === "true";
        boton.setAttribute("aria-expanded", abierto ? "false" : "true");
        detalle.hidden = abierto;
        item.classList.toggle("is-open", !abierto);
      });
    });
  }

  /* ------------------------------------------------------------------
     Portal de padres y deportistas: crear cuenta, iniciar sesion
     y sesion local en el navegador (demostracion educativa)
  ------------------------------------------------------------------ */
  var portalModal = $("#portal-modal");
  var openPortalBtn = $("[data-open-portal]");
  var loginView = $("#modal-login-view");
  var registerView = $("#modal-register-view");
  var dashboardView = $("#modal-dashboard-view");
  var contactStatus = $("#contact-status");
  var portalStatus = $("#portal-status");
  var registerStatus = $("#register-status");
  var dashboardUserName = $("#dashboard-user-name");
  var dashboardUserEmail = $("#dashboard-user-email");

  var USERS_KEY = "cvp_users";
  var SESSION_KEY = "cvp_session";

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveUsers(list) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch (e) {
      return null;
    }
  }
  function saveSession(user) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  /* Hash sencillo para no guardar la contrasena en texto plano (demo) */
  function hashPassword(password) {
    var hash = 5381;
    var salted = "cvp|" + password + "|pensilvania";
    for (var i = 0; i < salted.length; i++) {
      hash = ((hash << 5) + hash) + salted.charCodeAt(i);
    }
    return String(hash >>> 0);
  }

  function normalizeEmail(value) {
    return (value || "").trim().toLowerCase();
  }

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = "form-status" + (type ? " " + type : "");
  }

  function switchAuthView(view) {
    if (loginView) loginView.hidden = view !== "login";
    if (registerView) registerView.hidden = view !== "register";
    if (dashboardView) dashboardView.hidden = true;
    if (adminView) adminView.hidden = true;
    if (portalModal) {
      portalModal.setAttribute(
        "aria-labelledby",
        view === "register" ? "portal-modal-title-r" : "portal-modal-title"
      );
    }
    var activeView = view === "register" ? registerView : loginView;
    if (activeView) {
      var firstInput = activeView.querySelector("input");
      if (firstInput && activeView.offsetParent !== null) firstInput.focus();
    }
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showDashboard(user) {
    var firstName = user && user.name ? user.name.split(" ")[0] : "familia";
    if (dashboardUserName) dashboardUserName.textContent = "Hola, " + firstName;
    if (dashboardUserEmail) dashboardUserEmail.textContent = user ? user.email : "";
    if (loginView) loginView.hidden = true;
    if (registerView) registerView.hidden = true;
    if (adminView) adminView.hidden = true;
    if (dashboardView) dashboardView.hidden = false;
    if (portalModal) portalModal.setAttribute("aria-labelledby", "dashboard-user-name");
  }

  if (openPortalBtn && portalModal) {
    openPortalBtn.addEventListener("click", function () {
      var session = getSession();
      if (session && session.role === "admin") {
        showAdmin();
      } else if (session) {
        showDashboard(session);
      } else {
        if (loginView) loginView.hidden = false;
        if (registerView) registerView.hidden = true;
        if (dashboardView) dashboardView.hidden = true;
        if (adminView) adminView.hidden = true;
        if (portalModal) portalModal.setAttribute("aria-labelledby", "portal-modal-title");
        setStatus(portalStatus, "");
      }
      openModal(portalModal);
    });
  }

  /* Cambiar entre iniciar sesion y crear cuenta */
  $$("[data-auth-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchAuthView(btn.getAttribute("data-auth-view"));
      setStatus(portalStatus, "");
      setStatus(registerStatus, "");
    });
  });

  $$("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeModal(portalModal);
    });
  });

  if (portalModal) {
    portalModal.addEventListener("click", function (e) {
      if (e.target.classList.contains("modal-backdrop")) closeModal(portalModal);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal(portalModal);
      closeLightbox();
    }
  });

  /* Mostrar / ocultar contrasena en los tres campos */
  ["portal-password", "register-password", "register-confirm"].forEach(function (id) {
    var input = $("#" + id);
    var toggle = document.querySelector('[data-password-toggle="' + id + '"]');
    if (!input || !toggle) return;
    toggle.addEventListener("click", function () {
      var isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.textContent = isPassword ? "Ocultar" : "Mostrar";
    });
  });

  /* Crear cuenta */
  var registerForm = $("#portal-register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#register-name");
      var email = $("#register-email");
      var password = $("#register-password");
      var confirm = $("#register-confirm");

      if (!name.value.trim()) {
        setStatus(registerStatus, "Escribe el nombre de la familia.", "is-error");
        name.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setStatus(registerStatus, "Escribe un correo electrónico válido.", "is-error");
        email.focus();
        return;
      }
      if (password.value.length < 6) {
        setStatus(registerStatus, "La contraseña debe tener mínimo 6 caracteres.", "is-error");
        password.focus();
        return;
      }
      if (password.value !== confirm.value) {
        setStatus(registerStatus, "Las contraseñas no coinciden.", "is-error");
        confirm.focus();
        return;
      }

      var users = getUsers();
      var normalized = normalizeEmail(email.value);
      var exists = users.some(function (u) { return u.email === normalized; });
      if (exists) {
        setStatus(registerStatus, "Ya existe una cuenta con ese correo. Inicia sesión.", "is-error");
        return;
      }

      users.push({
        name: name.value.trim(),
        email: normalized,
        pass: hashPassword(password.value),
        role: "familia",
        createdAt: new Date().toISOString(),
        payments: buildDemoPayments(normalized)
      });
      saveUsers(users);

      registerForm.reset();
      switchAuthView("login");
      var userField = $("#portal-user");
      if (userField) userField.value = email.value.trim();
      setStatus(portalStatus, "Cuenta creada. Ya puedes ver el estado de cuenta de tu familia.", "is-success");
      var passField = $("#portal-password");
      if (passField) passField.focus();
    });
  }

  /* Iniciar sesion: valida contra las cuentas guardadas */
  var portalForm = $("#portal-login-form");
  if (portalForm) {
    portalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var user = $("#portal-user");
      var pass = $("#portal-password");

      if (!user.value.trim() || !pass.value.trim()) {
        setStatus(portalStatus, "Ingresa el correo y la contraseña.", "is-error");
        return;
      }

      var normalized = normalizeEmail(user.value);
      var match = getUsers().find(function (u) {
        return u.email === normalized && u.pass === hashPassword(pass.value);
      });

      if (!match) {
        setStatus(portalStatus, "No encontramos esa cuenta. Revisa los datos o crea una cuenta nueva.", "is-error");
        return;
      }

      saveSession({ name: match.name, email: match.email, role: match.role || "familia" });
      setStatus(portalStatus, "");
      if (match.role === "admin") {
        showAdmin();
      } else {
        showDashboard(match);
      }
    });
  }

  /* ------------------------------------------------------------------
     Cuenta de la coordinacion: se crea sola si no existe
  ------------------------------------------------------------------ */
  var ADMIN_EMAIL = "coordinacion@clubvoleibol.com";
  var ADMIN_PASS = "cvp2026";

  function ensureAdmin() {
    var users = getUsers();
    var yaExiste = users.some(function (u) {
      return normalizeEmail(u.email) === ADMIN_EMAIL;
    });
    if (yaExiste) return;
    users.push({
      name: "Coordinación del club",
      email: ADMIN_EMAIL,
      pass: hashPassword(ADMIN_PASS),
      role: "admin",
      createdAt: new Date().toISOString(),
      payments: []
    });
    saveUsers(users);
  }
  ensureAdmin();

  /* ------------------------------------------------------------------
     Crear una cuenta de coordinacion desde el panel
  ------------------------------------------------------------------ */
  var adminRegisterForm = $("#admin-register-form");
  var adminRegisterStatus = $("#admin-register-status");

  if (adminRegisterForm) {
    adminRegisterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nombre = $("#admin-new-name");
      var correo = $("#admin-new-email");
      var clave = $("#admin-new-pass");

      if (!nombre.value.trim()) {
        setStatus(adminRegisterStatus, "Escribe el nombre de la persona.", "is-error");
        nombre.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim())) {
        setStatus(adminRegisterStatus, "Escribe un correo electrónico válido.", "is-error");
        correo.focus();
        return;
      }
      if (clave.value.length < 6) {
        setStatus(adminRegisterStatus, "La contraseña debe tener mínimo 6 caracteres.", "is-error");
        clave.focus();
        return;
      }

      var usuarios = getUsers();
      var normalizado = normalizeEmail(correo.value);
      var existe = usuarios.some(function (u) { return u.email === normalizado; });

      if (existe) {
        setStatus(adminRegisterStatus, "Ese correo ya tiene una cuenta. Usa otro.", "is-error");
        correo.focus();
        return;
      }

      usuarios.push({
        name: nombre.value.trim(),
        email: normalizado,
        pass: hashPassword(clave.value),
        role: "admin",
        createdAt: new Date().toISOString(),
        payments: []
      });
      saveUsers(usuarios);

      adminRegisterForm.reset();
      setStatus(adminRegisterStatus,
        "Acceso creado para " + nombre.value.trim() + ". Ya puede entrar al panel.",
        "is-success");
      renderAdmin();
    });
  }

  /* Cerrar sesion */
  var logoutBtn = $("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      clearSession();
      closeModal(portalModal);
      switchAuthView("login");
      setStatus(portalStatus, "Sesión cerrada. Vuelve pronto.", "is-success");
    });
  }

  /* Descargar comprobante (dispositivo local) */
  $$(".download-button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var receipt = btn.getAttribute("data-receipt") || "Comprobante Club de Voleibol Pensilvania";
      var lines = receipt.split("|");
      var text =
        "CLUB DE VOLEIBOL PENSILVANIA\n" +
        "Comprobante de pago - zona de padres y deportistas\n" +
        "---------------------------------------------\n" +
        lines.join("\n") +
        "\n---------------------------------------------\n" +
        "Estado de cuenta personalizado\n" +
        "Pensilvania, Caldas\n";

      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "comprobante-cvp.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Comprobante descargado");
    });
  });

  /* ------------------------------------------------------------------
     Formulario de contacto (demo)
  ------------------------------------------------------------------ */
  var contactForm = $("#contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#contact-name");
      var email = $("#contact-email");
      var message = $("#contact-message");

      var valid = true;
      [name, email, message].forEach(function (field) {
        if (field && field.hasAttribute("required") && !field.value.trim()) valid = false;
      });
      if (email && email.value.trim() && email.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        valid = false;
      }

      if (!contactStatus) return;

      if (!valid) {
        contactStatus.textContent = "Completa todos los campos obligatorios con datos correctos.";
        contactStatus.className = "form-status is-error";
        return;
      }

      contactStatus.textContent = "Gracias, " + name.value.trim() + ". Hemos recibido tu mensaje y te responderemos pronto.";
      contactStatus.className = "form-status is-success";
      contactForm.reset();
      showToast("Mensaje enviado");
    });
  }

  /* Enlaces por confirmar */
  $$("[data-coming-soon]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showToast(btn.getAttribute("data-coming-soon"));
    });
  });
})();
