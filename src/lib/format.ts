const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const eur2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const num = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

export const formatEuro = (v: number) => eur.format(Math.round(v))
export const formatEuro2 = (v: number) => eur2.format(v)
export const formatNumber = (v: number) => num.format(v)
