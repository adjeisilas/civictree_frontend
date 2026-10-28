import React from 'react'

interface PageHeaderProps {
  title: string
  /** One line saying what the page is for. Keep it factual, not promotional. */
  description?: string
  /** Buttons, filters or a search box, right-aligned on wide screens. */
  actions?: React.ReactNode
}

/**
 * The heading every admin page starts with.
 *
 * Each page used to roll its own — some with a coloured hero panel, some with a
 * serif heading, some with nothing — so moving between them felt like moving
 * between applications. One component means one answer.
 */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
      <div className="min-w-0">
        <h1 className="font-heading text-[26px] leading-tight text-text-primary">{title}</h1>
        {description && <p className="text-[13px] text-gray-600 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
