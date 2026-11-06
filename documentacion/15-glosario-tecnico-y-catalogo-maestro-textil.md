# Glosario Técnico de la Industria Textil y Catálogo Maestro — D&D Textil

> **Documento de Dominio Ubicuo (Domain-Driven Design — DDD)**  
> **Propósito:** Unificar el lenguaje técnico entre expertos textiles de bodega, confeccionistas y el equipo de ingeniería de software de **D&D Textil**.

---

## 1. Glosario de Terminología Textil y Logística de Bodega

| Término Técnico | Campo / Concepto en el Software | Definición en la Industria Textil Colombiana |
| :--- | :--- | :--- |
| **Ancho Útil (Ancho de Peine)** | `width` / `ancho_metros` | Medida transversal utilizable del rollo de tela descontando los orillos laterales (usualmente **1,40 m**, **1,50 m**, **1,60 m** en confección y **2,80 m** en cortinería/hogar). |
| **Gramaje ($	ext{g/m}^2$ — GSM)** | `weight` / `gramaje` | Peso en gramos de un metro cuadrado de tejido. Determina el cuerpo, caída y abrigo de la tela (ej. Chalis ligero: $110	ext{ g/m}^2$; Denim pesado: $380	ext{ g/m}^2$). |
| **Lote de Tintorería (*Dye Lot*)** | `lote_tintoreria` | Identificador único de la barca o partida de teñido industrial. Dos rollos de la misma referencia pero de distinto lote pueden presentar variaciones de tono ($Delta E$) perceptibles al coser prendas contiguas. |
| **Metraje Lineal Continuo** | `metros_disponibles` | Longitud continua de tela enrollada en un tubo sin empates ni costuras intermedias. Es la unidad primaria de venta y descuento de inventario en **D&D Textil**. |
| **Merma Operativa** | `mermas` / `CalculadoraMerma` | Pérdida de metraje causada por defectos de tejeduría, manchas de almacenamiento, piques, deshilachado en puntas o desviación en mesa de corte. |
| **Retazo / Saldo de Rollo** | `RETAZO_LIQUIDADO` | Fracción remanente al final de un rollo físico cuya longitud es inferior a **1,00 metro lineal**. En **D&D Textil** pasa automáticamente a liquidación con el **40 % de descuento**. |
| **Urdimbre y Trama** | Tejido Plano (*Woven*) | En tejidos planos (Lino, Popelina, Dril, Denim), la **urdimbre** son los hilos longitudinales paralelos al orillo y la **trama** son los hilos transversales que se entrecruzan en el telar. |
| **Tejido de Punto (*Knit*)** | Elongación / Elasticidad | Tejido formado por mallas entrelazadas (Algodón Licrado, Piqué, Franela, Jersey) que posee elasticidad natural sin necesidad de romper fibras. |
| **Orillo (*Selvedge*)** | Borde longitudinal del rollo | Borde lateral reforzado del rollo de tela que evita que el tejido se deshilache durante el transporte y el tendido en mesa de corte. |
| **Factor de Fruncido** | `factorFruncido` | Multiplicador de ancho aplicado en cortinería y faldas plisadas/circulares (usualmente **1,5x a 2,5x**) para lograr ondas con volumen estético. |

---

## 2. Catálogo Maestro de Referencias Textiles (Especificaciones de Dominio)

La siguiente matriz documenta las propiedades físico-químicas y comerciales de las familias textiles comercializadas en **D&D Textil**:

| Referencia Textil | Categoría | Composición de Fibras | Gramaje Promedio | Ancho Estándar | Proyectos Recomendados (Filtro Inteligente) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Lino Belga / Lino Crudo Italiano** | Lino | 100 % Lino Natural de fibra larga | $220 - 240\text{ g/m}^2$ | $1,50\text{ m}$ | Moda y Confección, Verano, Cortinas y Hogar |
| **Seda Natural / Satín de Seda** | Seda | 100 % Seda Morera (*Mulberry Silk*) | $95 - 120\text{ g/m}^2$ | $1,40\text{ m}$ | Moda y Confección (Alta Costura, Blusas, Vestidos de Noche) |
| **Algodón Pima Peruano / Licrado** | Algodón | 95 % Algodón Pima / 5 % Elastano (Spandex) | $180 - 200\text{ g/m}^2$ | $1,60\text{ m}$ | Moda y Confección, Verano, Ropa Infantil y Básica |
| **Terciopelo Real / Velvet Antifuidos** | Tapicería | 100 % Poliéster de alta densidad repelente a líquidos | $340 - 420\text{ g/m}^2$ | $1,45\text{ m}$ | Tapicería (Sofás, Poltronas, Cabeceros), Cojines, Invierno |
| **Blackout Textil Tricapa** | Cortinería | 70 % Poliéster / 30 % Recubrimiento Acrílico Térmico | $290 - 320\text{ g/m}^2$ | $2,80\text{ m}$ | Cortinas y Hogar (Control solar 100 % y aislamiento acústico) |
| **Velo Suizo / Velo Lino Translúcido** | Cortinería | 100 % Poliéster de alta caída | $85 - 110\text{ g/m}^2$ | $2,80\text{ m}$ | Cortinas y Hogar (Iluminación difusa para salas y alcobas) |
| **Denim Índigo Stretch (12 oz)** | Dril y Denim | 98 % Algodón / 2 % Elastano | $360 - 400\text{ g/m}^2$ | $1,50\text{ m}$ | Moda y Confección (Jeans, Chaquetas, Dotación Industrial) |
| **Paño Cachemir / Lana Fría** | Invierno | 80 % Lana Virgen / 20 % Poliamida | $310 - 350\text{ g/m}^2$ | $1,50\text{ m}$ | Invierno, Sastrería Masculina y Femenina, Abrigos |

