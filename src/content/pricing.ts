/**
 * PREISLOGIK – alle Sätze für Konfigurator und Kostenvergleich.
 * Abrechnung nach Stunden pro Mitarbeiter. Alle Preise sind unverbindlich.
 */
export const pricing = {
  /** Stundensatz pro Mitarbeiterstunde inkl. MwSt. (brutto) */
  hourlyRateGrossMin: 35,
  hourlyRateGrossMax: 45,
  /** Mehrwertsteuersatz */
  vatRate: 0.19,
  /** Durchschnittliche Wochen pro Monat (52 / 12) */
  weeksPerMonth: 4.33,
}

export const net = (gross: number) => gross / (1 + pricing.vatRate)

export const hourlyRateNetMin = () => net(pricing.hourlyRateGrossMin)
export const hourlyRateNetMax = () => net(pricing.hourlyRateGrossMax)

/** Monatliche Richtpreis-Spanne aus bekannten Einsatzzeiten (Weg A im Konfigurator) */
export function monthlyRange(staff: number, hoursPerVisit: number, visitsPerWeek: number) {
  const hours = staff * hoursPerVisit * visitsPerWeek * pricing.weeksPerMonth
  const grossMin = hours * pricing.hourlyRateGrossMin
  const grossMax = hours * pricing.hourlyRateGrossMax
  return { hours, grossMin, grossMax, netMin: net(grossMin), netMax: net(grossMax) }
}

/**
 * Annahmen für den Kostenvergleich „Eigenes Personal vs. CleanStar“.
 * Das sind Beispielwerte, die Nutzer auf der Seite selbst anpassen können.
 * TODO: Werte einmal mit Steuerberatung oder Lohnbüro abgleichen.
 */
export const costAssumptions = {
  hoursPerWeek: 10,
  hourlyWage: 15,
  /** Arbeitgeberanteile Sozialversicherung + Umlagen in % (sozialversicherungspflichtig, grob) */
  employerChargesRegular: 22,
  /** Pauschalabgaben Minijob in % (grob) */
  employerChargesMinijob: 31,
  /** Bezahlte Urlaubstage pro Jahr bei 5-Tage-Woche */
  vacationDays: 24,
  /** Krankheitstage pro Jahr (bezahlt, Durchschnitt) */
  sickDays: 10,
  /** Arbeitstage pro Jahr bei 5-Tage-Woche (vor Urlaub und Krankheit) */
  workingDaysPerYear: 250,
  /** Anteil der Ausfallzeit, die durch Vertretung (Überstunden, Aushilfe) aufgefangen werden muss, in % */
  coverageShare: 100,
  /** Aufschlag für Vertretung gegenüber dem normalen Lohn in % */
  coveragePremium: 25,
  /** Reinigungsmittel, Geräte, Verbrauchsmaterial pro Monat in € */
  materialPerMonth: 60,
  /** Verwaltungsaufwand (Lohnabrechnung, Planung, Einweisung) in Stunden pro Monat */
  adminHoursPerMonth: 3,
  /** Interner Stundensatz der Verwaltung in € */
  adminHourlyCost: 40,
}

export type CostAssumptions = typeof costAssumptions
