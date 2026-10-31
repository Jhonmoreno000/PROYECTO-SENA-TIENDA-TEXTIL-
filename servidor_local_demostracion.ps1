<#
.SYNOPSIS
    Servidor Local de Demostracion en Vivo (Nativo Windows / .NET HttpListener) - D&D Textil
.DESCRIPTION
    Levanta un servidor web y API REST local en los puertos 3001 y 8081 sin requerir
    la instalacion de Docker ni Java. Sirve los activos compilados de la SPA
    y responde a todos los endpoints del backend con codificacion UTF-8 limpia.
#>

param(
    [int]$PuertoFrontend = 3001,
    [int]$PuertoBackend = 8081,
    [switch]$NoAbrirNavegador
)

$ErrorActionPreference = "Continue"

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$distDir = Join-Path $rootDir "tienda digital de telas\dist"
$publicDir = Join-Path $rootDir "tienda digital de telas\public"
$androidAssetsDir = Join-Path $rootDir "TiendaTextilApp\app\src\main\assets"
$uploadsDir = Join-Path $rootDir "tienda digital de telas\backend-java\servidor-api\uploads"

$assetsDir = if (Test-Path (Join-Path $distDir "index.html")) { $distDir } else { $androidAssetsDir }

if (-not (Test-Path $assetsDir)) {
    Write-Error "No se encontraron los activos compilados en: $assetsDir"
    exit 1
}

Write-Output "================================================================================"
Write-Output "SERVIDOR LOCAL DE DEMOSTRACION EN VIVO - D&D TEXTIL"
Write-Output "Iniciando servidor nativo .NET HttpListener..."
Write-Output "Frontend Web: http://localhost:${PuertoFrontend}/"
Write-Output "Backend API:  http://localhost:${PuertoBackend}/"
Write-Output "Sirviendo SPA desde: $assetsDir"
Write-Output "================================================================================"

$listener = New-Object System.Net.HttpListener
$prefixFrontend = "http://localhost:${PuertoFrontend}/"
$prefixBackend = "http://localhost:${PuertoBackend}/"

$listener.Prefixes.Add($prefixFrontend)
$listener.Prefixes.Add($prefixBackend)

try {
    $listener.Start()
} catch {
    Write-Error "No se pudo iniciar HttpListener: $_"
    exit 1
}

Write-Output "Servidor activo y escuchando peticiones HTTP."
if (-not $NoAbrirNavegador) {
    Start-Process "http://localhost:${PuertoFrontend}/"
}

$mimeMap = @{
    ".html" = "text/html; charset=UTF-8"
    ".js"   = "application/javascript; charset=UTF-8"
    ".mjs"  = "application/javascript; charset=UTF-8"
    ".css"  = "text/css; charset=UTF-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml; charset=UTF-8"
    ".json" = "application/json; charset=UTF-8"
    ".ico"  = "image/x-icon"
}

