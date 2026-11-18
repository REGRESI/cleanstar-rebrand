// Erzeugt Salz und Hash für die Passwort-Sperre (scripts/preview-gate.mjs, Objekt GATE).
// Aufruf: node scripts/gate-hash.mjs 'NEUES-PASSWORT'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
const pw = process.argv[2]
if (!pw) {
  console.error("Aufruf: node scripts/gate-hash.mjs 'PASSWORT'")
  process.exit(1)
}
const salt = randomBytes(16).toString('hex')
const iterations = 250000
const hash = pbkdf2Sync(pw, Buffer.from(salt, 'hex'), iterations, 32, 'sha256').toString('hex')
console.log(JSON.stringify({ salt, iterations, hash }, null, 2))
