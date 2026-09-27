import sqlite3
import uuid
from datetime import datetime


TIPOS_MOVIMIENTO = {
    "ENTREGA_CLIENTE": "ENTREGA A CLIENTE",
    "RETIRO_CLIENTE": "RETIRO DE CLIENTE",
    "ENTREGA_RETIRO": "ENTREGA + RETIRO",
    "SALIDA_PLANTA": "SALIDA A PLANTA",
    "REGRESO_PLANTA": "REGRESO DE PLANTA",
    "TRASLADO": "TRASLADO ENTRE CAMIONES",
}

CAMIONES = ("ROJO", "BLANCO")

ESTADOS_MOVIMIENTO = ("ACTIVO", "ANULADO")


def generar_id():
    return str(uuid.uuid4())


def fecha_actual():
    return datetime.now().isoformat(timespec="seconds")


def validar_entero(valor, nombre):
    if not isinstance(valor, int):
        raise ValueError(f"{nombre} debe ser un número entero.")

    if valor < 0:
        raise ValueError(f"{nombre} no puede ser negativo.")


def validar_cantidad_positiva(valor, nombre):
    validar_entero(valor, nombre)

    if valor <= 0:
        raise ValueError(f"{nombre} debe ser mayor que cero.")


def validar_camion(camion, nombre="camión"):
    if camion not in CAMIONES:
        raise ValueError(
            f"{nombre} debe ser ROJO o BLANCO."
        )


def obtener_inventario(conexion, ubicacion):
    fila = conexion.execute(
        """
        SELECT *
        FROM inventario_actual
        WHERE ubicacion = ?
        """,
        (ubicacion,)
    ).fetchone()

    if fila is None:
        raise ValueError(
            f"No existe la ubicación {ubicacion}."
        )

    return dict(fila)


def obtener_cliente(conexion, id_cliente):
    fila = conexion.execute(
        """
        SELECT *
        FROM clientes
        WHERE id_cliente = ?
        """,
        (id_cliente,)
    ).fetchone()

    if fila is None:
        raise ValueError(
            "El cliente no existe."
        )

    return dict(fila)


def validar_cliente_activo(conexion, id_cliente):
    cliente = obtener_cliente(conexion, id_cliente)

    if cliente["estado"] != "ACTIVO":
        raise ValueError(
            "El cliente está inactivo."
        )

    return cliente


def actualizar_inventario(
    conexion,
    ubicacion,
    llenos=None,
    vacios=None,
    pendientes=None
):
    actual = obtener_inventario(
        conexion,
        ubicacion
    )

    nuevos_llenos = (
        actual["llenos"]
        if llenos is None
        else llenos
    )

    nuevos_vacios = (
        actual["vacios"]
        if vacios is None
        else vacios
    )

    nuevos_pendientes = (
        actual["pendientes"]
        if pendientes is None
        else pendientes
    )

    if nuevos_llenos < 0:
        raise ValueError(
            f"{ubicacion}: los llenos no pueden quedar negativos."
        )

    if nuevos_vacios < 0:
        raise ValueError(
            f"{ubicacion}: los vacíos no pueden quedar negativos."
        )

    if nuevos_pendientes < 0:
        raise ValueError(
            f"{ubicacion}: los pendientes no pueden quedar negativos."
        )

    conexion.execute(
        """
        UPDATE inventario_actual
        SET
            llenos = ?,
            vacios = ?,
            pendientes = ?,
            actualizado_en = ?
        WHERE ubicacion = ?
        """,
        (
            nuevos_llenos,
            nuevos_vacios,
            nuevos_pendientes,
            fecha_actual(),
            ubicacion
        )
    )


def actualizar_pendientes_cliente(
    conexion,
    id_cliente,
    cantidad
):
    cliente = obtener_cliente(
        conexion,
        id_cliente
    )

    nuevos_pendientes = (
        cliente["pendientes_actuales"]
        + cantidad
    )

    if nuevos_pendientes < 0:
        raise ValueError(
            "Los pendientes del cliente no pueden quedar negativos."
        )

    conexion.execute(
        """
        UPDATE clientes
        SET
            pendientes_actuales = ?,
            actualizado_en = ?
        WHERE id_cliente = ?
        """,
        (
            nuevos_pendientes,
            fecha_actual(),
            id_cliente
        )
    )

    return nuevos_pendientes