---

## 3. Fórmulas Matemáticas de la Calculadora de Metraje por Proyecto

El módulo **Calculadora de Metraje** (`/cliente/calculadora` y `formateadores.js`) implementa ecuaciones paramétricas que consideran el ancho del rollo ($A_{\text{rollo}}$), las dimensiones de la prenda/hogar y un **margen de seguridad técnica del 10 %** ($M = 1,10$) para absorber el encogimiento por primer lavado y los márgenes de costura:

### 3.1. Cortinas Estándar con Fruncido y Dobladillos
Para una ventana de ancho $W\text{ (m)}$ y alto $H\text{ (m)}$, con factor de fruncido $F$ (por defecto $2,0$), dobladillo superior/inferior de $0,30\text{ m}$ ($15\text{ cm}$ arriba + $15\text{ cm}$ bota) y rollo de ancho estándar $A_{\text{rollo}} = 1,50\text{ m}$:

$$
\text{Metraje}_{\text{cortina}} = \text{redondear}_{2}\left( \frac{(W \times F) \times (H + 0,30)}{A_{\text{rollo}}} \times (1 + M_{\text{seguridad}}) \right)
$$

### 3.2. Moldes de Confección y Hogar en el Panel del Cliente

| Proyecto | Variables de Entrada | Regla de Cálculo Paramétrico (con +10 % de margen técnico) |
| :--- | :--- | :--- |
| **Falda Circular (360°)** | Cintura ($C$) y Largo deseado ($L$) | Radio de cintura $R = \frac{C}{2\pi}$; requiere $2 \times (L + R + 4\text{ cm})$ ajustado según el ancho del rollo. |
| **Falda Recta / Básica** | Cadera ($K$) y Largo deseado ($L$) | Si $K + 10\text{ cm} \le A_{\text{rollo}}$, requiere $1 \times (L + 10\text{ cm}$ de pretina y ruedo$)$ más el 10 % de margen. |
| **Mantel de Mesa** | Largo de mesa ($L_m$), Ancho ($W_m$) y Caída lateral ($d = 30\text{ cm}$) | Superficie total $(L_m + 2d) \times (W_m + 2d)$ dividida en paños según $A_{\text{rollo}}$. |
| **Cojines Decorativos** | Lado del cojín ($L_c$) y Cantidad de unidades ($N$) | Cada cojín consume $2 \times (L_c + 4\text{ cm})$ de ancho; el sistema agrupa cuántos cojines caben a lo ancho del rollo. |
| **Vestido Sencillo** | Largo de talle + falda ($L_v$) y Contorno de busto/cadera | Consume $(L_v + 25\text{ cm de mangas/escote}) \times 1,10$ cuando el contorno cabe en un ancho de rollo. |

---

## 4. Normatividad Técnica Colombiana (NTC) de Etiquetado, Conservación y Control de Mermas

El diseño del catálogo y de las etiquetas térmicas de **D&D Textil** está alineado con el **Reglamento Técnico de Etiquetado de Confecciones y Textiles (Resolución SIC / NTC 1806 y ISO 3758)**:

### 4.1. Símbolos y Reglas de Conservación Textil (`careInstructions`)

1. **Lino Natural:** Lavado a mano o ciclo delicado a máximo $30\ ^\circ\text{C}$, secado a la sombra en superficie horizontal y planchado en húmedo a temperatura media-alta.
2. **Seda Natural:** Lavado en seco profesional o lavado manual en agua fría con jabón neutro sin retorcer; prohibido el uso de blanqueadores clorados y secadora de tambor.
3. **Algodón Pima / Punto:** Lavado en máquina a máximo $30\ ^\circ\text{C}$, no usar blanqueador, secado a baja temperatura para prevenir encogimiento superior al 3 %.
4. **Terciopelo y Tapicería Antifluidos:** Limpieza inmediata de líquidos con paño absorbente sin frotar, cepillado suave en sentido del pelo y prohibido planchar directamente sobre la cara afelpada.

### 4.2. Clasificación Contable y Operativa de Mermas en Bodega

En el módulo **Calculadora de Merma** (`/admin/inventario/mermas`), toda baja de metraje se clasifica bajo una de las siguientes causales auditables:

- **Defecto de Fábrica / Tejeduría:** nudos, hilos rotos o barrado de tintorería detectado al desenrollar la pieza (reclamable al proveedor).
- **Daño por Manipulación o Almacenamiento:** humedad, manchas o rasgaduras ocurridas en estantería o mesa de corte.
- **Muestrario Comercial:** cortes de $10\text{ cm} \times 15\text{ cm}$ destinados a catálogos físicos de vendedores y clientes mayoristas.
- **Retazo Sub-Métrico (`RETAZO_LIQUIDADO`):** saldo final del rollo menor a $1,00\text{ m}$ que se transfiere automáticamente al outlet de liquidación con 40 % de descuento.
