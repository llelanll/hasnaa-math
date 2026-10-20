// Small exact helpers: decimal display and fraction arithmetic never use eval.
export const ar=n=>Number(n).toLocaleString('ar-SA',{useGrouping:false,maximumFractionDigits:3});
export const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
export const lcm=(a,b)=>Math.abs(a*b)/gcd(a,b);
export const fraction=(n,d)=>{const g=gcd(n,d);return `${n/g}/${d/g}`;};
export const fracText=(n,d)=>`${ar(n)}/${ar(d)}`;
export function normalize(value){return String(value).trim().replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٫,]/g,'.').replace(/٬/g,'').replace(/[−–]/g,'-').replace(/\s+/g,'');}
export function equivalent(value,answer){
 const canonical=v=>normalize(typeof v==='number'&&Number.isFinite(v)?v.toFixed(9):v),a=canonical(value),b=canonical(answer);
 const rational=s=>{if(s.length>80)return null;const f=s.match(/^([+-]?\d+)\/(\d+)$/);if(f){const d=BigInt(f[2]);return d?[BigInt(f[1]),d]:null;}const m=s.match(/^([+-]?)(\d*)(?:\.(\d*))?$/);if(!m||!(m[2]||m[3]))return null;const digits=(m[2]||'0')+(m[3]||'');return [BigInt((m[1]==='-'?'-':'')+digits),10n**BigInt((m[3]||'').length)];};
 const x=rational(a),y=rational(b);return x&&y?x[0]*y[1]===y[0]*x[1]:a===b;
}
export const roundTo=(n,unit)=>Math.floor(n/unit+0.5)*unit;
export const prime=n=>n>=2&&Array.from({length:Math.max(0,Math.floor(Math.sqrt(n))-1)},(_,i)=>i+2).every(d=>n%d!==0);
export const sum=xs=>xs.reduce((a,b)=>a+b,0);
