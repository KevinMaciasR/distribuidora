import {
    obtener,
    guardar,
    obtenerTodos
} from './db.js';


export const UBICACIONES = {
    ROJO: 'ROJO',
    BLANCO: 'BLANCO',
    CLIENTES: 'CLIENTES',
    SIN_ASIGNAR: 'SIN ASIGNAR'
};


/* =====================================================
   INICIALIZAR INVENTARIO
===================================================== */

export async function inicializarInventario() {

    const inventario =
        await obtenerTodos('inventario');


    // Crear solamente las ubicaciones que todavía no existan.
    // Esto permite actualizar instalaciones que ya tienen
    // ROJO, BLANCO y CLIENTES sin borrar sus datos.

    const rojo =
        inventario.find(
            item => item.ubicacion === UBICACIONES.ROJO
        );

    if (!rojo) {

        await guardar('inventario', {
            ubicacion: UBICACIONES.ROJO,
            llenos: 0,
            vacios: 0
        });

    }


    const blanco =
        inventario.find(
            item => item.ubicacion === UBICACIONES.BLANCO
        );

    if (!blanco) {

        await guardar('inventario', {
            ubicacion: UBICACIONES.BLANCO,
            llenos: 0,
            vacios: 0
        });

    }


    const clientes =
        inventario.find(
            item => item.ubicacion === UBICACIONES.CLIENTES
        );

    if (!clientes) {

        await guardar('inventario', {
            ubicacion: UBICACIONES.CLIENTES,
            pendientes: 0
        });

    }


    const sinAsignar =
        inventario.find(
            item => item.ubicacion === UBICACIONES.SIN_ASIGNAR
        );

    if (!sinAsignar) {

        await guardar('inventario', {
            ubicacion: UBICACIONES.SIN_ASIGNAR,
            llenos: 0,
            vacios: 0
        });

    }
}


/* =====================================================
   OBTENER INVENTARIO
===================================================== */

export async function obtenerInventario() {

    await inicializarInventario();


    const rojo =
        await obtener(
            'inventario',
            UBICACIONES.ROJO
        );


    const blanco =
        await obtener(
            'inventario',
            UBICACIONES.BLANCO
        );


    const clientes =
        await obtener(
            'inventario',
            UBICACIONES.CLIENTES
        );


    const sinAsignar =
        await obtener(
            'inventario',
            UBICACIONES.SIN_ASIGNAR
        );


    return {
        rojo,
        blanco,
        clientes,
        sinAsignar
    };
}


/* =====================================================
   ACTUALIZAR UNA UBICACIÓN
===================================================== */

export async function actualizarInventario(
    ubicacion,
    cambios
) {

    const actual =
        await obtener(
            'inventario',
            ubicacion
        );


    if (!actual) {

        throw new Error(
            `No existe la ubicación ${ubicacion}.`
        );

    }


    const nuevo = {
        ...actual,
        ...cambios,
        ubicacion
    };


    validarNoNegativos(nuevo);


    await guardar(
        'inventario',
        nuevo
    );


    return nuevo;
}


/* =====================================================
   VALIDAR NO NEGATIVOS
===================================================== */

function validarNoNegativos(inventario) {

    if (
        inventario.llenos !== undefined &&
        (
            !Number.isInteger(inventario.llenos) ||
            inventario.llenos < 0
        )
    ) {

        throw new Error(
            'Los cilindros llenos deben ser un número entero mayor o igual a 0.'
        );

    }


    if (
        inventario.vacios !== undefined &&
        (
            !Number.isInteger(inventario.vacios) ||
            inventario.vacios < 0
        )
    ) {

        throw new Error(
            'Los cilindros vacíos deben ser un número entero mayor o igual a 0.'
        );

    }


    if (
        inventario.pendientes !== undefined &&
        (
            !Number.isInteger(inventario.pendientes) ||
            inventario.pendientes < 0
        )
    ) {

        throw new Error(
            'Los pendientes de clientes deben ser un número entero mayor o igual a 0.'
        );

    }
}


