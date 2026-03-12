interface Tab<T extends string> {
  key: T
  label: string
}

interface Props<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (key: T) => void
}

export default function TabSwitcher<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div className="w-full max-w-2xl flex gap-1 bg-gray-100 p-1 rounded-xl">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
