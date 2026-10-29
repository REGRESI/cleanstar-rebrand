import { useEffect, useState } from 'react'
import type { ImageId } from '@/content/images'
import type { QuoteData } from '@/features/configurator/schema'

/**
 * „Welches Büro betreuen wir für Sie?“: drei Wege auf der Startseite. Die Wahl passt die Startseite dezent an
 * (Reihenfolge der Leistungen, Satz im Abschluss) und füllt den Konfigurator mit einer passenden Objektgröße vor.
 * Gemerkt wird sie nur für diese Sitzung (sessionStorage), jederzeit änderbar.
 * Die Vorbelegung im Konfigurator ist ein Startwert zum Anpassen, keine Angabe über Kunden.
 */
export type OfficeWay = 'buero' | 'mittelstand' | 'standorte'

export interface Way {
  id: OfficeWay
  title: string
  text: string
  image: ImageId
  /** Leistungen, die zuerst erscheinen (Slugs) */
  services: string[]
  /** Satz im Abschluss der Startseite */
  cta: string
  /** Startwerte im Konfigurator */
  preset: Partial<QuoteData>
}

export const ways: Way[] = [
  {
    id: 'buero',
    title: 'Ein Büro, bis ca. 20 Arbeitsplätze',
    text: 'Eine Etage, eine Teeküche, ein fester Rhythmus. Ein festes Team, das Ihre Räume kennt.',
    image: 'svc-buero-detail',
    services: ['unterhaltsreinigung', 'fensterreinigung'],
    cta: 'Für ein Büro wie Ihres reicht meist ein kurzer Termin vor Ort, dann steht das Angebot.',
    preset: { objectType: 'buero', employees: 15, area: 300, floors: 1 },
  },
  {
    id: 'mittelstand',
    title: 'Mittelstand, mehrere Etagen oder Abteilungen',
    text: 'Mehrere Bereiche mit eigenem Takt: Büros, Besprechung, Sanitär, Treppenhaus. Ein Leistungsverzeichnis für alles.',
    image: 'svc-unterhalt',
    services: ['treppenhausreinigung', 'hygienereinigung', 'unterhaltsreinigung'],
    cta: 'Bei mehreren Etagen gehen wir jede Etage mit Ihnen durch und legen Intervalle je Bereich fest.',
    preset: { objectType: 'buero', employees: 60, area: 1200, floors: 3 },
  },
  {
    id: 'standorte',
    title: 'Mehrere Standorte im Ortenaukreis',
    text: 'Gleicher Standard an jedem Standort, ein Ansprechpartner für alle. Wir sind im ganzen Kreis unterwegs.',
    image: 'region',
    services: ['fensterreinigung', 'treppenhausreinigung', 'unterhaltsreinigung'],
    cta: 'Für mehrere Standorte besichtigen wir jeden einzeln und fassen alles in einem Angebot zusammen.',
    preset: { objectType: 'buero', employees: 40, area: 800, floors: 1 },
  },
]

const KEY = 'cs-office-way'
const EVENT = 'cs-office-way'

export function readWay(): OfficeWay | null {
  try {
    const v = sessionStorage.getItem(KEY)
    return ways.some((w) => w.id === v) ? (v as OfficeWay) : null
  } catch {
    return null
  }
}

export function setWay(v: OfficeWay | null) {
  try {
    if (v) sessionStorage.setItem(KEY, v)
    else sessionStorage.removeItem(KEY)
  } catch {
    /* ohne Speicher gilt die Wahl nur bis zum nächsten Laden */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }))
}

/** Aktuelle Wahl (nach dem ersten Rendern, damit das vorgerenderte HTML gleich bleibt) */
export function useOfficeWay(): [Way | null, (v: OfficeWay | null) => void] {
  const [id, setId] = useState<OfficeWay | null>(null)
  useEffect(() => {
    setId(readWay())
    const on = (e: Event) => setId((e as CustomEvent<OfficeWay | null>).detail)
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])
  return [ways.find((w) => w.id === id) ?? null, setWay]
}

/** Dienste in der gewählten Reihenfolge: passende zuerst, die übrigen wie gehabt */
export function orderServices<T extends { slug: string }>(list: T[], way: Way | null) {
  if (!way) return list
  const rank = (s: T) => {
    const i = way.services.indexOf(s.slug)
    return i < 0 ? 99 : i
  }
  return [...list].sort((a, b) => rank(a) - rank(b))
}
