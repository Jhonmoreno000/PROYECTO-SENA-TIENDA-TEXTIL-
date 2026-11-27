# Especificacion de Requerimientos de Software (SRS) - Norma IEEE 830 y BDD
**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Normas Aplicadas:** IEEE 830-1998, ISO/IEC 25010:2011, BDD (Behavior-Driven Development)  
**Version:** 2.0.0 - Documentacion Tecnica Oficial  
**Estado:** Aprobado para Evaluacion de Proyecto  

---

## 1. Fase de Investigacion y Fundamentacion (Marco del Proyecto)

### 1.1. Planteamiento del Problema
En el sector textil tradicional de Colombia, concentrado en zonas de alta distribucion mayorista y minorista (como el barrio Alqueria en Bogota, el sector de El Hueco en Medellin y el centro comercial de Cali), los procesos de comercializacion, fraccionamiento, corte y almacenamiento de tejidos se ejecutan de manera predominantemente empirica y manual. Esta metodologia operativa genera un conjunto de ineficiencias criticas que comprometen la rentabilidad y la satisfaccion del cliente:

1. **Errores humanos en la medicion de rollos:** La venta por metraje fraccionado se apoya en reglas de madera, metros de cinta manuales o contadores mecanicos sin calibracion periodica. Esta practica ocasiona discrepancias acumuladas de entre el 3% y el 5% entre los inventarios fisicos reales en estanteria y los registros contables, generando desajustes de balance y faltantes no justificados al momento de preparar pedidos.
2. **Generacion descontrolada de mermas y retazos no comerciales:** Cuando un cliente adquiere una cantidad fraccionada de tela (por ejemplo, 4.20 metros de un rollo cuya existencia remanente es de 4.90 metros), queda un sobrante de 0.70 metros. En el modelo tradicional, estos segmentos inferiores a un metro lineal quedan dispersos en bodega sin clasificacion, sin etiquetado de lote y sin una politica de precio diferencial, acumulandose como perdidas directas de capital o merma pasiva.
3. **Inconsistencia de tonalidad por variacion de lotes de tintoreria (Color Shading o Lot Drift):** Los procesos industriales de tintoreria textil presentan variaciones termicas, quimicas y de absorcion de agua entre partidas de fabricacion diferentes. Si un confeccionista solicita 10 metros continuos de tela y el despachador une 6 metros del lote A con 4 metros del lote B, las prendas confeccionadas presentaran tonalidades desiguales en sus piezas. Esto ocasiona devoluciones obligadas, reprocesos en fabrica y deterioro de la confianza comercial.
4. **Falta de verificacion de continuidad del metraje:** Los sistemas de inventario convencionales manejan el stock como una cifra numerica agregada (por ejemplo, 50 metros disponibles), sin distinguir si dichos metros pertenecen a un solo rollo integro o a diez retazos de 5 metros. Al procesar una orden de compra que exige metraje continuo para patronaje industrial, el sistema permite la venta y el problema solo se detecta fisicamente en la mesa de corte, retrasando los tiempos de despacho.
5. **Demoras operativas en el alistamiento de bodega:** La ausencia de identificadores unicos por codigo de barras o codigo QR en cada rollo fisico obliga a los vendedores y personal de bodega a realizar busquedas manuales que pueden tardar entre 30 y 50 minutos por orden de trabajo, reduciendo la capacidad operativa de las tiendas.

### 1.2. Justificacion
La implementacion de una plataforma tecnologica orientada a servicios desacoplados bajo principios de Domain-Driven Design (DDD) permite abordar estas problematicas desde la raiz operativa del negocio textil:

- **Impacto Economico:** Se reduce en un 18% el desperdicio generado por retazos no clasificados, transformando los sobrantes inferiores a un metro en articulos de liquidacion sistematica con precios reducidos y rotacion rapida para manualidades, acolchados y muestras comerciales.
- **Impacto Operativo y Calidad de Producto:** El sistema asegura la integridad cromatica del pedido mediante el control estricto del lote de tintoreria (`lote_tintoreria`), impidiendo que un metraje solicitado se abastezca con rollos de formulaciones quimicas incompatibles.
- **Trazabilidad Integral en Tiempo Real:** El control unívoco por rollo fisico (`codigo_rollo`) sincroniza el catalogo de venta en linea con el inventario fisico de estanteria, aplicando bloqueos transaccionales en base de datos para impedir la sobreventa o la asignacion duplicada de un mismo rollo a clientes simultaneos.