def registrar_movimiento(
    conexion,
    *,
    tipo,
    id_cliente=None,
    camion_origen=None,
    camion_destino=None,
    llenos=0,
    vacios=0,
    id_viaje=None,
    observacion="",
    id_dispositivo=None
):
    id_movimiento = generar_id()
    ahora = fecha_actual()

    conexion.execute(
        """
        INSERT INTO movimientos (
            id_movimiento,
            fecha_hora,
            tipo,
            id_cliente,
            camion_origen,
            camion_destino,
            llenos,
            vacios,
            id_viaje,
            observacion,
            estado,
            id_dispositivo,
            creado_en,
            actualizado_en,
            sync_estado,
            sync_error
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            id_movimiento,
            ahora,
            tipo,
            id_cliente,
            camion_origen,
            camion_destino,
            llenos,
            vacios,
            id_viaje,
            observacion,
            "ACTIVO",
            id_dispositivo,
            ahora,
            ahora,
            "PENDIENTE",
            None
        )
    )

    return id_movimiento


def registrar_auditoria(
    conexion,
    accion,
    tabla,
    id_registro,
    id_dispositivo=None,
    detalle=""
):
    conexion.execute(
        """
        INSERT INTO auditoria (
            id_auditoria,
            fecha_hora,
            accion,
            tabla,
            id_registro,
            id_dispositivo,
            detalle
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            generar_id(),
            fecha_actual(),
            accion,
            tabla,
            id_registro,
            id_dispositivo,
            detalle
        )
    )


def entrega_cliente(
    conexion,
    id_cliente,
    camion,
    llenos,
    observacion="",
    id_dispositivo=None
):
    validar_camion(camion)
    validar_cantidad_positiva(llenos, "Llenos")

    cliente = validar_cliente_activo(
        conexion,
        id_cliente
    )

    inventario = obtener_inventario(
        conexion,
        camion
    )

    if inventario["llenos"] < llenos:
        raise ValueError(
            f"{camion}: no hay suficientes cilindros llenos."
        )

    actualizar_inventario(
        conexion,
        camion,
        llenos=inventario["llenos"] - llenos
    )

    actualizar_pendientes_cliente(
        conexion,
        id_cliente,
        llenos
    )

    nuevo_pendiente = (
        cliente["pendientes_actuales"] + llenos
    )

    actualizar_inventario(
        conexion,
        "CLIENTES",
        pendientes=(
            obtener_inventario(
                conexion,
                "CLIENTES"
            )["pendientes"] + llenos
        )
    )

    id_movimiento = registrar_movimiento(
        conexion,
        tipo=TIPOS_MOVIMIENTO["ENTREGA_CLIENTE"],
        id_cliente=id_cliente,
        camion_origen=camion,
        llenos=llenos,
        observacion=observacion,
        id_dispositivo=id_dispositivo
    )

    registrar_auditoria(
        conexion,
        "CREAR",
        "movimientos",
        id_movimiento,
        id_dispositivo,
        f"Entrega de {llenos} llenos al cliente."
    )

    return id_movimiento


def retiro_cliente(
    conexion,
    id_cliente,
    camion,
    vacios,
    observacion="",
    id_dispositivo=None
):
    validar_camion(camion)
    validar_cantidad_positiva(vacios, "Vacíos")

    cliente = validar_cliente_activo(
        conexion,
        id_cliente
    )

    if cliente["pendientes_actuales"] < vacios:
        raise ValueError(
            "No puedes retirar más cilindros "
            "de los que el cliente tiene pendientes."
        )

    inventario_camion = obtener_inventario(
        conexion,
        camion
    )

    actualizar_pendientes_cliente(
        conexion,
        id_cliente,
        -vacios
    )

    inventario_clientes = obtener_inventario(
        conexion,
        "CLIENTES"
    )

    actualizar_inventario(
        conexion,
        "CLIENTES",
        pendientes=(
            inventario_clientes["pendientes"] - vacios
        )
    )

    actualizar_inventario(
        conexion,
        camion,
        vacios=inventario_camion["vacios"] + vacios
    )

    id_movimiento = registrar_movimiento(
        conexion,
        tipo=TIPOS_MOVIMIENTO["RETIRO_CLIENTE"],
        id_cliente=id_cliente,
        camion_destino=camion,
        vacios=vacios,
        observacion=observacion,
        id_dispositivo=id_dispositivo
    )

    registrar_auditoria(
        conexion,
        "CREAR",
        "movimientos",
        id_movimiento,
        id_dispositivo,
        f"Retiro de {vacios} vacíos del cliente."
    )

    return id_movimiento


