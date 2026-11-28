npm run dev# Uso: python3 generar_mapa.py "tienda digital de telas/src" documentacion/diagramas
# Requiere Graphviz (dot). Genera mapa_navegacion.png y mapa_navegacion.svg a partir de
# src/App.jsx (rutas) y src/datos/enlaces*.js (menús laterales de cada rol).
import re, sys, html, subprocess, pathlib

SRC = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])
E = html.escape
MONO = 'DejaVu Sans Mono'

app = (SRC / 'App.jsx').read_text(encoding='utf-8')
RUTAS = re.findall(r'path="([^"]+)"', app)


def menu(nombre):
    """Lee un archivo enlaces*.js: devuelve [(etiqueta, ruta | None, [(etiqueta, ruta), ...])]."""
    items, actual = [], None
    for line in (SRC / 'datos' / nombre).read_text(encoding='utf-8').splitlines():
        sangria = len(line) - len(line.lstrip())
        hijo = re.search(r"\{\s*label:\s*'([^']+)',\s*path:\s*'([^']+)'", line)
        if hijo and sangria >= 10:
            actual[2].append((hijo.group(1), hijo.group(2)))
        elif hijo:
            items.append((hijo.group(1), hijo.group(2), [])); actual = items[-1]
        elif re.search(r"^\s*label:\s*'([^']+)'", line) and sangria <= 8:
            items.append([re.search(r"label:\s*'([^']+)'", line).group(1), None, []]); actual = items[-1]
        elif re.search(r"^\s*path:\s*'([^']+)'", line) and actual is not None and not actual[2]:
            actual[1] = re.search(r"path:\s*'([^']+)'", line).group(1)
    return [tuple(x) for x in items]


def nid(ruta):
    if ruta == '*':
        return 'r_404'
    return 'r_' + (re.sub(r'[^a-z0-9]+', '_', ruta.strip('/')) or 'inicio')


def nodo(ruta, nombre, color, raiz=False, sin_enlace=False, nota=None):
    sub = E(ruta) + (f' &#160;· {nota}' if nota else (' &#160;· sin enlace' if sin_enlace else ''))
    etiqueta = (f'<<B>{E(nombre)}</B><BR/>' if raiz else f'<{E(nombre)}<BR/>') + \
        f'<FONT FACE="{MONO}" POINT-SIZE="9" COLOR="#6b7280">{sub}</FONT>>'
    if sin_enlace:
        return f'{nid(ruta)} [label={etiqueta}, style="rounded,dashed,filled", fillcolor="#ffffff", color="#9aa0a8"];'
    return f'{nid(ruta)} [label={etiqueta}, color="{color}", penwidth={1.6 if raiz else 1}];'


def grupo(id_, titulo, hijos, color):
    filas = ''.join(f'<TR><TD ALIGN="LEFT" CELLPADDING="3"><FONT POINT-SIZE="11">{E(n)}</FONT><BR ALIGN="LEFT"/>'
                    f'<FONT FACE="{MONO}" POINT-SIZE="9" COLOR="#6b7280">{E(r)}</FONT></TD></TR>' for n, r in hijos)
    return (f'{id_} [shape=plain, label=<<TABLE BORDER="1" COLOR="{color}" CELLBORDER="0" CELLSPACING="0" BGCOLOR="white">'
            f'<TR><TD ALIGN="LEFT" BGCOLOR="{color}" CELLPADDING="5"><FONT COLOR="white" POINT-SIZE="11"><B>{E(titulo)}</B></FONT></TD></TR>'
            f'{filas}</TABLE>>];')


def panel(clave, titulo, color, fondo, archivo, sin_enlace):
    items = menu(archivo)
    raiz = items[0]
    g = [f'subgraph cluster_{clave} {{ label=<<B>{E(titulo)}</B>>; fontcolor="{color}"; fontsize=14; labeljust=l; '
         f'style="rounded,filled"; fillcolor="{fondo}"; color="{color}"; margin=14;',
         nodo(raiz[1], raiz[0], color, raiz=True)]
    aristas, orden = [], []
    for i, (n, r, hijos) in enumerate(items[1:], start=1):
        if hijos:
            g.append(grupo(f'g_{clave}_{i}', n, hijos, color)); destino = f'g_{clave}_{i}'
        else:
            g.append(nodo(r, n, color)); destino = nid(r)
        aristas.append(f'{nid(raiz[1])} -> {destino} [color="{color}"];')
        orden.append(destino)
    for r, n, nota in sin_enlace:
        g.append(nodo(r, n, color, sin_enlace=True, nota=nota))
    g.append('}')
    return g + aristas, nid(raiz[1])


PUB = '#4b5563'
cuerpo = []
cuerpo.append('subgraph cluster_pub { label=<<B>Sitio público</B>>; fontcolor="#4b5563"; fontsize=14; labeljust=l; '
              'style="rounded,filled"; fillcolor="#eef0f3"; color="#4b5563"; margin=14;')
for r, n, raiz in [('/', 'Inicio', True), ('/catalogo', 'Catálogo', False), ('/producto/:id', 'Detalle de tela', False),
                   ('/carrito', 'Carrito', False), ('/favoritos', 'Favoritos', False), ('/nosotros', 'Nosotros', False),
                   ('/contacto', 'Contacto', False), ('/login', 'Iniciar sesión', False), ('/registro', 'Registro', False)]:
    cuerpo.append(nodo(r, n, PUB, raiz=raiz))
