# 🔄 Migración Framer Motion → GSAP — Tareas Pendientes

## Estado Actual
**Fase 1 ✅ COMPLETADA** — Páginas públicas y componentes UI.
**Fase 3 ✅ COMPLETADA** — Paneles administrativos (Soporte, Vetting, Inventario).
**Limpieza Final ✅ COMPLETADA** — Desinstalación de librerías legacy.

---

## Fase 2: Paneles de Usuario (Dashboard) ✅ COMPLETADA

### Componentes de Layout
| Archivo | Ruta | Estado |
|---------|------|--------|
| `DashboardLayout.jsx` | `src/components/layouts/` | ✅ Migrado |
| `CommandPalette.jsx` | `src/components/dashboard/` | ✅ Migrado |
| `NotificationFeed.jsx` | `src/components/dashboard/` | ✅ Migrado |

---

## Fase 3: Paneles Administrativos

### Módulos Core
| Archivo | Ruta | Complejidad |
|---------|------|-------------|
| `UserManagement.jsx` | `src/pages/admin/` | ✅ Migrado |
| `SystemConfig.jsx` | `src/pages/admin/` | ✅ Migrado |
| `AdminProducts.jsx` | `src/pages/admin/` | ✅ Migrado |
| `ManageHome.jsx` | `src/pages/admin/` | ✅ Migrado |
| `ManageCarousel.jsx` | `src/pages/admin/` | ✅ Migrado |
| `AdminActivity.jsx` | `src/pages/admin/` | ✅ Migrado |

### Métricas y Analytics
| Archivo | Ruta | Complejidad | Estado |
|---------|------|-------------|--------|
| `SellerMetrics.jsx` | `src/pages/admin/` | 🟡 Media | ✅ Migrado |
| `ClientMetrics.jsx` | `src/pages/admin/` | 🟢 Baja | ✅ Migrado |
| `SalesHeatMap.jsx` | `src/pages/admin/Analytics/` | 🟢 Baja | ✅ Migrado |
| `RotationRanking.jsx` | `src/pages/admin/Analytics/` | 🟡 Media | ✅ Migrado |
| `ReturnsAnalysis.jsx` | `src/pages/admin/Analytics/` | 🟢 Baja | ✅ Migrado |

### Inventario
| Archivo | Ruta | Complejidad | Estado |
|---------|------|-------------|--------|
| `BatchControl.jsx` | `src/pages/admin/Inventory/` | 🔴 Alta | ✅ Migrado |
| `StockSettings.jsx` | `src/pages/admin/Inventory/` | 🟡 Media | ✅ Migrado |
| `MovementHistory.jsx` | `src/pages/admin/Inventory/` | 🟢 Baja | ✅ Migrado |
| `WasteCalculator.jsx` | `src/pages/admin/Inventory/` | 🟡 Media | ✅ Migrado |

### Soporte y Moderación
| Archivo | Ruta | Complejidad |
|---------|------|-------------|
| `TicketManagement.jsx` | `src/pages/admin/Support/` | ✅ Migrado |
| `CouponCreation.jsx` | `src/pages/admin/Support/` | ✅ Migrado |
| `AdminBugReports.jsx` | `src/pages/admin/Support/` | ✅ Migrado |

### Vetting (Moderación de Vendedores)
| Archivo | Ruta | Complejidad |
|---------|------|-------------|
| `VendorPerformance.jsx` | `src/pages/admin/Vetting/` | ✅ Migrado |
| `ApprovalQueue.jsx` | `src/pages/admin/Vetting/` | ✅ Migrado |

---

## Paso Final

Después de completar todas las fases:

```bash
# ✅ EJECUTADO
npm uninstall framer-motion

# ✅ EJECUTADO
npm uninstall react-icons
```

---

## Patrón de Migración (Referencia Rápida)

### Reemplazar `motion.div` con animación de entrada:
```jsx
// ANTES (framer-motion)
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

// DESPUÉS (GSAP)
const ref = useRef(null);
useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
}, { scope: ref });
<div ref={ref}>
```

### Reemplazar `AnimatePresence`:
```jsx
// ANTES (framer-motion)
<AnimatePresence>{isOpen && <motion.div exit={{ opacity: 0 }}>...</motion.div>}</AnimatePresence>

// DESPUÉS (GSAP) — Controlar con estado + gsap.to onComplete
const handleClose = () => {
    gsap.to(ref.current, { opacity: 0, duration: 0.2, onComplete: () => setIsOpen(false) });
};
{isOpen && <div ref={ref}>...</div>}
```

### Reemplazar `whileHover` / `whileTap`:
```jsx
// ANTES
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>

// DESPUÉS (CSS puro)
<button className="hover:scale-105 active:scale-95 transition-transform">
```

### Iconos:
```jsx
// ANTES: import { MdStar } from 'react-icons/md'
// DESPUÉS: import { Star } from 'lucide-react'
```
