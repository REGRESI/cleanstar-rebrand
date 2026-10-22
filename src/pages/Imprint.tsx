import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { company, fullAddress } from '@/content/company'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Impressum', path: '/impressum' },
]

export default function Imprint() {
  return (
    <>
      <Seo
        title="Impressum"
        description={`Impressum der ${company.legalName}, ${fullAddress()}: vertretungsberechtigte Gesellschafter, Kontakt und Umsatzsteuer-ID.`}
        path="/impressum"
      />
      <PageHero trail={trail} title="Impressum" />
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <div className="prose-cs">
            <h2>Angaben gemäß § 5 DDG</h2>
            <p>
              {company.legalName}
              <br />
              {company.address.street}
              <br />
              {company.address.zip} {company.address.city}
            </p>

            <h2>Vertreten durch die Gesellschafter</h2>
            <p>{company.partners?.join(', ')}</p>

            <h2>Kontakt</h2>
            <p>
              Telefon: <a href={company.phone.href}>{company.phone.display}</a>
              <br />
              E-Mail: <a href={`mailto:${company.email}`}>{company.email}</a>
            </p>

            <h2>Umsatzsteuer-ID</h2>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {company.vatId}</p>

            <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>{company.partners?.[0]}, Anschrift wie oben.</p>

            <h2>Streitbeilegung für Verbraucher</h2>
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

            <h2>Haftung für Inhalte und Links</h2>
            <p>
              Wir erstellen die Inhalte dieser Website mit Sorgfalt. Für die Richtigkeit, Vollständigkeit und Aktualität übernehmen wir dennoch keine Gewähr. Für Inhalte externer
              Websites, auf die wir verlinken, sind ausschließlich deren Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir entsprechende Links
              umgehend.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