# JSON con secuencias Unicode (\uXXXX) para garantizar legibilidad perfecta en cualquier codificacion de consola
$productosJson = @'
[
  {"id":1,"name":"Algod\u00f3n Premium","nombre":"Algod\u00f3n Premium","price":25000,"precio":25000,"stock":100,"existencias":100,"category":"Algod\u00f3n","categoria":"Algod\u00f3n","description":"Tela de algod\u00f3n 100% natural, ideal para camisas y blusas.","descripcion":"Tela de algod\u00f3n 100% natural, ideal para camisas y blusas.","featured":true,"destacado":true,"isNewCollection":true,"esNuevaColeccion":true,"isExclusive":false,"esExclusivo":false,"isOffer":false,"esOferta":false,"sellerId":2,"images":["/uploads/product_12_1775767112691.jpg"],"material":"Algod\u00f3n 100%","width":"1.50 m","weight":"150 g/m\u00b2","care":"Lavar en fr\u00edo, no blanquear"},
  {"id":2,"name":"Seda Italiana","nombre":"Seda Italiana","price":85000,"precio":85000,"stock":50,"existencias":50,"category":"Seda","categoria":"Seda","description":"Seda pura con acabado brillante, perfecta para vestidos de gala.","descripcion":"Seda pura con acabado brillante, perfecta para vestidos de gala.","featured":true,"destacado":true,"isNewCollection":false,"esNuevaColeccion":false,"isExclusive":true,"esExclusivo":true,"isOffer":false,"esOferta":false,"sellerId":2,"images":["/uploads/product_16_1775766690228.webp"],"material":"Seda pura","width":"1.40 m","weight":"80 g/m\u00b2","care":"Limpieza en seco \u00fanicamente"},
  {"id":3,"name":"Lino Org\u00e1nico","nombre":"Lino Org\u00e1nico","price":45000,"precio":45000,"stock":80,"existencias":80,"category":"Lino","categoria":"Lino","description":"Lino fresco y transpirable para ropa de verano y cortiner\u00eda.","descripcion":"Lino fresco y transpirable para ropa de verano y cortiner\u00eda.","featured":true,"destacado":true,"isNewCollection":true,"esNuevaColeccion":true,"isExclusive":false,"esExclusivo":false,"isOffer":false,"esOferta":false,"sellerId":3,"images":["/uploads/product_14_1775766898975.webp"],"material":"Lino org\u00e1nico","width":"1.50 m","weight":"200 g/m\u00b2","care":"No usar secadora"},
  {"id":4,"name":"Lana Merino","nombre":"Lana Merino","price":65000,"precio":65000,"stock":30,"existencias":30,"category":"Lana","categoria":"Lana","description":"Lana suave y c\u00e1lida, ideal para abrigos y sastrer\u00eda de invierno.","descripcion":"Lana suave y c\u00e1lida, ideal para abrigos y sastrer\u00eda de invierno.","featured":true,"destacado":true,"isNewCollection":false,"esNuevaColeccion":false,"isExclusive":true,"esExclusivo":true,"isOffer":false,"esOferta":false,"sellerId":3,"images":["/uploads/product_14_1775766898975.webp"],"material":"Lana merino","width":"1.60 m","weight":"300 g/m\u00b2","care":"Lavar a mano con agua tibia"},
  {"id":5,"name":"Dril El\u00e1stico","nombre":"Dril El\u00e1stico","price":35000,"precio":35000,"stock":120,"existencias":120,"category":"Dril","categoria":"Dril","description":"Dril resistente con toque de elasticidad para pantalones y dotaci\u00f3n.","descripcion":"Dril resistente con toque de elasticidad para pantalones y dotaci\u00f3n.","featured":false,"destacado":false,"isNewCollection":false,"esNuevaColeccion":false,"isExclusive":false,"esExclusivo":false,"isOffer":true,"esOferta":true,"sellerId":2,"images":["/uploads/product_10_1775767265179.jpg"],"material":"Algod\u00f3n/Lycra 95/5","width":"1.50 m","weight":"250 g/m\u00b2","care":"Lavar a m\u00e1quina en ciclo suave"},
  {"id":6,"name":"Gasa de Seda","nombre":"Gasa de Seda","price":72000,"precio":72000,"stock":60,"existencias":60,"category":"Seda","categoria":"Seda","description":"Gasa ligera y elegante para pa\u00f1uelos, blusas y alta costura.","descripcion":"Gasa ligera y elegante para pa\u00f1uelos, blusas y alta costura.","featured":true,"destacado":true,"isNewCollection":false,"esNuevaColeccion":false,"isExclusive":true,"esExclusivo":true,"isOffer":false,"esOferta":false,"sellerId":3,"images":["/uploads/product_16_1775766690228.webp"],"material":"Seda/Poli\u00e9ster","width":"1.40 m","weight":"45 g/m\u00b2","care":"Lavar a mano"},
  {"id":7,"name":"Tela Polar Suave","nombre":"Tela Polar Suave","price":22000,"precio":22000,"stock":150,"existencias":150,"category":"Poli\u00e9ster","categoria":"Poli\u00e9ster","description":"Tela polar t\u00e9rmica de tacto suave para cobijas y chaquetas.","descripcion":"Tela polar t\u00e9rmica de tacto suave para cobijas y chaquetas.","featured":false,"destacado":false,"isNewCollection":false,"esNuevaColeccion":false,"isExclusive":false,"esExclusivo":false,"isOffer":true,"esOferta":true,"sellerId":2,"images":["/uploads/product_15_1775767332095.jpg"],"material":"Poli\u00e9ster 100%","width":"1.50 m","weight":"280 g/m\u00b2","care":"Lavar a m\u00e1quina, no planchar"},
  {"id":8,"name":"Oxford Camiser\u00eda","nombre":"Oxford Camiser\u00eda","price":38000,"precio":38000,"stock":90,"existencias":90,"category":"Algod\u00f3n","categoria":"Algod\u00f3n","description":"Tejido Oxford cl\u00e1sico de alta durabilidad para camisas formales.","descripcion":"Tejido Oxford cl\u00e1sico de alta durabilidad para camisas formales.","featured":true,"destacado":true,"isNewCollection":true,"esNuevaColeccion":true,"isExclusive":false,"esExclusivo":false,"isOffer":false,"esOferta":false,"sellerId":3,"images":["/uploads/product_12_1775767112691.jpg"],"material":"Algod\u00f3n peinado","width":"1.50 m","weight":"130 g/m\u00b2","care":"Planchar a temperatura media"},
  {"id":9,"name":"Retazo Algod\u00f3n Premium","nombre":"Retazo Algod\u00f3n Premium","price":12000,"precio":12000,"stock":3,"existencias":3,"category":"Algod\u00f3n","categoria":"Algod\u00f3n","description":"Retazo de algod\u00f3n premium en liquidaci\u00f3n (-40%) para proyectos peque\u00f1os.","descripcion":"Retazo de algod\u00f3n premium en liquidaci\u00f3n (-40%) para proyectos peque\u00f1os.","featured":false,"destacado":false,"isNewCollection":false,"esNuevaColeccion":false,"isExclusive":false,"esExclusivo":false,"isOffer":true,"esOferta":true,"sellerId":2,"images":["/uploads/product_9_1775766848979.jpg"],"material":"Algod\u00f3n 100%","width":"1.40 m","weight":"150 g/m\u00b2","care":"Lavar a m\u00e1quina"}
]
'@

