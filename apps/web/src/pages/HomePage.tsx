import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Team Manager</h1>
      <p className="text-lg text-gray-600">Build balanced teams using leadership archetypes and cultural profiles.</p>
      <nav className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          to="/assessment/leadership"
          className="block text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Leadership Assessment
        </Link>
        <Link
          to="/assessment/cvf"
          className="block text-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          CVF Assessment
        </Link>
        <Link
          to="/teams/demo"
          className="block text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Team Dashboard
        </Link>
      </nav>
    </main>
  )
}
