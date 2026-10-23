import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { ImageBand } from '@/components/ui/ImageBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ContactForm } from '@/features/forms/ContactForm'
import { BookingEmbed } from '@/features/booking/BookingEmbed'
import { CompanyDocs } from '@/features/forms/CompanyDocs'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { company, fullAddress } from '@/content/company'
import { breadcrumbSchema, localBusinessSchema } from '@/lib/schema'
import { RevealText } from '@/components/ui/RevealText'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Kontakt', path: '/kontakt' },
]

export default function Contact() {
  const cards = [
    { label: 'Telefon', value: company.phone.display, href: company.phone.href, note: `Direkt anrufen, ${company.availability}` },
    { label: 'E-Mail', value: company.email, href: `mailto:${company.email}`, note: `Antwort innerhalb von ${company.promises.responseHours} Stunden` },
    ...(company.whatsapp.enabled ? [{ label: 'WhatsApp', value: 'Nachricht schreiben', href: `https://wa.me/${company.whatsapp.number}`, note: 'Öffnet WhatsApp' }] : []),
  ]

  return (
    <>
      <Seo
        title="Kontakt: Reinigungsfirma Offenburg"
        description={`Kontakt zu CleanStar in Offenburg: Telefon ${company.phone.display}, E-Mail ${company.email}, 24/7 erreichbar. Kostenlose Besichtigung direkt buchen.`}
        path="/kontakt"
        schema={[localBusinessSchema(), breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        image="contact"
        caption="Offenburg, Prinz-Eugen-Straße"
        eyebrow="Kontakt"
        title="Sprechen wir über Ihr Objekt."
        lead="Rufen Sie an, schreiben Sie uns oder buchen Sie direkt einen Termin für die kostenlose Besichtigung. Wir melden uns innerhalb von 24 Stunden."
      />

      <section className="section" aria-label="Kontaktwege">
        <div className="container-site grid-site gap-y-16">
          <div className="col-span-12 lg:col-span-5">
            <ContactPerson />
            <ul className="mt-12 border-b border-line">
              {cards.map((c) => (
                <li key={c.label} className="border-t border-line">
                  <a href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group block py-5" data-reveal>
                    <span className="t-label block">{c.label}</span>
                    <span className="ulink mt-2 inline-block text-[1.375rem] font-medium tracking-[-0.02em] min-[420px]:text-[1.625rem]">
                      {c.value.includes('@') ? (
                        <>
                          {c.value.split('@')[0]}@<wbr />
                          {c.value.split('@')[1]}
                        </>
                      ) : (
                        c.value
                      )}
                    </span>
                    <span className="mt-1 block text-[0.9375rem] text-ink-2">{c.note}</span>
                  </a>
                </li>
              ))}
            </ul>
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-[0.8125rem]" data-reveal>
              <dt className="text-muted">Firma</dt>
              <dd>{company.legalName}</dd>
              <dt className="text-muted">Adresse</dt>
              <dd>
                <address className="not-italic">{fullAddress()}</address>
              </dd>
              <dt className="text-muted">Erreichbar</dt>
              <dd>{company.availability}. Kein Callcenter: Sie erreichen direkt einen der drei Gründer.</dd>
            </dl>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="t-label mb-6">Nachricht</p>
            <RevealText as="h2" text="Schreiben Sie uns." className="t-h3 mb-10" />
            <ContactForm />
          </div>
        </div>
      </section>

      <ImageBand id="region" caption="Wir kommen zu Ihnen, im ganzen Ortenaukreis" />
      <section id="besichtigung" className="section scroll-mt-28 bg-surface" aria-labelledby="booking-title">
        <div className="container-site">
          <SectionHeading
            layout="split"
            eyebrow="Objektbesichtigung"
            title="Kostenlose Besichtigung buchen."
            id="booking-title"
            text="Wir sehen uns Ihre Räume an und schicken Ihnen innerhalb von 48 Stunden ein schriftliches Angebot."
          />
          <div className="mt-14 lg:mt-20" data-reveal>
            <BookingEmbed />
          </div>
        </div>
      </section>

      <section id="unterlagen" className="section scroll-mt-28" aria-labelledby="docs-title">
        <div className="container-site">
          <SectionHeading
            layout="split"
            eyebrow="Für Einkauf und Verwaltung"
            title="Für Ihre Unterlagen."
            id="docs-title"
            text="Alles, was Sie brauchen, um uns als Dienstleister anzulegen. Zum Kopieren und Herunterladen."
          />
          <div className="mt-14 lg:mt-20" data-reveal>
            <CompanyDocs />
          </div>
        </div>
      </section>
      <Answer>{`CleanStar erreichen Sie rund um die Uhr telefonisch unter ${company.phone.display} oder per E-Mail an ${company.email}. Unsere Adresse: ${fullAddress()}. Auf Anfragen antworten wir innerhalb von ${company.promises.responseHours} Stunden.`}</Answer>
    </>
  )
}