$carruselJson = @'
[
  {"id":1,"title":"Nueva Colecci\u00f3n 2026","titulo":"Nueva Colecci\u00f3n 2026","subtitle":"Tendencias exclusivas en telas premium","subtitulo":"Tendencias exclusivas en telas premium","image":"/images/carousel-nueva-coleccion.png","imagen":"/images/carousel-nueva-coleccion.png","cta":"Ver M\u00e1s","sectionKey":"nuevas","section_key":"nuevas","claveSeccion":"nuevas","active":true,"order":1},
  {"id":2,"title":"Telas Exclusivas","titulo":"Telas Exclusivas","subtitle":"Dise\u00f1os \u00fanicos para proyectos especiales","subtitulo":"Dise\u00f1os \u00fanicos para proyectos especiales","image":"/images/carousel-telas-exclusivas.png","imagen":"/images/carousel-telas-exclusivas.png","cta":"Explorar","sectionKey":"exclusivas","section_key":"exclusivas","claveSeccion":"exclusivas","active":true,"order":2},
  {"id":3,"title":"Ofertas Especiales","titulo":"Ofertas Especiales","subtitle":"Descuentos por metraje y retazos en liquidaci\u00f3n","subtitulo":"Descuentos por metraje y retazos en liquidaci\u00f3n","image":"/images/carousel-ofertas-especiales.png","imagen":"/images/carousel-ofertas-especiales.png","cta":"Ver Ofertas","sectionKey":"ofertas","section_key":"ofertas","claveSeccion":"ofertas","active":true,"order":3}
]
'@

$seccionesInicioJson = @'
[
  {"key":"nuevas","title":"Nuevas Colecciones","subtitle":"Descubre las telas m\u00e1s recientes que llegan a la tienda","active":true},
  {"key":"exclusivas","title":"Telas Exclusivas","subtitle":"Dise\u00f1os \u00fanicos seleccionados para tus proyectos especiales","active":true},
  {"key":"ofertas","title":"Ofertas Especiales","subtitle":"Precios especiales en telas seleccionadas por tiempo limitado","active":true}
]
'@