/* =====================================================
   CALCULAR TOTAL EMPRESA
===================================================== */

export function calcularTotal(inventario) {

    const rojo =
        (inventario.rojo?.llenos || 0) +
        (inventario.rojo?.vacios || 0);


    const blanco =
        (inventario.blanco?.llenos || 0) +
        (inventario.blanco?.vacios || 0);


    const clientes =
        inventario.clientes?.pendientes || 0;


    const sinAsignar =
        (inventario.sinAsignar?.llenos || 0) +
        (inventario.sinAsignar?.vacios || 0);


    return (
        rojo +
        blanco +
        clientes +
        sinAsignar
    );
}


/* =====================================================
   CONFIGURAR APERTURA
===================================================== */

export async function configurarApertura({
    rojoLlenos,
    rojoVacios,
    blancoLlenos,
    blancoVacios,
    clientesPendientes
}) {

    const movimientos =
        await obtenerTodos('movimientos');


    if (movimientos.length > 0) {

        throw new Error(
            'No puedes modificar la apertura después de registrar movimientos.'
        );

    }


    const valores = [
        rojoLlenos,
        rojoVacios,
        blancoLlenos,
        blancoVacios,
        clientesPendientes
    ];


    if (
        valores.some(
            valor =>
                !Number.isInteger(valor) ||
                valor < 0
        )
    ) {

        throw new Error(
            'Todos los valores deben ser números enteros mayores o iguales a 0.'
        );

    }


    await guardar(
        'inventario',
        {
            ubicacion: UBICACIONES.ROJO,
            llenos: rojoLlenos,
            vacios: rojoVacios
        }
    );


    await guardar(
        'inventario',
        {
            ubicacion: UBICACIONES.BLANCO,
            llenos: blancoLlenos,
            vacios: blancoVacios
        }
    );


    await guardar(
        'inventario',
        {
            ubicacion: UBICACIONES.CLIENTES,
            pendientes: clientesPendientes
        }
    );


    // La apertura comienza sin cilindros adicionales
    // sin asignar, salvo que posteriormente se agreguen.

    await guardar(
        'inventario',
        {
            ubicacion: UBICACIONES.SIN_ASIGNAR,
            llenos: 0,
            vacios: 0
        }
    );


    return obtenerInventario();
}


/* =====================================================
   AÑADIR CILINDROS SIN ASIGNAR
===================================================== */

export async function agregarSinAsignar({
    llenos = 0,
    vacios = 0,
    observacion = ''
}) {

    llenos = Number(llenos);
    vacios = Number(vacios);


    validarCantidad(
        llenos,
        vacios
    );


    if (llenos === 0 && vacios === 0) {

        throw new Error(
            'Debes agregar al menos un cilindro.'
        );

    }


    const actual =
        await obtener(
            'inventario',
            UBICACIONES.SIN_ASIGNAR
        );


    if (!actual) {

        throw new Error(
            'No existe la ubicación SIN ASIGNAR.'
        );

    }


    await guardar(
        'inventario',
        {
            ...actual,
            llenos:
                (actual.llenos || 0) +
                llenos,
            vacios:
                (actual.vacios || 0) +
                vacios
        }
    );


    return {
        llenos,
        vacios,
        observacion
    };
}


/* =====================================================
   RETIRAR CILINDROS SIN ASIGNAR
===================================================== */

