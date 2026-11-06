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
