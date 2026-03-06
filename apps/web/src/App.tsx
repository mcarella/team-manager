import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.js'
import LeadershipAssessmentPage from './pages/LeadershipAssessmentPage.js'
import CVFAssessmentPage from './pages/CVFAssessmentPage.js'
import TeamDashboardPage from './pages/TeamDashboardPage.js'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/assessment/leadership" element={<LeadershipAssessmentPage />} />
      <Route path="/assessment/cvf" element={<CVFAssessmentPage />} />
      <Route path="/teams/:id" element={<TeamDashboardPage />} />
    </Routes>
  )
}
