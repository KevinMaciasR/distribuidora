import sqlite3
from pathlib import Path

from operaciones import (
    entrega_cliente,
    retiro_cliente,
    entrega_retiro,
    salida_planta,
    regreso_planta,
    traslado_camiones,
    ejecutar_operacion
)


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_FILE = BASE_DIR / "distribuidora.db"


def conectar():
    conexion = sqlite3.connect(DATABASE_FILE)
    conexion.row_factory = sqlite3.Row
    conexion.execute("PRAGMA foreign_keys = ON")
    return conexion


def configurar_prueba():
    conexion = conectar()

    try:
        conexion.execute("""
            UPDATE inventario_actual
            SET
                llenos = 0,
                vacios = 0,
                pendientes = 0
        """)

        conexion.execute("""
            UPDATE clientes
            SET
                pendientes_actuales = 0
        """)

        conexion.execute("""
            INSERT OR IGNORE INTO clientes (
                id_cliente,
                nombre,
                telefono,
                direccion,
                sector,
                fecha_registro,
                estado,
                observacion,
                pendientes_actuales,
                creado_en,
                actualizado_en
            )
            VALUES (
                'CLIENTE-PRUEBA',
                'Cliente de prueba',
                '',
                '',
                '',
                datetime('now'),
                'ACTIVO',
                '',
                0,
                datetime('now'),
                datetime('now')
            )
        """)

        conexion.execute("""
            UPDATE inventario_actual
            SET llenos = 150, vacios = 30
            WHERE ubicacion = 'ROJO'
        """)

        conexion.execute("""
            UPDATE inventario_actual
            SET llenos = 100, vacios = 50
            WHERE ubicacion = 'BLANCO'
        """)

        conexion.commit()

    finally:
        conexion.close()


def mostrar_inventario(conexion):
    print("\nINVENTARIO")

    filas = conexion.execute("""
        SELECT *
        FROM inventario_actual
        ORDER BY ubicacion
    """).fetchall()

    total = 0

    for fila in filas:
        if fila["ubicacion"] == "CLIENTES":
            cantidad = fila["pendientes"]

            print(
                f"  {fila['ubicacion']}: "
                f"Pendientes={cantidad}"
            )

            total += cantidad

        else:
            cantidad = (
                fila["llenos"]
                + fila["vacios"]
            )

            print(
                f"  {fila['ubicacion']}: "
                f"Llenos={fila['llenos']} "
                f"Vacíos={fila['vacios']}"
            )

            total += cantidad

    print(f"\nTOTAL EMPRESA: {total}")


def main():
    configurar_prueba()

    conexion = conectar()

    try:
        mostrar_inventario(conexion)

        print("\n1. Entrega a cliente")
        ejecutar_operacion(
            conexion,
            entrega_cliente,
            "CLIENTE-PRUEBA",
            "ROJO",
            10,
            id_dispositivo="PC-01"
        )
        mostrar_inventario(conexion)

        print("\n2. Retiro de cliente")
        ejecutar_operacion(
            conexion,
            retiro_cliente,
            "CLIENTE-PRUEBA",
            "ROJO",
            5,
            id_dispositivo="PC-01"
        )
        mostrar_inventario(conexion)

        print("\n3. Entrega + retiro")
        ejecutar_operacion(
            conexion,
            entrega_retiro,
            "CLIENTE-PRUEBA",
            "ROJO",
            8,
            5,
            id_dispositivo="PC-01"
        )
        mostrar_inventario(conexion)

        print("\n4. Salida a planta")
        ejecutar_operacion(
            conexion,
            salida_planta,
            "ROJO",
            10,
            id_dispositivo="PC-01"
        )
        mostrar_inventario(conexion)

        print("\n5. Regreso de planta")
        ejecutar_operacion(
            conexion,
            regreso_planta,
            "ROJO",
            10,
            id_dispositivo="PC-01"
        )
        mostrar_inventario(conexion)

        print("\n6. Traslado de llenos")
        ejecutar_operacion(
            conexion,
            traslado_camiones,
            "ROJO",
            "BLANCO",
            10,
            0,
            id_dispositivo="PC-01"
        )
        mostrar_inventario(conexion)

        print("\n7. Traslado de vacíos")
        ejecutar_operacion(
            conexion,
            traslado_camiones,
            "BLANCO",
            "ROJO",
            0,
            10,
            id_dispositivo="PC-01"
        )
        mostrar_inventario(conexion)

        print("\nPRUEBA TERMINADA.")

    finally:
        conexion.close()


if __name__ == "__main__":
    main()