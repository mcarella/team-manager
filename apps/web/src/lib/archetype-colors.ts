export const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-100 text-red-700',
  coordinator: 'bg-orange-100 text-orange-700',
  peer:        'bg-blue-100 text-blue-700',
  coach:       'bg-green-100 text-green-700',
  strategist:  'bg-purple-100 text-purple-700',
}

// Card-wrap colors mirroring ArchetypeCard's themed border + tint.
export const ARCHETYPE_CARD_COLORS: Record<string, string> = {
  expert:      'bg-red-50 border-red-200 text-red-900',
  coordinator: 'bg-orange-50 border-orange-200 text-orange-900',
  peer:        'bg-blue-50 border-blue-200 text-blue-900',
  coach:       'bg-green-50 border-green-200 text-green-900',
  strategist:  'bg-purple-50 border-purple-200 text-purple-900',
}

// Accent hex values for inline-styled elements (radar fill, factor bars, etc.)
export const ARCHETYPE_ACCENTS: Record<string, string> = {
  expert:      '#dc2626', // red-600
  coordinator: '#ea580c', // orange-600
  peer:        '#2563eb', // blue-600
  coach:       '#16a34a', // green-600
  strategist:  '#9333ea', // purple-600
}
