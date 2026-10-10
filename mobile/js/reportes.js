import { obtenerTodos } from './db.js';

function fechaLocalISO(fecha = new Date()) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


/**
 * Obtiene el inventario actual para el reporte diario.
 * No recalcula el inventario desde el historial.
 */
export async function obtenerInventarioReporte() {
    const registros = await obtenerTodos('inventario');

    const buscar = ubicacion =>
        registros.find(item => item.ubicacion === ubicacion) || {};

    const rojo = buscar('ROJO');
    const blanco = buscar('BLANCO');
    const clientes = buscar('CLIENTES');
    const sinAsignar = buscar('SIN ASIGNAR');

    const inventario = {
        rojoLlenos: Number(rojo.llenos) || 0,
        rojoVacios: Number(rojo.vacios) || 0,

        blancoLlenos: Number(blanco.llenos) || 0,
        blancoVacios: Number(blanco.vacios) || 0,

        pendientesClientes: Number(clientes.pendientes) || 0,

        sinAsignarLlenos: Number(sinAsignar.llenos) || 0,
        sinAsignarVacios: Number(sinAsignar.vacios) || 0
    };

    inventario.total =
        inventario.rojoLlenos +
        inventario.rojoVacios +
        inventario.blancoLlenos +
        inventario.blancoVacios +
        inventario.pendientesClientes +
        inventario.sinAsignarLlenos +
        inventario.sinAsignarVacios;

    return inventario;
}


/**
 * Devuelve las ventas por cliente dentro de un rango.
 * Solo considera movimientos activos de entrega.
 */

export async function vendidosPorClienteRango(fechaInicio, fechaFin) {
    const [movimientos, clientes] = await Promise.all([
        obtenerTodos('movimientos'),
        obtenerTodos('clientes')
    ]);

    const nombres = Object.fromEntries(
        clientes.map(cliente => [
            cliente.id_cliente,
            cliente.nombre
        ])
    );

    const resultado = {};

    movimientos
        .filter(m => {
            if (m.estado !== 'ACTIVO') return false;

            const fechaLocal = m.fecha_hora
                ? new Date(m.fecha_hora).toLocaleDateString('en-CA', {
                    timeZone: 'America/Guayaquil'
                })
                : m.fecha;

            return (
                fechaLocal >= fechaInicio &&
                fechaLocal <= fechaFin &&
                (
                    m.tipo === 'ENTREGA A CLIENTE' ||
                    m.tipo === 'ENTREGA + RETIRO'
                )
            );
        })
        .forEach(m => {
            const id = m.cliente || m.id_cliente || 'SIN CLIENTE';
            const cantidad = Number(m.llenos) || 0;

            if (!resultado[id]) {
                resultado[id] = {
                    idCliente: id,
                    nombre: nombres[id] || id,
                    cantidad: 0
                };
            }

            resultado[id].cantidad += cantidad;
        });

    return Object.values(resultado)
        .sort((a, b) => b.cantidad - a.cantidad);
}



export async function vendidosPorFecha(fecha) {
    const movimientos = await obtenerTodos('movimientos');

    return movimientos
        .filter(m => {
            if (m.estado !== 'ACTIVO') return false;

            const fechaLocal = m.fecha_hora
                ? new Date(m.fecha_hora).toLocaleDateString('en-CA', {
                    timeZone: 'America/Guayaquil'
                })
                : m.fecha;

            return (
                fechaLocal === fecha &&
                (
                    m.tipo === 'ENTREGA A CLIENTE' ||
                    m.tipo === 'ENTREGA + RETIRO'
                )
            );
        })
        .reduce(
            (total, m) => total + (Number(m.llenos) || 0),
            0
        );
}

export async function vendidosPorRango(fechaInicio, fechaFin) {
    const movimientos = await obtenerTodos('movimientos');

    return movimientos
        .filter(m => {
            if (m.estado !== 'ACTIVO') return false;

            const fechaLocal = m.fecha_hora
                ? new Date(m.fecha_hora).toLocaleDateString('en-CA', {
                    timeZone: 'America/Guayaquil'
                })
                : m.fecha;

            return (
                fechaLocal >= fechaInicio &&
                fechaLocal <= fechaFin &&
                (
                    m.tipo === 'ENTREGA A CLIENTE' ||
                    m.tipo === 'ENTREGA + RETIRO'
                )
            );
        })
        .reduce(
            (total, m) => total + (Number(m.llenos) || 0),
            0
        );
}

