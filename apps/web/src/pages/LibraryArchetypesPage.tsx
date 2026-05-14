import { Link } from 'react-router-dom'
import OAArchetypesGallery from '../components/OAArchetypesGallery.js'
import ArchetypesGallery from '../components/ArchetypesGallery.js'
import GolemanStylesGallery from '../components/GolemanStylesGallery.js'

export default function LibraryArchetypesPage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-10">
      <header className="text-center max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Reference</p>
        <h1 className="text-3xl font-bold mt-1">Leadership Archetypes Library</h1>
        <p className="text-sm text-gray-500 mt-2">
          Forma's three lenses on leadership. Layer 1 lists the 5 ORGANIC-Agility archetypes tagged
          with their Goleman style pair. Layer 2 lists the 17 stable behavioral patterns underneath.
          The Goleman section breaks down the 6 leadership styles themselves — the shared language.
        </p>
      </header>

      {/* Section 1 — OA Archetypes (5 Layer 1 archetypes) */}
      <section className="w-full max-w-5xl space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Layer 1</p>
          <h2 className="text-xl font-bold mt-0.5">Leadership Archetypes — 5</h2>
          <p className="text-sm text-gray-500 mt-1">
            The ORGANIC-Agility archetypes, ordered by Hackman authority level (Manager-led → Self-governing).
            Each one is shown with its Goleman style pair and OA behavior triad — e.g., <em>Coach (coaching)</em>.
          </p>
        </div>
        <OAArchetypesGallery />
      </section>

      {/* Section 2 — Behavioral Core Sub-Profiles (17 Layer 2 archetypes) */}
      <section className="w-full max-w-5xl space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Layer 2</p>
          <h2 className="text-xl font-bold mt-0.5">Behavioral Archetypes — 17</h2>
          <p className="text-sm text-gray-500 mt-1">
            The stable behavioral patterns underneath your leadership style. Built from 4 drives
            (Dominance, Extraversion, Patience, Formality) and grouped into 4 families.
          </p>
        </div>
        <ArchetypesGallery />
      </section>

      {/* Section 3 — Goleman Leadership Styles (6 styles, with deep-dive tables) */}
      <section className="w-full max-w-3xl space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Shared language</p>
          <h2 className="text-xl font-bold mt-0.5">Leadership Styles — Attitudes &amp; Behaviors — 6</h2>
          <p className="text-sm text-gray-500 mt-1">
            The Goleman styles every archetype reaches for. Each card shows the style's motto, its
            matched ORGANIC behavior, and the attitudes &amp; behaviors that make it work.
          </p>
        </div>
        <GolemanStylesGallery />
      </section>

      <Link to="/assessment/leadership" className="text-sm text-blue-600 hover:underline">
        ← Back to Leadership
      </Link>
    </main>
  )
}
