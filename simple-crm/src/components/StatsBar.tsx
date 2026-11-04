import { STATUS_LABELS } from '../lib/contacts'
import type { ContactStats } from '../types'

interface StatsBarProps {
  stats: ContactStats
}

/** KPI cards: total contacts, counts per pipeline stage and due follow-ups. */
export function StatsBar({ stats }: StatsBarProps) {
  const cards = [
    { label: 'Contacts', value: stats.total },
    { label: `${STATUS_LABELS.lead}s`, value: stats.byStatus.lead },
    { label: `${STATUS_LABELS.prospect}s`, value: stats.byStatus.prospect },
    { label: `${STATUS_LABELS.client}s`, value: stats.byStatus.client },
    { label: 'Follow-ups due', value: stats.followUpsDue, alert: stats.followUpsDue > 0 },
  ]

  return (
    <section className="stats" aria-label="Statistics">
      {cards.map((card) => (
        <div key={card.label} className={card.alert ? 'stat stat--alert' : 'stat'}>
          <span className="stat__value">{card.value}</span>
          <span className="stat__label">{card.label}</span>
        </div>
      ))}
    </section>
  )
}