def entrega_retiro(
    conexion,
    id_cliente,
    camion,
    llenos,
    vacios,
    observacion="",
    id_dispositivo=None
):
    validar_camion(camion)
    validar_cantidad_positiva(llenos, "Llenos")
    validar_cantidad_positiva(vacios, "Vacíos")

    cliente = validar_cliente_activo(
        conexion,
        id_cliente
    )

    inventario_camion = obtener_inventario(
        conexion,
        camion
    )

    if inventario_camion["llenos"] < llenos:
        raise ValueError(
            f"{camion}: no hay suficientes cilindros llenos."
        )

    if cliente["pendientes_actuales"] < vacios:
        raise ValueError(
            "No puedes retirar más cilindros "
            "de los que el cliente tiene pendientes."
        )

    inventario_clientes = obtener_inventario(
        conexion,
        "CLIENTES"
    )

    nuevos_pendientes = (
        cliente["pendientes_actuales"]
        + llenos
        - vacios
    )

    if nuevos_pendientes < 0:
        raise ValueError(
            "Los pendientes del cliente no pueden quedar negativos."
        )

    nuevos_pendientes_empresa = (
        inventario_clientes["pendientes"]
        + llenos
        - vacios
    )

    actualizar_inventario(
        conexion,
        camion,
        llenos=inventario_camion["llenos"] - llenos,
        vacios=inventario_camion["vacios"] + vacios
    )

    actualizar_pendientes_cliente(
        conexion,
        id_cliente,
        llenos - vacios
    )

    actualizar_inventario(
        conexion,
        "CLIENTES",
        pendientes=nuevos_pendientes_empresa
    )

    id_movimiento = registrar_movimiento(
        conexion,
        tipo=TIPOS_MOVIMIENTO["ENTREGA_RETIRO"],
        id_cliente=id_cliente,
        camion_origen=camion,
        llenos=llenos,
        vacios=vacios,
        observacion=observacion,
        id_dispositivo=id_dispositivo
    )

    registrar_auditoria(
        conexion,
        "CREAR",
        "movimientos",
        id_movimiento,
        id_dispositivo,
        (
            f"Entrega de {llenos} llenos y "
            f"retiro de {vacios} vacíos."
        )
    )

    return id_movimiento