### 1.3. Objetivos del Proyecto

#### 1.3.1. Objetivo General
Desarrollar una plataforma distribuida para la comercializacion, control logistico y administracion de inventario textil continuo y fraccionado, que garantice la consistencia transaccional, la trazabilidad por rollos fisicos y la alta disponibilidad operativa bajo estandares de calidad de software internacionales.

#### 1.3.2. Objetivos Especificos
1. Disenar e implementar una arquitectura limpia desacoplada (Clean Architecture) orientada a dominios de negocio (DDD), separando la gestion de catalogo, el control de inventario de rollos, el procesamiento de pedidos, la facturacion simulada y el soporte postventa.
2. Construir un motor de calculo textil especializado que valide la continuidad del tejido en rollos unicos, clasifique automaticamente los remanentes menores a un metro como retazos liquidados y aplique escalas de precios diferenciales por volumen (detal, mayorista y rollo cerrado).
3. Desarrollar mecanismos de transaccionalidad concurrente con bloqueos pesimistas a nivel de base de datos relacional y orquestacion tipo Saga para revertir reservas de metraje ante pagos fallidos o cancelados.
4. Definir y ejecutar planes integrales de pruebas unitarias, de seguridad y de integracion que certifiquen el cumplimiento de los requerimientos funcionales y no funcionales con cobertura minima del 80%.
5. Establecer procedimientos estandarizados de despliegue reproducible mediante contenedores Docker con redes aisladas y politicas de seguridad conforme a la legislacion de proteccion de datos (Ley 1581 de 2012) y buenas practicas OWASP.

### 1.4. Alcance y Delimitacion del Sistema

#### 1.4.1. Modulos Incluidos en el Alcance
- **Modulo de Catalogo Textil Granular:** Gestion de especificaciones fisicas y textiles completas (composicion porcentual, gramaje en gramos por metro cuadrado, ancho de pieza, elasticidad, tipo de tejido y cuidados de conservacion).
- **Modulo de Inventario por Rollos Fisicos:** Registro individualizado de rollos con metraje inicial, metraje remanente, codigo de lote de tintoreria, ubicacion fisica en estanteria y estado operativo (`disponible`, `reservado`, `retazo_liquidado`, `agotado`).
- **Modulo de Cotizacion y Simulador de Confeccion:** Calculadora matematica para proyectos de modisteria y decoracion (cortinas, vestidos, forros, manteles), integrando un margen de seguridad tecnico recomendado del diez por ciento (+10%).
- **Modulo de Gestion de Pedidos y Carrito de Compras:** Administracion de transacciones, validacion de cupones de descuento con restricciones por categoria, liquidacion de costos de envio por departamento y generacion de ordenes de corte.
- **Modulo de Mesa de Corte y Bodega:** Generacion de ordenes de trabajo con codigo escaneable para lectura en estaciones de preparacion y actualizacion de metros descontados.
- **Modulo Administrativo y de Control de Mermas:** Registro historico de eventos de merma, configuracion de umbrales minimos de stock por categoria y tableros estadisticos de ventas diarias y regionales.

#### 1.4.2. Delimitacion (Aspectos Fuera del Alcance Inicial)
- Conexion directa por protocolos de automatizacion industrial (como Modbus, OPC-UA o Profibus) con maquinaria de tejeduria o hilatura pesada.
- Integracion propietaria bidireccional con software ERP propietario legado de gran escala (como SAP R/3 o AS/400).
- Liquidacion aduanera y tramitacion de exportaciones internacionales automatizadas; la cobertura inicial abarca exclusivamente la logistica nacional de Colombia.

---

## 2. Matriz de Requerimientos Funcionales (RF) - Estandar IEEE 830

A continuacion se presenta la matriz formal de requerimientos funcionales, codificados segun el estandar IEEE 830 con su respectivo identificador, descripcion tecnica, rol asignado, prioridad y criterio de aceptacion:

| Codigo | Nombre del Requerimiento | Descripcion Tecnica Detallada | Rol Autorizado | Prioridad |
| :---: | :--- | :--- | :---: | :---: |
| **RF-01** | Registro y autenticacion bajo modelo RBAC | El sistema debe permitir el registro y autenticacion de usuarios asignando roles estrictos: `cliente`, `vendedor` y `administrador` (ademas de navegacion publica como visitante sin permiso de compra). Las contrasenas deben procesarse mediante funciones hash criptograficas SHA-256 en codificacion UTF-8. El sistema debe emitir tokens de sesion con expiracion controlada. | Todos los usuarios | Alta |
| **RF-02** | Ficha tecnica y catalogo textil granular | El sistema debe permitir a cada vendedor registrar y actualizar las propiedades tecnicas de sus telas: nombre comercial, categoria, precio por metro lineal, composicion porcentual de fibras, gramaje (g/m2), ancho util, elasticidad, instrucciones de lavado y fotografia codificada en Base64 o URL segura. Por control antifraude, el administrador solo consulta y modera estado de publicacion sin editar precios. | Vendedor (edicion), Admin (auditoria) | Alta |
| **RF-03** | Trazabilidad de inventario por rollo fisico | El sistema debe gestionar el inventario asociando cada producto a rollos fisicos independientes con codigo unico (`codigo_rollo`), metraje inicial, metraje remanente en metros lineales, codigo de lote de tintoreria (`lote_tintoreria`), ubicacion en bodega y estado operativo. Solo el vendedor propietario registra y ajusta sus lotes, mientras el administrador realiza auditoria en modo solo lectura. | Vendedor (gestion), Admin (auditoria) | Alta |
| **RF-04** | Validacion de metraje continuo para corte | Antes de autorizar una reserva de inventario, el sistema debe verificar que la cantidad solicitada quepa de forma integra y sin empates de costura en un unico rollo del lote de tintoreria especificado. Si la suma total de metros del lote es suficiente pero ningun rollo individual posee la longitud completa solicitada, el sistema debe rechazar la orden automatica con el codigo `FRAGMENTED_STOCK`. | Sistema, Cliente | Critica |
| **RF-05** | Reclasificacion automatica de mermas y retazos | Cuando despues de ejecutar un corte el remanente de un rollo resulte menor a un metro lineal (< 1.0 m) y mayor a cero, el sistema debe cambiar automaticamente el estado del rollo a `retazo_liquidado`, generar un registro en la tabla `eventos_merma` con motivo `remanente_sub_metro` y aplicar un descuento comercial de liquidacion del cuarenta por ciento (40%). | Sistema, Vendedor | Media |
| **RF-06** | Transaccionalidad de pedidos y compensacion Saga | La creacion de un pedido debe realizarse dentro de una transaccion atomica con bloqueo pesimista en base de datos (`SELECT ... FOR UPDATE`). Si la pasarela de pagos rechaza la transaccion o expira el tiempo de espera (timeout), el sistema debe ejecutar una accion compensatoria reintegrando los metros reservados al rollo original en menos de 60 segundos. | Sistema, Cliente | Critica |
| **RF-07** | Generacion de orden de corte con codigo QR | Tras la confirmacion exitosa del pago, el sistema debe generar una orden de corte que contenga el identificador del pedido, el codigo del rollo asignado, el lote de tintoreria, los metros exactos a cortar y un identificador escaneable en formato codigo QR para despacho por parte del vendedor. | Vendedor | Alta |
| **RF-08** | Marketplace multi-vendedor y perfil social de tienda | El sistema debe conectar multiples proveedores textiles externos reales con directorio publico (`/tiendas`) y perfil publico tipo red social (`/tienda/:id`) con portada, avatar, biografia, ciudad, politicas, telas activas, calificacion promedio y resenas reales verificadas. Cada vendedor edita en vivo su perfil en `/vendedor/mi-tienda`. | Visitante, Cliente, Vendedor | Alta |
| **RF-09** | Modelo de comision y division de carrito multi-vendedor | Cuando un cliente compra telas de multiples vendedores en una misma transaccion, el sistema debe dividir el checkout en sub-pedidos independientes vinculados por `grupo_checkout`, aplicando la tasa de comision configurada (10 % por defecto) y registrando `monto_comision_admin` y `ganancia_neta_vendedor`. | Cliente, Vendedor, Administrador | Alta |
| **RF-10** | Algoritmo de exclusividad VIP y alertas de oportunidad | El sistema debe evaluar periodicamente la recurrencia de compra y gasto acumulado de cada cliente para desbloquear acceso exclusivo a telas VIP (`ServicioExclusividadVIP`) y generar alertas de oportunidad en la bandeja del vendedor (`/vendedor/alertas`) para activar promociones y lanzamientos exclusivos. | Cliente (acceso), Vendedor (activacion) | Alta |
| **RF-11** | Restriccion estricta de compras y resenas a clientes | Solo los usuarios autenticados con rol `cliente` pueden ejecutar el checkout (`/checkout`, `/pago`), confirmar pedidos y publicar resenas verificadas sobre productos o tiendas. Visitantes, vendedores y administradores deben ser bloqueados en frontend y backend (`HTTP 401`/`403`). | Cliente | Alta |
| **RF-12** | Control antifraude de precios e inventario y notificaciones reales | El administrador tiene prohibido editar precios, stock, rollos fisicos, lotes o mermas de los vendedores (`HTTP 403` en endpoints de mutacion). En su lugar, puede auditar/moderar estado (`changes_requested`), revisar metricas reales y enviar notificaciones reales de stock bajo y reportes de mermas a la tabla `alertas_vendedor` del proveedor. | Administrador (auditoria y alertas), Vendedor (recepcion y ajuste) | Alta |

