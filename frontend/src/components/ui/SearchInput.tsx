import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Qidirish...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-card-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white w-56"
      />
    </div>
  )
}
