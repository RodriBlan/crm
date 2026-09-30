-- Indices para las consultas reales del backend de YourClients.
-- Se puede ejecutar mas de una vez desde Supabase > SQL Editor.

-- Necesario para acelerar LIKE '%texto%' sobre la descripcion de productos.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Autenticacion y solicitudes de acceso.
CREATE INDEX IF NOT EXISTS idx_users_username
    ON public.users (username);

CREATE INDEX IF NOT EXISTS idx_users_status_id_desc
    ON public.users (status, id DESC);

-- Clientes.
CREATE INDEX IF NOT EXISTS idx_client_phone
    ON public.client (phone);

CREATE INDEX IF NOT EXISTS idx_client_name
    ON public.client (name);

-- Categorias.
CREATE INDEX IF NOT EXISTS idx_category_description
    ON public.category (description);

-- Productos y filtros del catalogo.
CREATE INDEX IF NOT EXISTS idx_product_description_trgm
    ON public.product USING gin (LOWER(description) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_product_category_id
    ON public.product (category_id);

CREATE INDEX IF NOT EXISTS idx_product_price
    ON public.product (price);

CREATE INDEX IF NOT EXISTS idx_product_active_discount
    ON public.product (descuento DESC)
    WHERE active IS TRUE AND descuento > 0;

-- Historial, rangos de fechas y estadisticas de ventas.
CREATE INDEX IF NOT EXISTS idx_sales_client_date_desc
    ON public.sales (client_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_sales_date_desc
    ON public.sales (date DESC);

CREATE INDEX IF NOT EXISTS idx_sales_completed_date_client
    ON public.sales (date DESC, client_id)
    INCLUDE (total)
    WHERE status = 'COMPLETED';

-- PostgreSQL no crea indices automaticamente para las claves foraneas.
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id
    ON public.sale_items (sale_id);

CREATE INDEX IF NOT EXISTS idx_sale_items_product_id
    ON public.sale_items (product_id);

-- Actualiza las estadisticas del planificador despues de crear los indices.
ANALYZE public.users;
ANALYZE public.client;
ANALYZE public.category;
ANALYZE public.product;
ANALYZE public.sales;
ANALYZE public.sale_items;

-- Verificacion: Supabase mostrara los indices creados como resultado.
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
