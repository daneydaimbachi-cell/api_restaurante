-- -------------------------------------------------------------
-- 1. LIMPIEZA DE TABLAS PREVIAS (Para ejecutar desde cero)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS movimientos_insumo CASCADE;
DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS receta_detalle CASCADE;
DROP TABLE IF EXISTS insumos CASCADE;
DROP TABLE IF EXISTS productos_menu CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- -------------------------------------------------------------
-- 2. CREACIÓN DE ESTRUCTURA DE TABLAS (SCHEMA)
-- -------------------------------------------------------------

-- Tabla: usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(160) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('administrador', 'operador', 'consulta', 'auditor')),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: productos_menu
CREATE TABLE productos_menu (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(40) UNIQUE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    precio NUMERIC(12,2) CHECK (precio >= 0),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: insumos
CREATE TABLE insumos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(40) UNIQUE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    stock NUMERIC(12,3) CHECK (stock >= 0),
    stock_minimo NUMERIC(12,3) DEFAULT 0 CHECK (stock_minimo >= 0),
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: receta_detalle
CREATE TABLE receta_detalle (
    id BIGSERIAL PRIMARY KEY,
    producto_menu_id INTEGER REFERENCES productos_menu(id) ON DELETE CASCADE,
    insumo_id INTEGER REFERENCES insumos(id) ON DELETE CASCADE,
    cantidad_por_porcion NUMERIC(12,3) CHECK (cantidad_por_porcion > 0),
    UNIQUE (producto_menu_id, insumo_id)
);

-- Tabla: pedidos
CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(40) UNIQUE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    referencia_mesa VARCHAR(30) NULL,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
    total NUMERIC(12,2) CHECK (total >= 0)
);

-- Tabla: detalle_pedido
CREATE TABLE detalle_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_menu_id INTEGER REFERENCES productos_menu(id),
    cantidad INTEGER CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) CHECK (subtotal >= 0)
);

-- Tabla: movimientos_insumo
CREATE TABLE movimientos_insumo (
    id BIGSERIAL PRIMARY KEY,
    insumo_id INTEGER REFERENCES insumos(id),
    pedido_id BIGINT REFERENCES pedidos(id) NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'consumo', 'ajuste')),
    cantidad NUMERIC(12,3) CHECK (cantidad > 0),
    stock_antes NUMERIC(12,3) CHECK (stock_antes >= 0),
    stock_despues NUMERIC(12,3) CHECK (stock_despues >= 0),
    fecha TIMESTAMPTZ DEFAULT NOW(),
    motivo TEXT NOT NULL
);

-- Tabla: auditoria
CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) NULL,
    accion VARCHAR(20),
    metodo VARCHAR(10),
    ruta TEXT NOT NULL,
    recurso VARCHAR(80) NOT NULL,
    recurso_id VARCHAR(80) NULL,
    datos_anteriores JSONB NULL,
    datos_nuevos JSONB NULL,
    codigo_http INTEGER,
    ip INET NULL,
    user_agent TEXT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 3. CARGA DE DATOS INICIALES (SEED)
-- -------------------------------------------------------------

-- Usuarios (Contraseña de todos: 123456)
INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
('Carlos Admin', 'admin@restaurante.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'administrador'),
('Maria Operadora', 'operador@restaurante.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'operador'),
('Juan Consulta', 'consulta@restaurante.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'consulta'),
('Laura Auditora', 'auditor@restaurante.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'auditor');

-- Productos del Menú
INSERT INTO productos_menu (codigo, nombre, descripcion, precio) VALUES
('P001', 'Hamburguesa Especial', 'Carne 150g con queso y tocineta', 25000.00),
('P002', 'Jugo Natural', 'Jugo de fruta en agua o leche', 6000.00);

-- Insumos de Inventario
INSERT INTO insumos (codigo, nombre, unidad_medida, stock, stock_minimo) VALUES
('INS001', 'Carne de Res 150g', 'unidad', 30.000, 5.000),
('INS002', 'Pan Artesanal', 'unidad', 25.000, 5.000),
('INS003', 'Queso Cheddar', 'gramos', 1000.000, 100.000),
('INS004', 'Tocineta', 'gramos', 500.000, 50.000),
('INS005', 'Pulpa de Mora', 'gramos', 2000.000, 200.000);

-- Receta: Hamburguesa Especial (ID 1)
INSERT INTO receta_detalle (producto_menu_id, insumo_id, cantidad_por_porcion) VALUES
(1, 1, 1.000),   -- 1 Carne
(1, 2, 1.000),   -- 1 Pan
(1, 3, 30.000),  -- 30g Queso
(1, 4, 20.000);  -- 20g Tocineta

-- Receta: Jugo Natural (ID 2)
INSERT INTO receta_detalle (producto_menu_id, insumo_id, cantidad_por_porcion) VALUES
(2, 5, 150.000); -- 150g Pulpa