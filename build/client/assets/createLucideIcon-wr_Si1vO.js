import{r as o,j as f}from"./chunk-4N6VE7H7-CImIXm7K.js";function L(t,e,n){const r=o.useRef(typeof window<"u"&&"BroadcastChannel"in window?new BroadcastChannel(`${t}-channel`):null);return x(r,"message",e),x(r,"messageerror",n),o.useCallback(s=>{var a;(a=r?.current)==null||a.postMessage(s)},[])}function x(t,e,n=()=>{}){o.useEffect(()=>{const r=t.current;if(r)return r.addEventListener(e,n),()=>r.removeEventListener(e,n)},[e,n])}function B(t){const e=document.createElement("style");e.appendChild(document.createTextNode(`* {
       -webkit-transition: none !important;
       -moz-transition: none !important;
       -o-transition: none !important;
       -ms-transition: none !important;
       transition: none !important;
    }`)),document.head.appendChild(e),t(),setTimeout(()=>{window.getComputedStyle(e).transition,document.head.removeChild(e)},100)}function j({disableTransitions:t=!1}={}){return o.useCallback(e=>{t?B(()=>{e()}):e()},[t])}var E=(t=>(t.DARK="dark",t.LIGHT="light",t))(E||{}),M=Object.values(E),y=o.createContext(void 0);y.displayName="ThemeContext";var v="(prefers-color-scheme: light)",S=()=>window.matchMedia(v).matches?"light":"dark",g=typeof window<"u"?window.matchMedia(v):null;function D({children:t,specifiedTheme:e,themeAction:n,disableTransitionOnThemeChange:r=!1}){const s=j({disableTransitions:r}),[a,u]=o.useState(()=>e?M.includes(e)?e:null:typeof window!="object"?null:S()),[d,m]=o.useState(e?"USER":"SYSTEM"),l=L("remix-themes",i=>{s(()=>{console.log("broadcastThemeChange",r),u(i.data.theme),m(i.data.definedBy)})});o.useEffect(()=>{if(d==="USER")return()=>{};const i=c=>{s(()=>{u(c.matches?"light":"dark")})};return g?.addEventListener("change",i),()=>g?.removeEventListener("change",i)},[s,d]);const h=o.useCallback(i=>{const c=typeof i=="function"?i(a):i;if(c===null){const p=S();s(()=>{u(p),m("SYSTEM"),l({theme:p,definedBy:"SYSTEM"})}),fetch(`${n}`,{method:"POST",body:JSON.stringify({theme:null})})}else s(()=>{u(c),m("USER")}),l({theme:c,definedBy:"USER"}),fetch(`${n}`,{method:"POST",body:JSON.stringify({theme:c})})},[l,s,a,n]),C=o.useMemo(()=>[a,h,{definedBy:d}],[a,h,d]);return f.jsx(y.Provider,{value:C,children:t})}var P=String.raw`
(() => {
  const theme = window.matchMedia(${JSON.stringify(v)}).matches
    ? 'light'
    : 'dark';
  
  const cl = document.documentElement.classList;
  const dataAttr = document.documentElement.dataset.theme;

  if (dataAttr != null) {
    const themeAlreadyApplied = dataAttr === 'light' || dataAttr === 'dark';
    if (!themeAlreadyApplied) {
      document.documentElement.dataset.theme = theme;
    }
  } else {
    const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
    if (!themeAlreadyApplied) {
      cl.add(theme);
    }
  }
  
  const meta = document.querySelector('meta[name=color-scheme]');
  if (meta) {
    if (theme === 'dark') {
      meta.content = 'dark light';
    } else if (theme === 'light') {
      meta.content = 'light dark';
    }
  }
})();
`;function H({ssrTheme:t,nonce:e}){const[n]=R();return f.jsxs(f.Fragment,{children:[f.jsx("meta",{name:"color-scheme",content:n==="light"?"light dark":"dark light"}),t?null:f.jsx("script",{dangerouslySetInnerHTML:{__html:P},nonce:e,suppressHydrationWarning:!0})]})}function R(){const t=o.useContext(y);if(t===void 0)throw new Error("useTheme must be used within a ThemeProvider");return t}const T=(...t)=>t.filter((e,n,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===n).join(" ").trim();const W=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();const $=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,r)=>r?r.toUpperCase():n.toLowerCase());const k=t=>{const e=$(t);return e.charAt(0).toUpperCase()+e.slice(1)};var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const N=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},O=o.createContext({}),U=()=>o.useContext(O),I=o.forwardRef(({color:t,size:e,strokeWidth:n,absoluteStrokeWidth:r,className:s="",children:a,iconNode:u,...d},m)=>{const{size:l=24,strokeWidth:h=2,absoluteStrokeWidth:C=!1,color:i="currentColor",className:c=""}=U()??{},p=r??C?Number(n??h)*24/Number(e??l):n??h;return o.createElement("svg",{ref:m,...w,width:e??l??w.width,height:e??l??w.height,stroke:t??i,strokeWidth:p,className:T("lucide",c,s),...!a&&!N(d)&&{"aria-hidden":"true"},...d},[...u.map(([A,b])=>o.createElement(A,b)),...Array.isArray(a)?a:[a]])});const J=(t,e)=>{const n=o.forwardRef(({className:r,...s},a)=>o.createElement(I,{ref:a,iconNode:e,className:T(`lucide-${W(k(t))}`,`lucide-${t}`,r),...s}));return n.displayName=k(t),n};export{H as P,D as T,E as a,J as c,R as u};
