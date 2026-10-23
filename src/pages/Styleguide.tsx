import { useState } from 'react'
import { Seo } from '@/components/ui/Seo'
import { Button } from '@/components/ui/Button'
import { Picture } from '@/components/ui/Picture'
import { Accordion } from '@/components/ui/Accordion'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FeatureColumns, InlineLinks, LinkRows, NumberedRows, Stat } from '@/components/ui/Editorial'
import { TextField, ChoiceCard } from '@/features/forms/fields'
import { Segments } from '@/features/tools/ui'
import { company } from '@/content/company'
import type { ImageId } from '@/content/images'

const colors = [
  ['paper', '#F3F1EC', 'Hintergrund'],
  ['surface', '#E9E6DF', 'Abgesetzte Fläche, Bild-Platzhalter'],
  ['ink', '#0E1013', 'Text, 16,9 : 1 auf paper'],
  ['ink-2', '#2A2D31', 'Fließtext sekundär'],
  ['muted', '#54575C', 'Labels, Metadaten, 6,4 : 1'],
  ['night', '#0B0F17', 'Dunkle Schlüsselmomente'],
  ['muted-dark', '#A2A6AD', 'Sekundärtext auf night, 7,9 : 1'],
  ['blue', '#1A4FE0', 'Primärer Button, Links, 5,7 : 1'],
  ['blue-on-dark', '#8DA6FF', 'Links auf night, 8,3 : 1'],
  ['line', 'ink / 16 %', 'Haarlinien'],
] as const

const type = [
  ['t-display', 'Startseite Hero', 'clamp(3rem, 1rem + 7.6vw, 9rem) · 0.96 · −0.045em'],
  ['t-h1', 'Seitenkopf', 'clamp(2.5rem, 1rem + 5.4vw, 6rem) · 1.0 · −0.04em'],
  ['t-h2', 'Abschnitt', 'clamp(2.125rem, 1rem + 3.7vw, 4.5rem) · 1.02 · −0.035em'],
  ['t-h3', 'Unterabschnitt', 'clamp(1.5rem, 1rem + 1.5vw, 2.375rem) · 1.1'],
  ['t-h4', 'Kleiner Titel', '1.25rem · 1.25'],
  ['t-lead', 'Einleitung', 'clamp(1.1875rem, 1rem + 0.6vw, 1.5rem) · 1.45'],
  ['t-body', 'Fließtext', '1.125rem · 1.55 · max. 65 Zeichen'],
  ['t-label', 'Label in Monospace', '0.8125rem · IBM Plex Mono'],
] as const

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-16 lg:py-24">
      <div className="grid-site gap-y-10">
        <div className="col-span-12 lg:col-span-3">
          <p className="t-label">{n}</p>
          <h2 className="t-h4 mt-2">{title}</h2>
        </div>
        <div className="col-span-12 lg:col-span-9">{children}</div>
      </div>
    </section>
  )
}