---

## 3. Matriz de Requerimientos No Funcionales (RNF) - Norma ISO/IEC 25010

Los requerimientos no funcionales se estructuran conforme a las caracteristicas de calidad del producto de software de la norma ISO/IEC 25010:

| Codigo | Caracteristica ISO 25010 | Subcaracteristica | Criterio de Medicion y Metrica Exigida | Mecanismo de Implementacion Tecnica |
| :---: | :--- | :--- | :--- | :--- |
| **RNF-01** | **Eficiencia de Desempeno** | Comportamiento temporal | El tiempo de respuesta en consultas de catalogo y validacion de metraje debe ser inferior o igual a doscientos milisegundos (p95 <= 200 ms) con concurrencia nominal. | Indices compuestos B-Tree en PostgreSQL, consultas SQL parametrizadas y compresion de respuestas HTTP. |
| **RNF-02** | **Fiabilidad** | Tolerancia a fallos y concurrencia | El sistema debe procesar un minimo de cincuenta transacciones simultaneas sobre el mismo rollo o producto sin incurrir en sobreventa ni inconsistencias de inventario. | Bloqueo pesimista a nivel de fila (`SELECT ... FOR UPDATE`) en transacciones JDBC con aislamiento `READ COMMITTED` y pool HikariCP con minimo 32 hilos. |
| **RNF-03** | **Seguridad** | Confidencialidad y proteccion de datos | Las credenciales deben almacenarse con SHA-256; no se permitira el almacenamiento de datos financieros de tarjetas (PAN ni CVV segun PCI-DSS); el transporte de red debe ser HTTPS sobre TLS 1.3 con cabeceras de proteccion CSP, XFO y CORS. | Suite de validacion `PruebasSeguridadIntegridad.java`, tokens de corta duracion (15 minutos) en cookies seguras y filtros de entrada anti-inyeccion SQL y anti-XSS. |
| **RNF-04** | **Disponibilidad** | Recuperabilidad y continuidad | La disponibilidad del sistema central de pedidos debe ser de al menos el 99.5% anual. La caida temporal de servicios no criticos (notificaciones o reportes) no debe bloquear el cobro ni el corte. | Probes de observabilidad `/health/live` y `/health/ready`, reinicio automatico mediante politicas Docker (`restart: unless-stopped`) y red aislada. |
| **RNF-05** | **Mantenibilidad** | Modularidad y reusabilidad | La arquitectura debe estar desacoplada en capas (`dominio`, `aplicacion`, `infraestructura`); la cobertura de pruebas unitarias debe ser igual o superior al 80% y no debe presentar dependencias circulares. | Implementacion de Clean Architecture sin marcos pesados, clases en espanol canónico y suites de pruebas `PruebasReglasNegocioTextil.java` y `PruebasSeguridadIntegridad.java`. |

---

## 4. Historias de Usuario con Criterios de Aceptacion (Formato BDD / Gherkin)

### 4.1. Historia de Usuario 1: Reserva de Metraje Continuo en Rollo Fisico
**Como** cliente confeccionista o sastre profesional  
**Quiero** comprar 6.0 metros continuos de tela Lino Crudo de un mismo lote de tintoreria  
**Para** garantizar que la prenda cortada mantenga una tonalidad uniforme sin uniones de costura forzadas.