export async function retirarSinAsignar({
    llenos = 0,
    vacios = 0,
    observacion = ''
}) {

    llenos = Number(llenos);
    vacios = Number(vacios);


    validarCantidad(
        llenos,
        vacios
    );


    if (llenos === 0 && vacios === 0) {

        throw new Error(
            'Debes retirar al menos un cilindro.'
        );

    }


    const actual =
        await obtener(
            'inventario',
            UBICACIONES.SIN_ASIGNAR
        );


    if (!actual) {

        throw new Error(
            'No existe la ubicación SIN ASIGNAR.'
        );

    }


    if (llenos > (actual.llenos || 0)) {

        throw new Error(
            `No puedes retirar ${llenos} llenos. Solo hay ${actual.llenos || 0} sin asignar.`
        );

    }


    if (vacios > (actual.vacios || 0)) {

        throw new Error(
            `No puedes retirar ${vacios} vacíos. Solo hay ${actual.vacios || 0} sin asignar.`
        );

    }


    await guardar(
        'inventario',
        {
            ...actual,
            llenos:
                (actual.llenos || 0) -
                llenos,
            vacios:
                (actual.vacios || 0) -
                vacios
        }
    );


    return {
        llenos,
        vacios,
        observacion
    };
}


/* =====================================================
   ASIGNAR DESDE SIN ASIGNAR A CAMIÓN
===================================================== */

export async function asignarACamion({
    camion,
    llenos = 0,
    vacios = 0
}) {

    if (
        camion !== UBICACIONES.ROJO &&
        camion !== UBICACIONES.BLANCO
    ) {

        throw new Error(
            'El destino debe ser ROJO o BLANCO.'
        );

    }


    llenos = Number(llenos);
    vacios = Number(vacios);


    validarCantidad(
        llenos,
        vacios
    );


    if (llenos === 0 && vacios === 0) {

        throw new Error(
            'Debes asignar al menos un cilindro.'
        );

    }


    const sinAsignar =
        await obtener(
            'inventario',
            UBICACIONES.SIN_ASIGNAR
        );


    const destino =
        await obtener(
            'inventario',
            camion
        );


    if (!sinAsignar || !destino) {

        throw new Error(
            'No se encontró el inventario necesario.'
        );

    }


    if (llenos > (sinAsignar.llenos || 0)) {

        throw new Error(
            `No hay suficientes cilindros llenos sin asignar. Disponibles: ${sinAsignar.llenos || 0}.`
        );

    }


    if (vacios > (sinAsignar.vacios || 0)) {

        throw new Error(
            `No hay suficientes cilindros vacíos sin asignar. Disponibles: ${sinAsignar.vacios || 0}.`
        );

    }


    await guardar(
        'inventario',
        {
            ...sinAsignar,
            llenos:
                (sinAsignar.llenos || 0) -
                llenos,
            vacios:
                (sinAsignar.vacios || 0) -
                vacios
        }
    );


    await guardar(
        'inventario',
        {
            ...destino,
            llenos:
                (destino.llenos || 0) +
                llenos,
            vacios:
                (destino.vacios || 0) +
                vacios
        }
    );


    return obtenerInventario();
}


/* =====================================================
   VALIDAR CANTIDADES
===================================================== */

function validarCantidad(
    llenos,
    vacios
) {

    if (
        !Number.isInteger(llenos) ||
        !Number.isInteger(vacios) ||
        llenos < 0 ||
        vacios < 0
    ) {

        throw new Error(
            'Las cantidades deben ser números enteros mayores o iguales a 0.'
        );

    }
}


/* =====================================================
   CONTAR REGISTROS
===================================================== */

export async function contar(storeName) {

    const registros =
        await obtenerTodos(storeName);

    return registros.length;
}


/* =====================================================
   GUARDAR VARIOS REGISTROS
===================================================== */

export async function guardarVarios(
    operaciones
) {

    if (!Array.isArray(operaciones)) {

        throw new Error(
            'Las operaciones deben ser un arreglo.'
        );

    }


    for (const operacion of operaciones) {

        if (
            !operacion ||
            !operacion.storeName
        ) {

            throw new Error(
                'Operación de guardado inválida.'
            );

        }


        await guardar(
            operacion.storeName,
            operacion.data
        );

    }
}