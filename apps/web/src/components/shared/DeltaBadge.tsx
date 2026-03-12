export default function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) <= 0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aligned</span>
  if (delta < -0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">⚠ Blind spot</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">✨ Hidden strength</span>
}
