-- ==========================================================================
--  CLUB DE VOLEIBOL PENSILVANIA
--  Tabla de familias en Supabase
-- ==========================================================================
--  COMO USARLO
--  1. Abre https://supabase.com/dashboard y entra a tu proyecto.
--  2. Menu de la izquierda -> "SQL Editor".
--  3. "New query", pega TODO este texto y dale "Run".
--
--  QUE HACE
--  Guarda las familias registradas en el portal, para que el coordinador
--  las vea desde cualquier celular o computador.
--
--  PRIVACIDAD
--  La columna "datos" guarda la cuenta completa MENOS la clave, que se queda
--  cifrada en cada equipo. Las politicas de abajo permiten leer la tabla con
--  la llave publica, asi que CUALQUIERA que conozca la URL puede leerla.
--  Para un trabajo escolar con datos de ejemplo esta bien. Si se van a usar
--  datos reales de familias, hay que revisar estas politicas.
-- ==========================================================================


-- --------------------------------------------------------------------------
-- 1. Crear la tabla
-- --------------------------------------------------------------------------
create table if not exists "public"."familias" (
  "id"         bigint generated always as identity primary key,
  "correo"     text        not null unique,
  "nombre"     text        not null default '',
  "rol"        text        not null default 'familia',
  "datos"      jsonb       not null default '{}'::jsonb,
  "creado"     timestamptz not null default now(),
  "actualizado" timestamptz not null default now()
);


-- --------------------------------------------------------------------------
-- 2. Indice para buscar rapido por correo
-- --------------------------------------------------------------------------
create index if not exists familias_correo_idx on "public"."familias" ("correo");


-- --------------------------------------------------------------------------
-- 3. Proteger la tabla y permitir el acceso desde la pagina
-- --------------------------------------------------------------------------
alter table "public"."familias" enable row level security;

drop policy if exists "lectura publica"   on "public"."familias";
drop policy if exists "escritura publica" on "public"."familias";
drop policy if exists "actualizacion publica" on "public"."familias";
drop policy if exists "borrado publico"    on "public"."familias";

create policy "lectura publica"
  on "public"."familias" for select to anon using (true);

create policy "escritura publica"
  on "public"."familias" for insert to anon with check (true);

create policy "actualizacion publica"
  on "public"."familias" for update to anon using (true) with check (true);

create policy "borrado publico"
  on "public"."familias" for delete to anon using (true);