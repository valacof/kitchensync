import { useState, useEffect, useCallback } from "react";
import { db, dbGet, dbSet, dbListen } from "./firebase.js";
import { ref, update } from "firebase/database";

const ROLES = {
  jefe:     { label: "Jefe de Cocina", color: "#F5A623", icon: "👑" },
  souschef: { label: "Sous Chef",      color: "#7B8FF5", icon: "⭐" },
  cocinero: { label: "Cocinero",       color: "#4EC9A0", icon: "🔪" },
  ayudante: { label: "Ayudante",       color: "#AAAAAA", icon: "🤝" },
};
const CATS = {
  produccion: { label: "Producción", emoji: "🔪", color: "#E8733A" },
  limpieza:   { label: "Limpieza",   emoji: "🧹", color: "#4A9B8E" },
  almacen:    { label: "Almacén",    emoji: "📦", color: "#7B6FB0" },
};
const PRIO = {
  alta:  { label: "Alta",  color: "#E8733A" },
  media: { label: "Media", color: "#D4A017" },
  baja:  { label: "Baja",  color: "#4A9B8E" },
};
const UNIDADES = ["ud","kg","g","L","ml","bote","caja","bolsa","ración"];
const DIAS = ["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];

const CATALOGO = [
  {nombre:"Pollo entero",unidad:"ud",categoria:"Carnes"},
  {nombre:"Pechuga de pollo",unidad:"kg",categoria:"Carnes"},
  {nombre:"Muslo de pollo",unidad:"kg",categoria:"Carnes"},
  {nombre:"Carne picada",unidad:"kg",categoria:"Carnes"},
  {nombre:"Lomo de cerdo",unidad:"kg",categoria:"Carnes"},
  {nombre:"Costillas de cerdo",unidad:"kg",categoria:"Carnes"},
  {nombre:"Ternera para guisar",unidad:"kg",categoria:"Carnes"},
  {nombre:"Solomillo de ternera",unidad:"kg",categoria:"Carnes"},
  {nombre:"Bacon",unidad:"kg",categoria:"Carnes"},
  {nombre:"Chorizo",unidad:"kg",categoria:"Embutidos"},
  {nombre:"Salchichas",unidad:"ud",categoria:"Embutidos"},
  {nombre:"Jamón cocido",unidad:"kg",categoria:"Embutidos"},
  {nombre:"Salmón fresco",unidad:"kg",categoria:"Pescados"},
  {nombre:"Atún fresco",unidad:"kg",categoria:"Pescados"},
  {nombre:"Gambas",unidad:"kg",categoria:"Pescados"},
  {nombre:"Calamar",unidad:"kg",categoria:"Pescados"},
  {nombre:"Bacalao",unidad:"kg",categoria:"Pescados"},
  {nombre:"Lubina",unidad:"kg",categoria:"Pescados"},
  {nombre:"Dorada",unidad:"kg",categoria:"Pescados"},
  {nombre:"Cebolla",unidad:"kg",categoria:"Verduras"},
  {nombre:"Ajo",unidad:"kg",categoria:"Verduras"},
  {nombre:"Tomate",unidad:"kg",categoria:"Verduras"},
  {nombre:"Pimiento rojo",unidad:"kg",categoria:"Verduras"},
  {nombre:"Pimiento verde",unidad:"kg",categoria:"Verduras"},
  {nombre:"Zanahoria",unidad:"kg",categoria:"Verduras"},
  {nombre:"Patata",unidad:"kg",categoria:"Verduras"},
  {nombre:"Lechuga",unidad:"ud",categoria:"Verduras"},
  {nombre:"Espinacas",unidad:"kg",categoria:"Verduras"},
  {nombre:"Champiñones",unidad:"kg",categoria:"Verduras"},
  {nombre:"Brócoli",unidad:"kg",categoria:"Verduras"},
  {nombre:"Calabacín",unidad:"kg",categoria:"Verduras"},
  {nombre:"Berenjena",unidad:"kg",categoria:"Verduras"},
  {nombre:"Limón",unidad:"ud",categoria:"Frescos"},
  {nombre:"Naranja",unidad:"ud",categoria:"Frescos"},
  {nombre:"Perejil fresco",unidad:"ud",categoria:"Frescos"},
  {nombre:"Albahaca fresca",unidad:"ud",categoria:"Frescos"},
  {nombre:"Jengibre fresco",unidad:"kg",categoria:"Frescos"},
  {nombre:"Aguacate",unidad:"ud",categoria:"Frescos"},
  {nombre:"Huevos",unidad:"ud",categoria:"Lácteos"},
  {nombre:"Leche entera",unidad:"L",categoria:"Lácteos"},
  {nombre:"Nata para cocinar",unidad:"L",categoria:"Lácteos"},
  {nombre:"Mantequilla",unidad:"kg",categoria:"Lácteos"},
  {nombre:"Queso parmesano",unidad:"kg",categoria:"Lácteos"},
  {nombre:"Queso manchego",unidad:"kg",categoria:"Lácteos"},
  {nombre:"Mozzarella",unidad:"kg",categoria:"Lácteos"},
  {nombre:"Arroz",unidad:"kg",categoria:"Secos"},
  {nombre:"Pasta spaghetti",unidad:"kg",categoria:"Secos"},
  {nombre:"Harina de trigo",unidad:"kg",categoria:"Secos"},
  {nombre:"Pan rallado",unidad:"kg",categoria:"Secos"},
  {nombre:"Azúcar",unidad:"kg",categoria:"Secos"},
  {nombre:"Sal",unidad:"kg",categoria:"Secos"},
  {nombre:"Pimienta negra",unidad:"bote",categoria:"Especias"},
  {nombre:"Pimentón dulce",unidad:"bote",categoria:"Especias"},
  {nombre:"Orégano seco",unidad:"bote",categoria:"Especias"},
  {nombre:"Comino",unidad:"bote",categoria:"Especias"},
  {nombre:"Curry",unidad:"bote",categoria:"Especias"},
  {nombre:"Canela",unidad:"bote",categoria:"Especias"},
  {nombre:"Laurel seco",unidad:"bote",categoria:"Especias"},
  {nombre:"Aceite de oliva",unidad:"L",categoria:"Aceites"},
  {nombre:"Aceite de girasol",unidad:"L",categoria:"Aceites"},
  {nombre:"Vinagre de vino",unidad:"L",categoria:"Salsas"},
  {nombre:"Salsa de tomate",unidad:"bote",categoria:"Salsas"},
  {nombre:"Mostaza",unidad:"bote",categoria:"Salsas"},
  {nombre:"Mayonesa",unidad:"bote",categoria:"Salsas"},
  {nombre:"Caldo de pollo",unidad:"L",categoria:"Caldos"},
  {nombre:"Caldo de carne",unidad:"L",categoria:"Caldos"},
  {nombre:"Caldo de verduras",unidad:"L",categoria:"Caldos"},
  {nombre:"Vino blanco cocina",unidad:"L",categoria:"Caldos"},
  {nombre:"Chocolate negro",unidad:"kg",categoria:"Postres"},
  {nombre:"Cacao en polvo",unidad:"kg",categoria:"Postres"},
  {nombre:"Harina de repostería",unidad:"kg",categoria:"Postres"},
  {nombre:"Levadura química",unidad:"bote",categoria:"Postres"},
  {nombre:"Maicena",unidad:"kg",categoria:"Postres"},
];

function uid() { return "_"+Math.random().toString(36).slice(2,9); }
function fmt(n) { return Number.isInteger(n)?String(n):parseFloat(n.toFixed(2)); }
function timeAgo(ts) {
  const s=(Date.now()-ts)/1000;
  if(s<60) return "ahora";
  if(s<3600) return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}
function objToArr(obj) { if(!obj) return []; return Object.values(obj); }
function loadSession() { try { return JSON.parse(localStorage.getItem("ks_session")); } catch { return null; } }
function saveSession(s) { if(s) localStorage.setItem("ks_session",JSON.stringify(s)); else localStorage.removeItem("ks_session"); }

async function fbMultiUpdate(updates) {
  await update(ref(db), updates);
}

async function checkStockAlertas(restoId, productos, recetas, empleados, tareas) {
  const updates = {};
  for (const p of productos) {
    if (p.stock < p.minStock) {
      const comprasSnap = await dbGet(`restaurantes/${restoId}/compras`);
      const comprasArr = objToArr(comprasSnap || {});
      const yaEnCompras = comprasArr.find(c => !c.hecho && c.productoId === p.id);
      if (!yaEnCompras) {
        const cId = uid();
        updates[`restaurantes/${restoId}/compras/${cId}`] = { id:cId, productoId:p.id, nombre:p.nombre, cantidad:p.minStock*2, unidad:p.unidad, auto:true, hecho:false, ts:Date.now() };
        const nId = uid();
        updates[`restaurantes/${restoId}/notificaciones/${nId}`] = { id:nId, texto:`⚠️ Stock bajo: ${p.nombre} (${fmt(p.stock)} ${p.unidad} / mín ${p.minStock} ${p.unidad})`, tipo:"alerta", ts:Date.now(), leida:false };
        const receta = recetas.find(re => re.productoResultadoId === p.id);
        if (receta?.responsableId) {
          const tareasArr = objToArr(tareas || {});
          const yaHayTarea = tareasArr.find(t => t.recetaId === receta.id && !t.completado);
          if (!yaHayTarea) {
            const tId = uid();
            const resp = empleados.find(e => e.id === receta.responsableId);
            updates[`restaurantes/${restoId}/tareas/${tId}`] = { id:tId, nombre:`Preparar: ${receta.nombre}`, cat:"produccion", prioridad:"alta", asignado:receta.responsableId, completado:false, creadoPor:"sistema", recetaId:receta.id, solicitudes:{}, ts:Date.now() };
            const n2Id = uid();
            updates[`restaurantes/${restoId}/notificaciones/${n2Id}`] = { id:n2Id, texto:`📋 Tarea auto: "Preparar: ${receta.nombre}" → ${resp?.nombre||"responsable"}`, tipo:"alerta", ts:Date.now(), leida:false };
          }
        }
      }
    }
  }
  if (Object.keys(updates).length) await fbMultiUpdate(updates);
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

export default function KitchenSync() {
  const [session, setSession] = useState(loadSession);
  const [resto,   setResto]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.restoId) { setLoading(false); setResto(null); return; }
    setLoading(true);
    const unsub = dbListen(`restaurantes/${session.restoId}`, (data) => {
      setResto(data);
      setLoading(false);
    });
    return () => unsub();
  }, [session?.restoId]);

  const yo = resto ? objToArr(resto.empleados).find(e => e.id === session?.empId) : null;
  const handleLogin = (s) => { saveSession(s); setSession(s); };
  const handleLogout = () => { saveSession(null); setSession(null); setResto(null); };

  if (loading && session) return <Splash texto="Conectando con el servidor..." />;
  if (!session || !resto || !yo) return <LoginScreen onLogin={handleLogin} />;
  return <MainApp resto={resto} yo={yo} restoId={session.restoId} onLogout={handleLogout} />;
}

