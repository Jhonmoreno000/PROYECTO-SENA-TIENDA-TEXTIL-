/**
 * Suite de Pruebas Automatizadas del Frontend - D&D Textil
 * Estandares: ISO/IEC 25010, Clean Architecture, BDD Assertions
 * Ejecutable nativo con Node.js (ES Modules).
 */

import { expiracionDeToken, tokenVigente, sesionVigente } from './src/utilidades/sesion.js';
import {
    formatCurrency,
    formatDate,
    truncateText,
    generateId,
    calcularMetrajeCortina,
    convertirACentavosWompi,
    generarReferenciaPedido,
} from './src/utilidades/formateadores.js';

let totalPruebas = 0;
let pruebasAprobadas = 0;
let pruebasFallidas = 0;

function assert(condicion, descripcion) {
    totalPruebas++;
    if (condicion) {
        pruebasAprobadas++;
        console.log(`  [OK] Prueba ${totalPruebas}: ${descripcion}`);
    } else {
        pruebasFallidas++;
        console.error(`  [FALLO] Prueba ${totalPruebas}: ${descripcion}`);
    }
}

console.log('================================================================================');
console.log('SUITE DE PRUEBAS AUTOMATIZADAS DEL FRONTEND (REACT / VITE / UTILS)');
console.log('Proyecto: D&D Textil - Tienda Digital de Telas');
console.log('Ambiente: Node.js Test Runner (ISO/IEC 25010)');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// 1. Pruebas de Formateadores Monetarios y Textuales
// -----------------------------------------------------------------------------
console.log('[GRUPO 1: Formateadores de Datos y Moneda]');

const moneda1 = formatCurrency(25000);
assert(moneda1.includes('25') && moneda1.includes('COP'), 'formatCurrency(25000) debe formatear separadores y sufijo COP');

const monedaNula = formatCurrency(null);
assert(monedaNula === '0 COP', 'formatCurrency(null) debe degradar limpiamente a "0 COP"');

const monedaNan = formatCurrency(NaN);
assert(monedaNan === '0 COP', 'formatCurrency(NaN) debe retornar "0 COP" defensivamente');

const monedaCero = formatCurrency(0);
assert(monedaCero.includes('0') && monedaCero.includes('COP'), 'formatCurrency(0) debe formatear correctamente el monto cero en COP');

const monedaMillones = formatCurrency(1500000);
assert(monedaMillones.includes('1.500.000') && monedaMillones.includes('COP'), 'formatCurrency(1500000) debe incluir separadores de miles colombianos');

const monedaNegativa = formatCurrency(-5000);
assert(monedaNegativa.includes('-5.000') && monedaNegativa.includes('COP'), 'formatCurrency(-5000) debe conservar el signo negativo y sufijo COP');

const fechaFormateada = formatDate('2026-10-15T12:00:00Z');
assert(typeof fechaFormateada === 'string' && fechaFormateada.includes('2026') && fechaFormateada.includes('15'), 'formatDate debe formatear fechas ISO en formato legible en español');

const textoCorto = truncateText('Tela Lino', 20);
assert(textoCorto === 'Tela Lino', 'truncateText con longitud menor al limite debe devolver el texto integro');

const textoLargo = truncateText('Este es un tejido premium de seda natural importada con acabado satinado', 25);
assert(textoLargo.endsWith('...') && textoLargo.length <= 28, 'truncateText debe truncar y anexar puntos suspensivos');

assert(truncateText('', 10) === '' && truncateText(null, 10) === '', 'truncateText debe devolver cadena vacia ante entradas vacias o nulas');
assert(truncateText('12345', 5) === '12345', 'truncateText con longitud exactamente igual al limite no debe truncar');

const id1 = generateId();
const id2 = generateId();
assert(typeof id1 === 'string' && id1.length > 10 && id1 !== id2, 'generateId debe producir identificadores unicos no vacios');

// -----------------------------------------------------------------------------
// 2. Pruebas del Motor de Calculo Textil (ProjectCalculator)
// -----------------------------------------------------------------------------
console.log('\n[GRUPO 2: Motor Matematico de la Calculadora de Confeccion]');

const metrosCortina = calcularMetrajeCortina(2.0, 2.2);
assert(metrosCortina > 0 && metrosCortina > (2.0 * 2.2), 'Calculo de cortina debe considerar fruncido 2.0x y dobladillo superior/inferior');

const margenAplicado = calcularMetrajeCortina(1.0, 1.0, 1.0, 0.10);
const margenEsperado = Math.round(((1.0 * 1.3) / 1.5 * 1.10) * 100) / 100;
assert(margenAplicado === margenEsperado, 'Margen tecnico del +10% para encogimiento y costura debe aplicarse exactamente');

let errorCapturado = false;
try {
    calcularMetrajeCortina(-2.0, 1.5);
} catch {
    errorCapturado = true;
}
assert(errorCapturado, 'Calculadora debe rechazar dimensiones negativas o iguales a cero');

const cortinaFruncidoTriple = calcularMetrajeCortina(2.0, 2.2, 3.0);
assert(cortinaFruncidoTriple > metrosCortina, 'Un factor de fruncido 3.0x debe requerir mayor metraje que el fruncido estandar 2.0x');

