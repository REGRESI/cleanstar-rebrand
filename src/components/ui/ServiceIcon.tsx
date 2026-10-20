import { Building2, Footprints, LayoutPanelTop, MonitorSmartphone, RefreshCcw, ShowerHead, Warehouse } from 'lucide-react'
import type { Service } from '@/content/services'

const map = {
  desk: MonitorSmartphone,
  routine: RefreshCcw,
  window: LayoutPanelTop,
  stairs: Footprints,
  hall: Warehouse,
  hygiene: ShowerHead,
} satisfies Record<Service['icon'], unknown>

export function ServiceIcon({ icon, className }: { icon: Service['icon']; className?: string }) {
  const Icon = map[icon] ?? Building2
  return <Icon aria-hidden className={className} strokeWidth={1.6} />
}
