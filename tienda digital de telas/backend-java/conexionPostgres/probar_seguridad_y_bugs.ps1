# ==============================================================================
# SCRIPT DE PRUEBAS DE SEGURIDAD, ERRORES Y BUGS (D&D TEXTIL)
# ==============================================================================
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   INICIANDO BATERIA DE PRUEBAS DE SEGURIDAD Y BUGS - D&D TEXTIL " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$urlBase = "http://localhost:8081"
$pruebasPasadas = 0
$pruebasFallidas = 0

function Ejecutar-Prueba {
    param (
        [string]$NombrePrueba,
        [scriptblock]$Bloque
    )
    Write-Host "`n[TEST] $NombrePrueba..." -ForegroundColor Yellow
    try {
        & $Bloque
        Write-Host "  -> [PASO] Exito en: $NombrePrueba" -ForegroundColor Green
        $global:pruebasPasadas++
    } catch {
        Write-Host "  -> [FALLO] Error en: $NombrePrueba" -ForegroundColor Red
        Write-Host "     Detalle: $_" -ForegroundColor DarkRed
        $global:pruebasFallidas++
    }
}

# ------------------------------------------------------------------------------
# 1. PRUEBAS DE INYECCION SQL (SQL Injection - SQLi)
# ------------------------------------------------------------------------------
Ejecutar-Prueba "SQLi en Login (Intento de evasion de autenticacion)" {
    $cuerpo = @{
        email = "admin@ejemplo.com' OR '1'='1"
        password = "' OR '1'='1"
    } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Uri "$urlBase/api/login" -Method Post -Body $cuerpo -ContentType "application/json" -ErrorAction Stop
        throw "Vulnerabilidad: El login acepto inyeccion SQL y devolvio exito!"
    } catch {
        $codigoEstado = $_.Exception.Response.StatusCode.value__
        if ($codigoEstado -eq 400 -or $codigoEstado -eq 401) {
            Write-Host "     Inyeccion bloqueada correctamente con HTTP $codigoEstado." -ForegroundColor Gray
        } else {
            throw "Codigo HTTP inesperado: $codigoEstado. Detalle: $_"
        }
    }
}

Ejecutar-Prueba "SQLi en Parametro de Seccion de Productos" {
    $url = "$urlBase/api/productos?seccion=%27%20OR%201=1%20--"
    $resp = Invoke-RestMethod -Uri $url -Method Get
    if ($resp -is [System.Array]) {
        Write-Host "     Respuesta controlada y segura: catalogo filtrado sin error de BD." -ForegroundColor Gray
    } else {
        throw "La respuesta no fue un arreglo valido."
    }
}

# ------------------------------------------------------------------------------
# 2. PRUEBAS DE PATH TRAVERSAL (Recorrido Arbitrario de Directorios)
# ------------------------------------------------------------------------------
Ejecutar-Prueba "Path Traversal relativo (intento de lectura fuera de uploads)" {
    try {
        $resp = Invoke-WebRequest -Uri "$urlBase/uploads/../src/App.java" -Method Get -ErrorAction Stop
        throw "Vulnerabilidad critica: Se permitio descargar archivo fuera de /uploads!"
    } catch {
        $codigoEstado = $_.Exception.Response.StatusCode.value__
        if ($codigoEstado -eq 403 -or $codigoEstado -eq 400 -or $codigoEstado -eq 404) {
            Write-Host "     Acceso bloqueado de forma segura con HTTP $codigoEstado." -ForegroundColor Gray
        } else {
            throw "Codigo HTTP inesperado: $codigoEstado"
        }
    }
}

Ejecutar-Prueba "Path Traversal con codificacion URL (%2e%2e)" {
    try {
        $resp = Invoke-WebRequest -Uri "$urlBase/uploads/%2e%2e/src/App.java" -Method Get -ErrorAction Stop
        throw "Vulnerabilidad: El servidor proceso %2e%2e permitiendo traversal!"
    } catch {
        $codigo = $_.Exception.Response.StatusCode.value__
        if ($codigo -eq 403 -or $codigo -eq 400 -or $codigo -eq 404) {
            Write-Host "     Traversal codificado bloqueado con HTTP $codigo." -ForegroundColor Gray
        } else {
            throw "Codigo HTTP inesperado: $codigo"
        }
    }
}