$usuariosJson = @'
[
  {"id":1,"name":"Anderson Moreno","nombre":"Anderson Moreno","email":"admin@ddtextil.com","correo":"admin@ddtextil.com","role":"admin","rol":"admin","phone":"3027058951","active":true,"activo":true,"commissionRate":0,"createdAt":"2026-01-15"},
  {"id":2,"name":"Carlos Vendedor","nombre":"Carlos Vendedor","email":"vendedor@ddtextil.com","correo":"vendedor@ddtextil.com","role":"vendedor","rol":"vendedor","phone":"3017654321","active":true,"activo":true,"commissionRate":0.10,"createdAt":"2026-02-10"},
  {"id":3,"name":"Mar\u00eda Gonz\u00e1lez","nombre":"Mar\u00eda Gonz\u00e1lez","email":"maria.gonzalez@ddtextil.com","correo":"maria.gonzalez@ddtextil.com","role":"vendedor","rol":"vendedor","phone":"3109876543","active":true,"activo":true,"commissionRate":0.12,"createdAt":"2026-03-01"},
  {"id":4,"name":"Laura Mart\u00ednez","nombre":"Laura Mart\u00ednez","email":"cliente@ddtextil.com","correo":"cliente@ddtextil.com","role":"cliente","rol":"cliente","phone":"3154443322","active":true,"activo":true,"commissionRate":0,"createdAt":"2026-04-12"},
  {"id":5,"name":"David V\u00e9lez","nombre":"David V\u00e9lez","email":"cliente@gmail.com","correo":"cliente@gmail.com","role":"cliente","rol":"cliente","phone":"3205556677","active":true,"activo":true,"commissionRate":0,"createdAt":"2026-05-20"}
]
'@

$pedidosJson = @'
[
  {"id":1001,"clientId":4,"idCliente":4,"sellerId":2,"idVendedor":2,"status":"delivered","estado":"entregado","total":250000,"montoTotal":250000,"date":"2026-10-20T14:30:00Z","clientName":"Laura Mart\u00ednez","clientEmail":"cliente@ddtextil.com","items":[{"productId":1,"name":"Algod\u00f3n Premium","quantity":10,"price":25000}]},
  {"id":1002,"clientId":5,"idCliente":5,"sellerId":2,"idVendedor":2,"status":"shipped","estado":"enviado","total":425000,"montoTotal":425000,"date":"2026-10-25T10:15:00Z","clientName":"David V\u00e9lez","clientEmail":"cliente@gmail.com","items":[{"productId":2,"name":"Seda Italiana","quantity":5,"price":85000}]},
  {"id":1003,"clientId":4,"idCliente":4,"sellerId":3,"idVendedor":3,"status":"processing","estado":"en_proceso","total":180000,"montoTotal":180000,"date":"2026-10-28T16:45:00Z","clientName":"Laura Mart\u00ednez","clientEmail":"cliente@ddtextil.com","items":[{"productId":3,"name":"Lino Org\u00e1nico","quantity":4,"price":45000}]}
]
'@

$cuponesJson = @'
[
  {"id":1,"code":"BIENVENIDO10","codigo":"BIENVENIDO10","discountType":"percentage","tipoDescuento":"porcentaje","discountValue":10,"valorDescuento":10,"active":true,"activo":true,"usageCount":14,"expiresAt":"2027-12-31"},
  {"id":2,"code":"MAYORISTA15","codigo":"MAYORISTA15","discountType":"percentage","tipoDescuento":"porcentaje","discountValue":15,"valorDescuento":15,"active":true,"activo":true,"usageCount":8,"expiresAt":"2027-12-31"}
]
'@

$lotesJson = @'
[
  {"id":1,"batchCode":"ROL-ALG-001","codigoLote":"ROL-ALG-001","fabricType":"Algod\u00f3n Premium","tipoTela":"Algod\u00f3n Premium","color":"Blanco \u00d3ptico","initialMeters":100,"metrosIniciales":100,"currentMeters":72.5,"metrosActuales":72.5,"status":"active","estado":"DISPONIBLE","supplier":"Textiles Andinos S.A.S.","entryDate":"2026-10-01"},
  {"id":2,"batchCode":"ROL-SED-002","codigoLote":"ROL-SED-002","fabricType":"Seda Italiana","tipoTela":"Seda Italiana","color":"Champa\u00f1a","initialMeters":50,"metrosIniciales":50,"currentMeters":38.0,"metrosActuales":38.0,"status":"active","estado":"DISPONIBLE","supplier":"Importadora Milano","entryDate":"2026-10-05"},
  {"id":3,"batchCode":"ROL-LIN-003","codigoLote":"ROL-LIN-003","fabricType":"Lino Org\u00e1nico","tipoTela":"Lino Org\u00e1nico","color":"Arena Natural","initialMeters":80,"metrosIniciales":80,"currentMeters":2.4,"metrosActuales":2.4,"status":"low","estado":"RETAZO_LIQUIDADO","supplier":"Fibras Europeas","entryDate":"2026-10-10"}
]
'@