let errorAltoCero = false;
try {
    calcularMetrajeCortina(2.0, 0);
} catch {
    errorAltoCero = true;
}
assert(errorAltoCero, 'calcularMetrajeCortina debe rechazar alto de cortina igual a cero');

// -----------------------------------------------------------------------------
// 3. Pruebas de Integracion Financiera Wompi (Checkout)
// -----------------------------------------------------------------------------
console.log('\n[GRUPO 3: Dominio Financiero y Checkout Wompi]');

const centavos1 = convertirACentavosWompi(125000);
assert(centavos1 === 12500000, 'Conversion de $125.000 COP a centavos Wompi debe ser exactamente 12500000 enteros');
assert(convertirACentavosWompi(0) === 0, 'Conversion de $0 COP a centavos Wompi debe retornar 0');
assert(convertirACentavosWompi(19999.99) === 1999999, 'Conversion de montos con decimales a centavos Wompi debe redondear sin perdida');

let errorWompiNegativo = false;
try {
    convertirACentavosWompi(-500);
} catch {
    errorWompiNegativo = true;
}
assert(errorWompiNegativo, 'convertirACentavosWompi debe rechazar montos negativos');

const ref = generarReferenciaPedido(42, 1729000000000);
assert(ref === 'PED-42-1729000000000' && ref.startsWith('PED-'), 'Referencia de pago debe cumplir estructura PED-{id}-{timestamp}');

const refAuto = generarReferenciaPedido(2050);
assert(/^PED-2050-\d+$/.test(refAuto), 'generarReferenciaPedido sin timestamp explícito debe usar marca de tiempo numérica');

// -----------------------------------------------------------------------------
// 4. Pruebas de vigencia de sesiones
// -----------------------------------------------------------------------------
console.log('\n[GRUPO 4: Vigencia de Tokens y Sesiones]');

const ahora = 1800000000000;
const expiracionFutura = ahora / 1000 + 60;
const crearToken = exp => Buffer.from(JSON.stringify({ sub: 7, rol: 'cliente', exp })).toString('base64url') + '.firma';
const tokenValido = crearToken(expiracionFutura);
const tokenExpirado = crearToken(ahora / 1000 - 60);
assert(tokenVigente(tokenValido, ahora), 'Un token con expiración futura debe estar vigente');
assert(expiracionDeToken(tokenValido) === expiracionFutura * 1000, 'La expiración del token debe expresarse en milisegundos');
assert(!tokenVigente(tokenExpirado, ahora), 'Un token expirado no debe estar vigente');
assert(!tokenVigente(crearToken(ahora / 1000), ahora), 'Un token que expira ahora no debe estar vigente');

const tokensInvalidos = [undefined, null, '', 'abc', 'a.b.c', 7, '.firma', 'carga.', '%%%.firma',
    Buffer.from('no es JSON').toString('base64url') + '.firma', crearToken('mañana'),
    Buffer.from('{"exp":1e999}').toString('base64url') + '.firma'];
for (const token of tokensInvalidos) {
    let resultadoSeguro = false;
    try {
        resultadoSeguro = !tokenVigente(token, ahora) && expiracionDeToken(token) === null;
    } catch {
        resultadoSeguro = false;
    }
    assert(resultadoSeguro, `El token inválido ${String(token)} debe rechazarse sin lanzar errores`);
}

assert(!sesionVigente(null, ahora), 'Un usuario nulo no debe tener sesión vigente');
assert(!sesionVigente({ id: 7 }, ahora), 'Un usuario sin token no debe tener sesión vigente');
assert(!sesionVigente({ token: tokenExpirado }, ahora), 'Un usuario con token expirado no debe tener sesión vigente');
assert(sesionVigente({ token: tokenValido }, ahora), 'Un usuario con token válido debe tener sesión vigente');
assert(sesionVigente({ sesionLocal: true }, ahora), 'Una sesión local explícita debe seguir vigente sin token');
assert(!sesionVigente({}, ahora), 'Un objeto de usuario vacío sin token ni marca local no debe tener sesión vigente');

const tokenConAcentos = Buffer.from(JSON.stringify({ sub: 99, nombre: 'María José Calderón', rol: 'administrador', exp: expiracionFutura }), 'utf8').toString('base64url') + '.firma';
assert(sesionVigente({ token: tokenConAcentos }, ahora), 'Un token con caracteres UTF-8 acentuados en su carga debe decodificarse y validarse correctamente');

// -----------------------------------------------------------------------------
// Resumen Final
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log(`RESUMEN DE PRUEBAS FRONTEND:`);
const porcentajeAprobacion = totalPruebas > 0 ? Math.round((pruebasAprobadas / totalPruebas) * 100) : 0;
const dictamen = pruebasFallidas === 0 ? 'SUITE FRONTEND APROBADA PARA CI/CD' : 'SUITE FRONTEND CON FALLOS';
console.log(`Total Pruebas: ${totalPruebas}`);
console.log(`Aprobadas: ${pruebasAprobadas} (${porcentajeAprobacion}%)`);
console.log(`Fallidas: ${pruebasFallidas}`);
console.log(`Dictamen: ${dictamen}`);
console.log('================================================================================');

if (pruebasFallidas > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
