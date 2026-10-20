import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Fact, Todo } from '@/components/ui/Todo'
import { company } from '@/content/company'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Impressum', path: '/impressum' },
]

export default function Imprint() {
  return (
    <>
      <Seo title="Impressum" description={`Impressum der ${company.legalName}, ${company.address.city}.`} path="/impressum" />
      <PageHero trail={trail} title="Impressum" />
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <div className="prose-cs">
            <h2>Angaben gemäß § 5 DDG</h2>
            <p>
              {company.legalName}
              <br />
              {company.address.street}
              <br />
              {company.address.zip} {company.address.city}
            </p>

            <h2>Vertreten durch die Gesellschafter</h2>
            <p>
              <Fact
                value={company.partners?.join(', ')}
                fallback="[Namen der vertretungsberechtigten Gesellschafter]"
                todo="Gesellschafter aus dem bisherigen Impressum in company.ts (partners) eintragen"
              />
            </p>

            <h2>Kontakt</h2>
            <p>
              Telefon: <a href={company.phone.href}>{company.phone.display}</a>
              <br />
              E-Mail: <a href={`mailto:${company.email}`}>{company.email}</a>
            </p>

            <h2>Umsatzsteuer-ID</h2>
            <p>
              <Fact
                value={company.vatId ? `Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: ${company.vatId}` : null}
                fallback="Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [falls vorhanden eintragen, sonst Abschnitt entfernen]"
                todo="USt-ID prüfen"
              />
            </p>

            <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>
              <Fact value={company.partners?.[0]} fallback="[Name]" todo="Verantwortliche Person eintragen" />, Anschrift wie oben.
            </p>

            <h2>Verbraucherstreitbeilegung</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              <Todo title="Rechtlich prüfen lassen">rechtlich prüfen</Todo>
            </p>

            <h2>Haftung für Inhalte und Links</h2>
            <p>
              Wir erstellen die Inhalte dieser Website mit Sorgfalt. Für die Richtigkeit, Vollständigkeit und Aktualität übernehmen wir dennoch keine Gewähr. Für Inhalte externer
              Websites, auf die wir verlinken, sind ausschließlich deren Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir entsprechende Links
              umgehend.
            </p>

            <h2>Bildnachweise</h2>
            <p>
              <Todo>Bildnachweise ergänzen, sobald echte Fotos eingebunden sind</Todo>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
