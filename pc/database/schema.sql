PRAGMA foreign_keys = ON;

-- =========================================================
-- CONFIGURACIÓN
-- =========================================================

CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    actualizado_en TEXT NOT NULL
);


-- =========================================================
-- DISPOSITIVOS
-- =========================================================

CREATE TABLE IF NOT EXISTS dispositivos (
    id_dispositivo TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL
        CHECK (tipo IN ('CELULAR', 'PC')),
    estado TEXT NOT NULL DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    creado_en TEXT NOT NULL,
    ultimo_sync TEXT
);


-- =========================================================
-- CLIENTES
-- =========================================================

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT DEFAULT '',
    direccion TEXT DEFAULT '',
    sector TEXT DEFAULT '',
    fecha_registro TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    observacion TEXT DEFAULT '',
    pendientes_actuales INTEGER NOT NULL DEFAULT 0
        CHECK (pendientes_actuales >= 0),
    creado_en TEXT NOT NULL,
    actualizado_en TEXT NOT NULL
);


-- =========================================================
-- VIAJES A PLANTA
-- =========================================================

CREATE TABLE IF NOT EXISTS viajes_planta (
    id_viaje TEXT PRIMARY KEY,
    camion TEXT NOT NULL
        CHECK (camion IN ('ROJO', 'BLANCO')),
    fecha_salida TEXT NOT NULL,
    movimiento_salida_id TEXT UNIQUE,
    fecha_regreso TEXT,
    movimiento_regreso_id TEXT UNIQUE,
    estado TEXT NOT NULL DEFAULT 'ABIERTO'
        CHECK (estado IN ('ABIERTO', 'CERRADO')),
    vacios_enviados INTEGER NOT NULL DEFAULT 0
        CHECK (vacios_enviados >= 0),
    llenos_recibidos INTEGER NOT NULL DEFAULT 0
        CHECK (llenos_recibidos >= 0),
    observacion TEXT DEFAULT ''
);


-- =========================================================
-- MOVIMIENTOS
-- =========================================================

CREATE TABLE IF NOT EXISTS movimientos (
    id_movimiento TEXT PRIMARY KEY,
    fecha_hora TEXT NOT NULL,

    tipo TEXT NOT NULL
        CHECK (
            tipo IN (
                'ENTREGA A CLIENTE',
                'RETIRO DE CLIENTE',
                'ENTREGA + RETIRO',
                'SALIDA A PLANTA',
                'REGRESO DE PLANTA',
                'TRASLADO ENTRE CAMIONES'
            )
        ),

    id_cliente TEXT,

    camion_origen TEXT
        CHECK (
            camion_origen IS NULL
            OR camion_origen IN ('ROJO', 'BLANCO')
        ),

    camion_destino TEXT
        CHECK (
            camion_destino IS NULL
            OR camion_destino IN ('ROJO', 'BLANCO')
        ),

    llenos INTEGER NOT NULL DEFAULT 0
        CHECK (llenos >= 0),

    vacios INTEGER NOT NULL DEFAULT 0
        CHECK (vacios >= 0),

    id_viaje TEXT,

    observacion TEXT DEFAULT '',

    estado TEXT NOT NULL DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'ANULADO')),

    id_dispositivo TEXT,

    creado_en TEXT NOT NULL,
    actualizado_en TEXT NOT NULL,

    sync_estado TEXT NOT NULL DEFAULT 'PENDIENTE'
        CHECK (
            sync_estado IN (
                'PENDIENTE',
                'SINCRONIZADO',
                'ERROR'
            )
        ),

    sync_error TEXT
);


-- =========================================================
-- INVENTARIO ACTUAL
-- =========================================================

CREATE TABLE IF NOT EXISTS inventario_actual (
    ubicacion TEXT PRIMARY KEY
        CHECK (
            ubicacion IN (
                'ROJO',
                'BLANCO',
                'CLIENTES'
            )
        ),

    llenos INTEGER NOT NULL DEFAULT 0
        CHECK (llenos >= 0),

    vacios INTEGER NOT NULL DEFAULT 0
        CHECK (vacios >= 0),

    pendientes INTEGER NOT NULL DEFAULT 0
        CHECK (pendientes >= 0),

    actualizado_en TEXT NOT NULL
);


-- =========================================================
-- CIERRES DEL DÍA
-- =========================================================

CREATE TABLE IF NOT EXISTS cierres_dia (
    id_cierre TEXT PRIMARY KEY,

    fecha TEXT NOT NULL UNIQUE,

    rojo_llenos INTEGER NOT NULL
        CHECK (rojo_llenos >= 0),

    rojo_vacios INTEGER NOT NULL
        CHECK (rojo_vacios >= 0),

    blanco_llenos INTEGER NOT NULL
        CHECK (blanco_llenos >= 0),

    blanco_vacios INTEGER NOT NULL
        CHECK (blanco_vacios >= 0),

    clientes_pendientes INTEGER NOT NULL
        CHECK (clientes_pendientes >= 0),

    total_empresa INTEGER NOT NULL
        CHECK (total_empresa >= 0),

    observacion TEXT DEFAULT '',

    cerrado_en TEXT NOT NULL,

    id_dispositivo TEXT
);


-- =========================================================
-- AUDITORÍA
-- =========================================================

CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria TEXT PRIMARY KEY,
    fecha_hora TEXT NOT NULL,

    accion TEXT NOT NULL,

    tabla TEXT NOT NULL,

    id_registro TEXT NOT NULL,

    id_dispositivo TEXT,

    detalle TEXT DEFAULT ''
);


-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_movimientos_fecha
ON movimientos(fecha_hora);

CREATE INDEX IF NOT EXISTS idx_movimientos_tipo
ON movimientos(tipo);

CREATE INDEX IF NOT EXISTS idx_movimientos_cliente
ON movimientos(id_cliente);

CREATE INDEX IF NOT EXISTS idx_movimientos_origen
ON movimientos(camion_origen);

CREATE INDEX IF NOT EXISTS idx_movimientos_destino
ON movimientos(camion_destino);

CREATE INDEX IF NOT EXISTS idx_movimientos_estado
ON movimientos(estado);

CREATE INDEX IF NOT EXISTS idx_movimientos_sync
ON movimientos(sync_estado);

CREATE INDEX IF NOT EXISTS idx_viajes_fecha
ON viajes_planta(fecha_salida);

CREATE INDEX IF NOT EXISTS idx_clientes_estado
ON clientes(estado);


-- =========================================================
-- DATOS INICIALES
-- =========================================================

INSERT OR IGNORE INTO configuracion
    (clave, valor, actualizado_en)
VALUES
    ('nombre_negocio', 'Distribuidora', datetime('now')),
    ('version_bd', '1', datetime('now'));


INSERT OR IGNORE INTO inventario_actual
    (ubicacion, llenos, vacios, pendientes, actualizado_en)
VALUES
    ('ROJO', 0, 0, 0, datetime('now')),
    ('BLANCO', 0, 0, 0, datetime('now')),
    ('CLIENTES', 0, 0, 0, datetime('now'));