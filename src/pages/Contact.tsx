import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ContactForm } from '@/features/forms/ContactForm'
import { BookingEmbed } from '@/features/booking/BookingEmbed'
import { CompanyDocs } from '@/features/forms/CompanyDocs'
import { ContactPerson } from '@/components/ui/ContactPerson'
import { company, fullAddress } from '@/content/company'
import { breadcrumbSchema, localBusinessSchema } from '@/lib/schema'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Kontakt', path: '/kontakt' },
]

export default function Contact() {
  const cards = [
    { icon: Phone, label: 'Telefon', value: company.phone.display, href: company.phone.href, note: `Direkt anrufen, ${company.availability}` },
    { icon: Mail, label: 'E-Mail', value: company.email, href: `mailto:${company.email}`, note: `Antwort innerhalb von ${company.promises.responseHours} Stunden` },
    ...(company.whatsapp.enabled
      ? [{ icon: MessageCircle, label: 'WhatsApp', value: 'Nachricht schreiben', href: `https://wa.me/${company.whatsapp.number}`, note: 'Öffnet WhatsApp' }]
      : []),
  ]

  return (
    <>
      <Seo
        title="Kontakt: Reinigungsfirma in Offenburg"
        description={`Kontakt zu CleanStar Dienstleistungen in Offenburg: Telefon ${company.phone.display}, E-Mail ${company.email}. Kostenlose Objektbesichtigung buchen.`}
        path="/kontakt"
        schema={[localBusinessSchema(), breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        image="contact"
        eyebrow="Kontakt"
        title="Sprechen wir über Ihr Objekt."
        lead="Rufen Sie an, schreiben Sie uns oder buchen Sie direkt einen Termin für die kostenlose Besichtigung. Wir melden uns innerhalb von 24 Stunden."
      />

      <section className="py-20 sm:py-28" aria-label="Kontaktwege">
        <div className="container-site grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <ContactPerson className="mb-2" />
            {cards.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex items-center gap-5 rounded-card bg-white p-5 ring-1 ring-line transition hover:shadow-soft hover:ring-blue/30 sm:p-6"
                data-reveal
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue text-white">
                  <c.icon aria-hidden className="size-5" />
                </span>
                <span>
                  <span className="block text-sm text-muted">{c.label}</span>
                  <span className="block text-lg font-semibold break-all text-ink group-hover:text-blue">{c.value}</span>
                  <span className="block text-xs text-muted">{c.note}</span>
                </span>
              </a>
            ))}
            <div className="rounded-card bg-glacier p-6" data-reveal>
              <div className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-blue" />
                <span>
                  <span className="block font-semibold">{company.legalName}</span>
                  <address className="text-muted not-italic">{fullAddress()}</address>
                </span>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Clock aria-hidden className="mt-1 size-5 shrink-0 text-blue" />
                <span>
                  <span className="block font-semibold">Erreichbarkeit</span>
                  <span className="text-muted">{company.availability}. Kein Callcenter: Sie erreichen direkt einen der drei Gründer.</span>
                </span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight" data-reveal>
              Schreiben Sie uns
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <section id="besichtigung" className="scroll-mt-28 bg-glacier py-24 sm:py-32" aria-labelledby="booking-title">
        <div className="container-site">
          <SectionHeading
            eyebrow="Objektbesichtigung"
            title="Kostenlose Besichtigung buchen."
            id="booking-title"
            text="Wir sehen uns Ihre Räume an und schicken Ihnen innerhalb von 48 Stunden ein schriftliches Angebot."
          />
          <div className="mt-12" data-reveal>
            <BookingEmbed />
          </div>
        </div>
      </section>

      <section id="unterlagen" className="scroll-mt-28 py-24 sm:py-32" aria-labelledby="docs-title">
        <div className="container-site">
          <SectionHeading
            eyebrow="Für Einkauf und Verwaltung"
            title="Für Ihre Unterlagen."
            id="docs-title"
            text="Alles, was Sie brauchen, um uns als Dienstleister anzulegen. Zum Kopieren und Herunterladen."
          />
          <div className="mt-12" data-reveal>
            <CompanyDocs />
          </div>
        </div>
      </section>
    </>
  )
}
