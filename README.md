# Club de Voleibol Pensilvania

Sitio web del **Club Municipal de Voleibol Pensilvania** (Pensilvania, Caldas, Colombia).

Proyecto de la asignatura *Diseño de interfases web*.
**Autor:** Cristian David López Palacios · **Docente:** Stiven Londoño Agudelo

---

## Ver la página en línea

La página está publicada en GitHub Pages en la pestaña **About** de este repositorio,
o directamente en:

```
https://<tu-usuario>.github.io/club-voleibol-pensilvania/
```

## Cómo abrirla en el computador

Haz doble clic en `index.html`. No necesita internet, salvo para el mapa, las redes
sociales y los videos.

Si quieres probarla con un servidor local:

```bash
python -m http.server 8000
```

Luego visita `http://localhost:8000`.

---

## Secciones de la página

| Sección | Qué hace |
|---|---|
| **Inicio** | Lema del club, foto de portada y llamadas a la acción |
| **Sobre nosotros** | Origen, valores, misión, visión y el creador y entrenador |
| **Categorías** | Las 6 categorías del club con sus edades |
| **Horarios** | Días y horas reales de cada categoría, con enlace al mapa |
| **Noticias** | Torneos y convocatorias, con filtros por tipo |
| **Galería** | 12 fotos del club con visor de imagen ampliado |
| **Portal de padres** | Zona privada con estado de cuenta y comprobantes |
| **Contacto** | Correo, WhatsApp, redes y formulario con validación |

### Categorías y horarios

| Categoría | Edades | Días y horas |
|---|---|---|
| Mini | 6 a 8 | Mié 4:00–5:15 p.m. · Jue 4:00–5:15 p.m. |
| Pre infantil | 9 a 11 | Mar 4:30–6:15 p.m. · Vie 5:00–6:30 p.m. |
| Infantil - Juvenil F | 12 a 17 | Mar 7:10–9:45 p.m. · Jue 5:45–8:45 p.m. · Sáb 9:45 a.m.–12:45 p.m. |
| Infantil - Juvenil M | 12 a 17 | Mar 7:10–10:30 p.m. · Jue 7:00–10:30 p.m. · Sáb 11:00 a.m.–1:45 p.m. |
| Mayor femenina | 18+ | Lun 6:10–9:10 p.m. · Mié 6:10–9:10 p.m. · Vie 7:10–9:45 p.m. |
| Mayor masculina | 18+ | Lun 7:30–10:30 p.m. · Mié 7:30–10:30 p.m. · Vie 7:30–10:30 p.m. |

---

## ⚠️ Aviso importante sobre el portal de padres

La zona privada es una **demostración con fines educativos**, tal como se
especificó en la ficha del proyecto. Esto significa que:

- Las cuentas se guardan **solo en el navegador** (`localStorage`).
- **No hay servidor ni base de datos.** Si una familia se registra en su celular,
  el entrenador no lo ve en su computador.
- Los montos que se muestran son **valores de ejemplo**, no los reales del club.
- Las contraseñas se guardan cifradas mediante *hash*, y **nadie puede verlas**.
  Si un padre olvida la suya, la coordinación le genera una clave nueva.

### Cuentas de prueba

Para poder revisar el panel, existe una cuenta de coordinación que se crea sola
al abrir la página:

| | |
|---|---|
| Correo | `coordinacion@clubvoleibol.com` |
| Contraseña | `cvp2026` |

> Estas credenciales son públicas porque el repositorio es público. En un sitio
> real de producción se conectarían a un backend con autenticación segura.

---

## Estructura del proyecto

```
club-voleibol/
├── index.html      Estructura y contenido de la página
├── styles.css      Diseño, colores, animaciones y adaptación a pantallas
├── script.js       Menú, galería, formularios y portal de padres
└── assets/         Imágenes del club
    ├── cover.jpg       Portada oficial
    ├── escudo.jpg      Escudo del club
    ├── post-01 a 10    Fotografías del club
    ├── copa-hacha.jpg  Cartel de la I Copa Internacional del Hacha
    ├── tournament.jpg  Archivo extra
    └── training.jpg    Archivo extra
```

## Tecnología

- HTML5, CSS3 y JavaScript sin librerías externas
- Tipografías Google Fonts (Space Grotesk y DM Sans)
- Iconos en SVG, sin emojis
- Diseño adaptable a celular, tableta y computador
- Sin dependencias: no necesita `npm install` ni compilación

## Datos del club

| | |
|---|---|
| Nombre | Club Municipal de Voleibol Pensilvania |
| Ubicación | Pensilvania, Caldas, Colombia |
| Entrenamientos | Coliseo Municipal |
| Lema | *"Si lo crees, lo creas"* |
| Correo | clubvoleibolpensilvania@gmail.com |
| WhatsApp | 321 841 1007 |
| Instagram | @clubvoleibolpensilvania |
| TikTok | @pensilvania.volei |
| Fundador y entrenador | David Felipe Cortés (@cortesdavidfelipe), FIVB Nivel 2 |

---

## Información pendiente de confirmar

Estos datos todavía no han sido confirmados por la coordinación del club y están
marcados como *"Por confirmar"* dentro de la página:

- Fecha oficial de creación del club
- Valores reales de inscripción y mensualidad (el portal usa datos de ejemplo)