# ------------------------------------------------------------------------------
# 3. PRUEBAS DE ROBUSTEZ Y VALIDACION DE ENTRADAS MALFORMADAS
# ------------------------------------------------------------------------------
Ejecutar-Prueba "Identificador alfanumerico malformado en actualizacion de pedido" {
    $cuerpo = @{ status = "shipped" } | ConvertTo-Json
    try {
        $resp = Invoke-WebRequest -Uri "$urlBase/api/pedidos/id-malformado/estado" -Method Put -Body $cuerpo -ContentType "application/json" -ErrorAction Stop
        throw "No se rechazo la ruta con ID no numerico."
    } catch {
        $codigo = $_.Exception.Response.StatusCode.value__
        if ($codigo -eq 400) {
            Write-Host "     Manejado limpiamente con HTTP 400 Bad Request (sin error 500)." -ForegroundColor Gray
        } else {
            throw "Codigo HTTP inesperado: $codigo (deberia ser 400)"
        }
    }
}

Ejecutar-Prueba "Identificador no numerico en actualizacion de reporte de error" {
    $cuerpo = @{ estado = "resuelto" } | ConvertTo-Json
    try {
        $resp = Invoke-WebRequest -Uri "$urlBase/api/soporte/errores/xyz/estado" -Method Put -Body $cuerpo -ContentType "application/json" -ErrorAction Stop
        throw "No se rechazo la ruta con ID no numerico."
    } catch {
        $codigo = $_.Exception.Response.StatusCode.value__
        if ($codigo -eq 400) {
            Write-Host "     Manejado limpiamente con HTTP 400 Bad Request." -ForegroundColor Gray
        } else {
            throw "Codigo HTTP inesperado: $codigo"
        }
    }
}

Ejecutar-Prueba "Validacion de cantidad negativa o cero en carrito de compras" {
    $cuerpo = @{
        userId = 1
        productId = 1
        quantity = -3
    } | ConvertTo-Json
    try {
        $resp = Invoke-WebRequest -Uri "$urlBase/api/carrito" -Method Post -Body $cuerpo -ContentType "application/json" -ErrorAction Stop
        throw "Se permitio agregar cantidades negativas al carrito!"
    } catch {
        $codigo = $_.Exception.Response.StatusCode.value__
        if ($codigo -eq 400) {
            Write-Host "     Cantidad invalida rechazada correctamente con HTTP 400." -ForegroundColor Gray
        } else {
            throw "Codigo HTTP inesperado: $codigo"
        }
    }
}

# ------------------------------------------------------------------------------
# 4. PRUEBA DE CICLO COMPLETO DE REPORTE DE BUGS (Bug Reports)
# ------------------------------------------------------------------------------
$idReporteCreado = 0
Ejecutar-Prueba "Creacion y persistencia de Bug Report con severidad y titulo" {
    $payloadBug = @{
        title = "Prueba Automatizada de Seguridad y Renderizado"
        titulo = "Prueba Automatizada de Seguridad y Renderizado"
        description = "Descripcion detallada del reporte para verificacion en panel de control."
        descripcion = "Descripcion detallada del reporte para verificacion en panel de control."
        severity = "high"
        severidad = "alta"
        sellerId = 1
        idVendedor = 1
        sellerName = "Auditor de Seguridad"
        nombreVendedor = "Auditor de Seguridad"
        status = "open"
        estado = "abierto"
    } | ConvertTo-Json

    $respPost = Invoke-RestMethod -Uri "$urlBase/api/soporte/errores" -Method Post -Body $payloadBug -ContentType "application/json"
    if ($respPost.success -ne $true) {
        throw "La respuesta de creacion de reporte no indico exito: $($respPost | ConvertTo-Json)"
    }

    # Verificar que aparece en el listado y tiene titulo y severidad
    $listaBugs = Invoke-RestMethod -Uri "$urlBase/api/soporte/errores" -Method Get
    $bugEncontrado = $listaBugs | Where-Object { $_.description -like "*verificacion en panel*" -or $_.descripcion -like "*verificacion en panel*" } | Select-Object -First 1

    if (-not $bugEncontrado) {
        throw "El reporte de error recien insertado no fue encontrado en la base de datos."
    }

    $global:idReporteCreado = $bugEncontrado.id
    Write-Host "     Reporte creado con ID: $($bugEncontrado.id)" -ForegroundColor Gray
    Write-Host "     Titulo recuperado: $($bugEncontrado.title)" -ForegroundColor Gray
    Write-Host "     Severidad recuperada: $($bugEncontrado.severity)" -ForegroundColor Gray
    Write-Host "     Prioridad recuperada: $($bugEncontrado.priority)" -ForegroundColor Gray

    if (-not $bugEncontrado.title -and -not $bugEncontrado.titulo) {
        throw "El titulo del bug report vino vacio o nulo!"
    }
    if ($bugEncontrado.severity -ne "high" -and $bugEncontrado.priority -ne "high" -and $bugEncontrado.severidad -ne "alta") {
        throw "La severidad del bug report no se guardo correctamente: $($bugEncontrado | ConvertTo-Json)"
    }
}

