import { z } from 'zod'
import type { ObjectType } from './QuoteContext'

export const objectTypes: { id: ObjectType; label: string; description: string }[] = [
  { id: 'buero', label: 'Büro', description: 'Arbeitsplätze, Besprechung, Küche, Sanitär' },
  { id: 'praxis', label: 'Praxis / Kanzlei', description: 'Empfang, Wartebereich, Büros' },
  { id: 'gewerbe', label: 'Gewerbefläche', description: 'Laden, Halle, Werkstatt, Lager' },
  { id: 'sonstiges', label: 'Sonstiges', description: 'Treppenhaus, Verein, Schulung …' },
]

export const specialAreas = ['Sanitärräume', 'Duschen', 'Küchen / Teeküchen', 'Sauna / Wellness', 'Treppenhaus', 'Glasflächen'] as const

export const intervals = [
  { id: 'taeglich', label: 'Täglich', visits: 5 },
  { id: '3x', label: '3× pro Woche', visits: 3 },
  { id: '2x', label: '2× pro Woche', visits: 2 },
  { id: 'woechentlich', label: 'Wöchentlich', visits: 1 },
  { id: 'individuell', label: 'Individuell', visits: 0 },
] as const

export const timeSlots = ['Vor Bürobeginn (morgens)', 'Nach Büroschluss (abends)', 'Tagsüber', 'Am Wochenende'] as const

export const extras = [
  { id: 'Fensterreinigung', description: 'Glasflächen, Rahmen, Falze' },
  { id: 'Treppenhausreinigung', description: 'Treppen, Eingang, Aufzug' },
  { id: 'Grundreinigung', description: 'Einmalige Tiefenreinigung, z. B. zum Start' },
  { id: 'Hygienereinigung', description: 'Sanitär, Küchen, Kontaktflächen desinfizieren' },
] as const

export const quoteSchema = z.object({
  objectType: z.enum(['buero', 'praxis', 'gewerbe', 'sonstiges'], { message: 'Bitte wählen Sie eine Objektart.' }),
  areas: z.array(z.string()),
  path: z.enum(['A', 'B'], { message: 'Bitte wählen Sie eine Option.' }),
  staff: z.number().min(1).max(20),
  /** Mitarbeiter, die in den Räumen arbeiten (für Kosten pro Mitarbeiter und Arbeitstag) */
  employees: z.number().min(1).max(2000),
  hours: z.number().min(0.5).max(12),
  visits: z.number().min(1).max(7),
  area: z.number().min(20).max(10000),
  floors: z.number().min(1).max(30),
  interval: z.string().min(1, 'Bitte wählen Sie ein Intervall.'),
  intervalNote: z.string().max(300).optional(),
  times: z.array(z.string()),
  extras: z.array(z.string()),
  company: z.string().trim().min(2, 'Bitte geben Sie Ihr Unternehmen an.').max(120),
  name: z.string().trim().min(2, 'Bitte geben Sie Ihren Namen an.').max(120),
  email: z.string().trim().email('Bitte prüfen Sie die E-Mail-Adresse.'),
  phone: z
    .string()
    .trim()
    .min(6, 'Bitte geben Sie eine Telefonnummer an.')
    .regex(/^[+()\d\s/-]+$/, 'Bitte nur Ziffern, Leerzeichen, +, /, - verwenden.'),
  location: z.string().trim().min(2, 'Bitte geben Sie den Ort des Objekts an.').max(120),
  visitDate: z.string().optional(),
  visitTime: z.string().optional(),
  message: z.string().max(2000).optional(),
  privacy: z.boolean().refine((v) => v, 'Bitte stimmen Sie der Datenverarbeitung zu.'),
  botcheck: z.string().optional(),
})

export type QuoteData = z.infer<typeof quoteSchema>

export const defaultQuote: QuoteData = {
  objectType: undefined as unknown as QuoteData['objectType'],
  areas: [],
  path: undefined as unknown as QuoteData['path'],
  staff: 1,
  employees: 10,
  hours: 2,
  visits: 3,
  area: 300,
  floors: 1,
  interval: '',
  intervalNote: '',
  times: [],
  extras: [],
  company: '',
  name: '',
  email: '',
  phone: '',
  location: '',
  visitDate: '',
  visitTime: '',
  message: '',
  privacy: false,
  botcheck: '',
}

/** Felder je Schritt (für die Validierung beim Weiterklicken) */
export const stepFields: (keyof QuoteData)[][] = [
  ['objectType', 'areas'],
  ['path', 'staff', 'employees', 'hours', 'visits', 'area', 'floors'],
  ['interval', 'times'],
  ['extras'],
  ['company', 'name', 'email', 'phone', 'location', 'visitDate', 'privacy'],
]

export const stepTitles = ['Objekt', 'Aufwand', 'Intervall', 'Extras', 'Kontakt']