export async function vendidosPorCliente() {
    const movimientos = await obtenerTodos('movimientos');

    const resultado = {};

    movimientos
        .filter(m =>
            m.estado === 'ACTIVO' &&
            (
                m.tipo === 'ENTREGA A CLIENTE' ||
                m.tipo === 'ENTREGA + RETIRO'
            )
        )
        .forEach(m => {
            const cliente = m.id_cliente || 'SIN CLIENTE';

            if (!resultado[cliente]) {
                resultado[cliente] = 0;
            }

            resultado[cliente] += m.llenos || 0;
        });

    return resultado;
}

export async function vendidosHoy() {
    const movimientos = await obtenerTodos('movimientos');
    const hoy = fechaLocalISO();

    return movimientos
        .filter(m => {
            if (m.estado !== 'ACTIVO') return false;

            const fechaLocal = m.fecha_hora
                ? new Date(m.fecha_hora).toLocaleDateString('en-CA', {
                    timeZone: 'America/Guayaquil'
                })
                : m.fecha;

            return (
                fechaLocal === hoy &&
                (
                    m.tipo === 'ENTREGA A CLIENTE' ||
                    m.tipo === 'ENTREGA + RETIRO'
                )
            );
        })
        .reduce(
            (total, m) => total + (Number(m.llenos) || 0),
            0
        );
}

function fechaLocalDeReporte(fechaHora) {
    if (!fechaHora) return '';

    return new Date(fechaHora).toLocaleDateString('en-CA', {
        timeZone: 'America/Guayaquil'
    });
}

function horaLocalDeReporte(fechaHora) {
    if (!fechaHora) return 'Hora no disponible';

    return new Date(fechaHora).toLocaleTimeString('es-EC', {
        timeZone: 'America/Guayaquil',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

export async function obtenerVentasDetallePorFecha(fecha) {
    const [movimientos, clientes] = await Promise.all([
        obtenerTodos('movimientos'),
        obtenerTodos('clientes')
    ]);

    const nombres = Object.fromEntries(
        clientes.map(c => [c.id_cliente, c.nombre])
    );

    return movimientos
        .filter(m => {
            if (m.estado !== 'ACTIVO') return false;

            const fechaLocal = m.fecha_hora
                ? fechaLocalDeReporte(m.fecha_hora)
                : m.fecha;

            return (
                fechaLocal === fecha &&
                (
                    m.tipo === 'ENTREGA A CLIENTE' ||
                    m.tipo === 'ENTREGA + RETIRO'
                )
            );
        })
        .map(m => {
            const idCliente = m.cliente || m.id_cliente;

            return {
                cliente: nombres[idCliente] || idCliente || 'Sin cliente',
                cantidad: Number(m.llenos) || 0,
                fechaHora: m.fecha_hora,
                hora: horaLocalDeReporte(m.fecha_hora)
            };
        })
        .sort((a, b) => {
            if (!a.fechaHora) return 1;
            if (!b.fechaHora) return -1;

            return new Date(a.fechaHora) - new Date(b.fechaHora);
        });
}

export async function obtenerViajesPlantaPorRango(fechaInicio, fechaFin) {
    const viajes = await obtenerTodos('viajes_planta');

    return viajes
        .filter(v => {
            const fechaLocal = v.fecha_salida
                ? fechaLocalDeReporte(v.fecha_salida)
                : '';

            return (
                fechaLocal >= fechaInicio &&
                fechaLocal <= fechaFin
            );
        })
        .map(v => ({
            camion: v.camion || 'Camión no identificado',
            cantidad: Number(v.vacios_enviados) || 0,
            fecha: fechaLocalDeReporte(v.fecha_salida),
            fechaHora: v.fecha_salida,
            hora: horaLocalDeReporte(v.fecha_salida)
        }))
        .sort((a, b) => {
            if (!a.fechaHora) return 1;
            if (!b.fechaHora) return -1;

            return new Date(a.fechaHora) - new Date(b.fechaHora);
        });
}

function esVentaMovimiento(m) {
    const tipo = String(
        m.tipo_movimiento ?? m.tipo ?? ''
    ).trim().toLowerCase();

    return (
        tipo === 'entrega' ||
        tipo === 'entrega_retiro' ||
        tipo === 'entrega a cliente' ||
        tipo === 'entrega + retiro'
    );
}

function fechaDelMovimiento(m) {
    return String(
        m.fecha_hora ?? m.fecha ?? ''
    ).slice(0, 10);
}
