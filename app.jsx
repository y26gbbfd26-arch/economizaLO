const { useState, useEffect, useRef } = React;

// ============================================================
//  economízalo · PROTOTIPO v4  (tema blanco)
//  Datos (base) · Mes (seguimiento) · Resumen (derivado)
//  Empieza de cero · Tutorial · Reparto por banco · Cierre de mes
// ============================================================

const T = {
  bg: "#FFFFFF", panel: "#FFFFFF",
  surface: "#FFFFFF", surface2: "#F1F3EF",
  border: "rgba(45,74,30,0.16)", line: "rgba(45,74,30,0.09)",
  text: "#1A1A18", mid: "#4C4C40", dim: "#8A8775",
  accent: "#2D5E3F", accentSoft: "#6A994E", warn: "#B8860B", neg: "#C0573E",
  shadow: "0 1px 3px rgba(20,30,15,0.06), 0 1px 2px rgba(20,30,15,0.04)",
  serif: "'DM Serif Display', Georgia, serif", ui: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace",
};
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const eur = (n) => Math.round(n || 0).toLocaleString("es-ES") + "€";
let _uidSeq = 0;
const uid = () => "x" + Date.now().toString(36) + "-" + (_uidSeq++).toString(36) + "-" + Math.random().toString(36).slice(2, 8);
const red = (x, r) => (r > 0 ? Math.ceil(x / r) * r : Math.round(x));
const numf = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; };

const P = {
  banco: <><path d="M3 9l9-5 9 5"/><path d="M5 9v9M9 9v9M15 9v9M19 9v9M3 18h18"/></>,
  inversion: <><path d="M3 17l6-6 4 4 7-8"/><path d="M16 7h5v5"/></>,
  ingreso: <><path d="M12 4v10"/><path d="M8 11l4 4 4-4"/><path d="M5 20h14"/></>,
  objetivo: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></>,
  gasto: <><path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4V3z"/><path d="M9 8h6M9 12h6"/></>,
  anual: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  criterios: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></>,
  resumen: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/></>,
  datos: <><path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  mes: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M8 14l2.5 2.5L16 12"/></>,
  reserva: <><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M4 11h16"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></>,
  chevron: <><path d="M6 9l6 6 6-6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>, x: <><path d="M6 6l12 12M18 6L6 18"/></>,
  check: <><path d="M20 6L9 17l-5-5"/></>,
  shield: <><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></>,
  reparto: <><path d="M12 3v6M12 9l-5 5M12 9l5 5M4 18h4M16 18h4M10 18h4"/></>,
  carro: <><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2 4h2.2l2.3 11.4a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.78L20 7H5.2"/></>,
  auto: <><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></>,
  compartida: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 3.5a3 3 0 0 1 0 5.8M21 20c0-2.5-1.5-4.2-4-4.8"/></>,
  transfer: <><path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 20l-4-4 4-4"/></>,
  casa: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
  deuda: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  chevL: <><path d="M15 6l-6 6 6 6"/></>, chevR: <><path d="M9 6l6 6-6 6"/></>,
  cog: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></>,
  descargar: <><path d="M12 3v12M8 11l4 4 4-4M5 21h14"/></>,
  subir: <><path d="M12 21V9M8 13l4-4 4 4M5 3h14"/></>,
};
const Icon = ({ n, s = 20, c = T.mid, sw = 1.7 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>{P[n]}</svg>
);

const TIPOS_ACTIVO = {
  etf:    { label: "ETF",    color: "#0E7C86", icono: "📊" },
  accion: { label: "Acción", color: "#2D5E3F", icono: "📈" },
  fondo:  { label: "Fondo",  color: "#B8860B", icono: "🏦" },
  cripto: { label: "Cripto", color: "#C0573E", icono: "₿" },
  bono:   { label: "Bono",   color: "#6A4C93", icono: "📜" },
};
const TIPOS_UNIDADES = ["etf", "accion", "cripto"]; // se introducen por cantidad × precio; fondo/bono por importe directo
const APP_VERSION = "v50-econ8";
const nuevoMes = () => new Date().getMonth();
const VACIO = { mes: nuevoMes(), bancos: [], inversiones: [], ingresos: [], objetivos: [], fijos: [], variables: [], anuales: [], inmuebles: [], deudas: [], presupuestos: [], puntuales: {}, ingresosMes: {}, provisionPagos: {}, cerrados: [],
  criterios: { mesesEmergencia: 6, proMesLimite: 10, proRedondeo: 50, proBolsa: null, proExtraPct: 42.86, bancoNomina: null, autoAnual: false, autoAnualBanco: null, presImprevistos: 10, presRedondeo: 50 } };

const EJEMPLO = { mes: nuevoMes(), cerrados: [],
  inmuebles: [{ id: "in1", nombre: "Vivienda", valor: 145000 }],
  deudas: [{ id: "de1", nombre: "Hipoteca pendiente", importe: 82000 }],
  presupuestos: [{ id: "pr1", nombre: "Terraza", articulos: [{ id: "ar1", nombre: "Sofá exterior", uds: 1, precio: 650 }, { id: "ar2", nombre: "Mesa", uds: 1, precio: 180 }], imprevistos: 10, incorporado: false }],
  puntuales: {},
  bancos: [
    { id: "b1", nombre: "BBVA", saldo: 8200, compartida: false, reservas: [{ id: "r1", nombre: "Fondo emergencia", importe: 3000 }, { id: "r2", nombre: "Anuales apartados", importe: 1200 }] },
    { id: "b2", nombre: "MyInvestor", saldo: 4500, compartida: false, reservas: [] },
    { id: "b3", nombre: "Cuenta común", saldo: 2000, compartida: true, reservas: [] },
  ],
  inversiones: [
    { id: "i1", nombre: "MSCI World", tipo: "etf", ticker: "IWDA", cantidad: 140, precioMedio: 85.7, precioActual: 101.4 },
    { id: "i2", nombre: "Bitcoin", tipo: "cripto", ticker: "BTC", cantidad: 0.12, precioMedio: 34000, precioActual: 41000 },
    { id: "i3", nombre: "Fondo Indexado Naranja", tipo: "fondo", invertido: 6000, valor: 6850 },
  ],
  ingresosMes: {},
  ingresos: [{ id: "g1", nombre: "Nómina", importe: 2100, nomina: true }, { id: "g2", nombre: "Alquiler local", importe: 350, nomina: false }],
  objetivos: [{ id: "o1", nombre: "Coche nuevo", meta: 12000, ahorrado: 3500, meses: 18, banco: "b1", auto: true }, { id: "o2", nombre: "Viaje Japón", meta: 4000, ahorrado: 1200, meses: 10, banco: "b2", auto: false }],
  fijos: [{ id: "f1", nombre: "Hipoteca", importe: 620, banco: "b1", pagados: [] }, { id: "f2", nombre: "Luz y agua", importe: 95, banco: "b1", pagados: [] }, { id: "f3", nombre: "Internet y móvil", importe: 55, banco: "b3", pagados: [] }],
  variables: [{ id: "v1", nombre: "Compra", importe: 400, banco: "b3", pagados: [] }, { id: "v2", nombre: "Gasolina", importe: 120, banco: "b1", pagados: [] }],
  anuales: [
    { id: "c1", nombre: "Coche", conceptos: [{ id: "x1", nombre: "Seguro coche", importe: 480, pagos: [{ id: "p1", mes: 2, importe: 480 }] }, { id: "x2", nombre: "ITV", importe: 45, pagos: [] }] },
    { id: "c2", nombre: "Hogar", conceptos: [{ id: "x3", nombre: "IBI", importe: 350, pagos: [] }, { id: "x4", nombre: "Seguro hogar", importe: 220, pagos: [{ id: "p2", mes: 1, importe: 220 }] }] },
  ],
  criterios: { mesesEmergencia: 6, proMesLimite: 10, proRedondeo: 50, proBolsa: "r2", proExtraPct: 42.86, bancoNomina: "b1", autoAnual: true, autoAnualBanco: "b1", presImprevistos: 10, presRedondeo: 50 } };

function Campo({ value, onChange, sufijo, ancho, alinear = "right", ph }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 9px", width: ancho, boxSizing: "border-box" }}>
      <input value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} inputMode={sufijo ? "decimal" : undefined}
        style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: T.text, fontFamily: sufijo ? T.mono : T.ui, fontSize: 13, textAlign: alinear }} />
      {sufijo && <span style={{ color: T.dim, fontFamily: T.mono, fontSize: 12 }}>{sufijo}</span>}
    </div>
  );
}
function Sel({ value, onChange, opciones, ancho }) {
  return (
    <select value={value == null ? "" : value} onChange={(e) => onChange(e.target.value)} style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 9px", fontFamily: T.ui, fontSize: 12, maxWidth: ancho }}>
      {opciones.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}
function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{ width: 42, height: 25, borderRadius: 13, border: "none", cursor: "pointer", background: on ? T.accent : "#D9DDD6", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 19, height: 19, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
    </button>
  );
}
function Bloque({ icon, titulo, sub, total, sufTotal, children, abierto, onTog, vacio }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, marginBottom: 12, overflow: "hidden", boxShadow: T.shadow }}>
      <div onClick={onTog} style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 16px", cursor: "pointer" }}>
        <Icon n={icon} s={19} c={T.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "0.04em", textTransform: "uppercase" }}>{titulo}</div>
          {sub && <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim, marginTop: 2 }}>{sub}</div>}
        </div>
        {vacio && !abierto && <span style={{ fontFamily: T.ui, fontSize: 10, color: T.accent, fontWeight: 600, marginRight: 8 }}>+ añadir</span>}
        {total != null && !vacio && <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.mid, marginRight: 8 }}>{eur(total)}{sufTotal || ""}</div>}
        <div style={{ transform: abierto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><Icon n="chevron" s={16} c={T.dim} /></div>
      </div>
      {abierto && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
}
function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ width: "100%", marginTop: 8, background: "none", border: `1px dashed ${T.accent}66`, borderRadius: 9, padding: "10px", cursor: "pointer", color: T.accent, fontFamily: T.ui, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <Icon n="plus" s={14} c={T.accent} /> {label}
    </button>
  );
}
function Del({ onClick, s = 30 }) {
  return (
    <button onClick={onClick} style={{ width: s, height: s, flexShrink: 0, background: `${T.neg}14`, border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon n="x" s={13} c={T.neg} />
    </button>
  );
}
function Vacio({ txt }) { return <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.dim, textAlign: "center", padding: "6px 0 10px", lineHeight: 1.5 }}>{txt}</div>; }