cuerpo.append(nodo('/reportar-fallo', 'Reportar fallo', PUB, sin_enlace=True))
cuerpo.append(nodo('/wishlist', 'Favoritos (alias)', PUB, sin_enlace=True))
cuerpo.append(nodo('*', 'Página no encontrada', PUB, sin_enlace=True, nota='cualquier ruta inexistente'))
cuerpo.append('}')
cuerpo.append('subgraph cluster_buy { label=<<B>Proceso de compra</B><FONT COLOR="#8e3b7a"> · no exige sesión</FONT>>; fontcolor="#8e3b7a"; '
              'fontsize=14; labeljust=l; style="rounded,filled"; fillcolor="#f6eaf3"; color="#8e3b7a"; margin=14;')
for r, n in [('/checkout', 'Datos de envío'), ('/pago', 'Pago (tarjeta, PSE, Nequi o contraentrega)'), ('/confirmacion', 'Confirmación del pedido')]:
    cuerpo.append(nodo(r, n, '#8e3b7a'))
cuerpo.append('}')
for a, b, etq, extra in [('/', '/catalogo', 'menú', ''), ('/', '/carrito', 'ícono carrito', ''), ('/', '/favoritos', 'ícono favoritos', ''),
                         ('/', '/contacto', 'menú', ''), ('/', '/nosotros', 'menú', ''), ('/', '/login', 'Ingresar', ''),
                         ('/catalogo', '/producto/:id', 'ver tela', ''), ('/producto/:id', '/carrito', 'agregar', ''),
                         ('/login', '/registro', 'crear cuenta', ''), ('/registro', '/', 'cuenta creada', ', style=dashed'),
                         ('/carrito', '/checkout', 'Continuar a Envío y Pago', ', color="#8e3b7a", penwidth=1.4'),
                         ('/checkout', '/pago', 'continuar', ', color="#8e3b7a", penwidth=1.4'),
                         ('/pago', '/confirmacion', 'pago aprobado', ', color="#8e3b7a", penwidth=1.4')]:
    cuerpo.append(f'{nid(a)} -> {nid(b)} [label="{etq}"{extra}];')
cuerpo.append(f'r_404 -> {nid("/")} [label="volver al inicio", style=dashed];')

for clave, titulo, color, fondo, archivo, sin, etq in [
        ('cliente', 'Panel del cliente', '#2f7d45', '#e8f3ea', 'enlacesCliente.js',
         [('/cliente/perfil', 'Perfil (duplicado)', None), ('/cliente/favoritos', 'Favoritos (alias)', None)], 'rol cliente'),
        ('vendedor', 'Panel del vendedor (también admin)', '#a8641a', '#fbf1e3', 'enlacesVendedor.js', [], 'rol vendedor'),
        ('admin', 'Panel del administrador', '#3b5ba9', '#e8eef9', 'enlacesAdmin.js',
         [('/admin/actividad', 'Actividad reciente', None)], 'rol admin')]:
    g, raiz = panel(clave, titulo, color, fondo, archivo, sin)
    cuerpo += g
    cuerpo.append(f'{nid("/login")} -> {raiz} [label="{etq}", color="{color}", penwidth=1.4];')

n = len(RUTAS)
titulo = (f'<<TABLE BORDER="0" CELLSPACING="0" CELLPADDING="2">'
          f'<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="24"><B>D&amp;D Textil — Mapa de navegación</B></FONT></TD></TR>'
          f'<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="13" COLOR="#555555">{n} rutas · fuente: src/App.jsx y src/datos/enlaces*.js · '
          f'las flechas son enlaces o botones reales del código</FONT></TD></TR>'
          f'<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="11" COLOR="#555555">Ruta protegida sin sesión → redirige a /login · ruta de otro rol → '
          f'redirige a / &#160;·&#160; borde punteado = ruta que existe pero ningún menú ni botón enlaza</FONT></TD></TR></TABLE>>')
dot = '\n'.join(['digraph NAV {',
                 f'graph [rankdir=LR, ordering=out, fontname="Inter", bgcolor="white", pad=0.4, nodesep=0.22, ranksep=0.9, '
                 f'label={titulo}, labelloc=t, labeljust=l];',
                 'node [shape=box, style="rounded,filled", fillcolor="white", fontname="Inter", fontsize=12, margin="0.18,0.06"];',
                 'edge [fontname="Inter", fontsize=9, fontcolor="#4b5563", color="#6b7280", arrowsize=0.7];',
                 *cuerpo, '}'])
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'mapa_navegacion.dot').write_text(dot, encoding='utf-8')
for fmt, extra in (('svg', []), ('png', ['-Gdpi=150'])):
    subprocess.run(['dot', f'-T{fmt}', *extra, '-o', str(OUT / f'mapa_navegacion.{fmt}'), str(OUT / 'mapa_navegacion.dot')], check=True)
(OUT / 'mapa_navegacion.dot').unlink()
print(f'{n} rutas', file=sys.stderr)
