// Passwort-Sperre im Browser (Vorschau-Build PAGES=1 und die Live-Seite über scripts/apply-gate.mjs).
// Schlichte Sperre: sie blendet die Seite aus und fragt nach dem Passwort. Sie ist KEIN echter Zugriffsschutz
// (der HTML-Text steht weiter in den ausgelieferten Dateien, das Repository ist öffentlich); sie hält zufällige
// Besucher und Suchmaschinen fern. Freischaltung gilt für die Browser-Sitzung.
import { readFileSync } from 'node:fs'

/**
 * Passwort als gesalzener PBKDF2-Hash (SHA-256, 250 000 Runden), kein Klartext im Repository.
 * Neues Passwort: node scripts/gate-hash.mjs 'NEUES-PASSWORT' und die Ausgabe hier einsetzen.
 */
export const GATE = {
  salt: '88a8f335ee03ccbdf33ea340710f1126',
  iterations: 250000,
  hash: 'a474b3de87444a9ab53f0043add115249534bdce8b9363ed946695d880ec69ae',
}

const GATE_CSS = `
html.cs-locked,html.cs-locked body{overflow:hidden!important}
html.cs-locked #root{visibility:hidden}
html.cs-locked #cs-gate{display:flex!important;position:fixed;inset:0;z-index:2147483647;align-items:center;justify-content:center;padding:16px;background:radial-gradient(circle at 85% 10%,rgba(31,94,255,.10),transparent 55%),#eef4fc;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0a1628}
#cs-gate form{width:100%;max-width:400px;background:#fff;border-radius:28px;padding:36px 28px;box-shadow:0 30px 60px -30px rgba(10,22,40,.25);border:1px solid #e2e8f0;text-align:center}
#cs-gate .logo{height:34px;width:auto;margin:0 auto 22px;display:block}
#cs-gate h1{font-size:22px;line-height:1.25;font-weight:600;letter-spacing:-.02em;margin:0}
#cs-gate p{font-size:15px;line-height:1.55;color:#5b6b82;margin:10px 0 24px}
#cs-gate label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#cs-gate input{width:100%;box-sizing:border-box;height:52px;border-radius:14px;border:0;box-shadow:inset 0 0 0 1px #e2e8f0;padding:0 16px;font:inherit;font-size:16px;color:#0a1628;outline:none}
#cs-gate input:focus{box-shadow:inset 0 0 0 2px #1f5eff}
#cs-gate input[aria-invalid=true]{box-shadow:inset 0 0 0 2px #dc2626}
#cs-gate button{margin-top:12px;width:100%;height:52px;border:0;border-radius:999px;background:#1f5eff;color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 12px 30px -12px rgba(31,94,255,.6)}
#cs-gate button:hover{background:#1a4fe0}
#cs-gate .err{min-height:20px;margin:10px 0 0;font-size:14px;color:#dc2626}
#cs-gate .note{margin:18px 0 0;font-size:12px;color:#5b6b82}
`.replace(/\n/g, '')

export const PREVIEW_TEXT = {
  title: 'Vorschau der neuen Website',
  text: 'Diese Vorschau ist nur für ausgewählte Personen. Bitte geben Sie das Passwort ein.',
  button: 'Vorschau öffnen',
  note: 'Vorschau-Version · nicht öffentlich',
}
export const LIVE_TEXT = {
  title: 'Geschützte Website',
  text: 'Diese Website ist nur mit Passwort zugänglich. Bitte geben Sie das Passwort ein.',
  button: 'Öffnen',
  note: '',
}

export function previewGateHead() {
  // Die CSS-Regeln setzt das Skript zur Laufzeit ein: Der Build-Optimierer (Beasties) würde Regeln für
  // .cs-locked sonst als ungenutzt entfernen, weil die Klasse erst im Browser gesetzt wird.
  return `<meta name="robots" content="noindex, nofollow">
<script>(function(){var d=document.documentElement,locked=true;try{locked=sessionStorage.getItem('cs-preview')!=='1'}catch(e){}
if(!locked)return;d.classList.add('cs-locked');var s=document.createElement('style');s.id='cs-gate-css';s.textContent=${JSON.stringify(GATE_CSS)};document.head.appendChild(s)})()</script>`
}

export function previewGateBody(t = PREVIEW_TEXT) {
  const logo = readFileSync(new URL('../src/assets/brand/logo.svg', import.meta.url), 'utf8').replace('<svg ', '<svg class="logo" aria-hidden="true" ')
  return `<div id="cs-gate" style="display:none" role="dialog" aria-modal="true" aria-labelledby="cs-gate-title">
<form autocomplete="off">
${logo}
<h1 id="cs-gate-title">${t.title}</h1>
<p>${t.text}</p>
<label for="cs-gate-pw">Passwort</label>
<input id="cs-gate-pw" type="password" placeholder="Passwort" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" required>
<button type="submit">${t.button}</button>
<div class="err" aria-live="polite"></div>
${t.note ? `<div class="note">${t.note}</div>` : ''}
</form>
</div>
<script>(function(){var g=document.getElementById('cs-gate');if(!g)return;if(!document.documentElement.classList.contains('cs-locked')){g.remove();return}var f=g.querySelector('form'),i=g.querySelector('input'),e=g.querySelector('.err');
if(document.documentElement.classList.contains('cs-locked'))setTimeout(function(){i.focus()},50);
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
function bytes(h){var a=new Uint8Array(h.length/2);for(var k=0;k<a.length;k++)a[k]=parseInt(h.substr(k*2,2),16);return a}
f.addEventListener('submit',function(ev){ev.preventDefault();var v=i.value.trim();
crypto.subtle.importKey('raw',new TextEncoder().encode(v),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes('${GATE.salt}'),iterations:${GATE.iterations},hash:'SHA-256'},k,256)}).then(function(b){if(hex(b)==='${GATE.hash}'){try{sessionStorage.setItem('cs-preview','1')}catch(x){}document.documentElement.classList.remove('cs-locked');g.remove();var c=document.getElementById('cs-gate-css');if(c)c.remove();window.dispatchEvent(new Event('resize'))}else{i.setAttribute('aria-invalid','true');e.textContent='Das Passwort stimmt nicht.';i.select()}}).catch(function(){e.textContent='Die Prüfung ist in diesem Browser nicht möglich (HTTPS erforderlich).'})})})()</script>`
}