function Splash({ texto }) {
  return (
    <div style={{minHeight:"100vh",background:"#0d0d0d",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{fontSize:48}}>🍳</div>
      <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>KitchenSync</div>
      <div style={{fontSize:14,color:"#555"}}>{texto}</div>
      <div className="ks-spinner"/>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [tab,setTab]       = useState("entrar");
  const [codigo,setCodigo] = useState("");
  const [resto,setResto]   = useState(null);
  const [empId,setEmpId]   = useState(null);
  const [pin,setPin]       = useState("");
  const [err,setErr]       = useState("");
  const [busy,setBusy]     = useState(false);
  const [cN,setCN]=useState(""); const [cC,setCC]=useState("");
  const [cJ,setCJ]=useState(""); const [cP,setCP]=useState(""); const [cOk,setCOk]=useState(false);

  const buscar = async () => {
    if (!codigo.trim()) { setErr("Introduce un código"); return; }
    setBusy(true); setErr("");
    try {
      const data = await dbGet(`restaurantes/${codigo.toUpperCase().trim()}`);
      if (!data) { setErr("Código no encontrado"); setBusy(false); return; }
      setResto(data); setEmpId(null); setPin("");
    } catch(e) { setErr("Error de conexión"); }
    setBusy(false);
  };

  const entrar = () => {
    const emp = objToArr(resto.empleados).find(e => e.id === empId);
    if (!emp) return;
    if (emp.pin && pin !== emp.pin) { setErr("PIN incorrecto"); return; }
    onLogin({ restoId: resto.id, empId: emp.id });
  };

  const crear = async () => {
    if (!cN||!cC||!cJ) { setErr("Rellena todos los campos"); return; }
    const id = cC.toUpperCase().trim();
    setBusy(true); setErr("");
    try {
      const existe = await dbGet(`restaurantes/${id}/id`);
      if (existe) { setErr("Ese código ya existe"); setBusy(false); return; }
      const jefeId = uid();
      await dbSet(`restaurantes/${id}`, {
        id, nombre:cN,
        empleados:{ [jefeId]:{ id:jefeId, nombre:cJ, rol:"jefe", pin:cP||"" } },
        tareas:{}, productos:{}, recetas:{}, compras:{}, notificaciones:{}, proveedores:{},
      });
      setCOk(true);
    } catch(e) { setErr("Error: "+e.message); }
    setBusy(false);
  };

  return (
    <div style={LS.root}><style>{CSS}</style>
      <div style={LS.card}>
        <div style={{fontSize:40,textAlign:"center"}}>🍳</div>
        <div style={{fontSize:26,fontWeight:800,color:"#fff",textAlign:"center",letterSpacing:-1}}>KitchenSync</div>
        <div style={{fontSize:13,color:"#555",textAlign:"center",marginTop:-8}}>Gestión de cocina profesional</div>
        <div style={LS.tabs}>
          {["entrar","crear"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr("");setCOk(false);}} style={{...LS.tab,...(tab===t?LS.tabOn:{})}}>
              {t==="entrar"?"Entrar":"Nuevo restaurante"}
            </button>
          ))}
        </div>

        {tab==="entrar"&&!cOk&&(!resto?(
          <>
            <input className="ks-input" placeholder="Código del restaurante (ej. RINCON01)"
              value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==="Enter"&&buscar()} />
            <button className="ks-btn-primary" onClick={buscar} disabled={busy}>{busy?"Buscando...":"Buscar"}</button>
          </>
        ):(
          <>
            <div style={{fontSize:16,fontWeight:700,color:"#fff",textAlign:"center"}}>{resto.nombre}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {objToArr(resto.empleados).map(e=>(
                <button key={e.id} className="ks-emp-btn" style={empId===e.id?{borderColor:"#E8733A",background:"#1e1e1e"}:{}} onClick={()=>{setEmpId(e.id);setPin("");setErr("");}}>
                  <span style={{fontSize:22}}>{ROLES[e.rol]?.icon}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#eee"}}>{e.nombre}</span>
                  <span style={{fontSize:10,color:ROLES[e.rol]?.color}}>{ROLES[e.rol]?.label}</span>
                </button>
              ))}
            </div>
            {empId&&objToArr(resto.empleados).find(e=>e.id===empId)?.pin&&(
              <input className="ks-input" type="password" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&entrar()} maxLength={6}/>
            )}
            {empId&&<button className="ks-btn-primary" onClick={entrar}>Entrar →</button>}
            <button className="ks-btn-sec" onClick={()=>setResto(null)}>← Cambiar código</button>
          </>
        ))}

        {tab==="crear"&&!cOk&&(
          <>
            <input className="ks-input" placeholder="Nombre del restaurante" value={cN} onChange={e=>setCN(e.target.value)}/>
            <input className="ks-input" placeholder="Código único (ej. RINCON01)" value={cC} onChange={e=>setCC(e.target.value.toUpperCase())} maxLength={10}/>
            <div style={{fontSize:11,color:"#555"}}>Tus compañeros usarán este código para entrar</div>
            <input className="ks-input" placeholder="Tu nombre (Jefe de cocina)" value={cJ} onChange={e=>setCJ(e.target.value)}/>
            <input className="ks-input" type="password" placeholder="Tu PIN (opcional)" value={cP} onChange={e=>setCP(e.target.value)} maxLength={6}/>
            <button className="ks-btn-primary" onClick={crear} disabled={busy}>{busy?"Creando...":"Crear restaurante"}</button>
          </>
        )}

        {cOk&&(
          <div style={{textAlign:"center",color:"#4EC9A0",lineHeight:2}}>
            ✅ ¡Restaurante creado!<br/>
            Código para tus compañeros:<br/>
            <b style={{color:"#fff",fontSize:22,fontFamily:"monospace",letterSpacing:3}}>{cC}</b><br/>
            <button className="ks-btn-primary" style={{marginTop:12}} onClick={()=>{setTab("entrar");setCOk(false);setCodigo(cC);setResto(null);}}>Entrar ahora</button>
          </div>
        )}
        {err&&<div style={{color:"#e05555",fontSize:13,textAlign:"center"}}>{err}</div>}
      </div>
    </div>
  );
}
const LS={
  root:{minHeight:"100vh",background:"#0d0d0d",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:16,boxSizing:"border-box"},
  card:{background:"#161616",border:"1px solid #222",borderRadius:20,padding:"36px 28px",width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:12,boxSizing:"border-box"},
  tabs:{display:"flex",background:"#111",borderRadius:10,padding:3,gap:3},
  tab:{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:"transparent",color:"#555",fontSize:13,cursor:"pointer",fontWeight:600},
  tabOn:{background:"#222",color:"#fff"},
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────

function MainApp({ resto, yo, restoId, onLogout }) {
  const [tab,setTab] = useState("tareas");
  const esJefe = yo.rol==="jefe"||yo.rol==="souschef";
  const productos   = objToArr(resto.productos||{});
  const notifs      = objToArr(resto.notificaciones||{});
  const compras     = objToArr(resto.compras||{});
  const alertas     = productos.filter(p=>p.stock<p.minStock).length;
  const noLeidas    = notifs.filter(n=>!n.leida).length;
  const comprasPend = compras.filter(c=>!c.hecho).length;

  const navTabs=[
    {id:"tareas",icon:"✅",label:"Tareas",badge:0},
    {id:"stock",icon:"📦",label:"Stock",badge:alertas},
    {id:"recetas",icon:"📋",label:"Recetas",badge:0},
    {id:"compras",icon:"🛒",label:"Compras",badge:comprasPend},
    {id:"proveedores",icon:"🚚",label:"Proveed.",badge:0},
    {id:"equipo",icon:"👥",label:"Equipo",badge:0},
  ];

  return (
    <div style={MA.root}><style>{CSS}</style>
      <header style={MA.header}>
        <div>
          <div style={MA.hT}>{resto.nombre}</div>
          <div style={MA.hS}>{ROLES[yo.rol]?.icon} {yo.nombre} · {ROLES[yo.rol]?.label}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#4EC9A0",boxShadow:"0 0 6px #4EC9A0"}} title="Tiempo real"/>
          <NotifBell notifs={notifs} restoId={restoId} count={noLeidas}/>
          <button className="ks-logout" onClick={onLogout}>Salir</button>
        </div>
      </header>
      <div style={MA.content}>
        {tab==="tareas"&&<TabTareas resto={resto} yo={yo} esJefe={esJefe} restoId={restoId}/>}
        {tab==="stock"&&<TabStock resto={resto} yo={yo} esJefe={esJefe} restoId={restoId}/>}
        {tab==="recetas"&&<TabRecetas resto={resto} yo={yo} esJefe={esJefe} restoId={restoId}/>}
        {tab==="compras"&&<TabCompras resto={resto} yo={yo} esJefe={esJefe} restoId={restoId}/>}
        {tab==="proveedores"&&<TabProveedores resto={resto} yo={yo} esJefe={esJefe} restoId={restoId}/>}
        {tab==="equipo"&&<TabEquipo resto={resto} yo={yo} esJefe={esJefe} restoId={restoId}/>}
      </div>
      <nav style={MA.nav}>
        {navTabs.map(t=>(
          <button key={t.id} className="ks-nav-btn" style={{...MA.navBtn,...(tab===t.id?MA.navOn:{})}} onClick={()=>setTab(t.id)}>
            <span style={{position:"relative",fontSize:20}}>{t.icon}{t.badge>0&&<span style={MA.badge}>{t.badge}</span>}</span>
            <span style={{fontSize:10}}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
const MA={
  root:{height:"100vh",display:"flex",flexDirection:"column",background:"#0f0f0f",fontFamily:"'DM Sans',sans-serif",color:"#eee",maxWidth:480,margin:"0 auto"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px 10px",borderBottom:"1px solid #1e1e1e",background:"#141414",flexShrink:0},
  hT:{fontSize:16,fontWeight:800,color:"#fff",letterSpacing:-0.5},hS:{fontSize:12,color:"#666",marginTop:2},
  content:{flex:1,overflowY:"auto"},
  nav:{display:"flex",borderTop:"1px solid #1e1e1e",background:"#111",flexShrink:0},
  navBtn:{flex:1,background:"transparent",border:"none",color:"#555",padding:"10px 0 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"},
  navOn:{color:"#E8733A"},
  badge:{position:"absolute",top:-4,right:-6,background:"#E8733A",color:"#fff",borderRadius:99,fontSize:9,padding:"1px 4px",fontWeight:700,lineHeight:1.4},
};

function NotifBell({ notifs, restoId, count }) {
  const [open,setOpen]=useState(false);
  const marcarLeidas = async () => {
    const updates={};
    notifs.filter(n=>!n.leida).forEach(n=>{ updates[`restaurantes/${restoId}/notificaciones/${n.id}/leida`]=true; });
    if(Object.keys(updates).length) await fbMultiUpdate(updates);
  };
  return (
    <div style={{position:"relative"}}>
      <button className="ks-icon-btn" onClick={()=>{setOpen(o=>!o);if(!open)marcarLeidas();}} style={{position:"relative"}}>
        🔔{count>0&&<span style={{...MA.badge,top:0,right:0}}>{count}</span>}
      </button>
      {open&&(
        <div style={NB.panel}>
          <div style={NB.titulo}>Notificaciones</div>
          {notifs.length===0?<div style={NB.vacio}>Sin notificaciones</div>
            :[...notifs].sort((a,b)=>b.ts-a.ts).slice(0,12).map(n=>(
              <div key={n.id} style={{...NB.item,opacity:n.leida?.45:1}}>
                <span>{n.tipo==="alerta"?"⚠️":"ℹ️"}</span>
                <div><div style={{fontSize:13,color:"#ddd"}}>{n.texto}</div><div style={{fontSize:11,color:"#555"}}>{timeAgo(n.ts)}</div></div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
const NB={
  panel:{position:"absolute",right:0,top:38,background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:14,width:300,zIndex:999,boxShadow:"0 8px 32px #000c",maxHeight:360,overflowY:"auto"},
  titulo:{padding:"12px 16px 8px",fontSize:13,fontWeight:700,color:"#888",borderBottom:"1px solid #222"},
  vacio:{padding:16,color:"#555",fontSize:13,textAlign:"center"},
  item:{display:"flex",gap:10,padding:"10px 16px",borderBottom:"1px solid #1a1a1a",alignItems:"flex-start"},
};

// ─── TAB TAREAS ──────────────────────────────────────────────────────────────

function TabTareas({ resto, yo, esJefe, restoId }) {
  const [filtro,setFiltro]=useState("todas");
  const [showNueva,setShowNueva]=useState(false);
  const [solicTarea,setSolicTarea]=useState(null);
  const [calcTarea,setCalcTarea]=useState(null);
  const [nueva,setNueva]=useState({nombre:"",cat:"produccion",prioridad:"media",asignado:"",recetaId:""});

  const tareas=objToArr(resto.tareas||{});
  const productos=objToArr(resto.productos||{});
  const recetas=objToArr(resto.recetas||{});
  const empleados=objToArr(resto.empleados||{});

  const tareasFiltradas=tareas.filter(t=>filtro==="todas"?true:filtro==="mias"?t.asignado===yo.id:t.cat===filtro);
  const total=tareas.length, hechas=tareas.filter(t=>t.completado).length;
  const pct=total?Math.round((hechas/total)*100):0;

  const toggleCompletado=async(tarea,factorOverride)=>{
    const yaHecha=tarea.completado;
    const updates={};
    updates[`restaurantes/${restoId}/tareas/${tarea.id}/completado`]=!yaHecha;
    if(!yaHecha&&tarea.recetaId){
      const receta=recetas.find(re=>re.id===tarea.recetaId);
      if(receta?.productoResultadoId){
        const factor=factorOverride??1;
        const cantidadReal=+(receta.cantidadResultado*factor).toFixed(2);
        const prod=productos.find(p=>p.id===receta.productoResultadoId);
        if(prod){
          const nuevoStock=+(prod.stock+cantidadReal).toFixed(2);
          updates[`restaurantes/${restoId}/productos/${prod.id}/stock`]=nuevoStock;
          const nId=uid();
          updates[`restaurantes/${restoId}/notificaciones/${nId}`]={id:nId,texto:`✅ ${yo.nombre} preparó "${receta.nombre}"${factor!==1?` (×${fmt(factor)})`:""}→ +${cantidadReal} ${receta.unidadResultado} de ${prod.nombre} (total: ${fmt(nuevoStock)} ${prod.unidad})`,tipo:"info",ts:Date.now(),leida:false};
          await fbMultiUpdate(updates);
          const prodActualizado=productos.map(p=>p.id===prod.id?{...p,stock:nuevoStock}:p);
          await checkStockAlertas(restoId,prodActualizado,recetas,empleados,resto.tareas);
          return;
        }
      }
    }
    if(!yaHecha&&!tarea.recetaId){
      const nId=uid();
      updates[`restaurantes/${restoId}/notificaciones/${nId}`]={id:nId,texto:`${yo.nombre} completó: ${tarea.nombre}`,tipo:"info",ts:Date.now(),leida:false};
    }
    await fbMultiUpdate(updates);
  };

  const crearTarea=async()=>{
    if(!nueva.nombre.trim()) return;
    const id=uid();
    await dbSet(`restaurantes/${restoId}/tareas/${id}`,{id,nombre:nueva.nombre,cat:nueva.cat,prioridad:nueva.prioridad,asignado:nueva.asignado||null,completado:false,creadoPor:yo.id,recetaId:nueva.recetaId||null,solicitudes:{},ts:Date.now()});
    setNueva({nombre:"",cat:"produccion",prioridad:"media",asignado:"",recetaId:""});
    setShowNueva(false);
  };

  const eliminarTarea=async id=>await dbSet(`restaurantes/${restoId}/tareas/${id}`,null);

  const enviarSolicitud=async(tarea,texto)=>{
    if(!texto.trim()) return;
    const id=uid(), nId=uid();
    const updates={};
    updates[`restaurantes/${restoId}/tareas/${tarea.id}/solicitudes/${id}`]={id,de:yo.id,texto,ts:Date.now()};
    updates[`restaurantes/${restoId}/notificaciones/${nId}`]={id:nId,texto:`💬 ${yo.nombre}: "${texto}" (${tarea.nombre})`,tipo:"info",ts:Date.now(),leida:false};
    await fbMultiUpdate(updates);
    setSolicTarea(null);
  };

  const resetDia=async()=>{
    const updates={};
    tareas.forEach(t=>{
      updates[`restaurantes/${restoId}/tareas/${t.id}/completado`]=false;
      updates[`restaurantes/${restoId}/tareas/${t.id}/solicitudes`]={};
    });
    await fbMultiUpdate(updates);
  };

  return (
    <div style={{paddingBottom:8}}>
      <div style={TT.progBox}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:13,color:"#888"}}>Progreso del día</span>
          <span style={{fontSize:13,fontWeight:700,color:"#E8733A"}}>{hechas}/{total} tareas</span>
        </div>
        <div style={TT.barWrap}><div style={{...TT.barFill,width:`${pct}%`}}/></div>
      </div>
      <div style={TT.filtros}>
        {[{id:"todas",label:"Todas"},{id:"mias",label:"Mis tareas"},{id:"produccion",label:"🔪"},{id:"limpieza",label:"🧹"},{id:"almacen",label:"📦"}].map(f=>(
          <button key={f.id} className="ks-filtro" style={filtro===f.id?{background:"#E8733A",color:"#fff",borderColor:"#E8733A"}:{}} onClick={()=>setFiltro(f.id)}>{f.label}</button>
        ))}
      </div>
      {esJefe&&(
        <div style={{display:"flex",gap:8,padding:"0 14px 10px"}}>
          <button className="ks-btn-primary" style={{flex:1}} onClick={()=>setShowNueva(true)}>+ Nueva tarea</button>
          <button className="ks-btn-sec" onClick={resetDia}>↺ Nuevo día</button>
        </div>
      )}
      {Object.entries(CATS).map(([catKey,cat])=>{
        const items=tareasFiltradas.filter(t=>t.cat===catKey);
        if(!items.length) return null;
        return (
          <div key={catKey} style={TT.grupo}>
            <div style={TT.grupoHead}>
              <span style={{width:8,height:8,borderRadius:"50%",background:cat.color,display:"inline-block"}}/>
              <span style={TT.grupoLabel}>{cat.emoji} {cat.label}</span>
              <span style={TT.grupoCount}>{items.filter(i=>i.completado).length}/{items.length}</span>
            </div>
            {items.map(tarea=>{
              const asig=tarea.asignado?empleados.find(e=>e.id===tarea.asignado):null;
              const solicitudes=objToArr(tarea.solicitudes||{});
              const yaSolic=solicitudes.some(s=>s.de===yo.id);
              const receta=tarea.recetaId?recetas.find(re=>re.id===tarea.recetaId):null;
              const prodRes=receta?.productoResultadoId?productos.find(p=>p.id===receta.productoResultadoId):null;
              return (
                <div key={tarea.id} className="ks-tarea-row" style={tarea.completado?{opacity:0.4}:{}}>
                  <button className={`ks-check${tarea.completado?" ks-check-done":""}`} onClick={()=>toggleCompletado(tarea)}>
                    {tarea.completado?"✓":""}
                  </button>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,color:"#ddd",textDecoration:tarea.completado?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tarea.nombre}</div>
                    <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:99,background:PRIO[tarea.prioridad]?.color+"22",color:PRIO[tarea.prioridad]?.color,fontWeight:600}}>{PRIO[tarea.prioridad]?.label}</span>
                      {asig&&<span style={{fontSize:11,color:"#666"}}>{ROLES[asig.rol]?.icon} {asig.nombre}</span>}
                      {receta&&prodRes&&<span style={{fontSize:10,color:"#4EC9A0"}}>+{receta.cantidadResultado}{receta.unidadResultado} {prodRes.nombre}</span>}
                    </div>
                    {solicitudes.length>0&&<div style={{fontSize:11,color:"#7B6FB0",marginTop:2}}>💬 {solicitudes.map(s=>{const emp=empleados.find(e=>e.id===s.de);return `${emp?.nombre}: ${s.texto}`;}).join(" · ")}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0}}>
                    {receta&&!tarea.completado&&<button className="ks-calc-btn" onClick={()=>setCalcTarea(tarea)}>🧮</button>}
                    {!tarea.completado&&!yaSolic&&<button className="ks-solic-btn" onClick={()=>setSolicTarea(tarea)}>Solicitar</button>}
                    {yaSolic&&<span style={{fontSize:10,color:"#7B6FB0"}}>✉️</span>}
                    {esJefe&&<button className="ks-del" onClick={()=>eliminarTarea(tarea.id)}>✕</button>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {showNueva&&(
        <Modal titulo="Nueva tarea" onClose={()=>setShowNueva(false)}>
          <label className="ks-label">Nombre</label>
          <input className="ks-input" placeholder="Ej: Elaborar salsa teriyaki" value={nueva.nombre} onChange={e=>setNueva(p=>({...p,nombre:e.target.value}))} autoFocus/>
          <label className="ks-label">Categoría</label>
          <select className="ks-input" value={nueva.cat} onChange={e=>setNueva(p=>({...p,cat:e.target.value}))}>
            {Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
          <label className="ks-label">Prioridad</label>
          <select className="ks-input" value={nueva.prioridad} onChange={e=>setNueva(p=>({...p,prioridad:e.target.value}))}>
            <option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🟢 Baja</option>
          </select>
          <label className="ks-label">Asignar a</label>
          <select className="ks-input" value={nueva.asignado} onChange={e=>setNueva(p=>({...p,asignado:e.target.value}))}>
            <option value="">— Sin asignar —</option>
            {empleados.map(e=><option key={e.id} value={e.id}>{ROLES[e.rol]?.icon} {e.nombre}</option>)}
          </select>
          {nueva.cat==="produccion"&&(
            <>
              <label className="ks-label">Vincular receta (opcional)</label>
              <select className="ks-input" value={nueva.recetaId} onChange={e=>setNueva(p=>({...p,recetaId:e.target.value}))}>
                <option value="">— Sin receta —</option>
                {recetas.map(re=><option key={re.id} value={re.id}>{re.nombre}</option>)}
              </select>
              {nueva.recetaId&&(()=>{const rec=recetas.find(r=>r.id===nueva.recetaId);const prod=rec&&productos.find(p=>p.id===rec.productoResultadoId);return rec&&prod?(<div style={{fontSize:12,color:"#4EC9A0",background:"#4EC9A011",padding:"8px 10px",borderRadius:8}}>✅ Al completar → +{rec.cantidadResultado} {rec.unidadResultado} de <b>{prod.nombre}</b></div>):null;})()}
            </>
          )}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button className="ks-btn-sec" style={{flex:1}} onClick={()=>setShowNueva(false)}>Cancelar</button>
            <button className="ks-btn-primary" style={{flex:1}} onClick={crearTarea}>Crear</button>
          </div>
        </Modal>
      )}
      {solicTarea&&<SolicModal tarea={solicTarea} yo={yo} empleados={empleados} onEnviar={enviarSolicitud} onClose={()=>setSolicTarea(null)}/>}
      {calcTarea&&<RecetaCalculadora tarea={calcTarea} resto={resto} onClose={()=>setCalcTarea(null)}/>}
    </div>
  );
}
const TT={
  progBox:{margin:"14px 14px 10px",background:"#161616",border:"1px solid #1e1e1e",borderRadius:12,padding:"12px 14px"},
  barWrap:{height:6,background:"#222",borderRadius:99},
  barFill:{height:6,background:"linear-gradient(90deg,#E8733A,#f0a060)",borderRadius:99,transition:"width .4s"},
  filtros:{display:"flex",gap:6,padding:"0 14px 10px",flexWrap:"wrap"},
  grupo:{margin:"0 14px 14px",background:"#161616",border:"1px solid #1e1e1e",borderRadius:12,overflow:"hidden"},
  grupoHead:{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#1a1a1a",borderBottom:"1px solid #1e1e1e"},
  grupoLabel:{fontSize:13,fontWeight:600,color:"#ccc",flex:1},grupoCount:{fontSize:12,color:"#555"},
};

function SolicModal({ tarea, yo, empleados, onEnviar, onClose }) {
  const [texto,setTexto]=useState("");
  return (
    <Modal titulo={`Solicitud — ${tarea.nombre}`} onClose={onClose}>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {["¿Puedes hacerte cargo?","Necesito ayuda","Falta material","Ya está listo"].map(s=>(
          <button key={s} className="ks-chip" onClick={()=>setTexto(s)}>{s}</button>
        ))}
      </div>
      <textarea className="ks-input" rows={3} placeholder="Escribe tu solicitud..." value={texto} onChange={e=>setTexto(e.target.value)} style={{resize:"none",fontFamily:"inherit"}}/>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button className="ks-btn-sec" style={{flex:1}} onClick={onClose}>Cancelar</button>
        <button className="ks-btn-primary" style={{flex:1}} onClick={()=>onEnviar(tarea,texto)}>Enviar</button>
      </div>
    </Modal>
  );
}

function RecetaCalculadora({ tarea, resto, onClose }) {
  const recetas=objToArr(resto.recetas||{});
  const productos=objToArr(resto.productos||{});
  const receta=recetas.find(re=>re.id===tarea.recetaId);
  const prodRes=receta?.productoResultadoId?productos.find(p=>p.id===receta.productoResultadoId):null;
  const [modo,setModo]=useState("multiplicador");
  const [multi,setMulti]=useState("1");
  const [refProdId,setRefProdId]=useState("");
  const [refCant,setRefCant]=useState("");
  if(!receta) return null;
  const ingArr=objToArr(receta.ingredientes||{});
  let factor=1;
  if(modo==="multiplicador") factor=parseFloat(multi)||1;
  else {
    const cantNum=parseFloat(refCant)||0;
    if(refProdId==="resultado") factor=receta.cantidadResultado>0?cantNum/receta.cantidadResultado:1;
    else { const ingBase=ingArr.find(i=>i.productoId===refProdId); factor=ingBase&&ingBase.cantidad>0?cantNum/ingBase.cantidad:1; }
  }
  factor=Math.max(0.01,isNaN(factor)?1:factor);
  return (
    <Modal titulo={`🧮 ${receta.nombre}`} onClose={onClose}>
      <div style={{display:"flex",background:"#111",borderRadius:10,padding:3,gap:3}}>
        {[["multiplicador","× Multiplicador"],["ingrediente","Por ingrediente"]].map(([m,l])=>(
          <button key={m} onClick={()=>setModo(m)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",background:modo===m?"#222":"transparent",color:modo===m?"#fff":"#555",fontSize:12,cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
        ))}
      </div>
      {modo==="multiplicador"&&(
        <>
          <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
            {[1,2,3,4,5].map(n=>(<button key={n} className={parseFloat(multi)===n?"ks-btn-primary":"ks-chip"} style={{minWidth:44,padding:"8px 0",fontWeight:700,fontSize:15}} onClick={()=>setMulti(String(n))}>×{n}</button>))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <label className="ks-label" style={{whiteSpace:"nowrap",marginBottom:0}}>Personalizado:</label>
            <input className="ks-input" type="number" min="0.1" step="0.1" placeholder="ej: 2.5" value={multi} onChange={e=>setMulti(e.target.value)} style={{flex:1}}/>
          </div>
        </>
      )}
      {modo==="ingrediente"&&(
        <>
          <label className="ks-label">Calcular en base a:</label>
          <select className="ks-input" value={refProdId} onChange={e=>setRefProdId(e.target.value)}>
            <option value="">— Elige un ingrediente —</option>
            {prodRes&&<option value="resultado">→ {prodRes.nombre} (resultado deseado)</option>}
            {ingArr.map(ing=>{const prod=productos.find(p=>p.id===ing.productoId);return <option key={ing.productoId} value={ing.productoId}>{prod?.nombre} (base: {ing.cantidad} {ing.unidad})</option>;})}
          </select>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input className="ks-input" type="number" min="0" step="0.1" placeholder="Cantidad que tienes/quieres..." value={refCant} onChange={e=>setRefCant(e.target.value)} style={{flex:1}}/>
            <span style={{color:"#888",fontSize:13,whiteSpace:"nowrap"}}>
              {refProdId==="resultado"?receta.unidadResultado:ingArr.find(i=>i.productoId===refProdId)?.unidad||""}
            </span>
          </div>
        </>
      )}
      <div style={{background:"#111",borderRadius:12,padding:"14px"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Cantidades para ×{fmt(factor)} receta</div>
        {ingArr.map((ing,i)=>{
          const prod=productos.find(p=>p.id===ing.productoId);
          const cantE=+(ing.cantidad*factor).toFixed(2);
          const suf=(prod?.stock??0)>=cantE;
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #1a1a1a"}}>
              <div><div style={{fontSize:13,color:"#ddd"}}>{prod?.nombre||"—"}</div><div style={{fontSize:11,color:"#555"}}>Stock: {fmt(prod?.stock??0)} {prod?.unidad}</div></div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:15,fontWeight:700,color:suf?"#4EC9A0":"#E8733A"}}>{cantE} {ing.unidad}</div>
                {!suf&&<div style={{fontSize:10,color:"#E8733A"}}>⚠️ faltan {fmt(cantE-(prod?.stock??0))}</div>}
              </div>
            </div>
          );
        })}
        {prodRes&&<div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",marginTop:4}}><span style={{fontSize:13,color:"#4EC9A0",fontWeight:600}}>✅ Se obtendrán</span><span style={{fontSize:16,fontWeight:800,color:"#4EC9A0"}}>{+(receta.cantidadResultado*factor).toFixed(2)} {receta.unidadResultado} de {prodRes.nombre}</span></div>}
      </div>
      <button className="ks-btn-sec" onClick={onClose}>Cerrar</button>
    </Modal>
  );
}

// ─── TAB STOCK ───────────────────────────────────────────────────────────────

function TabStock({ resto, yo, esJefe, restoId }) {
  const [showAdd,setShowAdd]=useState(false);
  const [modAdd,setModAdd]=useState("catalogo");
  const [busqueda,setBusqueda]=useState("");
  const [selCat,setSelCat]=useState("Todas");
  const [nuevo,setNuevo]=useState({nombre:"",stock:"",minStock:"",unidad:"ud",categoria:"",proveedorId:""});
  const [sel,setSel]=useState([]); // array de {nombre, unidad} para poder editar la unidad
  const productos=objToArr(resto.productos||{});
  const proveedores=objToArr(resto.proveedores||{});
  const recetas=objToArr(resto.recetas||{});
  const empleados=objToArr(resto.empleados||{});

  // Bug fix 2: stock y minStock pueden ser 0, solo bloquear si nombre está vacío
  const agregarProducto=async()=>{
    if(!nuevo.nombre.trim()) return;
    const id=uid();
    await dbSet(`restaurantes/${restoId}/productos/${id}`,{
      id, nombre:nuevo.nombre,
      stock: nuevo.stock===""?0:parseFloat(nuevo.stock),
      minStock: nuevo.minStock===""?0:parseFloat(nuevo.minStock),
      unidad:nuevo.unidad, categoria:nuevo.categoria||"General", proveedorId:nuevo.proveedorId||null
    });
    setNuevo({nombre:"",stock:"",minStock:"",unidad:"ud",categoria:"",proveedorId:""}); setShowAdd(false);
  };

  // Bug fix 1: usar la unidad editada por el usuario, no la del catálogo fijo
  const agregarDesdeCatalogo=async()=>{
    if(!sel.length) return;
    const updates={};
    sel.filter(item=>!productos.find(p=>p.nombre===item.nombre)).forEach(item=>{
      const cat=CATALOGO.find(c=>c.nombre===item.nombre);
      const id=uid();
      updates[`restaurantes/${restoId}/productos/${id}`]={id,nombre:item.nombre,stock:0,minStock:0,unidad:item.unidad,categoria:cat?.categoria||"General",proveedorId:null};
    });
    if(Object.keys(updates).length) await fbMultiUpdate(updates);
    setSel([]); setShowAdd(false); setBusqueda("");
  };

  // Cambiar unidad de un item seleccionado del catálogo
  const cambiarUnidadSel=(nombre,unidad)=>{
    setSel(prev=>prev.map(item=>item.nombre===nombre?{...item,unidad}:item));
  };

  const ajustarStock=async(id,delta)=>{
    const prod=productos.find(p=>p.id===id); if(!prod) return;
    const nuevoStock=Math.max(0,+(prod.stock+delta).toFixed(2));
    await dbSet(`restaurantes/${restoId}/productos/${id}/stock`,nuevoStock);
    const prodActualizado=productos.map(p=>p.id===id?{...p,stock:nuevoStock}:p);
    await checkStockAlertas(restoId,prodActualizado,recetas,empleados,resto.tareas);
  };

  const eliminar=async id=>await dbSet(`restaurantes/${restoId}/productos/${id}`,null);
  const toggleSel=c=>{
    const yaEsta=sel.find(item=>item.nombre===c.nombre);
    if(yaEsta) setSel(prev=>prev.filter(item=>item.nombre!==c.nombre));
    else setSel(prev=>[...prev,{nombre:c.nombre,unidad:c.unidad}]);
  };
  const categorias=[...new Set(productos.map(p=>p.categoria))];
  const catsCatalogo=["Todas",...new Set(CATALOGO.map(c=>c.categoria))];
  const catalogoFiltrado=CATALOGO.filter(c=>!productos.find(p=>p.nombre===c.nombre)&&c.nombre.toLowerCase().includes(busqueda.toLowerCase())&&(selCat==="Todas"||c.categoria===selCat));

  return (
    <div style={{padding:"14px 14px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Inventario</div>
        {esJefe&&<button className="ks-btn-primary" onClick={()=>{setShowAdd(true);setModAdd("catalogo");setSel([]);setBusqueda("");}}>+ Producto</button>}
      </div>
      {productos.filter(p=>p.stock<p.minStock).length>0&&<div style={{background:"#E8733A11",border:"1px solid #E8733A44",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#E8733A"}}>⚠️ {productos.filter(p=>p.stock<p.minStock).length} producto(s) bajo mínimo</div>}
      {categorias.map(cat=>(
        <div key={cat} style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{cat}</div>
          {productos.filter(p=>p.categoria===cat).map(p=>{
            const bajo=p.stock<p.minStock;
            const pct=Math.min(100,Math.round((p.stock/(p.minStock*2||1))*100));
            return (
              <div key={p.id} style={{...SK.card,borderColor:bajo?"#E8733A44":"#1e1e1e"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:14,fontWeight:600,color:bajo?"#E8733A":"#eee"}}>{p.nombre}</div><div style={{fontSize:12,color:"#555",marginTop:2}}>Mín: {p.minStock} {p.unidad}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {esJefe&&<button className="ks-qty-btn" onClick={()=>ajustarStock(p.id,-1)}>−</button>}
                    <span style={{fontSize:15,fontWeight:700,color:bajo?"#E8733A":"#fff",minWidth:60,textAlign:"center"}}>{fmt(p.stock)} {p.unidad}</span>
                    {esJefe&&<button className="ks-qty-btn" onClick={()=>ajustarStock(p.id,1)}>+</button>}
                    {esJefe&&<button className="ks-del" onClick={()=>eliminar(p.id)}>✕</button>}
                  </div>
                </div>
                <div style={{marginTop:8,height:4,background:"#222",borderRadius:99}}><div style={{height:4,width:`${pct}%`,background:bajo?"#E8733A":"#4EC9A0",borderRadius:99,transition:"width .3s"}}/></div>
                {bajo&&<div style={{fontSize:11,color:"#E8733A",marginTop:4}}>⚠️ Stock bajo — añadido a lista de compras</div>}
              </div>
            );
          })}
        </div>
      ))}
      {showAdd&&(
        <Modal titulo="Añadir producto" onClose={()=>{setShowAdd(false);setSel([]);}}>
          <div style={{display:"flex",background:"#111",borderRadius:10,padding:3,gap:3}}>
            {[["catalogo","📋 Catálogo"],["manual","✏️ Personalizado"]].map(([m,l])=>(
              <button key={m} onClick={()=>setModAdd(m)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:modAdd===m?"#222":"transparent",color:modAdd===m?"#fff":"#555",fontSize:13,cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
            ))}
          </div>
          {modAdd==="catalogo"&&(
            <>
              <input className="ks-input" placeholder="🔍 Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} autoFocus/>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {catsCatalogo.slice(0,9).map(c=>(<button key={c} onClick={()=>setSelCat(c)} style={{padding:"3px 10px",borderRadius:20,border:"1px solid",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:selCat===c?"#E8733A":"transparent",color:selCat===c?"#fff":"#666",borderColor:selCat===c?"#E8733A":"#2a2a2a"}}>{c}</button>))}
              </div>
              {sel.length>0&&<div style={{background:"#4EC9A011",border:"1px solid #4EC9A044",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#4EC9A0"}}>✅ {sel.length} seleccionado(s)</div>}
              <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
                {catalogoFiltrado.length===0?<div style={{color:"#444",fontSize:13,textAlign:"center",padding:"20px 0"}}>Sin resultados — prueba el modo personalizado</div>
                  :catalogoFiltrado.map(c=>{
                    const selItem=sel.find(item=>item.nombre===c.nombre);
                    const s=!!selItem;
                    return (
                      <div key={c.nombre} style={{borderRadius:8,border:`1px solid ${s?"#E8733A44":"transparent"}`,background:s?"#E8733A11":"transparent",transition:"all .15s",overflow:"hidden"}}>
                        <div onClick={()=>toggleSel(c)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",cursor:"pointer"}}>
                          <div><div style={{fontSize:13,color:s?"#E8733A":"#ddd",fontWeight:s?600:400}}>{c.nombre}</div><div style={{fontSize:11,color:"#555"}}>{c.categoria}</div></div>
                          <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${s?"#E8733A":"#333"}`,background:s?"#E8733A":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#fff",fontWeight:700}}>{s?"✓":""}</div>
                        </div>
                        {s&&(
                          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 12px 10px"}} onClick={e=>e.stopPropagation()}>
                            <span style={{fontSize:11,color:"#888"}}>Unidad:</span>
                            <select className="ks-input" style={{flex:1,padding:"4px 8px",fontSize:12}} value={selItem.unidad} onChange={e=>cambiarUnidadSel(c.nombre,e.target.value)}>
                              {UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div style={{fontSize:11,color:"#555",textAlign:"center"}}>Se añaden con stock 0. Ajusta el mínimo después.</div>
              <div style={{display:"flex",gap:8}}>
                <button className="ks-btn-sec" style={{flex:1}} onClick={()=>{setShowAdd(false);setSel([]);}}>Cancelar</button>
                <button className="ks-btn-primary" style={{flex:1,opacity:sel.length?1:0.4}} onClick={agregarDesdeCatalogo}>Añadir {sel.length>0?`(${sel.length})`:""}</button>
              </div>
            </>
          )}
          {modAdd==="manual"&&(
            <>
              <label className="ks-label">Nombre</label>
              <input className="ks-input" placeholder="Ej: Caldo dashi" value={nuevo.nombre} onChange={e=>setNuevo(p=>({...p,nombre:e.target.value}))} autoFocus/>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}><label className="ks-label">Stock actual</label><input className="ks-input" type="number" min="0" step="0.1" placeholder="0" value={nuevo.stock} onChange={e=>setNuevo(p=>({...p,stock:e.target.value}))}/></div>
                <div style={{flex:1}}><label className="ks-label">Stock mínimo</label><input className="ks-input" type="number" min="0" step="0.1" placeholder="0" value={nuevo.minStock} onChange={e=>setNuevo(p=>({...p,minStock:e.target.value}))}/></div>
              </div>
              <label className="ks-label">Unidad</label>
              <select className="ks-input" value={nuevo.unidad} onChange={e=>setNuevo(p=>({...p,unidad:e.target.value}))}>{UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}</select>
              <label className="ks-label">Categoría</label>
              <input className="ks-input" placeholder="Ej: Caldos, Carnes..." value={nuevo.categoria} onChange={e=>setNuevo(p=>({...p,categoria:e.target.value}))}/>
              <label className="ks-label">Proveedor</label>
              <select className="ks-input" value={nuevo.proveedorId} onChange={e=>setNuevo(p=>({...p,proveedorId:e.target.value}))}>
                <option value="">— Sin proveedor —</option>
                {proveedores.map(pv=><option key={pv.id} value={pv.id}>{pv.nombre}</option>)}
              </select>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button className="ks-btn-sec" style={{flex:1}} onClick={()=>setShowAdd(false)}>Cancelar</button>
                <button className="ks-btn-primary" style={{flex:1}} onClick={agregarProducto}>Añadir</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
const SK={card:{background:"#161616",border:"1px solid #1e1e1e",borderRadius:10,padding:"12px 14px",marginBottom:8}};

// ─── TAB RECETAS ─────────────────────────────────────────────────────────────

// ─── CONSTANTES IA ───────────────────────────────────────────────────────────
const GEMINI_KEY   = import.meta.env.VITE_GEMINI_KEY || "";
const CLD_CLOUD    = "dlqumdwzd";
const CLD_PRESET   = "ml_default";

async function subirCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLD_PRESET);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/auto/upload`, { method:"POST", body:fd });
  const d = await r.json();
  if (!d.secure_url) throw new Error("Error subiendo archivo");
  return { url: d.secure_url, tipo: d.resource_type, formato: d.format };
}

async function extraerRecetaConGemini(file, fileUrl) {
  const toBase64 = f => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(f); });
  const b64 = await toBase64(file);
  const mimeType = file.type || "application/pdf";

  const prompt = `Eres un asistente de cocina profesional. Analiza este documento (puede ser una imagen o PDF con una o varias recetas) y extrae TODAS las recetas que encuentres.

Devuelve ÚNICAMENTE un JSON válido con este formato exacto, sin markdown, sin texto extra, sin explicaciones:
{
  "recetas": [
    {
      "nombre": "nombre del plato",
      "descripcion": "descripción breve del método de elaboración",
      "ingredientes": [
        {"nombre": "nombre ingrediente", "cantidad": número, "unidad": "kg|g|L|ml|ud|bote|caja|bolsa|ración"}
      ]
    }
  ]
}

Reglas importantes:
- Si solo hay una receta, el array "recetas" tendrá un solo elemento
- Si hay varias recetas, inclúyelas todas en el array
- Las cantidades deben ser números (no texto)
- Si no puedes determinar una cantidad exacta, usa 1
- Las unidades deben ser una de las listadas, elige la más apropiada
- Si no encuentras descripción, usa string vacío`;

  const body = {
    contents:[{ parts:[
      { text: prompt },
      { inline_data:{ mime_type: mimeType, data: b64 } }
    ]}],
    generationConfig:{ temperature:0.1, maxOutputTokens:4000 }
  };

  const modelos = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro-vision",
  ];

  let texto = "";
  let ultimoError = null;

  for (const modelo of modelos) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${GEMINI_KEY}`;
      const resp = await fetch(endpoint, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
      });
      if (!resp.ok) { ultimoError = `${modelo}: ${resp.status}`; continue; }
      const d = await resp.json();
      texto = d.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (texto) break;
    } catch(e) { ultimoError = e.message; continue; }
  }

  if (!texto) throw new Error("No se pudo conectar con Gemini: " + ultimoError);
  const limpio = texto.replace(/```json|```/g,"").trim();
  const parsed = JSON.parse(limpio);
  if(parsed.recetas) return parsed.recetas;
  if(Array.isArray(parsed)) return parsed;
  return [parsed];
}

// ─── TAB RECETAS ─────────────────────────────────────────────────────────────

function TabRecetas({ resto, yo, esJefe, restoId }) {
  const [showAdd,setShowAdd]   = useState(false);
  const [modoAdd,setModoAdd]   = useState("manual"); // "manual" | "ia"
  const [detalle,setDetalle]   = useState(null);
  const [nueva,setNueva]       = useState({nombre:"",descripcion:"",responsableId:"",productoResultadoId:"",cantidadResultado:"",unidadResultado:"ud",ingredientes:{}});
  const [ingTmp,setIngTmp]     = useState({productoId:"",cantidad:"",unidad:"ud"});
  // IA
  const [iaFile,setIaFile]         = useState(null);
  const [iaPreview,setIaPreview]   = useState(null); // url preview imagen
  const [iaEstado,setIaEstado]     = useState("idle"); // idle | subiendo | analizando | listo | error
  const [iaResultado,setIaResultado] = useState(null); // resultado de Gemini
  const [iaIngExtras,setIaIngExtras] = useState([]); // ingredientes extraídos no en DB
  const [archivoUrl,setArchivoUrl]   = useState(""); // url cloudinary del archivo

  const productos  = objToArr(resto.productos||{});
  const recetas    = objToArr(resto.recetas||{});
  const empleados  = objToArr(resto.empleados||{});

  const addIng=()=>{ if(!ingTmp.productoId||!ingTmp.cantidad)return; const id=uid(); setNueva(p=>({...p,ingredientes:{...p.ingredientes,[id]:{...ingTmp,id}}})); setIngTmp({productoId:"",cantidad:"",unidad:"ud"}); };

  const crearReceta=async()=>{
    if(!nueva.nombre) return;
    const id=uid();
    const datos={...nueva,id,cantidadResultado:parseFloat(nueva.cantidadResultado)||0};
    if(archivoUrl) datos.archivoUrl=archivoUrl;
    await dbSet(`restaurantes/${restoId}/recetas/${id}`,datos);
    setNueva({nombre:"",descripcion:"",responsableId:"",productoResultadoId:"",cantidadResultado:"",unidadResultado:"ud",ingredientes:{}});
    setArchivoUrl(""); setShowAdd(false);
  };

  const eliminarReceta=async id=>await dbSet(`restaurantes/${restoId}/recetas/${id}`,null);

  const resetIA=()=>{ setIaFile(null); setIaPreview(null); setIaEstado("idle"); setIaResultado(null); setIaIngExtras([]); setArchivoUrl(""); };
  const resetModal=()=>{ setShowAdd(false); setModoAdd("manual"); resetIA(); setNueva({nombre:"",descripcion:"",responsableId:"",productoResultadoId:"",cantidadResultado:"",unidadResultado:"ud",ingredientes:{}}); };

  // Subir archivo y analizar con Gemini
  const procesarArchivo=async(file)=>{
    setIaFile(file); setIaEstado("subiendo"); setIaResultado(null);
    if(file.type.startsWith("image/")) setIaPreview(URL.createObjectURL(file));
    else setIaPreview(null);
    try {
      const {url} = await subirCloudinary(file);
      setArchivoUrl(url);
      setIaEstado("analizando");
      const recetas = await extraerRecetaConGemini(file, url);
      // Para cada receta detectada, calcular qué ingredientes están en DB y cuáles no
      const recetasProcesadas = recetas.map(re=>{
        const ingsEnDB={};
        const ingsExtras=[];
        (re.ingredientes||[]).forEach(ing=>{
          const prod=productos.find(p=>p.nombre.toLowerCase()===ing.nombre.toLowerCase());
          const id=uid();
          if(prod) ingsEnDB[id]={id,productoId:prod.id,cantidad:ing.cantidad,unidad:ing.unidad||"ud"};
          else ingsExtras.push({...ing,id});
        });
        return { ...re, ingsEnDB, ingsExtras, seleccionada:true };
      });
      setIaResultado(recetasProcesadas);
      setIaEstado("listo");
    } catch(e) {
      console.error(e);
      setIaEstado("error");
    }
  };

  // Guardar todas las recetas seleccionadas de una vez
  const guardarRecetasIA=async()=>{
    if(!iaResultado?.length) return;
    const updates={};
    iaResultado.filter(re=>re.seleccionada).forEach(re=>{
      const id=uid();
      updates[`restaurantes/${restoId}/recetas/${id}`]={
        id, nombre:re.nombre, descripcion:re.descripcion||"",
        responsableId:"", productoResultadoId:"", cantidadResultado:0, unidadResultado:"ud",
        ingredientes:re.ingsEnDB, archivoUrl:archivoUrl, ts:Date.now()
      };
    });
    if(Object.keys(updates).length) await fbMultiUpdate(updates);
    resetModal();
  };

  const [editando, setEditando] = useState(null); // receta completa siendo editada

  const abrirEditar = (re) => {
    setEditando({ ...re, ingredientes: re.ingredientes||{}, cantidadResultado: re.cantidadResultado||0 });
  };

  const guardarEdicion = async () => {
    if(!editando?.nombre) return;
    await dbSet(`restaurantes/${restoId}/recetas/${editando.id}`, {
      ...editando,
      cantidadResultado: parseFloat(editando.cantidadResultado)||0,
    });
    setEditando(null);
  };

  const editIngAdd = () => {
    if(!ingTmp.productoId||!ingTmp.cantidad) return;
    const id=uid();
    setEditando(p=>({...p, ingredientes:{...p.ingredientes,[id]:{...ingTmp,id}}}));
    setIngTmp({productoId:"",cantidad:"",unidad:"ud"});
  };

  const editIngRemove = (id) => {
    setEditando(p=>{ const ings={...p.ingredientes}; delete ings[id]; return {...p,ingredientes:ings}; });
  };

  return (
    <div style={{padding:"14px 14px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Recetas</div>
        {esJefe&&<button className="ks-btn-primary" onClick={()=>setShowAdd(true)}>+ Receta</button>}
      </div>

      {recetas.length===0&&<div style={{color:"#444",fontSize:14,textAlign:"center",marginTop:40}}>Sin recetas.{esJefe?" Crea la primera →":""}</div>}

      {recetas.map(re=>{
        const resp=re.responsableId?empleados.find(e=>e.id===re.responsableId):null;
        const prodRes=re.productoResultadoId?productos.find(p=>p.id===re.productoResultadoId):null;
        const isOpen=detalle===re.id;
        const ings=objToArr(re.ingredientes||{});
        return (
          <div key={re.id} style={RE.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{re.nombre}</div>
                {re.descripcion&&<div style={{fontSize:12,color:"#666",marginTop:2}}>{re.descripcion}</div>}
                <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                  {resp&&<span style={{fontSize:12,color:"#888"}}>{ROLES[resp.rol]?.icon} {resp.nombre}</span>}
                  {prodRes&&<span style={{fontSize:12,color:"#4EC9A0",background:"#4EC9A011",padding:"2px 8px",borderRadius:99}}>+{re.cantidadResultado} {re.unidadResultado} → {prodRes.nombre}</span>}
                  {re.archivoUrl&&<a href={re.archivoUrl} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#7B6FB0",background:"#7B6FB011",padding:"2px 8px",borderRadius:99,textDecoration:"none"}}>📎 Ver archivo</a>}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="ks-chip" onClick={()=>setDetalle(isOpen?null:re.id)}>{isOpen?"Cerrar":"Ver"}</button>
                {esJefe&&<button className="ks-chip" style={{color:"#D4A017",borderColor:"#D4A01744"}} onClick={()=>abrirEditar(re)}>✏️</button>}
                {esJefe&&<button className="ks-del" onClick={()=>eliminarReceta(re.id)}>✕</button>}
              </div>
            </div>
            {isOpen&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #222"}}>
                {re.archivoUrl&&re.archivoUrl.match(/\.(jpg|jpeg|png|webp)/i)&&(
                  <img src={re.archivoUrl} alt="receta" style={{width:"100%",borderRadius:8,marginBottom:10,maxHeight:200,objectFit:"cover"}}/>
                )}
                <div style={{fontSize:12,fontWeight:700,color:"#888",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Ingredientes</div>
                {ings.length===0?<div style={{fontSize:13,color:"#444"}}>Sin ingredientes</div>
                  :ings.map((ing,i)=>{const prod=productos.find(p=>p.id===ing.productoId);return(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1a1a1a",fontSize:13}}><span style={{color:"#ccc"}}>{prod?.nombre||ing.nombre||"—"}</span><span style={{color:"#888"}}>{ing.cantidad} {ing.unidad}</span></div>);})}
                {prodRes&&<div style={{marginTop:10,fontSize:13,color:"#4EC9A0",background:"#4EC9A011",padding:"8px 10px",borderRadius:8}}>✅ Al completar → +<b>{re.cantidadResultado} {re.unidadResultado}</b> de <b>{prodRes.nombre}</b></div>}
              </div>
            )}
          </div>
        );
      })}

      {showAdd&&(
        <Modal titulo="Nueva receta" onClose={resetModal}>
          {/* Tabs manual / IA */}
          <div style={{display:"flex",background:"#111",borderRadius:10,padding:3,gap:3}}>
            {[["manual","✏️ Manual"],["ia","🤖 Subir foto/PDF"]].map(([m,l])=>(
              <button key={m} onClick={()=>{setModoAdd(m);resetIA();}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:modoAdd===m?"#222":"transparent",color:modoAdd===m?"#fff":"#555",fontSize:13,cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
            ))}
          </div>

          {/* MODO IA */}
          {modoAdd==="ia"&&(
            <>
              {iaEstado==="idle"&&(
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"24px 16px",border:"2px dashed #2a2a2a",borderRadius:12,cursor:"pointer",background:"#111"}}>
                  <span style={{fontSize:36}}>📸</span>
                  <span style={{fontSize:14,color:"#888",textAlign:"center"}}>Sube una foto o PDF de la receta<br/><span style={{fontSize:12,color:"#555"}}>y la IA extraerá los ingredientes</span></span>
                  <input type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>{ if(e.target.files[0]) procesarArchivo(e.target.files[0]); }}/>
                  <span style={{background:"#E8733A",color:"#fff",padding:"8px 20px",borderRadius:10,fontSize:13,fontWeight:700}}>Elegir archivo</span>
                </label>
              )}

              {(iaEstado==="subiendo"||iaEstado==="analizando")&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"24px 0"}}>
                  <div className="ks-spinner"/>
                  <div style={{fontSize:13,color:"#888"}}>{iaEstado==="subiendo"?"Subiendo archivo...":"Analizando con IA..."}</div>
                </div>
              )}

              {iaEstado==="error"&&(
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{fontSize:14,color:"#e05555",marginBottom:12}}>❌ No se pudo leer la receta</div>
                  <button className="ks-btn-sec" onClick={resetIA}>Intentar de nuevo</button>
                </div>
              )}

              {iaEstado==="listo"&&iaResultado&&(
                <>
                  <div style={{background:"#4EC9A011",border:"1px solid #4EC9A044",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#4EC9A0"}}>
                    ✅ {iaResultado.length} receta{iaResultado.length>1?"s":""}  detectada{iaResultado.length>1?"s":""} — revisa y guarda
                  </div>
                  {iaPreview&&<img src={iaPreview} alt="preview" style={{width:"100%",borderRadius:8,maxHeight:120,objectFit:"cover"}}/>}

                  {iaResultado.map((re,idx)=>(
                    <div key={idx} style={{background:"#111",border:`1px solid ${re.seleccionada?"#E8733A44":"#222"}`,borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",gap:8}}>
                      {/* Cabecera con checkbox */}
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button
                          className={`ks-check${re.seleccionada?" ks-check-done":""}`}
                          onClick={()=>setIaResultado(prev=>prev.map((r,i)=>i===idx?{...r,seleccionada:!r.seleccionada}:r))}>
                          {re.seleccionada?"✓":""}
                        </button>
                        <div style={{flex:1}}>
                          <input className="ks-input" style={{fontWeight:700,fontSize:14}} value={re.nombre}
                            onChange={e=>setIaResultado(prev=>prev.map((r,i)=>i===idx?{...r,nombre:e.target.value}:r))}/>
                        </div>
                      </div>

                      {re.descripcion&&<div style={{fontSize:12,color:"#666",paddingLeft:32}}>{re.descripcion}</div>}

                      {/* Ingredientes en DB */}
                      {Object.values(re.ingsEnDB||{}).length>0&&(
                        <div style={{paddingLeft:32}}>
                          <div style={{fontSize:11,color:"#4EC9A0",fontWeight:700,marginBottom:4}}>✅ En inventario</div>
                          {Object.values(re.ingsEnDB).map((ing,i)=>{
                            const prod=productos.find(p=>p.id===ing.productoId);
                            return <div key={i} style={{fontSize:12,color:"#888",display:"flex",justifyContent:"space-between",padding:"2px 0"}}><span>{prod?.nombre}</span><span>{ing.cantidad} {ing.unidad}</span></div>;
                          })}
                        </div>
                      )}

                      {/* Ingredientes NO en DB */}
                      {(re.ingsExtras||[]).length>0&&(
                        <div style={{paddingLeft:32}}>
                          <div style={{fontSize:11,color:"#E8733A",fontWeight:700,marginBottom:4}}>⚠️ No están en inventario</div>
                          {re.ingsExtras.map((ing,i)=>(
                            <div key={i} style={{fontSize:12,color:"#888",display:"flex",justifyContent:"space-between",padding:"2px 0"}}><span style={{color:"#E8733A"}}>{ing.nombre}</span><span>{ing.cantidad} {ing.unidad}</span></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={{fontSize:11,color:"#555",textAlign:"center"}}>
                    {iaResultado.filter(r=>r.seleccionada).length} de {iaResultado.length} receta{iaResultado.length>1?"s":""} seleccionada{iaResultado.filter(r=>r.seleccionada).length>1?"s":""}
                  </div>

                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <button className="ks-btn-sec" style={{flex:1}} onClick={resetIA}>← Volver</button>
                    <button className="ks-btn-primary" style={{flex:1,opacity:iaResultado.filter(r=>r.seleccionada).length?1:0.4}}
                      onClick={guardarRecetasIA}>
                      Guardar {iaResultado.filter(r=>r.seleccionada).length>1?`${iaResultado.filter(r=>r.seleccionada).length} recetas`:"receta"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* MODO MANUAL */}
          {modoAdd==="manual"&&(
            <>
              <label className="ks-label">Nombre</label>
              <input className="ks-input" placeholder="Ej: Fondo de pollo" value={nueva.nombre} onChange={e=>setNueva(p=>({...p,nombre:e.target.value}))} autoFocus/>
              <label className="ks-label">Descripción</label>
              <input className="ks-input" placeholder="Notas de elaboración..." value={nueva.descripcion} onChange={e=>setNueva(p=>({...p,descripcion:e.target.value}))}/>
              <label className="ks-label">Responsable</label>
              <select className="ks-input" value={nueva.responsableId} onChange={e=>setNueva(p=>({...p,responsableId:e.target.value}))}>
                <option value="">— Sin asignar —</option>
                {empleados.map(e=><option key={e.id} value={e.id}>{ROLES[e.rol]?.icon} {e.nombre}</option>)}
              </select>
              <div style={{fontSize:13,fontWeight:600,color:"#888",marginTop:4}}>Ingredientes</div>
              {objToArr(nueva.ingredientes).map((ing,i)=>{const prod=productos.find(p=>p.id===ing.productoId);return(<div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#ccc",padding:"4px 0",borderBottom:"1px solid #1a1a1a"}}><span>{prod?.nombre}</span><span>{ing.cantidad} {ing.unidad}</span></div>);})}
              <div style={{display:"flex",gap:6}}>
                <select className="ks-input" style={{flex:2}} value={ingTmp.productoId} onChange={e=>setIngTmp(p=>({...p,productoId:e.target.value}))}><option value="">Producto...</option>{productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
                <input className="ks-input" style={{flex:1,minWidth:50}} type="number" placeholder="Cant." min="0" step="0.1" value={ingTmp.cantidad} onChange={e=>setIngTmp(p=>({...p,cantidad:e.target.value}))}/>
                <select className="ks-input" style={{flex:1}} value={ingTmp.unidad} onChange={e=>setIngTmp(p=>({...p,unidad:e.target.value}))}>{UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}</select>
                <button className="ks-btn-primary" style={{padding:"0 12px"}} onClick={addIng}>+</button>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:"#888",marginTop:4}}>Producto que genera al completar</div>
              <select className="ks-input" value={nueva.productoResultadoId} onChange={e=>setNueva(p=>({...p,productoResultadoId:e.target.value}))}><option value="">— Ninguno —</option>{productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
              {nueva.productoResultadoId&&(
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}><label className="ks-label">Cantidad</label><input className="ks-input" type="number" min="0" step="0.1" placeholder="0" value={nueva.cantidadResultado} onChange={e=>setNueva(p=>({...p,cantidadResultado:e.target.value}))}/></div>
                  <div style={{flex:1}}><label className="ks-label">Unidad</label><select className="ks-input" value={nueva.unidadResultado} onChange={e=>setNueva(p=>({...p,unidadResultado:e.target.value}))}>{UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button className="ks-btn-sec" style={{flex:1}} onClick={resetModal}>Cancelar</button>
                <button className="ks-btn-primary" style={{flex:1}} onClick={crearReceta}>Guardar</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* MODAL EDITAR RECETA */}
      {editando&&(
        <Modal titulo={`Editar — ${editando.nombre}`} onClose={()=>setEditando(null)}>
          <label className="ks-label">Nombre</label>
          <input className="ks-input" value={editando.nombre} onChange={e=>setEditando(p=>({...p,nombre:e.target.value}))} autoFocus/>
          <label className="ks-label">Descripción</label>
          <input className="ks-input" placeholder="Notas de elaboración..." value={editando.descripcion||""} onChange={e=>setEditando(p=>({...p,descripcion:e.target.value}))}/>
          <label className="ks-label">Responsable</label>
          <select className="ks-input" value={editando.responsableId||""} onChange={e=>setEditando(p=>({...p,responsableId:e.target.value}))}>
            <option value="">— Sin asignar —</option>
            {empleados.map(e=><option key={e.id} value={e.id}>{ROLES[e.rol]?.icon} {e.nombre}</option>)}
          </select>

          <div style={{fontSize:13,fontWeight:600,color:"#888",marginTop:4}}>Ingredientes</div>
          {objToArr(editando.ingredientes).map((ing)=>{
            const prod=productos.find(p=>p.id===ing.productoId);
            return (
              <div key={ing.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,color:"#ccc",padding:"4px 0",borderBottom:"1px solid #1a1a1a"}}>
                <span style={{flex:1}}>{prod?.nombre||"—"}</span>
                <span style={{color:"#888",marginRight:8}}>{ing.cantidad} {ing.unidad}</span>
                <button className="ks-del" onClick={()=>editIngRemove(ing.id)}>✕</button>
              </div>
            );
          })}
          <div style={{display:"flex",gap:6}}>
            <select className="ks-input" style={{flex:2}} value={ingTmp.productoId} onChange={e=>setIngTmp(p=>({...p,productoId:e.target.value}))}>
              <option value="">Producto...</option>
              {productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <input className="ks-input" style={{flex:1,minWidth:50}} type="number" placeholder="Cant." min="0" step="0.1" value={ingTmp.cantidad} onChange={e=>setIngTmp(p=>({...p,cantidad:e.target.value}))}/>
            <select className="ks-input" style={{flex:1}} value={ingTmp.unidad} onChange={e=>setIngTmp(p=>({...p,unidad:e.target.value}))}>{UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}</select>
            <button className="ks-btn-primary" style={{padding:"0 12px"}} onClick={editIngAdd}>+</button>
          </div>

          <div style={{fontSize:13,fontWeight:600,color:"#888",marginTop:4}}>Producto que genera al completar</div>
          <select className="ks-input" value={editando.productoResultadoId||""} onChange={e=>setEditando(p=>({...p,productoResultadoId:e.target.value}))}>
            <option value="">— Ninguno —</option>
            {productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          {editando.productoResultadoId&&(
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}><label className="ks-label">Cantidad</label><input className="ks-input" type="number" min="0" step="0.1" value={editando.cantidadResultado||""} onChange={e=>setEditando(p=>({...p,cantidadResultado:e.target.value}))}/></div>
              <div style={{flex:1}}><label className="ks-label">Unidad</label><select className="ks-input" value={editando.unidadResultado||"ud"} onChange={e=>setEditando(p=>({...p,unidadResultado:e.target.value}))}>{UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
            </div>
          )}

          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button className="ks-btn-sec" style={{flex:1}} onClick={()=>setEditando(null)}>Cancelar</button>
            <button className="ks-btn-primary" style={{flex:1}} onClick={guardarEdicion}>Guardar cambios</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
const RE={card:{background:"#161616",border:"1px solid #1e1e1e",borderRadius:12,padding:"14px",marginBottom:10}};

// ─── TAB COMPRAS ─────────────────────────────────────────────────────────────

function TabCompras({ resto, yo, esJefe, restoId }) {
  const [showAdd,setShowAdd]=useState(false);
  const [nueva,setNueva]=useState({nombre:"",cantidad:"",unidad:"ud"});
  const compras=objToArr(resto.compras||{});

  const toggleHecho=async id=>{const c=compras.find(c=>c.id===id);if(c) await dbSet(`restaurantes/${restoId}/compras/${id}/hecho`,!c.hecho);};
  const eliminar=async id=>await dbSet(`restaurantes/${restoId}/compras/${id}`,null);
  const agregar=async()=>{if(!nueva.nombre||!nueva.cantidad)return;const id=uid();await dbSet(`restaurantes/${restoId}/compras/${id}`,{id,nombre:nueva.nombre,cantidad:parseFloat(nueva.cantidad),unidad:nueva.unidad,auto:false,hecho:false,ts:Date.now()});setNueva({nombre:"",cantidad:"",unidad:"ud"});setShowAdd(false);};
  const limpiarHechos=async()=>{const updates={};compras.filter(c=>c.hecho).forEach(c=>{updates[`restaurantes/${restoId}/compras/${c.id}`]=null;});if(Object.keys(updates).length)await fbMultiUpdate(updates);};

  const pendientes=compras.filter(c=>!c.hecho);
  const hechos=compras.filter(c=>c.hecho);

  return (
    <div style={{padding:"14px 14px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Lista de la compra</div>
        <div style={{display:"flex",gap:8}}>
          {hechos.length>0&&<button className="ks-btn-sec" onClick={limpiarHechos}>Limpiar</button>}
          <button className="ks-btn-primary" onClick={()=>setShowAdd(true)}>+ Añadir</button>
        </div>
      </div>
      {pendientes.length===0&&hechos.length===0&&<div style={{color:"#444",fontSize:14,textAlign:"center",marginTop:40}}>La lista está vacía</div>}
      {pendientes.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Pendiente ({pendientes.length})</div>
          {pendientes.map(c=>(<div key={c.id} style={CP.item}><button className="ks-check" onClick={()=>toggleHecho(c.id)}/><div style={{flex:1}}><div style={{fontSize:14,color:"#eee"}}>{c.nombre}</div><div style={{fontSize:12,color:"#666"}}>{c.cantidad} {c.unidad}{c.auto&&<span style={{color:"#7B6FB0",fontSize:10}}> · auto</span>}</div></div><button className="ks-del" onClick={()=>eliminar(c.id)}>✕</button></div>))}
        </div>
      )}
      {hechos.length>0&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Comprado ({hechos.length})</div>
          {hechos.map(c=>(<div key={c.id} style={{...CP.item,opacity:0.4}}><button className="ks-check ks-check-done" onClick={()=>toggleHecho(c.id)}>✓</button><div style={{flex:1}}><div style={{fontSize:14,color:"#eee",textDecoration:"line-through"}}>{c.nombre}</div><div style={{fontSize:12,color:"#666"}}>{c.cantidad} {c.unidad}</div></div><button className="ks-del" onClick={()=>eliminar(c.id)}>✕</button></div>))}
        </div>
      )}
      {showAdd&&(
        <Modal titulo="Añadir a la compra" onClose={()=>setShowAdd(false)}>
          <label className="ks-label">Producto</label>
          <input className="ks-input" placeholder="Ej: Aceite de sésamo" value={nueva.nombre} onChange={e=>setNueva(p=>({...p,nombre:e.target.value}))} autoFocus/>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><label className="ks-label">Cantidad</label><input className="ks-input" type="number" min="0" step="0.1" value={nueva.cantidad} onChange={e=>setNueva(p=>({...p,cantidad:e.target.value}))}/></div>
            <div style={{flex:1}}><label className="ks-label">Unidad</label><select className="ks-input" value={nueva.unidad} onChange={e=>setNueva(p=>({...p,unidad:e.target.value}))}>{UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button className="ks-btn-sec" style={{flex:1}} onClick={()=>setShowAdd(false)}>Cancelar</button>
            <button className="ks-btn-primary" style={{flex:1}} onClick={agregar}>Añadir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
const CP={item:{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #1a1a1a"}};

// ─── TAB PROVEEDORES ─────────────────────────────────────────────────────────

function TabProveedores({ resto, yo, esJefe, restoId }) {
  const [showAdd,setShowAdd]=useState(false);
  const [detalle,setDetalle]=useState(null);
  const [nuevo,setNuevo]=useState({nombre:"",telefono:"",email:"",diasPedido:[]});
  const proveedores=objToArr(resto.proveedores||{});
  const productos=objToArr(resto.productos||{});
  const hoy=DIAS[new Date().getDay()===0?6:new Date().getDay()-1];

  const agregar=async()=>{if(!nuevo.nombre)return;const id=uid();await dbSet(`restaurantes/${restoId}/proveedores/${id}`,{id,...nuevo});setNuevo({nombre:"",telefono:"",email:"",diasPedido:[]});setShowAdd(false);};
  const eliminar=async id=>{await dbSet(`restaurantes/${restoId}/proveedores/${id}`,null);const updates={};productos.filter(p=>p.proveedorId===id).forEach(p=>{updates[`restaurantes/${restoId}/productos/${p.id}/proveedorId`]=null;});if(Object.keys(updates).length)await fbMultiUpdate(updates);};
  const toggleDia=d=>setNuevo(p=>({...p,diasPedido:p.diasPedido.includes(d)?p.diasPedido.filter(x=>x!==d):[...p.diasPedido,d]}));

  const productosBajos=productos.filter(p=>p.stock<p.minStock);
  const pedidosPorProveedor=proveedores.map(pv=>({proveedor:pv,items:productosBajos.filter(p=>p.proveedorId===pv.id)})).filter(g=>g.items.length>0);
  const sinProveedor=productosBajos.filter(p=>!p.proveedorId);

  return (
    <div style={{padding:"14px 14px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Proveedores</div>
        {esJefe&&<button className="ks-btn-primary" onClick={()=>setShowAdd(true)}>+ Proveedor</button>}
      </div>
      {productosBajos.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:"#E8733A",marginBottom:10}}>⚠️ Pedidos necesarios</div>
          {pedidosPorProveedor.map(({proveedor,items})=>(
            <div key={proveedor.id} style={PV.pedidoCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{proveedor.nombre}</div>
                  {proveedor.diasPedido?.length>0&&<div style={{fontSize:12,color:"#666",marginTop:2}}>📅 {proveedor.diasPedido.join(", ")}{proveedor.diasPedido.includes(hoy)&&<span style={{color:"#4EC9A0",marginLeft:6}}>← hoy</span>}</div>}
                </div>
                <div style={{display:"flex",gap:6}}>
                  {proveedor.telefono&&<a href={`tel:${proveedor.telefono}`} style={{background:"#4EC9A022",color:"#4EC9A0",border:"1px solid #4EC9A044",borderRadius:8,padding:"4px 10px",fontSize:12,textDecoration:"none",fontWeight:600}}>📞</a>}
                  {proveedor.email&&<a href={`mailto:${proveedor.email}?subject=Pedido ${new Date().toLocaleDateString("es-ES")}&body=${items.map(p=>`- ${p.nombre}: ${p.minStock*2} ${p.unidad}`).join("%0A")}`} style={{background:"#7B6FB022",color:"#7B6FB0",border:"1px solid #7B6FB044",borderRadius:8,padding:"4px 10px",fontSize:12,textDecoration:"none",fontWeight:600}}>✉️</a>}
                </div>
              </div>
              {items.map(p=>(<div key={p.id} style={PV.itemRow}><span style={{fontSize:13,color:"#ddd",flex:1}}>{p.nombre}</span><span style={{fontSize:12,color:"#E8733A",marginRight:8}}>{fmt(p.stock)} {p.unidad}</span><span style={{fontSize:12,color:"#4EC9A0",fontWeight:700}}>pedir: {p.minStock*2} {p.unidad}</span></div>))}
            </div>
          ))}
          {sinProveedor.length>0&&(<div style={{...PV.pedidoCard,borderColor:"#555"}}><div style={{fontSize:13,color:"#888",marginBottom:8}}>Sin proveedor asignado</div>{sinProveedor.map(p=>(<div key={p.id} style={PV.itemRow}><span style={{fontSize:13,color:"#ddd",flex:1}}>{p.nombre}</span><span style={{fontSize:12,color:"#E8733A"}}>{fmt(p.stock)} / mín {p.minStock} {p.unidad}</span></div>))}</div>)}
        </div>
      )}
      <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Directorio</div>
      {proveedores.length===0&&<div style={{color:"#444",fontSize:14,textAlign:"center",marginTop:20}}>Sin proveedores.{esJefe?" Añade el primero →":""}</div>}
      {proveedores.map(pv=>{
        const isOpen=detalle===pv.id;
        return (
          <div key={pv.id} style={PV.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{pv.nombre}</div>
                <div style={{display:"flex",gap:12,marginTop:4,flexWrap:"wrap"}}>
                  {pv.telefono&&<span style={{fontSize:12,color:"#888"}}>📞 {pv.telefono}</span>}
                  {pv.email&&<span style={{fontSize:12,color:"#888"}}>✉️ {pv.email}</span>}
                </div>
                {pv.diasPedido?.length>0&&<div style={{marginTop:4,display:"flex",gap:4,flexWrap:"wrap"}}>{pv.diasPedido.map(d=>(<span key={d} style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:d===hoy?"#4EC9A022":"#1e1e1e",color:d===hoy?"#4EC9A0":"#666",fontWeight:600}}>{d}{d===hoy?" ✓":""}</span>))}</div>}
                <div style={{fontSize:11,color:"#555",marginTop:4}}>{productos.filter(p=>p.proveedorId===pv.id).length} producto(s)</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="ks-chip" onClick={()=>setDetalle(isOpen?null:pv.id)}>{isOpen?"Cerrar":"Ver"}</button>
                {esJefe&&<button className="ks-del" onClick={()=>eliminar(pv.id)}>✕</button>}
              </div>
            </div>
            {isOpen&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #222"}}>
                {productos.filter(p=>p.proveedorId===pv.id).length===0?<div style={{fontSize:13,color:"#444"}}>Sin productos asignados</div>
                  :productos.filter(p=>p.proveedorId===pv.id).map(p=>(<div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1a1a1a",fontSize:13}}><span style={{color:"#ccc"}}>{p.nombre}</span><span style={{color:p.stock<p.minStock?"#E8733A":"#888"}}>{fmt(p.stock)} / {p.minStock} {p.unidad}</span></div>))}
              </div>
            )}
          </div>
        );
      })}
      {showAdd&&(
        <Modal titulo="Nuevo proveedor" onClose={()=>setShowAdd(false)}>
          <label className="ks-label">Nombre</label>
          <input className="ks-input" placeholder="Ej: Mercados Atlántico" value={nuevo.nombre} onChange={e=>setNuevo(p=>({...p,nombre:e.target.value}))} autoFocus/>
          <label className="ks-label">Teléfono</label>
          <input className="ks-input" placeholder="922 000 000" value={nuevo.telefono} onChange={e=>setNuevo(p=>({...p,telefono:e.target.value}))}/>
          <label className="ks-label">Email</label>
          <input className="ks-input" placeholder="pedidos@proveedor.es" value={nuevo.email} onChange={e=>setNuevo(p=>({...p,email:e.target.value}))}/>
          <label className="ks-label">Días de pedido</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {DIAS.map(d=>(<button key={d} onClick={()=>toggleDia(d)} style={{padding:"5px 10px",borderRadius:20,border:"1px solid",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:nuevo.diasPedido.includes(d)?"#E8733A":"transparent",color:nuevo.diasPedido.includes(d)?"#fff":"#666",borderColor:nuevo.diasPedido.includes(d)?"#E8733A":"#2a2a2a"}}>{d}</button>))}
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button className="ks-btn-sec" style={{flex:1}} onClick={()=>setShowAdd(false)}>Cancelar</button>
            <button className="ks-btn-primary" style={{flex:1}} onClick={agregar}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
const PV={
  card:{background:"#161616",border:"1px solid #1e1e1e",borderRadius:12,padding:"14px",marginBottom:10},
  pedidoCard:{background:"#1a1212",border:"1px solid #E8733A44",borderRadius:12,padding:"14px",marginBottom:10},
  itemRow:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1a1a1a",gap:8},
};

// ─── TAB EQUIPO ──────────────────────────────────────────────────────────────

function TabEquipo({ resto, yo, esJefe, restoId }) {
  const [showAdd,setShowAdd]=useState(false);
  const [nuevo,setNuevo]=useState({nombre:"",rol:"cocinero",pin:""});
  const empleados=objToArr(resto.empleados||{});
  const tareas=objToArr(resto.tareas||{});

  const agregar=async()=>{if(!nuevo.nombre)return;const id=uid();await dbSet(`restaurantes/${restoId}/empleados/${id}`,{id,nombre:nuevo.nombre,rol:nuevo.rol,pin:nuevo.pin});setNuevo({nombre:"",rol:"cocinero",pin:""});setShowAdd(false);};
  const eliminar=async id=>{if(id===yo.id)return;await dbSet(`restaurantes/${restoId}/empleados/${id}`,null);const updates={};tareas.filter(t=>t.asignado===id).forEach(t=>{updates[`restaurantes/${restoId}/tareas/${t.id}/asignado`]=null;});if(Object.keys(updates).length)await fbMultiUpdate(updates);};

  return (
    <div style={{padding:"14px 14px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>Equipo</div>
        {esJefe&&<button className="ks-btn-primary" onClick={()=>setShowAdd(true)}>+ Añadir</button>}
      </div>
      <div style={{background:"#161616",border:"1px solid #1e1e1e",borderRadius:12,overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"10px 14px",background:"#1a1a1a",fontSize:12,borderBottom:"1px solid #1e1e1e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#555"}}>Código del restaurante:</span>
          <b style={{color:"#E8733A",fontFamily:"monospace",fontSize:16,letterSpacing:2}}>{resto.id}</b>
        </div>
        {empleados.map(e=>{
          const tot=tareas.filter(t=>t.asignado===e.id).length;
          const hec=tareas.filter(t=>t.asignado===e.id&&t.completado).length;
          return (
            <div key={e.id} style={EQ.row}>
              <div style={{...EQ.avatar,background:ROLES[e.rol]?.color+"22",color:ROLES[e.rol]?.color}}>{e.nombre[0].toUpperCase()}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"#eee"}}>{e.nombre}{e.id===yo.id&&<span style={{fontSize:10,color:"#555",marginLeft:6}}>(tú)</span>}</div>
                <div style={{fontSize:12,color:ROLES[e.rol]?.color}}>{ROLES[e.rol]?.icon} {ROLES[e.rol]?.label}</div>
                <div style={{fontSize:11,color:"#555",marginTop:2}}>{hec}/{tot} tareas hoy</div>
              </div>
              {esJefe&&e.id!==yo.id&&<button className="ks-del" onClick={()=>eliminar(e.id)}>✕</button>}
            </div>
          );
        })}
      </div>
      {showAdd&&(
        <Modal titulo="Nuevo empleado" onClose={()=>setShowAdd(false)}>
          <label className="ks-label">Nombre</label>
          <input className="ks-input" placeholder="Nombre del empleado" value={nuevo.nombre} onChange={e=>setNuevo(p=>({...p,nombre:e.target.value}))} autoFocus/>
          <label className="ks-label">Rol</label>
          <select className="ks-input" value={nuevo.rol} onChange={e=>setNuevo(p=>({...p,rol:e.target.value}))}>
            {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
          <label className="ks-label">PIN (opcional)</label>
          <input className="ks-input" type="password" placeholder="4-6 dígitos" value={nuevo.pin} onChange={e=>setNuevo(p=>({...p,pin:e.target.value}))} maxLength={6}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button className="ks-btn-sec" style={{flex:1}} onClick={()=>setShowAdd(false)}>Cancelar</button>
            <button className="ks-btn-primary" style={{flex:1}} onClick={agregar}>Añadir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
const EQ={
  row:{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderBottom:"1px solid #1a1a1a"},
  avatar:{width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,flexShrink:0},
};

// ─── MODAL ───────────────────────────────────────────────────────────────────

function Modal({ titulo, onClose, children }) {
  return (
    <div style={MO.overlay} onClick={onClose}>
      <div style={MO.box} onClick={e=>e.stopPropagation()}>
        <div style={MO.header}>
          <div style={MO.titulo}>{titulo}</div>
          <button className="ks-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{children}</div>
      </div>
    </div>
  );
}
const MO={
  overlay:{position:"fixed",inset:0,background:"#000b",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:500},
  box:{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:"20px 20px 0 0",padding:"20px 20px 32px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxSizing:"border-box"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16},
  titulo:{fontSize:16,fontWeight:700,color:"#fff"},
};

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;}body{margin:0;background:#0d0d0d;}
.ks-input{background:#111;border:1px solid #2a2a2a;color:#eee;border-radius:10px;padding:10px 12px;font-size:14px;outline:none;width:100%;font-family:'DM Sans',sans-serif;transition:border-color .2s;}
.ks-input:focus{border-color:#E8733A;}
.ks-label{font-size:12px;color:#666;font-family:'DM Sans',sans-serif;display:block;margin-bottom:-4px;}
.ks-btn-primary{background:#E8733A;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity .2s;}
.ks-btn-primary:hover{opacity:.85;}
.ks-btn-primary:disabled{opacity:.4;cursor:not-allowed;}
.ks-btn-sec{background:#1e1e1e;color:#888;border:1px solid #2a2a2a;border-radius:10px;padding:9px 14px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .2s;}
.ks-btn-sec:hover{background:#252525;}
.ks-logout{background:transparent;color:#444;border:1px solid #222;border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.ks-logout:hover{color:#888;}
.ks-icon-btn{background:transparent;border:none;color:#888;font-size:18px;cursor:pointer;padding:4px 6px;border-radius:8px;position:relative;}
.ks-icon-btn:hover{background:#1e1e1e;}
.ks-nav-btn{transition:color .2s;}
.ks-filtro{background:transparent;border:1px solid #2a2a2a;color:#666;border-radius:20px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
.ks-filtro:hover{background:#1e1e1e;color:#ccc;}
.ks-tarea-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #1a1a1a;transition:background .15s;}
.ks-tarea-row:hover{background:#181818;}
.ks-check{width:22px;height:22px;border-radius:7px;border:2px solid #2a2a2a;background:transparent;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:700;transition:all .2s;}
.ks-check:hover{border-color:#E8733A;}
.ks-check-done{background:#E8733A!important;border-color:#E8733A!important;}
.ks-del{background:transparent;border:none;color:#333;font-size:13px;cursor:pointer;padding:4px 6px;border-radius:6px;transition:color .2s;font-family:'DM Sans',sans-serif;}
.ks-del:hover{color:#e05555;}
.ks-solic-btn{background:#7B6FB011;color:#7B6FB0;border:1px solid #7B6FB044;border-radius:8px;padding:3px 9px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.ks-solic-btn:hover{background:#7B6FB022;}
.ks-calc-btn{background:#D4A01722;color:#D4A017;border:1px solid #D4A01744;border-radius:8px;padding:3px 9px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.ks-calc-btn:hover{background:#D4A01733;}
.ks-chip{background:#1e1e1e;border:1px solid #2a2a2a;color:#888;border-radius:20px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.ks-chip:hover{background:#252525;color:#ccc;}
.ks-qty-btn{width:28px;height:28px;border-radius:8px;border:1px solid #2a2a2a;background:#1e1e1e;color:#eee;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;}
.ks-qty-btn:hover{background:#2a2a2a;}
.ks-emp-btn{background:#111;border:1px solid #222;border-radius:12px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;}
.ks-emp-btn:hover{background:#1a1a1a;}
.ks-spinner{width:32px;height:32px;border:3px solid #222;border-top-color:#E8733A;border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:99px;}
`;
