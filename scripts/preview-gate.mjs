// Passwortschutz und noindex für die GitHub-Pages-Vorschau (nur Build mit PAGES=1).
// Schlichte Sperre im Browser: hält zufällige Besucher fern, ist aber kein echter Zugriffsschutz
// (das Repository ist öffentlich). Freischaltung gilt für die Browser-Sitzung.
import { readFileSync } from 'node:fs'

/** SHA-256 von „cleanstar2026“. Neues Passwort: node -e "console.log(require('crypto').createHash('sha256').update('NEU').digest('hex'))" */
const HASH = '27579b51f2607f4007a5d806f86039f979d9c5af902404cf6d58e6c5f008b847'

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

export function previewGateHead() {
  // Die CSS-Regeln setzt das Skript zur Laufzeit ein: Der Build-Optimierer (Beasties) würde Regeln für
  // .cs-locked sonst als ungenutzt entfernen, weil die Klasse erst im Browser gesetzt wird.
  return `<meta name="robots" content="noindex, nofollow">
<script>(function(){var d=document.documentElement,locked=true;try{locked=sessionStorage.getItem('cs-preview')!=='1'}catch(e){}
if(!locked)return;d.classList.add('cs-locked');var s=document.createElement('style');s.id='cs-gate-css';s.textContent=${JSON.stringify(GATE_CSS)};document.head.appendChild(s)})()</script>`
}

export function previewGateBody() {
  const logo = readFileSync(new URL('../src/assets/brand/logo.svg', import.meta.url), 'utf8').replace('<svg ', '<svg class="logo" aria-hidden="true" ')
  return `<div id="cs-gate" style="display:none" role="dialog" aria-modal="true" aria-labelledby="cs-gate-title">
<form autocomplete="off">
${logo}
<h1 id="cs-gate-title">Vorschau der neuen Website</h1>
<p>Diese Vorschau ist nur für ausgewählte Personen. Bitte geben Sie das Passwort ein.</p>
<label for="cs-gate-pw">Passwort</label>
<input id="cs-gate-pw" type="password" placeholder="Passwort" autocomplete="current-password" required>
<button type="submit">Vorschau öffnen</button>
<div class="err" aria-live="polite"></div>
<div class="note">Vorschau-Version · nicht öffentlich</div>
</form>
</div>
<script>(function(){var g=document.getElementById('cs-gate');if(!g)return;if(!document.documentElement.classList.contains('cs-locked')){g.remove();return}var f=g.querySelector('form'),i=g.querySelector('input'),e=g.querySelector('.err');
if(document.documentElement.classList.contains('cs-locked'))setTimeout(function(){i.focus()},50);
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
f.addEventListener('submit',function(ev){ev.preventDefault();var v=i.value.trim();
crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)).then(function(b){if(hex(b)==='${HASH}'){try{sessionStorage.setItem('cs-preview','1')}catch(x){}document.documentElement.classList.remove('cs-locked');g.remove();var c=document.getElementById('cs-gate-css');if(c)c.remove();window.dispatchEvent(new Event('resize'))}else{i.setAttribute('aria-invalid','true');e.textContent='Das Passwort stimmt nicht.';i.select()}})})})()</script>`
}