const STORAGE_KEY = "economizalo-v1";
// Repara ids duplicados o vacíos (versiones antiguas usaban un generador que podía colisionar)
function normalizarIds(dd) {
  const vistos = new Set();
  const arreglaLista = (arr) => { if (!Array.isArray(arr)) return; arr.forEach((it) => { if (!it || typeof it !== "object") return; if (!it.id || vistos.has(it.id)) it.id = uid(); vistos.add(it.id); if (Array.isArray(it.reservas)) it.reservas.forEach((r) => { if (r && (!r.id || vistos.has(r.id))) r.id = uid(); if (r) vistos.add(r.id); }); if (Array.isArray(it.conceptos)) it.conceptos.forEach((x) => { if (x && (!x.id || vistos.has(x.id))) x.id = uid(); if (x) vistos.add(x.id); if (Array.isArray(x.pagos)) x.pagos.forEach((p) => { if (p && (!p.id || vistos.has(p.id))) p.id = uid(); if (p) vistos.add(p.id); }); }); if (Array.isArray(it.articulos)) it.articulos.forEach((a) => { if (a && (!a.id || vistos.has(a.id))) a.id = uid(); if (a) vistos.add(a.id); }); }); };
  ["bancos", "inversiones", "ingresos", "objetivos", "fijos", "variables", "anuales", "inmuebles", "deudas", "presupuestos"].forEach((k) => arreglaLista(dd[k]));
  Object.values(dd.puntuales || {}).forEach(arreglaLista);
  Object.values(dd.ingresosMes || {}).forEach(arreglaLista);
  return dd;
}
// Repara referencias a bancos/bolsas que ya no existen (p. ej. tras la reparación de ids duplicados de versiones antiguas)
function sanearRefs(dd) {
  const bancos = dd.bancos || [];
  const hay = (id) => bancos.some((b) => b.id === id);
  const unico = bancos.length === 1 ? bancos[0].id : null;
  const arregla = (v) => (v && !hay(v) ? unico : v);
  (dd.objetivos || []).forEach((o) => { o.banco = arregla(o.banco); });
  (dd.fijos || []).forEach((g) => { g.banco = arregla(g.banco); });
  (dd.variables || []).forEach((g) => { g.banco = arregla(g.banco); });
  if (dd.criterios) {
    dd.criterios.bancoNomina = arregla(dd.criterios.bancoNomina);
    dd.criterios.autoAnualBanco = arregla(dd.criterios.autoAnualBanco);
    const bolsas = bancos.flatMap((b) => (b.reservas || []).map((r) => r.id));
    if (dd.criterios.proBolsa && !bolsas.includes(dd.criterios.proBolsa)) dd.criterios.proBolsa = null;
  }
  return dd;
}
function cargarDatos() { try { const s = localStorage.getItem(STORAGE_KEY); return s ? sanearRefs(normalizarIds({ ...VACIO, ...JSON.parse(s) })) : VACIO; } catch (e) { return VACIO; } }
function guardarDatos(dd) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dd)); } catch (e) {} }

