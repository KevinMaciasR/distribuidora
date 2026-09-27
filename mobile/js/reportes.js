import { obtenerTodos } from './db.js';

function fechaLocalISO(fecha = new Date()) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export async function vendidosHoy() {
    const movimientos = await obtenerTodos('movimientos');

    const hoy = fechaLocalISO();

    return movimientos
        .filter(m =>
            m.estado === 'ACTIVO' &&
            m.fecha_hora?.slice(0, 10) === hoy &&
            (
                m.tipo === 'ENTREGA A CLIENTE' ||
                m.tipo === 'ENTREGA + RETIRO'
            )
        )
        .reduce(
            (total, m) => total + (m.llenos || 0),
            0
        );
}

export async function vendidosPorFecha(fecha) {
    const movimientos = await obtenerTodos('movimientos');

    return movimientos
        .filter(m =>
            m.estado === 'ACTIVO' &&
            m.fecha_hora?.slice(0, 10) === fecha &&
            (
                m.tipo === 'ENTREGA A CLIENTE' ||
                m.tipo === 'ENTREGA + RETIRO'
            )
        )
        .reduce(
            (total, m) => total + (m.llenos || 0),
            0
        );
}

export async function vendidosPorRango(fechaInicio, fechaFin) {
    const movimientos = await obtenerTodos('movimientos');

    return movimientos
        .filter(m => {
            if (m.estado !== 'ACTIVO') {
                return false;
            }

            const fecha = m.fecha_hora?.slice(0, 10);

            return (
                fecha >= fechaInicio &&
                fecha <= fechaFin &&
                (
                    m.tipo === 'ENTREGA A CLIENTE' ||
                    m.tipo === 'ENTREGA + RETIRO'
                )
            );
        })
        .reduce(
            (total, m) => total + (m.llenos || 0),
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