```gherkin
Caracteristica: Reserva de metraje continuo para compra de tela
  Como cliente de confeccion
  Quiero comprar 6.0 metros continuos de Lino Crudo
  Para asegurar que la prenda no tenga empates ni variaciones de tono

  Escenario: Rollo con metraje suficiente en un solo lote
    Dado que existe en bodega el rollo "ROL-502" con 12.0 metros disponibles del lote "LOT-2026-A"
    Cuando solicito una compra de 6.0 metros continuos de tela
    Entonces el sistema valida la disponibilidad y reserva 6.0 metros del rollo "ROL-502"
    Y el metraje remanente del rollo "ROL-502" se actualiza a 6.0 metros
    Y el pedido queda vinculado al lote de tintoreria "LOT-2026-A"
    Y el estado del rollo permanece en "disponible"
    Y no se genera ningun evento de merma

  Escenario: Metraje total en bodega suficiente pero fragmentado entre rollos distintos
    Dado que existen en bodega dos rollos de la misma tela:
      | codigo_rollo | metraje_remanente | lote_tintoreria |
      | ROL-101      | 4.0               | LOT-2026-A      |
      | ROL-102      | 4.0               | LOT-2026-A      |
    Cuando solicito una compra de 6.0 metros continuos de tela
    Entonces el sistema detecta que ningun rollo individual posee 6.0 metros
    Y el sistema rechaza la reserva automatica
    Y devuelve el codigo de advertencia "FRAGMENTED_STOCK"
    Y sugiere al cliente dividir el pedido en piezas menores o seleccionar otro lote

  Escenario: Inconsistencia entre lotes de tintoreria disponibles
    Dado que existe el rollo "ROL-301" con 10.0 metros disponibles pero pertenece al lote "LOT-2026-B"
    Cuando solicito 6.0 metros indicando preferencia estricta por el lote "LOT-2026-A"
    Entonces el sistema no asigna el rollo "ROL-301"
    Y notifica al usuario que no hay disponibilidad para el lote de tintoreria especificado
```

---

### 4.2. Historia de Usuario 2: Reclasificacion Automatica de Retazos y Mermas
**Como** vendedor propietario en el marketplace  
**Quiero** que el sistema reclasifique automaticamente cualquier rollo propio cuyo remanente final sea menor a 1.0 metro  
**Para** no mantener saldos no comerciales en el inventario regular y publicarlos con descuento como retazos liquidados.

```gherkin
Caracteristica: Reclasificacion automatica de retazos tras el corte
  Como vendedor de telas
  Quiero que los remanentes menores a un metro se clasifiquen como retazos
  Para optimizar mi inventario y prevenir reclamos por retazos residuales

  Escenario: Corte que deja un remanente menor al umbral critico
    Dado que el rollo "ROL-88" tiene un metraje remanente de 4.5 metros
    Y el precio base por metro lineal es de $30.000 COP
    Cuando se confirma un corte de 3.8 metros para el pedido "PED-9901"
    Entonces el remanente matematico calculado es de 0.7 metros
    Y como 0.7 metros es menor al umbral critico de 1.0 metro
    Entonces el rollo "ROL-88" cambia su estado a "retazo_liquidado"
    Y se genera un registro en la tabla "eventos_merma" con motivo "remanente_sub_metro"
    Y el precio por metro del retazo se fija en $18.000 COP con un 40% de descuento

  Escenario: Corte que deja un remanente comercializable
    Dado que el rollo "ROL-90" tiene un metraje remanente de 15.0 metros
    Cuando se confirma un corte de 10.0 metros para el pedido "PED-9902"
    Entonces el remanente matematico es de 5.0 metros
    Y como 5.0 metros es mayor o igual a 1.0 metro
    Entonces el rollo "ROL-90" se mantiene en estado "disponible"
    Y no se genera ningun registro de merma
```

---

### 4.3. Historia de Usuario 3: Liquidacion de Tarifas Escalonadas por Volumen
**Como** comprador mayorista o taller de confeccion  
**Quiero** que el sistema aplique descuentos automaticos basados en tramos de metraje lineal adquirido  
**Para** recibir tarifas preferenciales sin necesidad de cotizaciones manuales por correo.