/** Interne Übersicht aller Bausteine des Design-Systems. Nicht verlinkt, nicht in der Sitemap, noindex. */
export default function Styleguide() {
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a')
  return (
    <>
      <Seo title="Styleguide" description="Interne Übersicht des CleanStar Design-Systems: Farben, Schriften, Raster, Bausteine und Bewegung." path="/styleguide" noindex />
      <div className="container-site pt-28 pb-24 sm:pt-36 lg:pt-44">
        <p className="t-label">Intern · noindex · nicht verlinkt</p>
        <h1 className="t-h1 mt-6">Styleguide</h1>
        <p className="t-lead measure mt-8">
          Ruhig, präzise, selbstbewusst. Wenige Elemente, viel Typografie, strenges Raster, große Bilder. Alle Werte stehen als Tokens in src/styles/index.css.
        </p>

        <Block n="01" title="Farben">
          <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {colors.map(([name, hex, use]) => (
              <li key={name}>
                <span className="block aspect-[4/3] border border-line" style={{ background: `var(--color-${name})` }} />
                <p className="mt-3 font-medium">{name}</p>
                <p className="t-label">{hex}</p>
                <p className="mt-1 text-[0.875rem] text-ink-2">{use}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block n="02" title="Schrift">
          <p className="t-label">Instrument Sans (400, 500, 600) und IBM Plex Mono (400), lokal eingebunden, SIL Open Font License</p>
          <ul className="mt-8 border-t border-line">
            {type.map(([cls, use, spec]) => (
              <li key={cls} className="grid grid-cols-1 gap-2 border-b border-line py-6 lg:grid-cols-[12rem_1fr]">
                <p className="t-label">
                  {cls}
                  <br />
                  {use}
                  <br />
                  {spec}
                </p>
                <p className={cls === 't-display' ? 't-display' : cls}>{cls === 't-label' ? '01 / Leistungen · Offenburg · 24/7' : 'Sauber. Ohne dass Sie nachfragen müssen.'}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block n="03" title="Raster und Abstände">
          <p className="measure text-ink-2">
            12 Spalten, Abstand 20 px (Handy) bzw. 32 px (Desktop). Seitenrand 20 bis 64 px, maximale Breite 1600 px. Abschnitte 96 bis 192 px (.section), kompakt 64 bis 120 px
            (.section-tight). Eckenradius 0 bis 4 px. Keine Schatten außer funktional (Menü, Dialog).
          </p>
          <div className="mt-8 grid grid-cols-12 gap-x-5 lg:gap-x-8">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="flex h-24 items-end bg-surface p-1 font-mono text-[0.625rem] text-muted">
                {i + 1}
              </span>
            ))}
          </div>
        </Block>

        <Block n="04" title="Buttons und Links">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
            <Button arrow>Kostenlose Besichtigung</Button>
            <Button variant="outline">Zweite Aktion</Button>
            <Button variant="link">Textlink mit Pfeil</Button>
            <a href="#" className="link">
              Link im Fließtext
            </a>
            <a href="#" className="ulink">
              Unterstrich beim Überfahren
            </a>
          </div>
          <div className="on-dark mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 bg-night p-8 text-paper">
            <Button arrow>Primär auf dunkel</Button>
            <Button variant="light">Hell</Button>
            <Button variant="outline-dark">Rahmen</Button>
            <Button variant="link">Textlink</Button>
          </div>
        </Block>

        <Block n="05" title="Abschnittsüberschrift">
          <SectionHeading
            layout="split"
            index="01"
            eyebrow="Leistungen"
            title="Wir reinigen Büros. Und zwar richtig."
            text="Label in Monospace, Überschrift über 7 Spalten, Text versetzt rechts."
          />
        </Block>

        <Block n="06" title="Editoriale Zeilen statt Karten">
          <NumberedRows
            items={[
              { title: 'Fester Ansprechpartner', text: 'Eine Person, die Ihr Objekt kennt und direkt erreichbar ist.' },
              { title: 'Vertretung bei Ausfall', text: 'Fällt jemand aus, übernimmt eine eingewiesene Ersatzkraft.' },
              { title: 'Eigene Kontrollen', text: 'Wir prüfen selbst, bevor Sie es müssen.' },
            ]}
            total={8}
          />
          <FeatureColumns
            className="mt-16"
            items={[
              { title: 'Verlässlich', text: 'Wir sind da, wann wir es zugesagt haben.' },
              { title: 'Gründlich', text: 'Auch dort, wo niemand hinsieht.' },
              { title: 'Diskret', text: 'Wir sehen nichts und erzählen nichts.' },
              { title: 'Fair', text: 'Ehrliche Angebote statt Lockpreise.' },
            ]}
          />
        </Block>

        <Block n="07" title="Kennzahlen">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            <Stat value="24 h" label="Antwortzeit auf Ihre Anfrage" />
            <Stat value="48 h" label="bis zum schriftlichen Angebot" />
            <Stat value="34" label="Orte im Ortenaukreis" />
            <Stat value="1" label="fester Ansprechpartner" />
          </div>
        </Block>

        <Block n="08" title="Zitat">
          <figure className="grid grid-cols-[6rem_1fr] gap-6 sm:grid-cols-[9rem_1fr] sm:gap-10">
            <Picture id={company.founders[1].image as ImageId} ratio="4:5" sizes="150px" />
            <blockquote>
              <p className="t-h3">„{company.founders[1].statement}“</p>
              <figcaption className="t-label mt-6">
                {company.founders[1].name}, {company.founders[1].role.replace('Gründer · ', '')}
              </figcaption>
            </blockquote>
          </figure>
        </Block>

        <Block n="09" title="Bild-Slot">
          <Picture id="svc-buero" ratio="21:9" reveal caption="01 / Büroreinigung · Bildunterschrift in Monospace" />
          <p className="mt-6 text-ink-2">Feste Seitenverhältnisse (21:9, 3:2, 4:5, 16:9), einheitliche Farbbehandlung, Aufdecken von unten per clip-path.</p>
        </Block>

        <Block n="10" title="Formulare">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
            <TextField label="Name" placeholder="Vor- und Nachname" />
            <TextField label="Telefon" optional placeholder="0781 …" />
            <fieldset className="sm:col-span-2">
              <legend className="field-label mb-3">Auswahl</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <ChoiceCard type="radio" name="sg" label="Büro" defaultChecked />
                <ChoiceCard type="radio" name="sg" label="Praxis oder Kanzlei" />
                <ChoiceCard type="radio" name="sg" label="Gewerbefläche" />
              </div>
            </fieldset>
            <div className="sm:col-span-2">
              <p className="field-label mb-3">Segmente</p>
              <Segments
                name="sg-seg"
                value={seg}
                onChange={setSeg}
                options={[
                  { id: 'a', label: 'Täglich' },
                  { id: 'b', label: '3 × pro Woche' },
                  { id: 'c', label: 'Wöchentlich' },
                ]}
                className="sm:max-w-md"
              />
            </div>
          </div>
        </Block>

        <Block n="11" title="Akkordeon, Siegel, Ansprechpartner">
          <Accordion
            items={[
              { title: 'Was kostet eine Büroreinigung?', content: '35 bis 45 € brutto pro Mitarbeiterstunde. Den genauen Bedarf klären wir bei der kostenlosen Besichtigung.' },
              { title: 'Wie lange bin ich gebunden?', content: company.contract.firstMonth + ' ' + company.contract.afterwards },
            ]}
          />
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <RiskFreeSeal variant="card" />
            <ContactPerson />
          </div>
        </Block>

        <Block n="12" title="Linklisten">
          <LinkRows
            numbered
            items={[
              { to: '/leistungen/bueroreinigung', label: 'Büroreinigung' },
              { to: '/leistungen/fensterreinigung', label: 'Fensterreinigung' },
            ]}
          />
          <InlineLinks
            className="mt-10"
            items={[
              { to: '/einzugsgebiet/lahr', label: 'Reinigungsfirma Lahr' },
              { to: '/einzugsgebiet/kehl', label: 'Reinigungsfirma Kehl' },
              { to: '/einzugsgebiet', label: 'Alle Orte' },
            ]}
          />
        </Block>

        <Block n="13" title="Bewegung">
          <ul className="border-t border-line">
            {[
              ['Kurve', 'cubic-bezier(0.2, 0.7, 0.1, 1), überall gleich'],
              ['Dauer', '300 bis 900 ms'],
              ['Text', 'Überschriften Zeile für Zeile aus einer Maske, einmalig'],
              ['Bilder', 'Aufdecken von unten per clip-path, kein Zoom, kein Fade'],
              ['Linien', 'Haarlinien zeichnen sich von links nach rechts'],
              ['Links', 'Unterstrich zieht sich zurück und zeichnet sich neu'],
              ['Ohne', 'Kein Federn, kein Hüpfen, keine Magnet-Buttons, kein Custom Cursor; prefers-reduced-motion wird respektiert'],
            ].map(([k, v]) => (
              <li key={k} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-3">
                <span className="t-label pt-0.5">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </>
  )
}
