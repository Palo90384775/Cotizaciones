-- Tabla para clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT NOT NULL,
  atencion TEXT,
  correo TEXT,
  tel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  marca TEXT,
  unidad TEXT DEFAULT 'UND',
  precio NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  cliente JSONB NOT NULL,
  porcentajes JSONB NOT NULL,
  tipo_impuesto TEXT NOT NULL DEFAULT 'IVA',
  descuento_total NUMERIC DEFAULT 0,
  descuento_tipo TEXT DEFAULT 'porcentaje',
  texto_intro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para items de cotizaciones
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  "desc" TEXT NOT NULL,
  marca TEXT,
  unidad TEXT DEFAULT 'UND',
  cant INTEGER NOT NULL DEFAULT 1,
  precio NUMERIC NOT NULL DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para desarrollo
CREATE POLICY "Allow public access to clients"
ON clients
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to products"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to quotes"
ON quotes
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to quote_items"
ON quote_items
FOR ALL
USING (true)
WITH CHECK (true);