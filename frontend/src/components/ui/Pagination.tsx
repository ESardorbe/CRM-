import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface PaginationProps {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Jami {total} ta
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-primary hover:text-white hover:border-primary transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={clsx(
              'w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors',
              p === page
                ? 'bg-primary text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-primary hover:text-white hover:border-primary',
            )}
          >
            {p}
          </button>
        ))}
        {totalPages > 5 && page < totalPages - 2 && (
          <>
            <span className="text-gray-400">...</span>
            <button
              onClick={() => onChange(totalPages)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-sm hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 hover:bg-primary-hover transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