function App() {
  const [d, setD] = useState(cargarDatos);
  const [tab, setTab] = useState("datos");
  const [abiertos, setAbiertos] = useState({});
  const [tutorial, setTutorial] = useState(() => { try { return !localStorage.getItem(STORAGE_KEY); } catch (e) { return true; } });
  const [ajustes, setAjustes] = useState(false);
  useEffect(() => { guardarDatos(d); }, [d]);
  const upd = (fn) => setD((prev) => { const c = JSON.parse(JSON.stringify(prev)); fn(c); return c; });
  const tog = (k) => setAbiertos((s) => ({ ...s, [k]: !s[k] }));
  const n = numf;
  const factor = (b) => (b.compartida ? 0.5 : 1);
  const vacio = d.bancos.length === 0 && d.ingresos.length === 0;

  const saldoTotal = d.bancos.reduce((a, b) => a + n(b.saldo) * factor(b), 0);
  const nominaRef = d.ingresos.find((g) => g.nomina)?.importe || d.ingresos[0]?.importe || 0;
  const ingresoMes = d.ingresos.reduce((a, g) => a + n(g.importe), 0);
  // Prorrateo de anuales (se calcula antes porque puede generar un gasto fijo automático)
  const pagadoConcepto = (x) => x.pagos.reduce((a, p) => a + n(p.importe), 0);
  const anualTotal = d.anuales.reduce((a, c) => a + c.conceptos.reduce((s, x) => s + n(x.importe), 0), 0);
  const anualPagado = d.anuales.reduce((a, c) => a + c.conceptos.reduce((s, x) => s + pagadoConcepto(x), 0), 0);
  const anualPendiente = anualTotal - anualPagado;
  const mesesRest = Math.max(1, d.criterios.proMesLimite - d.mes + 1);
  const todasBolsas = d.bancos.flatMap((b) => b.reservas.map((r) => ({ id: r.id, importe: n(r.importe), label: `${b.nombre} · ${r.nombre || "bolsa"}` })));
  const bolsaSel = todasBolsas.find((x) => x.id === d.criterios.proBolsa);
  const reservaBolsa = bolsaSel ? bolsaSel.importe : 0;
  const extraFactor = n(nominaRef) * (n(d.criterios.proExtraPct) / 100);
  const apartarAnual = red(Math.max(0, anualPendiente - reservaBolsa - extraFactor) / mesesRest, n(d.criterios.proRedondeo));

  const cuotaObj = (o) => Math.max(0, (n(o.meta) - n(o.ahorrado))) / Math.max(1, n(o.meses));
  const cuotaObjRed = (o) => red(cuotaObj(o), 50);
  const bancoExiste = (id) => !!id && d.bancos.some((b) => b.id === id);
  // Un objetivo automatizado genera un gasto fijo (la cuota) y una bolsa de reserva (lo ahorrado) en su banco
  const objsAuto = d.objetivos.filter((o) => o.auto && bancoExiste(o.banco));
  const fijosObjetivo = objsAuto.map((o) => ({ id: "obj-" + o.id, objetivoId: o.id, nombre: "Ahorro: " + (o.nombre || "objetivo"), importe: cuotaObjRed(o), banco: o.banco, esObjetivo: true, pagados: Object.keys(o.aportaciones || {}).map(Number) }));
  // La provisión de anuales automatizada también es un gasto fijo
  const bancoAnualOk = bancoExiste(d.criterios.autoAnualBanco);
  const provisionAnual = d.criterios.autoAnual && bancoAnualOk ? [{ id: "anual-auto", nombre: "Provisión gastos anuales", importe: apartarAnual, banco: d.criterios.autoAnualBanco, esAnual: true, pagados: Object.keys(d.provisionPagos || {}).map(Number) }] : [];
  const fijosAuto = [...fijosObjetivo, ...provisionAnual];
  const fijosEfectivos = [...d.fijos, ...fijosAuto];
  const totFijos = fijosEfectivos.reduce((a, g) => a + n(g.importe), 0);
  const totVar = d.variables.reduce((a, g) => a + n(g.importe), 0);
  // Bolsas de reserva: las manuales + una bolsa por cada objetivo automatizado (su ahorrado)
  const bolsasObjetivo = objsAuto.map((o) => ({ id: "bolsaobj-" + o.id, nombre: "Objetivo: " + (o.nombre || ""), importe: n(o.ahorrado), banco: o.banco, esObjetivo: true }));
  const reservasManual = d.bancos.reduce((a, b) => a + b.reservas.reduce((x, r) => x + n(r.importe), 0) * factor(b), 0);
  const reservasObjetivo = bolsasObjetivo.reduce((a, x) => { const b = d.bancos.find((y) => y.id === x.banco); return a + x.importe * (b ? factor(b) : 1); }, 0);
  const reservasTotal = reservasManual + reservasObjetivo;
  // Valor de inversión según el tipo de activo
  const calcInv = (i) => i.soloPos ? { invertido: n(i.valor), valor: n(i.valor) } : TIPOS_UNIDADES.includes(i.tipo) ? { invertido: n(i.cantidad) * n(i.precioMedio), valor: n(i.cantidad) * n(i.precioActual) } : { invertido: n(i.invertido), valor: n(i.valor) };
  const invInvertido = d.inversiones.reduce((a, i) => a + calcInv(i).invertido, 0);
  const invValor = d.inversiones.reduce((a, i) => a + calcInv(i).valor, 0);
  // El fondo de emergencia se calcula a partir de los gastos fijos (que incluyen el ahorro automatizado)
  const fondoEmergencia = n(d.criterios.mesesEmergencia) * totFijos;
  const disponible = saldoTotal - reservasTotal - fondoEmergencia;

  const cuotaObjTotal = red(d.objetivos.reduce((a, o) => a + cuotaObj(o), 0), 50);
  const cuotaObjAutoTotal = objsAuto.reduce((a, o) => a + cuotaObjRed(o), 0);
  const totalPresup = (p) => { const base = (p.articulos || []).reduce((a, ar) => a + n(ar.uds) * n(ar.precio), 0); return base * (1 + n(p.imprevistos) / 100); };

  const gastoCorriente = totFijos + totVar; // totFijos ya incluye el ahorro automatizado (objetivos + provisión anuales)
  const ahorroLibre = ingresoMes - gastoCorriente;
  const inmueblesTotal = (d.inmuebles || []).reduce((a, i) => a + n(i.valor), 0);
  const deudasTotal = (d.deudas || []).reduce((a, x) => a + n(x.importe), 0);
  const patrimonio = saldoTotal + invValor + inmueblesTotal - deudasTotal;
  const hayCompartidas = d.bancos.some((b) => b.compartida);
  const bancoOpts = d.bancos.map((b) => ({ v: b.id, l: b.nombre || "banco" }));
  const bancoOptsN = [{ v: "", l: "—" }, ...bancoOpts];
  const nombreBanco = (id) => d.bancos.find((b) => b.id === id)?.nombre || "—";

  const cargarEjemplo = () => { setD(JSON.parse(JSON.stringify(EJEMPLO))); setTutorial(false); };
  const empezarCero = () => { setTutorial(false); tog("bancos"); };
  const exportar = () => {
    try { const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `economizalo-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { alert("No se pudo exportar."); }
  };
  const importar = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => { try { const obj = JSON.parse(r.result); setD({ ...VACIO, ...obj }); setAjustes(false); setTutorial(false); } catch (err) { alert("El archivo no es una copia válida."); } };
    r.readAsText(file);
  };
  const borrarTodo = () => { if (confirm("¿Borrar todos tus datos y empezar de cero? Exporta antes una copia si quieres conservarlos.")) { setD(VACIO); setAjustes(false); setTutorial(true); } };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", color: T.text, fontFamily: T.ui }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } input::placeholder { color: ${T.dim}; }
        select { -webkit-appearance: none; appearance: none; }`}</style>

      <div style={{ padding: "18px 16px 10px", position: "sticky", top: 0, zIndex: 10, background: `${T.bg}f5`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <span style={{ fontFamily: T.ui, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: T.text }}>economíza</span>
            <span style={{ fontFamily: T.serif, fontSize: 22, color: T.accent }}>lo.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: "4px 6px", boxShadow: T.shadow }}>
              <button onClick={() => upd((c) => { c.mes = (c.mes + 11) % 12; })} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><Icon n="chevL" s={16} c={T.dim} /></button>
              <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, width: 30, textAlign: "center" }}>{MESES[d.mes]}</span>
              <button onClick={() => upd((c) => { c.mes = (c.mes + 1) % 12; })} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><Icon n="chevR" s={16} c={T.dim} /></button>
            </div>
            <button onClick={() => setAjustes(true)} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px", cursor: "pointer", boxShadow: T.shadow, display: "flex" }}><Icon n="cog" s={17} c={T.mid} /></button>
          </div>
        </div>
      </div>

      {ajustes && (
        <div onClick={() => setAjustes(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,30,15,0.35)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", padding: "20px 18px 30px", boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: T.serif, fontSize: 20, color: T.text }}>Ajustes</span>
              <button onClick={() => setAjustes(false)} style={{ background: T.surface2, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="x" s={15} c={T.mid} /></button>
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Copia de seguridad</div>
            <button onClick={exportar} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px 14px", cursor: "pointer", marginBottom: 8 }}>
              <Icon n="descargar" s={19} c={T.accent} /><div style={{ textAlign: "left" }}><div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.text }}>Exportar copia</div><div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim }}>Guarda un archivo con todos tus datos</div></div>
            </button>
            <label style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px 14px", cursor: "pointer", marginBottom: 16 }}>
              <Icon n="subir" s={19} c={T.accent} /><div style={{ textAlign: "left" }}><div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.text }}>Importar copia</div><div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim }}>Restaura desde un archivo exportado</div></div>
              <input type="file" accept="application/json,.json" onChange={importar} style={{ display: "none" }} />
            </label>
            <div style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: 700, color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>App</div>
            <button onClick={() => location.reload()} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px 14px", cursor: "pointer", marginBottom: 8 }}>
              <Icon n="reparto" s={19} c={T.accent} /><div style={{ textAlign: "left" }}><div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.text }}>Buscar actualización</div><div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim }}>Recarga la app a la última versión</div></div>
            </button>
            <button onClick={borrarTodo} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: `${T.neg}0d`, border: `1px solid ${T.neg}33`, borderRadius: 12, padding: "13px 14px", cursor: "pointer" }}>
              <Icon n="x" s={19} c={T.neg} /><div style={{ textAlign: "left" }}><div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.neg }}>Borrar y empezar de cero</div><div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim }}>Elimina todos los datos de este dispositivo</div></div>
            </button>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.dim, textAlign: "center", marginTop: 16 }}>economízalo · {APP_VERSION}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, padding: "12px 16px 14px" }}>
        {[{ id: "datos", ic: "datos", l: "Datos" }, { id: "mes", ic: "mes", l: "Mes" }, { id: "resumen", ic: "resumen", l: "Resumen" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "11px 6px", borderRadius: 12, border: `1px solid ${tab === t.id ? T.accent + "55" : T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: tab === t.id ? `${T.accent}12` : T.panel, fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: tab === t.id ? T.accent : T.dim, boxShadow: tab === t.id ? "none" : T.shadow }}>
            <Icon n={t.ic} s={16} c={tab === t.id ? T.accent : T.dim} /> {t.l}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px 40px" }}>
        {/* TUTORIAL / BIENVENIDA */}
        {tutorial && vacio && (
          <div style={{ background: `${T.accent}0a`, border: `1px solid ${T.accent}33`, borderRadius: 16, padding: "18px", marginBottom: 14 }}>
            <div style={{ fontFamily: T.serif, fontSize: 22, color: T.text, marginBottom: 6 }}>Bienvenido a economízalo.</div>
            <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mid, lineHeight: 1.6, marginBottom: 14 }}>
              La idea es simple: en <b style={{ color: T.accent }}>Datos</b> defines tu dinero una sola vez; en <b style={{ color: T.accent }}>Mes</b> haces el seguimiento (repartes ingresos y marcas gastos); en <b style={{ color: T.accent }}>Resumen</b> lo ves todo calculado.
            </div>
            {[["1", "Añade tus bancos con su saldo real", "banco"], ["2", "Tus ingresos y gastos (fijos, variables, anuales)", "gasto"], ["3", "Tus objetivos de ahorro y criterios", "objetivo"], ["4", "Cada mes: reparte y marca lo que pagas", "mes"]].map(([nquot, txt, ic]) => (
              <div key={nquot} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${T.accent}18`, color: T.accent, fontFamily: T.mono, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{nquot}</div>
                <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mid }}>{txt}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={empezarCero} style={{ flex: 1, background: T.accent, color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Empezar de cero</button>
              <button onClick={cargarEjemplo} style={{ flex: 1, background: "none", color: T.accent, border: `1px solid ${T.accent}55`, borderRadius: 10, padding: "11px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Ver un ejemplo</button>
            </div>
          </div>
        )}

        {tab === "datos" && (
          <>
            {!tutorial && !vacio && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}><button onClick={cargarEjemplo} style={{ background: "none", border: "none", color: T.dim, fontFamily: T.ui, fontSize: 10.5, cursor: "pointer", textDecoration: "underline" }}>recargar ejemplo</button></div>}

            <Bloque icon="banco" titulo="Bancos y saldos" sub="Saldo real, compartidas y bolsas" total={saldoTotal} abierto={!!abiertos.bancos} onTog={() => tog("bancos")} vacio={d.bancos.length === 0}>
              {d.bancos.length === 0 && <Vacio txt="Añade el primer banco con el saldo que tienes ahora mismo. Dentro puedes crear bolsas de reserva (dinero apartado)." />}
              {d.bancos.map((b) => {
                const resB = b.reservas.reduce((a, r) => a + n(r.importe), 0) + bolsasObjetivo.filter((x) => x.banco === b.id).reduce((a, x) => a + n(x.importe), 0);
                return (
                  <div key={b.id} style={{ background: T.surface, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <Campo value={b.nombre} alinear="left" ph="Nombre del banco" onChange={(v) => upd((c) => { c.bancos.find((x) => x.id === b.id).nombre = v; })} />
                      <div style={{ flex: 1 }} />
                      <Campo value={b.saldo} sufijo="€" ancho={110} onChange={(v) => upd((c) => { c.bancos.find((x) => x.id === b.id).saldo = v; })} />
                      <Del onClick={() => upd((c) => { c.bancos = c.bancos.filter((x) => x.id !== b.id); })} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <button onClick={() => upd((c) => { const x = c.bancos.find((y) => y.id === b.id); x.compartida = !x.compartida; })} style={{ display: "flex", alignItems: "center", gap: 6, background: b.compartida ? `${T.accent}12` : "none", border: `1px solid ${b.compartida ? T.accent + "55" : T.border}`, borderRadius: 8, padding: "5px 9px", cursor: "pointer", color: b.compartida ? T.accent : T.dim, fontFamily: T.ui, fontSize: 10.5, fontWeight: 600 }}>
                        <Icon n="compartida" s={13} c={b.compartida ? T.accent : T.dim} /> Compartida (50%)
                      </button>
                      {b.compartida && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>tu parte {eur(n(b.saldo) * 0.5)}</span>}
                    </div>
                    <div style={{ paddingLeft: 10, borderLeft: `2px solid ${T.border}` }}>
                      <div style={{ fontFamily: T.ui, fontSize: 9.5, color: T.dim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}><Icon n="reserva" s={12} c={T.dim} /> Bolsas de reserva</div>
                      {b.reservas.map((r) => (
                        <div key={r.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                          <Campo value={r.nombre} alinear="left" ph="p. ej. Emergencia" onChange={(v) => upd((c) => { c.bancos.find((x) => x.id === b.id).reservas.find((y) => y.id === r.id).nombre = v; })} />
                          <div style={{ flex: 1 }} />
                          <Campo value={r.importe} sufijo="€" ancho={90} onChange={(v) => upd((c) => { c.bancos.find((x) => x.id === b.id).reservas.find((y) => y.id === r.id).importe = v; })} />
                          <Del onClick={() => upd((c) => { const bb = c.bancos.find((x) => x.id === b.id); bb.reservas = bb.reservas.filter((y) => y.id !== r.id); })} />
                        </div>
                      ))}
                      <button onClick={() => upd((c) => { c.bancos.find((x) => x.id === b.id).reservas.push({ id: uid(), nombre: "", importe: 0 }); })} style={{ background: "none", border: "none", color: T.accent, fontFamily: T.ui, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}>+ bolsa</button>
                      {bolsasObjetivo.filter((x) => x.banco === b.id).map((x) => (
                        <div key={x.id} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, padding: "7px 9px", background: `${T.accentSoft}0f`, borderRadius: 8, border: `1px dashed ${T.accentSoft}55` }}>
                          <Icon n="objetivo" s={13} c={T.accentSoft} />
                          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 11.5, color: T.mid }}>{x.nombre}</span>
                          <span style={{ fontFamily: T.ui, fontSize: 8.5, fontWeight: 700, color: T.accentSoft, background: `${T.accentSoft}1e`, borderRadius: 4, padding: "2px 5px", textTransform: "uppercase" }}>auto</span>
                          <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.mid }}>{eur(x.importe)}</span>
                        </div>
                      ))}
                      <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.dim, marginTop: 4 }}>Disponible: <span style={{ color: T.accent }}>{eur(n(b.saldo) - resB)}</span></div>
                    </div>
                  </div>
                );
              })}
              <AddBtn label="Añadir banco" onClick={() => upd((c) => c.bancos.push({ id: uid(), nombre: "", saldo: 0, compartida: false, reservas: [] }))} />
            </Bloque>

            <Bloque icon="inversion" titulo="Inversiones" sub="Por tipo de activo" total={invValor} abierto={!!abiertos.inv} onTog={() => tog("inv")} vacio={d.inversiones.length === 0}>
              {d.inversiones.length === 0 && <Vacio txt="Añade tus activos. Según el tipo (ETF, acción, cripto → por participaciones; fondo, bono → por importe) se introducen de una forma u otra." />}
              {d.inversiones.map((i) => {
                const tipo = TIPOS_ACTIVO[i.tipo] || TIPOS_ACTIVO.etf; const porUds = TIPOS_UNIDADES.includes(i.tipo);
                const pos = calcInv(i); const plus = pos.valor - pos.invertido; const pct = pos.invertido > 0 ? (plus / pos.invertido) * 100 : 0;
                return (
                  <div key={i.id} style={{ background: T.surface, borderRadius: 12, padding: 12, marginBottom: 8, border: `1px solid ${T.line}`, borderLeft: `3px solid ${tipo.color}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <Campo value={i.nombre} alinear="left" ph="Nombre del activo" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).nombre = v; })} />
                      <Del onClick={() => upd((c) => { c.inversiones = c.inversiones.filter((x) => x.id !== i.id); })} />
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 9 }}>
                      {Object.entries(TIPOS_ACTIVO).map(([id, t]) => (
                        <button key={id} onClick={() => upd((c) => { c.inversiones.find((x) => x.id === i.id).tipo = id; })} style={{ padding: "4px 9px", borderRadius: 7, border: `1px solid ${i.tipo === id ? t.color : T.border}`, cursor: "pointer", fontFamily: T.ui, fontSize: 10.5, fontWeight: 600, background: i.tipo === id ? `${t.color}18` : "transparent", color: i.tipo === id ? t.color : T.dim }}>{t.icono} {t.label}</button>
                      ))}
                    </div>
                    {i.soloPos ? (
                      <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Posición actual</div><Campo value={i.valor} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).valor = v; })} /></div>
                    ) : porUds ? (
                      <>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 62 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Ticker</div><Campo value={i.ticker || ""} alinear="left" ph="—" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).ticker = v.toUpperCase(); })} /></div>
                          <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Cantidad</div><Campo value={i.cantidad} ancho="100%" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).cantidad = v; })} /></div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Precio medio</div><Campo value={i.precioMedio} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).precioMedio = v; })} /></div>
                          <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Precio actual</div><Campo value={i.precioActual} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).precioActual = v; })} /></div>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Invertido</div><Campo value={i.invertido} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).invertido = v; })} /></div>
                        <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Valor actual</div><Campo value={i.valor} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.inversiones.find((x) => x.id === i.id).valor = v; })} /></div>
                      </div>
                    )}
                    {(!porUds || i.soloPos) && (
                      <button onClick={() => upd((c) => { const x = c.inversiones.find((y) => y.id === i.id); x.soloPos = !x.soloPos; if (x.soloPos) x.invertido = x.valor; })} style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 9, background: i.soloPos ? `${T.accent}12` : "none", border: `1px solid ${i.soloPos ? T.accent + "44" : T.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", width: "100%" }}>
                        <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${i.soloPos ? T.accent : T.border}`, background: i.soloPos ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i.soloPos && <Icon n="check" s={10} c="#fff" sw={3} />}</div>
                        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: i.soloPos ? T.accent : T.mid, textAlign: "left", lineHeight: 1.35 }}>Solo posición actual (sin seguimiento de rentabilidad)</span>
                      </button>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 9, paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>valor {eur(pos.valor)}</span>
                      {i.soloPos
                        ? <span style={{ fontFamily: T.ui, fontSize: 10, color: T.dim }}>solo saldo</span>
                        : <span style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, color: plus >= 0 ? T.accent : T.neg }}>{plus >= 0 ? "+" : ""}{eur(plus)} · {plus >= 0 ? "+" : ""}{pct.toFixed(1)}%</span>}
                    </div>
                  </div>
                );
              })}
              <AddBtn label="Añadir inversión" onClick={() => upd((c) => c.inversiones.push({ id: uid(), nombre: "", tipo: "etf", ticker: "", cantidad: 0, precioMedio: 0, precioActual: 0, invertido: 0, valor: 0, soloPos: false }))} />
            </Bloque>

            <Bloque icon="ingreso" titulo="Ingresos base" sub="Nóminas y otros ingresos estables" total={ingresoMes} abierto={!!abiertos.ing} onTog={() => tog("ing")} vacio={d.ingresos.length === 0}>
              {d.ingresos.length === 0 && <Vacio txt="Añade tus ingresos mensuales. Marca con N la nómina de referencia (para el margen de seguridad)." />}
              {d.ingresos.map((g) => (
                <div key={g.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <button onClick={() => upd((c) => { c.ingresos.forEach((x) => { if (x.id === g.id) x.nomina = !x.nomina; }); })} style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, border: "none", cursor: "pointer", background: g.nomina ? `${T.accent}18` : T.surface2, color: g.nomina ? T.accent : T.dim, fontFamily: T.ui, fontSize: 10, fontWeight: 700 }}>N</button>
                  <Campo value={g.nombre} alinear="left" ph="Concepto" onChange={(v) => upd((c) => { c.ingresos.find((x) => x.id === g.id).nombre = v; })} />
                  <div style={{ flex: 1 }} />
                  <Campo value={g.importe} sufijo="€" ancho={100} onChange={(v) => upd((c) => { c.ingresos.find((x) => x.id === g.id).importe = v; })} />
                  <Del onClick={() => upd((c) => { c.ingresos = c.ingresos.filter((x) => x.id !== g.id); })} />
                </div>
              ))}
              <AddBtn label="Añadir ingreso" onClick={() => upd((c) => c.ingresos.push({ id: uid(), nombre: "", importe: 0, nomina: d.ingresos.length === 0 }))} />
            </Bloque>

            <Bloque icon="objetivo" titulo="Objetivos de ahorro" sub={d.objetivos.length ? `Cuota total ${eur(cuotaObjTotal)}/mes` : "Metas con cuota mensual"} total={d.objetivos.reduce((a, o) => a + n(o.meta), 0)} abierto={!!abiertos.obj} onTog={() => tog("obj")} vacio={d.objetivos.length === 0}>
              {d.objetivos.length === 0 && <Vacio txt="Define metas (coche, viaje…). La app calcula la cuota mensual para llegar a tiempo." />}
              {d.objetivos.map((o) => {
                const rest = Math.max(0, n(o.meta) - n(o.ahorrado)); const pct = n(o.meta) > 0 ? Math.min(100, (n(o.ahorrado) / n(o.meta)) * 100) : 0;
                return (
                  <div key={o.id} style={{ background: T.surface, borderRadius: 12, padding: 12, marginBottom: 8, border: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <Campo value={o.nombre} alinear="left" ph="Nombre del objetivo" onChange={(v) => upd((c) => { c.objetivos.find((x) => x.id === o.id).nombre = v; })} />
                      <Del onClick={() => upd((c) => { c.objetivos = c.objetivos.filter((x) => x.id !== o.id); })} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Meta</div><Campo value={o.meta} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.objetivos.find((x) => x.id === o.id).meta = v; })} /></div>
                      <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Ahorrado</div><Campo value={o.ahorrado} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.objetivos.find((x) => x.id === o.id).ahorrado = v; })} /></div>
                      <div style={{ width: 60 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Meses</div><Campo value={o.meses} ancho="100%" onChange={(v) => upd((c) => { c.objetivos.find((x) => x.id === o.id).meses = v; })} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: T.ui, fontSize: 10, color: T.dim }}>Ahorra en</span>
                      <Sel value={bancoExiste(o.banco) ? o.banco : ""} onChange={(v) => upd((c) => { c.objetivos.find((x) => x.id === o.id).banco = v || null; })} opciones={bancoOptsN} ancho={150} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "8px 10px", background: o.auto ? `${T.accent}0d` : T.surface2, borderRadius: 9, border: `1px solid ${o.auto ? T.accent + "33" : T.line}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.ui, fontSize: 12, color: T.text, fontWeight: 600 }}>Automatizar</div>
                        <div style={{ fontFamily: T.ui, fontSize: 10, color: T.dim, lineHeight: 1.4 }}>{o.auto && o.banco ? `Crea una bolsa en ${nombreBanco(o.banco)} y un gasto fijo de ${eur(cuotaObjRed(o))}/mes` : "Genera bolsa de reserva + gasto fijo mensual"}</div>
                      </div>
                      <Toggle on={!!o.auto} onClick={() => upd((c) => { const x = c.objetivos.find((y) => y.id === o.id); x.auto = !x.auto; if (x.auto && !c.bancos.some((b) => b.id === x.banco)) x.banco = c.bancos[0]?.id || null; })} />
                    </div>
                    {o.auto && !bancoExiste(o.banco) && (
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, padding: "7px 10px", background: `${T.warn}10`, borderRadius: 8, border: `1px solid ${T.warn}44` }}>
                        <Icon n="info" s={14} c={T.warn} />
                        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.warn, lineHeight: 1.4 }}>Este objetivo no tiene un banco válido. Elige uno en "Ahorra en" para que se creen la bolsa y el gasto fijo.</span>
                      </div>
                    )}
                    {o.auto && bancoExiste(o.banco) && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 8, padding: "7px 10px", background: `${T.accent}0a`, borderRadius: 8, border: `1px solid ${T.accent}33` }}>
                        <Icon n="check" s={14} c={T.accent} />
                        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mid, lineHeight: 1.45 }}>Activo: bolsa de <b style={{ color: T.accent }}>{eur(n(o.ahorrado))}</b> dentro de {nombreBanco(o.banco)} (bloque Bancos) y gasto fijo de <b style={{ color: T.accent }}>{eur(cuotaObjRed(o))}/mes</b> en Gastos mensuales → Ahorro automático.</span>
                      </div>
                    )}
                    <div style={{ height: 5, background: T.surface2, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}><div style={{ width: pct + "%", height: "100%", background: T.accent, borderRadius: 3 }} /></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.dim }}>faltan {eur(rest)}</span><span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, fontWeight: 600 }}>cuota {eur(cuotaObj(o))}/mes</span></div>
                  </div>
                );
              })}
              <AddBtn label="Añadir objetivo" onClick={() => upd((c) => c.objetivos.push({ id: uid(), nombre: "", meta: 0, ahorrado: 0, meses: 12, banco: d.bancos[0]?.id || null, auto: false }))} />
            </Bloque>

            <Bloque icon="gasto" titulo="Gastos mensuales" sub="Fijos y prescindibles · con banco de pago" total={totFijos + totVar} abierto={!!abiertos.gm} onTog={() => tog("gm")} vacio={d.fijos.length === 0 && d.variables.length === 0 && fijosAuto.length === 0}>
              {d.fijos.length === 0 && d.variables.length === 0 && <Vacio txt="Añade tus gastos recurrentes e indica de qué banco sale cada uno (para el reparto del mes)." />}
              <SubLista d={d} upd={upd} campo="fijos" label="Fijos mensuales" total={d.fijos.reduce((a, g) => a + n(g.importe), 0)} bancoOpts={bancoOptsN} />
              {fijosAuto.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 700, color: T.mid, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ahorro automático</span>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.dim }}>{eur(fijosAuto.reduce((a, g) => a + n(g.importe), 0))}</span>
                  </div>
                  {fijosAuto.map((g) => (
                    <div key={g.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, padding: "8px 10px", background: `${T.accentSoft}0f`, borderRadius: 9, border: `1px dashed ${T.accentSoft}55` }}>
                      <Icon n={g.esAnual ? "anual" : "objetivo"} s={14} c={T.accentSoft} />
                      <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.mid }}>{g.nombre}</span>
                      <span style={{ fontFamily: T.ui, fontSize: 8.5, fontWeight: 700, color: T.accentSoft, background: `${T.accentSoft}1e`, borderRadius: 4, padding: "2px 5px", textTransform: "uppercase" }}>auto</span>
                      <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.dim, background: T.surface2, borderRadius: 5, padding: "2px 6px" }}>{nombreBanco(g.banco)}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 600, color: T.mid }}>{eur(g.importe)}</span>
                    </div>
                  ))}
                  <div style={{ fontFamily: T.ui, fontSize: 10, color: T.dim, marginTop: 2 }}>Generados por los objetivos automatizados y la provisión de anuales. Se controlan desde su origen.</div>
                </div>
              )}
              <SubLista d={d} upd={upd} campo="variables" label="Prescindibles" total={totVar} bancoOpts={bancoOptsN} />
            </Bloque>

            <Bloque icon="anual" titulo="Gastos anuales" sub={d.anuales.length ? `Pendiente ${eur(anualPendiente)}` : "Por bloques, con seguimiento de pago"} total={anualTotal} sufTotal="/año" abierto={!!abiertos.ga} onTog={() => tog("ga")} vacio={d.anuales.length === 0}>
              {d.anuales.length === 0 && <Vacio txt="Agrupa los gastos anuales por bloques (Coche, Hogar…). Cada mes marcarás lo que vayas pagando." />}
              {d.anuales.map((cat) => {
                const tot = cat.conceptos.reduce((a, x) => a + n(x.importe), 0); const pag = cat.conceptos.reduce((a, x) => a + pagadoConcepto(x), 0);
                return (
                  <div key={cat.id} style={{ background: T.surface, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                      <Campo value={cat.nombre} alinear="left" ph="Nombre del bloque" onChange={(v) => upd((c) => { c.anuales.find((x) => x.id === cat.id).nombre = v; })} />
                      <div style={{ flex: 1 }} />
                      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{eur(pag)}/{eur(tot)}</span>
                      <Del onClick={() => upd((c) => { c.anuales = c.anuales.filter((x) => x.id !== cat.id); })} />
                    </div>
                    {cat.conceptos.map((x) => {
                      const pg = pagadoConcepto(x); const pct = n(x.importe) > 0 ? Math.min(100, (pg / n(x.importe)) * 100) : 0; const pagadoEsteMes = x.pagos.some((p) => p.mes === d.mes);
                      return (
                        <div key={x.id} style={{ marginBottom: 9, paddingLeft: 10, borderLeft: `2px solid ${T.border}` }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                            <Campo value={x.nombre} alinear="left" ph="Concepto" onChange={(v) => upd((c) => { c.anuales.find((y) => y.id === cat.id).conceptos.find((z) => z.id === x.id).nombre = v; })} />
                            <div style={{ flex: 1 }} />
                            <Campo value={x.importe} sufijo="€" ancho={88} onChange={(v) => upd((c) => { c.anuales.find((y) => y.id === cat.id).conceptos.find((z) => z.id === x.id).importe = v; })} />
                            <Del s={26} onClick={() => upd((c) => { const cc = c.anuales.find((y) => y.id === cat.id); cc.conceptos = cc.conceptos.filter((z) => z.id !== x.id); })} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: T.surface2, borderRadius: 3, overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: pct >= 100 ? T.accent : T.warn, borderRadius: 3 }} /></div>
                            <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.dim, width: 66, textAlign: "right" }}>{eur(pg)}/{eur(x.importe)}</span>
                            <button onClick={() => upd((c) => { const z = c.anuales.find((y) => y.id === cat.id).conceptos.find((w) => w.id === x.id); if (pagadoEsteMes) { z.pagos = z.pagos.filter((p) => p.mes !== d.mes); } else { const pend = n(z.importe) - z.pagos.reduce((a, p) => a + n(p.importe), 0); z.pagos.push({ id: uid(), mes: d.mes, importe: Math.max(0, pend) }); } })} style={{ fontFamily: T.ui, fontSize: 10, fontWeight: 700, border: "none", borderRadius: 7, padding: "5px 9px", cursor: "pointer", background: pagadoEsteMes ? `${T.accent}18` : T.surface2, color: pagadoEsteMes ? T.accent : T.mid }}>{pagadoEsteMes ? "✓ " + MESES[d.mes] : "Pagar"}</button>
                          </div>
                          {x.pagos.length > 0 && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.dim, marginTop: 4 }}>{x.pagos.map((p) => MESES[p.mes] + " " + eur(p.importe)).join(" · ")}</div>}
                        </div>
                      );
                    })}
                    <button onClick={() => upd((c) => { c.anuales.find((y) => y.id === cat.id).conceptos.push({ id: uid(), nombre: "", importe: 0, pagos: [] }); })} style={{ background: "none", border: "none", color: T.accent, fontFamily: T.ui, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 0", marginLeft: 10 }}>+ concepto</button>
                  </div>
                );
              })}
              <AddBtn label="Añadir bloque anual" onClick={() => upd((c) => c.anuales.push({ id: uid(), nombre: "", conceptos: [] }))} />
            </Bloque>

            <Bloque icon="casa" titulo="Patrimonio" sub={(d.inmuebles || []).length || (d.deudas || []).length ? `Inmuebles ${eur(inmueblesTotal)} · deudas ${eur(deudasTotal)}` : "Inmuebles y deudas"} total={inmueblesTotal - deudasTotal} abierto={!!abiertos.pat} onTog={() => tog("pat")} vacio={!(d.inmuebles || []).length && !(d.deudas || []).length}>
              {!(d.inmuebles || []).length && !(d.deudas || []).length && <Vacio txt="Añade el valor de tus inmuebles (suman al patrimonio) y lo que debes (resta)." />}
              <div style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 700, color: T.mid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "2px 0 8px", display: "flex", alignItems: "center", gap: 6 }}><Icon n="casa" s={13} c={T.accent} /> Inmuebles</div>
              {(d.inmuebles || []).map((i) => (
                <div key={i.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Campo value={i.nombre} alinear="left" ph="p. ej. Vivienda" onChange={(v) => upd((c) => { c.inmuebles.find((x) => x.id === i.id).nombre = v; })} />
                  <div style={{ flex: 1 }} />
                  <Campo value={i.valor} sufijo="€" ancho={110} onChange={(v) => upd((c) => { c.inmuebles.find((x) => x.id === i.id).valor = v; })} />
                  <Del onClick={() => upd((c) => { c.inmuebles = c.inmuebles.filter((x) => x.id !== i.id); })} />
                </div>
              ))}
              <button onClick={() => upd((c) => { c.inmuebles = c.inmuebles || []; c.inmuebles.push({ id: uid(), nombre: "", valor: 0 }); })} style={{ background: "none", border: "none", color: T.accent, fontFamily: T.ui, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 0", marginBottom: 12 }}>+ inmueble</button>
              <div style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 700, color: T.mid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "2px 0 8px", display: "flex", alignItems: "center", gap: 6 }}><Icon n="deuda" s={13} c={T.neg} /> Deudas</div>
              {(d.deudas || []).map((x) => (
                <div key={x.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Campo value={x.nombre} alinear="left" ph="p. ej. Hipoteca" onChange={(v) => upd((c) => { c.deudas.find((y) => y.id === x.id).nombre = v; })} />
                  <div style={{ flex: 1 }} />
                  <Campo value={x.importe} sufijo="€" ancho={110} onChange={(v) => upd((c) => { c.deudas.find((y) => y.id === x.id).importe = v; })} />
                  <Del onClick={() => upd((c) => { c.deudas = c.deudas.filter((y) => y.id !== x.id); })} />
                </div>
              ))}
              <button onClick={() => upd((c) => { c.deudas = c.deudas || []; c.deudas.push({ id: uid(), nombre: "", importe: 0 }); })} style={{ background: "none", border: "none", color: T.accent, fontFamily: T.ui, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}>+ deuda</button>
            </Bloque>

            <Bloque icon="carro" titulo="Presupuestos" sub={(d.presupuestos || []).length ? "Previsión de compras · incorpora a anuales" : "Prevé compras y pásalas a anuales"} abierto={!!abiertos.pre} onTog={() => tog("pre")} vacio={!(d.presupuestos || []).length}>
              {!(d.presupuestos || []).length && <Vacio txt="Crea un presupuesto (una compra prevista) con sus artículos. Al incorporarlo se crea un gasto anual redondeado." />}
              {(d.presupuestos || []).map((p) => {
                const tot = totalPresup(p); const incorp = red(tot, n(d.criterios.presRedondeo));
                return (
                  <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                      <Campo value={p.nombre} alinear="left" ph="Nombre (p. ej. Terraza)" onChange={(v) => upd((c) => { c.presupuestos.find((x) => x.id === p.id).nombre = v; })} />
                      <div style={{ flex: 1 }} />
                      <Del onClick={() => upd((c) => { c.presupuestos = c.presupuestos.filter((x) => x.id !== p.id); })} />
                    </div>
                    {p.articulos.map((ar) => (
                      <div key={ar.id} style={{ background: T.surface2, borderRadius: 9, padding: 9, marginBottom: 7 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
                          <Campo value={ar.nombre} alinear="left" ph="Artículo" onChange={(v) => upd((c) => { c.presupuestos.find((x) => x.id === p.id).articulos.find((y) => y.id === ar.id).nombre = v; })} />
                          <Del s={26} onClick={() => upd((c) => { const pp = c.presupuestos.find((x) => x.id === p.id); pp.articulos = pp.articulos.filter((y) => y.id !== ar.id); })} />
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                          <div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Uds</div><Campo value={ar.uds} ancho="100%" onChange={(v) => upd((c) => { c.presupuestos.find((x) => x.id === p.id).articulos.find((y) => y.id === ar.id).uds = v; })} /></div>
                          <span style={{ color: T.dim, paddingBottom: 7 }}>×</span>
                          <div style={{ flex: 1.6 }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Precio/ud</div><Campo value={ar.precio} sufijo="€" ancho="100%" onChange={(v) => upd((c) => { c.presupuestos.find((x) => x.id === p.id).articulos.find((y) => y.id === ar.id).precio = v; })} /></div>
                          <span style={{ color: T.dim, paddingBottom: 7 }}>=</span>
                          <div style={{ textAlign: "right" }}><div style={{ fontFamily: T.ui, fontSize: 9, color: T.dim, textTransform: "uppercase", marginBottom: 3 }}>Total</div><div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.text, paddingBottom: 5 }}>{eur(n(ar.uds) * n(ar.precio))}</div></div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => upd((c) => { c.presupuestos.find((x) => x.id === p.id).articulos.push({ id: uid(), nombre: "", uds: 1, precio: 0 }); })} style={{ background: "none", border: "none", color: T.accent, fontFamily: T.ui, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}>+ artículo</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${T.line}`, marginTop: 6 }}>
                      <span style={{ fontFamily: T.ui, fontSize: 11, color: T.dim, flex: 1 }}>Imprevistos</span>
                      <Campo value={p.imprevistos} sufijo="%" ancho={70} onChange={(v) => upd((c) => { c.presupuestos.find((x) => x.id === p.id).imprevistos = v; })} />
                      <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.text }}>{eur(tot)}</span>
                    </div>
                    <button onClick={() => upd((c) => { const bloque = { id: uid(), nombre: p.nombre || "Compra", conceptos: [{ id: uid(), nombre: p.nombre || "Compra", importe: incorp, pagos: [] }] }; c.anuales.push(bloque); c.presupuestos.find((x) => x.id === p.id).incorporado = true; })} style={{ width: "100%", marginTop: 4, background: `${T.accent}12`, border: `1px solid ${T.accent}44`, borderRadius: 9, padding: "9px", cursor: "pointer", color: T.accent, fontFamily: T.ui, fontSize: 12, fontWeight: 700 }}>
                      {p.incorporado ? "Volver a incorporar" : "Incorporar a anuales"} ({eur(incorp)})
                    </button>
                  </div>
                );
              })}
              <AddBtn label="Añadir presupuesto" onClick={() => upd((c) => { c.presupuestos = c.presupuestos || []; c.presupuestos.push({ id: uid(), nombre: "", articulos: [{ id: uid(), nombre: "", uds: 1, precio: 0 }], imprevistos: n(d.criterios.presImprevistos), incorporado: false }); })} />
            </Bloque>

            <Bloque icon="criterios" titulo="Criterios" sub="Las reglas de cálculo" abierto={!!abiertos.crit} onTog={() => tog("crit")}>
              <CritFila titulo="Nómina entra en" desc="Banco donde cobras (para el reparto)"><Sel value={d.criterios.bancoNomina} onChange={(v) => upd((c) => { c.criterios.bancoNomina = v || null; })} opciones={bancoOptsN} /></CritFila>
              <CritFila titulo="Fondo de emergencia" desc="Meses de gastos fijos que reservas"><Campo value={d.criterios.mesesEmergencia} sufijo="meses" ancho={110} onChange={(v) => upd((c) => { c.criterios.mesesEmergencia = numf(v); })} /></CritFila>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.dim, margin: "2px 0 16px" }}>{d.criterios.mesesEmergencia} × {eur(totFijos)} fijos = <span style={{ color: T.warn }}>{eur(fondoEmergencia)}</span></div>

              <Titulo icon="reparto" t="Prorrateo de anuales" />
              <CritFila titulo="Aportar hasta" desc="Último mes en que apartas"><Sel value={d.criterios.proMesLimite} onChange={(v) => upd((c) => { c.criterios.proMesLimite = parseInt(v); })} opciones={MESES.map((m, i) => ({ v: i, l: m }))} /></CritFila>
              <CritFila titulo="Redondeo" desc="Redondea la aportación"><Campo value={d.criterios.proRedondeo} sufijo="€" ancho={90} onChange={(v) => upd((c) => { c.criterios.proRedondeo = numf(v); })} /></CritFila>
              <CritFila titulo="Bolsa de reserva" desc="Su saldo ya apartado se descuenta"><Sel value={d.criterios.proBolsa || ""} onChange={(v) => upd((c) => { c.criterios.proBolsa = v || null; })} ancho={190} opciones={[{ v: "", l: "Ninguna" }, ...todasBolsas.map((x) => ({ v: x.id, l: `${x.label} (${eur(x.importe)})` }))]} /></CritFila>
              <CritFila titulo="% de la paga extra" desc="Parte del extra que ya irá a anuales"><Campo value={d.criterios.proExtraPct} sufijo="%" ancho={80} onChange={(v) => upd((c) => { c.criterios.proExtraPct = numf(v); })} /></CritFila>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, margin: "2px 0 16px", lineHeight: 1.5 }}>({eur(anualPendiente)} − {eur(reservaBolsa)} bolsa{n(d.criterios.proExtraPct) > 0 ? ` − ${eur(extraFactor)} extra` : ""}) ÷ {mesesRest} → <span style={{ color: T.accent }}>{eur(apartarAnual)}/mes</span></div>

              <Titulo icon="auto" t="Ahorro automático" />
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}><div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 13, color: T.text, fontWeight: 600 }}>Apartar anuales solo</div><div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim }}>Crea un gasto fijo mensual con la provisión</div></div><Toggle on={d.criterios.autoAnual} onClick={() => upd((c) => { c.criterios.autoAnual = !c.criterios.autoAnual; })} /></div>
              {d.criterios.autoAnual && <CritFila titulo="→ a qué banco" desc={`${eur(apartarAnual)}/mes`}><Sel value={bancoAnualOk ? d.criterios.autoAnualBanco : ""} onChange={(v) => upd((c) => { c.criterios.autoAnualBanco = v || null; })} opciones={bancoOptsN} /></CritFila>}
              {d.criterios.autoAnual && !bancoAnualOk && <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.warn, padding: "2px 0 6px" }}>Elige a qué banco va la provisión para que se cree el gasto fijo.</div>}
              <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim, padding: "4px 0 2px", lineHeight: 1.5 }}>Los objetivos se automatizan uno a uno desde su ficha (crean su bolsa y su gasto fijo).</div>
              <div style={{ height: 10 }} />
              <Titulo icon="carro" t="Presupuestos" />
              <CritFila titulo="Imprevistos por defecto" desc="Margen de un presupuesto nuevo"><Campo value={d.criterios.presImprevistos} sufijo="%" ancho={80} onChange={(v) => upd((c) => { c.criterios.presImprevistos = numf(v); })} /></CritFila>
              <CritFila titulo="Redondeo al incorporar" desc="Al pasar a anuales"><Campo value={d.criterios.presRedondeo} sufijo="€" ancho={90} onChange={(v) => upd((c) => { c.criterios.presRedondeo = numf(v); })} /></CritFila>
            </Bloque>
          </>
        )}

        {tab === "mes" && <VistaMes {...{ d, upd, n, ingresoMes, totFijos, totVar, apartarAnual, ahorroLibre, fijosEfectivos, cuotaObjAutoTotal, nombreBanco, MESES }} />}

        {tab === "resumen" && <Resumen {...{ patrimonio, saldoTotal, reservasTotal, disponible, fondoEmergencia, mesesEmergencia: d.criterios.mesesEmergencia, totFijos, invValor, invInvertido, inmueblesTotal, deudasTotal, ingresoMes, gastoCorriente, apartarAnual, cuotaObjTotal, cuotaObjAutoTotal, ahorroLibre, anualPendiente, mesesRest, mesLabel: MESES[d.mes], reservaBolsa, extraFactor, bolsaLabel: bolsaSel ? bolsaSel.label : null, hayCompartidas, vacio }} />}
      </div>
    </div>
  );
}

function VistaMes({ d, upd, n, ingresoMes, totFijos, totVar, apartarAnual, fijosEfectivos, cuotaObjAutoTotal, nombreBanco }) {
  if (d.bancos.length === 0) return <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.dim, textAlign: "center", padding: "40px 20px", lineHeight: 1.6 }}>Primero añade tus bancos, ingresos y gastos en <b style={{ color: T.accent }}>Datos</b>.<br />Aquí harás el seguimiento de cada mes.</div>;
  const cerrado = d.cerrados.includes(d.mes);
  const mesKey = String(d.mes);
  const puntualesMes = (d.puntuales && d.puntuales[mesKey]) || [];
  const totalPuntuales = puntualesMes.reduce((a, g) => a + n(g.importe), 0);
  const extraMes = (d.ingresosMes && d.ingresosMes[mesKey]) || [];
  const totalExtraMes = extraMes.reduce((a, g) => a + n(g.importe), 0);
  const ingresoTotalMes = ingresoMes + totalExtraMes;
  // Reparto por banco: cada banco necesita = sus gastos fijos (incluidas cuotas de objetivos automatizados) + prescindibles + prorrateo si le toca
  const necesita = (bid) => {
    const gf = fijosEfectivos.filter((f) => f.banco === bid).reduce((a, f) => a + n(f.importe), 0);
    const gv = d.variables.filter((v) => v.banco === bid).reduce((a, v) => a + n(v.importe), 0);
    return { gf, gv, total: gf + gv };
  };
  const bancoNom = d.criterios.bancoNomina;
  const totalReparto = d.bancos.reduce((a, b) => a + necesita(b.id).total, 0);
  // Gastos del mes (fijos efectivos + prescindibles) con estado pagado
  const gastosMes = [...fijosEfectivos.map((g) => ({ ...g, tipo: "F" })), ...d.variables.map((g) => ({ ...g, tipo: "V" }))];
  const pagados = gastosMes.filter((g) => (g.pagados || []).includes(d.mes));
  const totalGastosMes = gastosMes.reduce((a, g) => a + n(g.importe), 0);
  const pagadoMes = pagados.reduce((a, g) => a + n(g.importe), 0);
  const margen = ingresoTotalMes - totalGastosMes - totalPuntuales;
  const togglePago = (id, tipo) => upd((c) => {
    if (id === "anual-auto") {
      c.provisionPagos = c.provisionPagos || {};
      if (c.provisionPagos[c.mes] != null) { delete c.provisionPagos[c.mes]; } else { c.provisionPagos[c.mes] = apartarAnual; }
      return;
    }
    if (String(id).startsWith("obj-")) {
      const oid = String(id).slice(4);
      const o = c.objetivos.find((y) => y.id === oid);
      if (!o) return;
      o.aportaciones = o.aportaciones || {};
      if (o.aportaciones[c.mes] != null) {
        o.ahorrado = numf(o.ahorrado) - numf(o.aportaciones[c.mes]);
        delete o.aportaciones[c.mes];
      } else {
        const cuota = red(Math.max(0, numf(o.meta) - numf(o.ahorrado)) / Math.max(1, numf(o.meses)), 50);
        o.aportaciones[c.mes] = cuota;
        o.ahorrado = numf(o.ahorrado) + cuota;
      }
      return;
    }
    const arr = tipo === "F" ? c.fijos : c.variables; const g = arr.find((x) => x.id === id); if (!g) return; g.pagados = g.pagados || []; g.pagados = g.pagados.includes(c.mes) ? g.pagados.filter((m) => m !== c.mes) : [...g.pagados, c.mes];
  });
  const cerrarMes = () => upd((c) => { c.cerrados = c.cerrados.includes(c.mes) ? c.cerrados.filter((m) => m !== c.mes) : [...c.cerrados, c.mes]; });

  return (
    <>
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.dim, lineHeight: 1.5, margin: "0 0 14px" }}>Seguimiento de <b style={{ color: T.accent }}>{MESES[d.mes]}</b>: reparte el ingreso, marca lo que pagas y cierra el mes.</p>

      {/* Reparto por banco */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: T.shadow }}>
        <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}><Icon n="transfer" s={16} c={T.accent} /> Reparto por banco</div>
        <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim, marginBottom: 12 }}>Cuánto necesita cada banco este mes para cubrir sus gastos y ahorro.</div>
        {d.bancos.map((b) => {
          const ne = necesita(b.id); const esNom = b.id === bancoNom;
          const retiene = esNom ? ingresoTotalMes - (totalReparto - ne.total) : 0;
          return (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.line}` }}>
              <Icon n="banco" s={16} c={esNom ? T.accent : T.dim} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.text }}>{b.nombre || "banco"} {esNom && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.accent }}>· entra la nómina</span>}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.dim }}>{[ne.gf > 0 && `fijos ${eur(ne.gf)}`, ne.gv > 0 && `prescind ${eur(ne.gv)}`].filter(Boolean).join(" · ") || "sin gastos asignados"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {esNom
                  ? <><div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.accent }}>+{eur(ingresoTotalMes)}</div><div style={{ fontFamily: T.mono, fontSize: 9, color: T.dim }}>retiene {eur(retiene)}</div></>
                  : <><div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: ne.total > 0 ? T.warn : T.dim }}>{ne.total > 0 ? "→ " + eur(ne.total) : "—"}</div><div style={{ fontFamily: T.mono, fontSize: 9, color: T.dim }}>transferir</div></>}
              </div>
            </div>
          );
        })}
        {!bancoNom && <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.warn, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><Icon n="info" s={13} c={T.warn} /> Elige en Criterios en qué banco entra la nómina.</div>}
      </div>

      {/* Checklist de gastos */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: T.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}><Icon n="check" s={16} c={T.accent} /> Gastos del mes</div>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{pagados.length}/{gastosMes.length} · {eur(pagadoMes)}/{eur(totalGastosMes)}</span>
        </div>
        {gastosMes.length === 0 && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.dim, textAlign: "center", padding: "6px 0" }}>Añade gastos mensuales en Datos.</div>}
        {gastosMes.map((g) => {
          const ok = (g.pagados || []).includes(d.mes);
          return (
            <div key={g.id + g.tipo} onClick={() => togglePago(g.id, g.tipo)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${ok ? (g.esObjetivo ? T.accentSoft : T.accent) : T.border}`, background: ok ? (g.esObjetivo ? T.accentSoft : T.accent) : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ok && <Icon n="check" s={13} c="#fff" sw={2.5} />}</div>
              <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, color: ok ? T.dim : T.text, textDecoration: ok ? "line-through" : "none" }}>{g.nombre || "(sin nombre)"}</span>
              {(g.esObjetivo || g.esAnual) && <span style={{ fontFamily: T.ui, fontSize: 8.5, fontWeight: 700, color: T.accentSoft, background: `${T.accentSoft}1e`, borderRadius: 4, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>auto</span>}
              <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.dim, background: T.surface2, borderRadius: 5, padding: "2px 6px" }}>{nombreBanco(g.banco)}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 600, color: ok ? T.dim : T.mid, width: 62, textAlign: "right" }}>{eur(g.importe)}</span>
            </div>
          );
        })}
      </div>

      {/* Ingresos adicionales del mes */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: T.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}><Icon n="ingreso" s={16} c={T.accent} /> Ingresos extra de {MESES[d.mes]}</div>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent }}>+{eur(totalExtraMes)}</span>
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim, marginBottom: 10 }}>Ingresos que solo entran este mes (paga extra, venta, devolución…). Suman al margen.</div>
        {extraMes.map((g) => (
          <div key={g.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
            <Campo value={g.nombre} alinear="left" ph="Concepto" onChange={(v) => upd((c) => { c.ingresosMes[mesKey].find((x) => x.id === g.id).nombre = v; })} />
            <div style={{ flex: 1 }} />
            <Campo value={g.importe} sufijo="€" ancho={95} onChange={(v) => upd((c) => { c.ingresosMes[mesKey].find((x) => x.id === g.id).importe = v; })} />
            <Del onClick={() => upd((c) => { c.ingresosMes[mesKey] = c.ingresosMes[mesKey].filter((x) => x.id !== g.id); })} />
          </div>
        ))}
        <AddBtn label="Añadir ingreso extra" onClick={() => upd((c) => { c.ingresosMes = c.ingresosMes || {}; c.ingresosMes[mesKey] = c.ingresosMes[mesKey] || []; c.ingresosMes[mesKey].push({ id: uid(), nombre: "", importe: 0 }); })} />
      </div>

      {/* Gastos puntuales del mes */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: T.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}><Icon n="gasto" s={16} c={T.accent} /> Puntuales de {MESES[d.mes]}</div>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{eur(totalPuntuales)}</span>
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim, marginBottom: 10 }}>Gastos que solo ocurren este mes (no se repiten).</div>
        {puntualesMes.map((g) => (
          <div key={g.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
            <Campo value={g.nombre} alinear="left" ph="Concepto" onChange={(v) => upd((c) => { c.puntuales[mesKey].find((x) => x.id === g.id).nombre = v; })} />
            <div style={{ flex: 1 }} />
            <Campo value={g.importe} sufijo="€" ancho={95} onChange={(v) => upd((c) => { c.puntuales[mesKey].find((x) => x.id === g.id).importe = v; })} />
            <Del onClick={() => upd((c) => { c.puntuales[mesKey] = c.puntuales[mesKey].filter((x) => x.id !== g.id); })} />
          </div>
        ))}
        <AddBtn label="Añadir gasto puntual" onClick={() => upd((c) => { c.puntuales = c.puntuales || {}; c.puntuales[mesKey] = c.puntuales[mesKey] || []; c.puntuales[mesKey].push({ id: uid(), nombre: "", importe: 0 }); })} />
      </div>

      {/* Margen para cerrar */}
      <div style={{ background: cerrado ? `${T.accent}0a` : T.panel, border: `1px solid ${cerrado ? T.accent + "44" : T.border}`, borderRadius: 16, padding: "16px 18px", boxShadow: cerrado ? "none" : T.shadow }}>
        <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icon n="shield" s={16} c={T.accent} /> Cierre del mes</div>
        <Fila l="Ingresos base" v={eur(ingresoMes)} c={T.accent} />
        {totalExtraMes > 0 && <Fila l="+ Ingresos adicionales" v={"+" + eur(totalExtraMes)} c={T.accent} />}
        <Fila l="− Gastos del mes" v={"−" + eur(totalGastosMes)} c={T.mid} />
        {totalPuntuales > 0 && <Fila l="− Puntuales" v={"−" + eur(totalPuntuales)} c={T.mid} />}
        <div style={{ height: 1, background: T.line, margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.text }}>Margen del mes</span>
          <span style={{ fontFamily: T.serif, fontSize: 28, color: margen >= 0 ? T.accent : T.neg }}>{margen >= 0 ? "+" : ""}{eur(margen)}</span>
        </div>
        <button onClick={cerrarMes} style={{ width: "100%", padding: "12px", borderRadius: 10, border: cerrado ? `1px solid ${T.accent}` : "none", cursor: "pointer", fontFamily: T.ui, fontSize: 13, fontWeight: 700, background: cerrado ? "none" : T.accent, color: cerrado ? T.accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon n={cerrado ? "lock" : "check"} s={16} c={cerrado ? T.accent : "#fff"} /> {cerrado ? `${MESES[d.mes]} cerrado · reabrir` : `Cerrar ${MESES[d.mes]}`}
        </button>
        {cerrado && <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim, textAlign: "center", marginTop: 8 }}>El margen de {eur(margen)} pasa a tu ahorro libre.</div>}
      </div>
    </>
  );
}

function Titulo({ icon, t }) { return <div style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 700, color: T.mid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "6px 0 8px", display: "flex", alignItems: "center", gap: 6 }}><Icon n={icon} s={14} c={T.accent} /> {t}</div>; }
function CritFila({ titulo, desc, children }) { return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}><div style={{ flex: 1 }}><div style={{ fontFamily: T.ui, fontSize: 13, color: T.text, fontWeight: 600 }}>{titulo}</div><div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.dim }}>{desc}</div></div>{children}</div>; }
function SubLista({ d, upd, campo, label, total, bancoOpts }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 700, color: T.mid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ fontFamily: T.mono, fontSize: 12, color: T.dim }}>{eur(total)}</span>
      </div>
      {d[campo].map((g) => (
        <div key={g.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
            <Campo value={g.nombre} alinear="left" ph="Concepto" onChange={(v) => upd((c) => { c[campo].find((x) => x.id === g.id).nombre = v; })} />
            <div style={{ flex: 1 }} />
            <Campo value={g.importe} sufijo="€" ancho={95} onChange={(v) => upd((c) => { c[campo].find((x) => x.id === g.id).importe = v; })} />
            <Del onClick={() => upd((c) => { c[campo] = c[campo].filter((x) => x.id !== g.id); })} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 2 }}>
            <span style={{ fontFamily: T.ui, fontSize: 9.5, color: T.dim, textTransform: "uppercase", letterSpacing: "0.05em" }}>paga desde</span>
            <Sel value={g.banco} onChange={(v) => upd((c) => { c[campo].find((x) => x.id === g.id).banco = v; })} opciones={bancoOpts} ancho={150} />
          </div>
        </div>
      ))}
      <AddBtn label={`Añadir a ${label.toLowerCase()}`} onClick={() => upd((c) => c[campo].push({ id: uid(), nombre: "", importe: 0, banco: d.bancos[0]?.id || null, pagados: [] }))} />
    </div>
  );
}
function Tarjeta({ label, valor, color, sub, grande }) { return <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: grande ? "18px" : "14px 16px", flex: 1, boxShadow: T.shadow }}><div style={{ fontFamily: T.ui, fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div><div style={{ fontFamily: T.serif, fontSize: grande ? 34 : 24, color: color || T.text, lineHeight: 1 }}>{valor}</div>{sub && <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.dim, marginTop: 6 }}>{sub}</div>}</div>; }
function Fila({ l, v, c, pad = "6px 0" }) { return <div style={{ display: "flex", justifyContent: "space-between", padding: pad, fontFamily: T.ui, fontSize: 12.5, color: T.mid }}><span style={{ paddingRight: 8 }}>{l}</span><span style={{ fontFamily: T.mono, color: c || T.mid, whiteSpace: "nowrap" }}>{v}</span></div>; }
function Panel({ children, tono }) { return <div style={{ background: tono ? `${tono}0d` : T.panel, border: `1px solid ${tono ? tono + "33" : T.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: tono ? "none" : T.shadow }}>{children}</div>; }
function Resumen(x) {
  if (x.vacio) return <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.dim, textAlign: "center", padding: "40px 20px", lineHeight: 1.6 }}>Cuando añadas tus datos, aquí verás<br />el patrimonio, el disponible y el ahorro.</div>;
  const gan = x.invValor - x.invInvertido;
  return (
    <>
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.dim, lineHeight: 1.5, margin: "0 0 14px" }}>Solo lectura. Todo sale de <b style={{ color: T.mid }}>Datos</b>.</p>
      <Tarjeta grande label="Patrimonio neto" valor={eur(x.patrimonio)} color={T.accent} sub={`${eur(x.saldoTotal)} bancos · ${eur(x.invValor)} inversión${x.inmueblesTotal ? " · " + eur(x.inmueblesTotal) + " inmuebles" : ""}${x.deudasTotal ? " − " + eur(x.deudasTotal) + " deuda" : ""}`} />
      <div style={{ height: 12 }} />
      <Panel>
        <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icon n="shield" s={16} c={T.accent} /> Dinero disponible de verdad</div>
        <Fila l="Saldo total en bancos" v={eur(x.saldoTotal)} />
        <Fila l="− Bolsas de reserva" v={"−" + eur(x.reservasTotal)} c={T.dim} />
        <Fila l={`− Fondo emergencia (${x.mesesEmergencia}m fijos)`} v={"−" + eur(x.fondoEmergencia)} c={T.warn} />
        <div style={{ height: 1, background: T.line, margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.text }}>Disponible</span><span style={{ fontFamily: T.serif, fontSize: 26, color: x.disponible >= 0 ? T.accent : T.neg }}>{eur(x.disponible)}</span></div>
      </Panel>
      <Panel tono={T.accent}>
        <div style={{ fontFamily: T.ui, fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>A apartar este mes ({x.mesLabel}) para anuales</div>
        <Fila l="Pendiente del año" v={eur(x.anualPendiente)} pad="4px 0" />
        <Fila l={"− Bolsa" + (x.bolsaLabel ? " (" + x.bolsaLabel + ")" : "")} v={"−" + eur(x.reservaBolsa)} c={T.dim} pad="4px 0" />
        <Fila l="− Parte de la paga extra" v={"−" + eur(x.extraFactor)} c={T.dim} pad="4px 0" />
        <div style={{ height: 1, background: T.line, margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>÷ {x.mesesRest} meses restantes</span><span style={{ fontFamily: T.serif, fontSize: 28, color: T.accent }}>{eur(x.apartarAnual)}</span></div>
      </Panel>
      <Panel>
        <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Icon n="ingreso" s={16} c={T.accent} /> Flujo mensual</div>
        <Fila l="Ingresos" v={eur(x.ingresoMes)} c={T.accent} />
        <Fila l="− Gastos (fijos + prescindibles)" v={"−" + eur(x.gastoCorriente)} c={T.mid} />
        <div style={{ height: 1, background: T.line, margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.text }}>Te queda libre</span><span style={{ fontFamily: T.serif, fontSize: 26, color: x.ahorroLibre >= 0 ? T.accent : T.neg }}>{x.ahorroLibre >= 0 ? "+" : ""}{eur(x.ahorroLibre)}</span></div>
      </Panel>
      <div style={{ display: "flex", gap: 12 }}>
        <Tarjeta label="Ahorro objetivos" valor={eur(x.cuotaObjTotal) + "/m"} color={T.mid} sub={x.cuotaObjAutoTotal > 0 ? eur(x.cuotaObjAutoTotal) + " automatizado" : "manual"} />
        <Tarjeta label="Plusvalía" valor={(gan >= 0 ? "+" : "") + eur(gan)} color={gan >= 0 ? T.accent : T.neg} sub={`de ${eur(x.invInvertido)}`} />
      </div>
    </>
  );
}

const __root = ReactDOM.createRoot(document.getElementById("root"));
__root.render(React.createElement(App));
window.__appMontada = true;