def salida_planta(
    conexion,
    camion,
    vacios,
    observacion="",
    id_dispositivo=None
):
    validar_camion(camion)
    validar_cantidad_positiva(vacios, "Vacíos")

    inventario = obtener_inventario(
        conexion,
        camion
    )

    if inventario["vacios"] < vacios:
        raise ValueError(
            f"{camion}: no hay suficientes cilindros vacíos."
        )

    id_viaje = generar_id()

    actualizar_inventario(
        conexion,
        camion,
        vacios=inventario["vacios"] - vacios
    )

    ahora = fecha_actual()

    conexion.execute(
        """
        INSERT INTO viajes_planta (
            id_viaje,
            camion,
            fecha_salida,
            estado,
            vacios_enviados,
            llenos_recibidos,
            observacion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            id_viaje,
            camion,
            ahora,
            "ABIERTO",
            vacios,
            0,
            observacion
        )
    )

    id_movimiento = registrar_movimiento(
        conexion,
        tipo=TIPOS_MOVIMIENTO["SALIDA_PLANTA"],
        camion_origen=camion,
        vacios=vacios,
        id_viaje=id_viaje,
        observacion=observacion,
        id_dispositivo=id_dispositivo
    )

    conexion.execute(
        """
        UPDATE viajes_planta
        SET movimiento_salida_id = ?
        WHERE id_viaje = ?
        """,
        (
            id_movimiento,
            id_viaje
        )
    )

    registrar_auditoria(
        conexion,
        "CREAR",
        "movimientos",
        id_movimiento,
        id_dispositivo,
        f"Salida a planta de {vacios} vacíos."
    )

    return id_movimiento


def obtener_viaje_abierto(conexion, camion):
    fila = conexion.execute(
        """
        SELECT *
        FROM viajes_planta
        WHERE camion = ?
          AND estado = 'ABIERTO'
        ORDER BY fecha_salida DESC
        LIMIT 1
        """,
        (camion,)
    ).fetchone()

    if fila is None:
        raise ValueError(
            f"No existe un viaje abierto para {camion}."
        )

    return dict(fila)


def regreso_planta(
    conexion,
    camion,
    llenos,
    observacion="",
    id_dispositivo=None
):
    validar_camion(camion)
    validar_cantidad_positiva(llenos, "Llenos")

    viaje = obtener_viaje_abierto(
        conexion,
        camion
    )

    if llenos != viaje["vacios_enviados"]:
        raise ValueError(
            "La cantidad que regresa de planta "
            "debe ser igual a la cantidad enviada."
        )

    inventario = obtener_inventario(
        conexion,
        camion
    )

    actualizar_inventario(
        conexion,
        camion,
        llenos=inventario["llenos"] + llenos
    )

    id_movimiento = registrar_movimiento(
        conexion,
        tipo=TIPOS_MOVIMIENTO["REGRESO_PLANTA"],
        camion_destino=camion,
        llenos=llenos,
        id_viaje=viaje["id_viaje"],
        observacion=observacion,
        id_dispositivo=id_dispositivo
    )

    ahora = fecha_actual()

    conexion.execute(
        """
        UPDATE viajes_planta
        SET
            fecha_regreso = ?,
            movimiento_regreso_id = ?,
            estado = 'CERRADO',
            llenos_recibidos = ?,
            observacion = ?
        WHERE id_viaje = ?
        """,
        (
            ahora,
            id_movimiento,
            llenos,
            observacion,
            viaje["id_viaje"]
        )
    )

    registrar_auditoria(
        conexion,
        "CREAR",
        "movimientos",
        id_movimiento,
        id_dispositivo,
        f"Regreso de planta con {llenos} llenos."
    )

    return id_movimiento


def traslado_camiones(
    conexion,
    camion_origen,
    camion_destino,
    llenos=0,
    vacios=0,
    observacion="",
    id_dispositivo=None
):
    validar_camion(camion_origen, "Camión origen")
    validar_camion(camion_destino, "Camión destino")

    if camion_origen == camion_destino:
        raise ValueError(
            "El camión origen y destino deben ser diferentes."
        )

    if llenos <= 0 and vacios <= 0:
        raise ValueError(
            "Debes trasladar al menos un cilindro."
        )

    if llenos > 0 and vacios > 0:
        raise ValueError(
            "Un traslado debe realizarse con llenos "
            "o con vacíos, no ambos simultáneamente."
        )

    origen = obtener_inventario(
        conexion,
        camion_origen
    )

    destino = obtener_inventario(
        conexion,
        camion_destino
    )

    if llenos > 0:
        validar_cantidad_positiva(llenos, "Llenos")

        if origen["llenos"] < llenos:
            raise ValueError(
                f"{camion_origen}: no hay suficientes llenos."
            )

        actualizar_inventario(
            conexion,
            camion_origen,
            llenos=origen["llenos"] - llenos
        )

        actualizar_inventario(
            conexion,
            camion_destino,
            llenos=destino["llenos"] + llenos
        )

    else:
        validar_cantidad_positiva(vacios, "Vacíos")

        if origen["vacios"] < vacios:
            raise ValueError(
                f"{camion_origen}: no hay suficientes vacíos."
            )

        actualizar_inventario(
            conexion,
            camion_origen,
            vacios=origen["vacios"] - vacios
        )

        actualizar_inventario(
            conexion,
            camion_destino,
            vacios=destino["vacios"] + vacios
        )

    id_movimiento = registrar_movimiento(
        conexion,
        tipo=TIPOS_MOVIMIENTO["TRASLADO"],
        camion_origen=camion_origen,
        camion_destino=camion_destino,
        llenos=llenos,
        vacios=vacios,
        observacion=observacion,
        id_dispositivo=id_dispositivo
    )

    registrar_auditoria(
        conexion,
        "CREAR",
        "movimientos",
        id_movimiento,
        id_dispositivo,
        (
            f"Traslado {camion_origen} → "
            f"{camion_destino}."
        )
    )

    return id_movimiento


def ejecutar_operacion(conexion, funcion, *args, **kwargs):
    try:
        resultado = funcion(
            conexion,
            *args,
            **kwargs
        )

        conexion.commit()

        return resultado

    except Exception:
        conexion.rollback()
        raise