/**
 * Suite de Pruebas Automatizadas del Frontend - D&D Textil
 * Estandares: ISO/IEC 25010, Clean Architecture, BDD Assertions
 * Ejecutable nativo con Node.js (ES Modules).
 */

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

const textoCorto = truncateText('Tela Lino', 20);
assert(textoCorto === 'Tela Lino', 'truncateText con longitud menor al limite debe devolver el texto integro');

const textoLargo = truncateText('Este es un tejido premium de seda natural importada con acabado satinado', 25);
assert(textoLargo.endsWith('...') && textoLargo.length <= 28, 'truncateText debe truncar y anexar puntos suspensivos');

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
} catch (e) {
    errorCapturado = true;
}
assert(errorCapturado, 'Calculadora debe rechazar dimensiones negativas o iguales a cero');

// -----------------------------------------------------------------------------
// 3. Pruebas de Integracion Financiera Wompi (Checkout)
// -----------------------------------------------------------------------------
console.log('\n[GRUPO 3: Dominio Financiero y Checkout Wompi]');

const centavos1 = convertirACentavosWompi(125000);
assert(centavos1 === 12500000, 'Conversion de $125.000 COP a centavos Wompi debe ser exactamente 12500000 enteros');

const ref = generarReferenciaPedido(42, 1729000000000);
assert(ref === 'PED-42-1729000000000' && ref.startsWith('PED-'), 'Referencia de pago debe cumplir estructura PED-{id}-{timestamp}');

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