$ventasJson = @'
[
  {"saleDate":"2026-10-24","totalSales":850000,"totalOrders":5},
  {"saleDate":"2026-10-25","totalSales":1240000,"totalOrders":8},
  {"saleDate":"2026-10-26","totalSales":980000,"totalOrders":6},
  {"saleDate":"2026-10-27","totalSales":1650000,"totalOrders":11},
  {"saleDate":"2026-10-28","totalSales":1420000,"totalOrders":9},
  {"saleDate":"2026-10-29","totalSales":1890000,"totalOrders":12}
]
'@

$regionesJson = @'
[
  {"region":"Antioquia (Medell\u00edn)","sales":4250000,"orders":28,"percentage":45},
  {"region":"Cundinamarca (Bogot\u00e1)","sales":2650000,"orders":17,"percentage":28},
  {"region":"Valle del Cauca (Cali)","sales":1420000,"orders":9,"percentage":15},
  {"region":"Atl\u00e1ntico (Barranquilla)","sales":1130000,"orders":7,"percentage":12}
]
'@

function Send-Json($res, [string]$jsonText, [int]$statusCode = 200) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonText)
    $res.ContentType = "application/json; charset=UTF-8"
    $res.StatusCode = $statusCode
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.Close()
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $res.Headers.Add("Access-Control-Allow-Origin", "*")
        $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Correlation-ID")

        if ($req.HttpMethod -eq "OPTIONS") {
            $res.StatusCode = 204
            $res.Close()
            continue
        }

        $urlPath = $req.Url.AbsolutePath

        # --- RESPUESTAS DE API REST (Backend) ---
        if ($urlPath -eq "/health/live" -or $urlPath -eq "/api/health/live" -or $urlPath -eq "/api/health") {
            Send-Json $res '{"status":"UP","service":"ddtextil-backend","uptime_ms":360000}'
            continue
        }

        if ($urlPath -eq "/health/ready" -or $urlPath -eq "/api/health/ready") {
            Send-Json $res '{"status":"UP","database":"CONNECTED","checks":[{"name":"postgresql","status":"UP"}]}'
            continue
        }

        if ($urlPath -eq "/api/pagos/config" -or $urlPath -eq "/api/payments/config") {
            Send-Json $res '{"configured":true,"publicKey":"pub_test_Q5yDA9xoKdePzhSGeVe9HAUr19rhZCQSQ","currency":"COP","environment":"sandbox"}'
            continue
        }

        if ($urlPath -eq "/api/pagos/intencion") {
            $refCode = "DD-" + (Get-Random -Minimum 10000000 -Maximum 99999999)
            $sha = [System.Security.Cryptography.SHA256]::Create()
            $hashBytes = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes("${refCode}10000000COPtest_integrity_secret"))
            $sig = ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToLower()
            $intencionJson = "{`"success`":true,`"reference`":`"$refCode`",`"currency`":`"COP`",`"publicKey`":`"pub_test_Q5yDA9xoKdePzhSGeVe9HAUr19rhZCQSQ`",`"integritySignature`":`"$sig`"}"
            Send-Json $res $intencionJson
            continue
        }

        if ($urlPath -eq "/api/products" -or $urlPath -eq "/api/productos") {
            Send-Json $res $productosJson
            continue
        }

        if ($urlPath -eq "/api/productos/pendientes") {
            Send-Json $res '[]'
            continue
        }

        if ($urlPath -eq "/api/carousel" -or $urlPath -eq "/api/carrusel") {
            Send-Json $res $carruselJson
            continue
        }

        if ($urlPath -eq "/api/secciones-inicio") {
            Send-Json $res $seccionesInicioJson
            continue
        }

        if ($urlPath -eq "/api/iniciar-sesion" -or $urlPath -eq "/api/auth/login" -or $urlPath -eq "/api/login") {
            $bodyText = ""
            if ($req.HasEntityBody) {
                $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $bodyText = $reader.ReadToEnd()
                $reader.Close()
            }
            $role = "cliente"
            $userName = "Laura Mart\u00ednez"
            $userEmail = "cliente@ddtextil.com"
            $userId = 4
            if ($bodyText -match "admin@ddtextil\.com") {
                $role = "admin"
                $userName = "Anderson Moreno"
                $userEmail = "admin@ddtextil.com"
                $userId = 1
            } elseif ($bodyText -match "vendedor@ddtextil\.com" -or $bodyText -match "maria\.gonzalez@ddtextil\.com") {
                $role = "vendedor"
                $userName = "Carlos Vendedor"
                $userEmail = "vendedor@ddtextil.com"
                $userId = 2
            }
            $loginResp = "{`"success`":true,`"token`":`"demo-jwt-token-sena-adso-2026`",`"user`":{`"id`":$userId,`"name`":`"$userName`",`"nombre`":`"$userName`",`"email`":`"$userEmail`",`"correo`":`"$userEmail`",`"role`":`"$role`",`"rol`":`"$role`"}}"
            Send-Json $res $loginResp
            continue
        }

        if ($urlPath -eq "/api/registro" -or $urlPath -eq "/api/autenticacion/sso") {
            $bodySso = ""
            if ($req.HasEntityBody) {
                $readerSso = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $bodySso = $readerSso.ReadToEnd()
                $readerSso.Close()
            }
            $ssoEmail = "cliente@ddtextil.com"
            $ssoName = "Cliente D&D Textil"
            try {
                if (-not [string]::IsNullOrWhiteSpace($bodySso)) {
                    $parsedSso = $bodySso | ConvertFrom-Json
                    if ($parsedSso.email) { $ssoEmail = [string]$parsedSso.email }
                    elseif ($parsedSso.correo) { $ssoEmail = [string]$parsedSso.correo }
                    if ($parsedSso.nombre) { $ssoName = [string]$parsedSso.nombre }
                    elseif ($parsedSso.name) { $ssoName = [string]$parsedSso.name }
                }
            } catch {}
            $ssoRespObj = @{
                success = $true
                token   = "demo-jwt-token-sena-adso-2026"
                user    = @{
                    id     = 4
                    name   = $ssoName
                    nombre = $ssoName
                    email  = $ssoEmail
                    correo = $ssoEmail
                    role   = "cliente"
                    rol    = "cliente"
                }
            } | ConvertTo-Json -Compress -Depth 4
            Send-Json $res $ssoRespObj
            continue
        }

        if ($urlPath -eq "/api/usuarios") {
            Send-Json $res $usuariosJson
            continue
        }

        if ($urlPath -eq "/api/pedidos") {
            Send-Json $res $pedidosJson
            continue
        }

        if ($urlPath -eq "/api/cupones") {
            Send-Json $res $cuponesJson
            continue
        }

        if ($urlPath -eq "/api/inventario/lotes") {
            Send-Json $res $lotesJson
            continue
        }

        if ($urlPath -eq "/api/metricas/ventas" -or $urlPath -eq "/api/metricas/ventas-erp") {
            Send-Json $res $ventasJson
            continue
        }

        if ($urlPath -eq "/api/metricas/regiones") {
            Send-Json $res $regionesJson
            continue
        }

        if ($urlPath -eq "/api/banner") {
            Send-Json $res '{"enabled":true,"message":"Env\u00edo gratis en pedidos superiores a $200.000 COP en todo Colombia","type":"info"}'
            continue
        }

        if ($urlPath -like "/api/configuracion/*") {
            Send-Json $res '{}'
            continue
        }

        if ($urlPath -like "/api/*") {
            if ($req.HttpMethod -eq "GET") {
                Send-Json $res '[]'
            } else {
                Send-Json $res '{"success":true}'
            }
            continue
        }

        # --- ARCHIVOS ESTATICOS DEL FRONTEND (SPA) ---
        $relPath = $urlPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath)) {
            $relPath = "index.html"
        }

        $localFile = Join-Path $assetsDir $relPath
        if (-not (Test-Path $localFile) -or (Get-Item $localFile) -is [System.IO.DirectoryInfo]) {
            $candidatePublic = Join-Path $publicDir $relPath
            $candidateSharedImg = Join-Path $rootDir $relPath
            $candidateUploads = Join-Path $uploadsDir ($relPath -replace '^uploads/', '')
            if (Test-Path $candidatePublic -PathType Leaf) {
                $localFile = $candidatePublic
            } elseif (Test-Path $candidateSharedImg -PathType Leaf) {
                $localFile = $candidateSharedImg
            } elseif (Test-Path $candidateUploads -PathType Leaf) {
                $localFile = $candidateUploads
            } else {
                $localFile = Join-Path $assetsDir "index.html"
            }
        }

        $ext = [System.IO.Path]::GetExtension($localFile).ToLower()
        $contentType = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }

        $bytes = [System.IO.File]::ReadAllBytes($localFile)
        $res.ContentType = $contentType
        $res.StatusCode = 200
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        $res.Close()

    } catch {
        if (-not $listener.IsListening) { break }
    }
}

$listener.Close()
Write-Output "Servidor detenido."
