import { getApiUrl } from '../config';

const SCRIPT_WIDGET_URL = 'https://checkout.wompi.co/widget.js';

let scriptCargadoPromesa = null;

/**
 * Carga el script oficial del Widget de Wompi de forma segura y una sola vez en el DOM.
 */
export const cargarScriptWompi = () => {
    if (window.WidgetCheckout) {
        return Promise.resolve(window.WidgetCheckout);
    }

    if (scriptCargadoPromesa) {
        return scriptCargadoPromesa;
    }

    scriptCargadoPromesa = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            scriptCargadoPromesa = null;
            reject(new Error('Tiempo de espera agotado al conectar con el servidor de Wompi. Verifica tu conexión.'));
        }, 15000);

        const onExito = () => {
            clearTimeout(timeoutId);
            if (window.WidgetCheckout) {
                resolve(window.WidgetCheckout);
            } else {
                scriptCargadoPromesa = null;
                reject(new Error('WidgetCheckout no está disponible en window'));
            }
        };

        const onError = () => {
            clearTimeout(timeoutId);
            scriptCargadoPromesa = null;
            reject(new Error('No se pudo cargar el script del widget de Wompi. Verifica tu conexión.'));
        };

        const scriptExistente = document.querySelector(`script[src="${SCRIPT_WIDGET_URL}"]`);
        if (scriptExistente) {
            if (window.WidgetCheckout) {
                clearTimeout(timeoutId);
                resolve(window.WidgetCheckout);
                return;
            }
            scriptExistente.addEventListener('load', onExito, { once: true });
            scriptExistente.addEventListener('error', onError, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = SCRIPT_WIDGET_URL;
        script.async = true;
        script.onload = onExito;
        script.onerror = onError;
        document.body.appendChild(script);
    });

    return scriptCargadoPromesa;
};

/**
 * Solicita al backend en Java la creación de la intención de pago segura.
 * El backend calcula el total exacto en base de datos y genera la firma SHA-256.
 *
 * @param {Object} datos
 * @param {Array<{ productId: number, quantity: number }>} datos.items
 * @param {Object} datos.customerInfo
 * @param {string} [datos.couponCode]
 * @param {number} [datos.userId]
 * @returns {Promise<Object>} Datos de la orden, monto en centavos y firma criptográfica.
 */
export const crearIntencionPagoWompi = async ({ items, customerInfo, couponCode, userId }) => {
    const respuesta = await fetch(getApiUrl('/api/pagos/intencion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userId || 1,
            customerInfo: {
                fullName: customerInfo?.fullName || '',
                email: customerInfo?.email || '',
                phone: customerInfo?.phone || '',
                address: customerInfo?.address || '',
                city: customerInfo?.city || '',
                state: customerInfo?.state || '',
                notes: customerInfo?.notes || ''
            },
            couponCode: couponCode || null,
            items: items.map(it => ({
                productId: Number(it.productId ?? it.id),
                quantity: Number(it.quantity || 1)
            }))
        })
    });

    const datos = await respuesta.json();
    if (!respuesta.ok || !datos.success) {
        throw new Error(datos.error || 'Error al iniciar la pasarela de pago.');
    }

    return datos;
};

/**
 * Consulta el estado y detalle de un pedido en la base de datos por su referencia de Wompi.
 * @param {string} referencia Referencia de la orden (ej: DD-12345678-0001)
 */
export const consultarEstadoPagoWompi = async (referencia) => {
    const respuesta = await fetch(getApiUrl(`/api/pagos/estado?referencia=${encodeURIComponent(referencia)}`));
    if (!respuesta.ok) {
        throw new Error('No se pudo consultar el estado del pedido.');
    }
    return await respuesta.json();
};

/**
 * Confirma el pago en el backend para actualizar el estado del pedido en PostgreSQL,
 * descontar stock y registrar la venta.
 */
export const confirmarPagoWompi = async ({ referencia, transaccionId, metodoPago, estadoPago = 'APPROVED' }) => {
    const respuesta = await fetch(getApiUrl('/api/pagos/confirmar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            referencia,
            transaccionId,
            metodoPago,
            estadoPago,
        }),
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo confirmar el pago en el servidor.');
    }
    return datos;
};

/**
 * Abre el Checkout Widget oficial de Wompi (Bancolombia) en el navegador.
 *
 * @param {Object} config
 * @param {string} config.currency         'COP'
 * @param {number} config.amountInCents    Monto en centavos
 * @param {string} config.reference        Referencia única generada por Java
 * @param {string} config.publicKey        Llave pública Wompi
 * @param {string} config.integritySignature Firma SHA-256 calculada por Java
 * @param {Object} config.customerInfo     Datos del cliente
 * @param {Function} [config.onFinish]     Callback al finalizar la interacción en el widget
 */
export const abrirWidgetWompi = async ({
    currency,
    amountInCents,
    reference,
    publicKey,
    integritySignature,
    customerInfo,
    onFinish
}) => {
    if (!publicKey || publicKey.trim() === '') {
        throw new Error('La pasarela de pagos Wompi no tiene configurada la llave pública en el servidor.');
    }

    await cargarScriptWompi();

    if (!window.WidgetCheckout) {
        throw new Error('El Widget de Wompi no se cargó correctamente.');
    }

    const redirectUrl = `${window.location.origin}/confirmacion?referencia=${encodeURIComponent(reference)}`;

    // Extraer solo dígitos y asegurar formato nacional de 10 dígitos (ej. 3001234567)
    const telefonoLimpio = (customerInfo?.phone || '').replace(/\D/g, '').slice(-10);

    const checkout = new window.WidgetCheckout({
        currency: currency || 'COP',
        amountInCents: amountInCents,
        reference: reference,
        publicKey: publicKey,
        signature: {
            integrity: integritySignature
        },
        redirectUrl: redirectUrl,
        customerData: {
            email: customerInfo?.email || 'cliente@tienda.com',
            fullName: customerInfo?.fullName || 'Cliente D&D Textil',
            phoneNumber: telefonoLimpio || '3001234567',
            phoneNumberPrefix: '+57'
        }
    });

    checkout.open((resultado) => {
        if (typeof onFinish === 'function') {
            onFinish(resultado);
        }
    });
};