if ($global:idReporteCreado -gt 0) {
    Ejecutar-Prueba "Actualizacion de estado de Bug Report a Resuelto" {
        $payloadEstado = @{
            status = "resolved"
            estado = "resuelto"
        } | ConvertTo-Json

        $respPut = Invoke-RestMethod -Uri "$urlBase/api/soporte/errores/$($global:idReporteCreado)/estado" -Method Put -Body $payloadEstado -ContentType "application/json"
        if ($respPut.success -ne $true) {
            throw "Fallo al actualizar el estado del reporte."
        }
        Write-Host "     Reporte ID $($global:idReporteCreado) marcado como resuelto exitosamente." -ForegroundColor Gray
    }
}

# ------------------------------------------------------------------------------
# 5. PRUEBAS DE GESTION DE USUARIOS (Persistencia de Rol y Estado en BD)
# ------------------------------------------------------------------------------
Ejecutar-Prueba "Actualizacion de rol de usuario con persistencia en PostgreSQL" {
    $usuarios = Invoke-RestMethod -Uri "$urlBase/api/usuarios" -Method Get
    if ($usuarios.Count -eq 0) { throw "No hay usuarios en el sistema." }
    
    $usuarioPrueba = $usuarios | Where-Object { $_.id -ne 1 } | Select-Object -Last 1
    if (-not $usuarioPrueba) { $usuarioPrueba = $usuarios[0] }

    $idUsuario = $usuarioPrueba.id
    $rolOriginal = $usuarioPrueba.role

    # Cambiamos temporalmente el rol a 'seller'
    $cuerpo = @{ role = "seller" } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$urlBase/api/usuarios/$idUsuario/rol" -Method Put -Body $cuerpo -ContentType "application/json"
    if ($resp.success -ne $true) { throw "No se pudo actualizar el rol a seller" }

    # Verificamos persistencia real
    $usuariosActualizados = Invoke-RestMethod -Uri "$urlBase/api/usuarios" -Method Get
    $usuarioVerificado = $usuariosActualizados | Where-Object { $_.id -eq $idUsuario }
    if ($usuarioVerificado.role -ne "seller" -and $usuarioVerificado.rol -ne "seller") {
        throw "El nuevo rol no se persistio en PostgreSQL!"
    }
    Write-Host "     Rol persistido con exito en PostgreSQL para usuario $idUsuario." -ForegroundColor Gray

    # Restauramos rol original
    $cuerpoRestaurar = @{ role = $rolOriginal } | ConvertTo-Json
    $null = Invoke-RestMethod -Uri "$urlBase/api/usuarios/$idUsuario/rol" -Method Put -Body $cuerpoRestaurar -ContentType "application/json"
}

# ------------------------------------------------------------------------------
# 6. PRUEBAS DE CONFIGURACION GLOBAL
# ------------------------------------------------------------------------------
Ejecutar-Prueba "Persistencia y lectura de configuracion dinamica" {
    $clavePrueba = "test_seguridad_clave"
    $valorPrueba = "activa_2026"

    $cuerpo = @{
        clave = $clavePrueba
        valor = $valorPrueba
    } | ConvertTo-Json

    $respPost = Invoke-RestMethod -Uri "$urlBase/api/configuracion" -Method Post -Body $cuerpo -ContentType "application/json"
    if ($respPost.success -ne $true) { throw "Error al guardar configuracion" }

    $respGet = Invoke-RestMethod -Uri "$urlBase/api/configuracion/$clavePrueba" -Method Get
    if ($respGet -ne $valorPrueba) {
        throw "El valor recuperado ($respGet) no coincide con el guardado ($valorPrueba)"
    }
    Write-Host "     Clave-valor de configuracion persistida y verificada con exito." -ForegroundColor Gray
}

# ------------------------------------------------------------------------------
# RESUMEN FINAL
# ------------------------------------------------------------------------------
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "                    RESUMEN DE PRUEBAS                          " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Total Pruebas Pasadas:  $pruebasPasadas" -ForegroundColor Green
Write-Host "  Total Pruebas Fallidas: $pruebasFallidas" -ForegroundColor $(if ($pruebasFallidas -eq 0) { "Green" } else { "Red" })

if ($pruebasFallidas -eq 0) {
    Write-Host "`n>>> EL SISTEMA HA SUPERADO CON EXITO TODAS LAS PRUEBAS DE SEGURIDAD, BUGS Y ERRORES <<<`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n>>> SE DETECTARON FALLOS EN LA SUITE DE PRUEBAS <<<`n" -ForegroundColor Red
    exit 1
}