```gherkin
Caracteristica: Calculo de precios escalonados por volumen textil
  Como comprador de gran volumen
  Quiero tarifas reducidas por tramos de metraje
  Para incentivar compras al por mayor y de rollos completos

  Escenario: Compra al detal (menos de 15.0 metros)
    Dado que el precio base de la tela "Seda Francesa" es de $30.000 COP por metro
    Cuando agrego al pedido 8.0 metros de tela
    Entonces el sistema aplica la tarifa "DETAL" con 0% de descuento
    Y el precio unitario liquidado es de $30.000 COP por metro
    Y el total neto de la linea es de $240.000 COP

  Escenario: Compra mayorista (entre 15.0 y 49.99 metros)
    Dado que el precio base de la tela "Seda Francesa" es de $30.000 COP por metro
    Cuando agrego al pedido 20.0 metros de tela
    Entonces el sistema aplica la tarifa "MAYORISTA" con 15% de descuento
    Y el precio unitario liquidado es de $25.500 COP por metro
    Y el total neto de la linea es de $510.000 COP
    Y el descuento total reflejado es de $90.000 COP

  Escenario: Compra de rollo cerrado (50.0 metros o mas)
    Dado que el precio base de la tela "Seda Francesa" es de $30.000 COP por metro
    Cuando agrego al pedido 60.0 metros de tela
    Entonces el sistema aplica la tarifa "ROLLO_CERRADO" con 25% de descuento
    Y el precio unitario liquidado es de $22.500 COP por metro
    Y el total neto de la linea es de $1.350.000 COP
    Y el descuento total reflejado es de $450.000 COP
```

---

## 5. Matriz de Trazabilidad Requerimientos vs Componentes Tecnicos

| Requerimiento Funcional | Caso de Uso / Servicio de Dominio | Componente de Infraestructura HTTP | Componente de Persistencia JDBC | Tabla en PostgreSQL |
| :---: | :--- | :--- | :--- | :--- |
| **RF-01** | `ServicioAutenticacion.java` | `ManejadorAutenticacion.java` | `JdbcRepositorioUsuarioImpl.java` | `usuarios` |
| **RF-02** | `ManejadorProductos.java` | `ManejadorProductos.java` | `ProductoDAO.java` | `productos`, `categorias`, `imagenes_producto` |
| **RF-03** | `ServicioCorteTextil.java` | `ManejadorInventario.java` | `InventarioDAO.java` | `lotes_inventario`, `rollos_textil` |
| **RF-04** | `ServicioCorteTextil.validarMetrajeContinuo()` | `ManejadorPedidos.java` | `PedidoDAO.java` (bloqueo FOR UPDATE) | `rollos_textil`, `lotes_inventario` |
| **RF-05** | `ServicioCorteTextil.procesarCorteYRemanente()` | `ManejadorInventario.java` | `InventarioDAO.java` | `eventos_merma`, `umbrales_stock` |
| **RF-06** | `ManejadorPedidos.java` (flujo transaccional) | `ManejadorPedidos.java` | `PedidoDAO.java` | `pedidos`, `items_pedido` |
| **RF-07** | `ServicioFactura.java` | `ManejadorFactura.java` | `PedidoDAO.java` | `pedidos` (campo `numero_guia`) |
| **RF-08** | `ManejadorTiendas.java` | `ManejadorTiendas.java` (`/api/tiendas*`) | `TiendaVendedorDAO.java` | `perfiles_vendedor`, `resenas_vendedor` |
| **RF-09** | `ServicioCriptoWompi.java` | `ManejadorPedidos.java`, `ManejadorPagosWompi.java` | `PedidoDAO.java` | `pedidos` (`grupo_checkout`, `monto_comision_admin`, `ganancia_neta_vendedor`) |
| **RF-10** | `ServicioExclusividadVIP.java` | `ManejadorTiendas.java` (`/api/clientes/elegibilidad-vip`, `/api/vendedor/alertas*`) | `TiendaVendedorDAO.java` | `alertas_vendedor`, `pedidos` |
| **RF-11** | `ServicioAutenticacion.java` | `ManejadorPedidos.java`, `ManejadorPagosWompi.java`, `ManejadorTiendas.java` | `JdbcRepositorioUsuarioImpl.java`, `PedidoDAO.java` | `usuarios`, `pedidos`, `resenas_vendedor` |
| **RF-12** | `ManejadorProductos.java` / `ManejadorInventario.java` | `ManejadorInventario.java` (`/api/inventario/notificar-stock`, `/api/inventario/enviar-reporte-mermas`), `ManejadorProductos.java` (`/moderar`) | `InventarioDAO.java`, `TiendaVendedorDAO.java` | `alertas_vendedor`, `lotes_inventario`, `eventos_merma` |
