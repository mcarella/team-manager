import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.js'
import OnboardingPage from './pages/OnboardingPage.js'
import LeadershipAssessmentPage from './pages/LeadershipAssessmentPage.js'
import CVFAssessmentPage from './pages/CVFAssessmentPage.js'
import SkillsAssessmentPage from './pages/SkillsAssessmentPage.js'
import ProfilePage from './pages/ProfilePage.js'
import ManagerHomePage from './pages/ManagerHomePage.js'
import CompanyDashboardPage from './pages/CompanyDashboardPage.js'
import CompanyProfilePage from './pages/CompanyProfilePage.js'
import TeamsPage from './pages/TeamsPage.js'
import TeamDashboardPage from './pages/TeamDashboardPage.js'
import RolesConfigPage from './pages/RolesConfigPage.js'
import SeedPage from './pages/SeedPage.js'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/seed" element={<SeedPage />} />
      {/* Member */}
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/assessment/leadership" element={<LeadershipAssessmentPage />} />
      <Route path="/assessment/cvf" element={<CVFAssessmentPage />} />
      <Route path="/assessment/skills" element={<SkillsAssessmentPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      {/* Manager */}
      <Route path="/manager" element={<ManagerHomePage />} />
      {/* Company */}
      <Route path="/company" element={<CompanyDashboardPage />} />
      {/* Shared */}
      <Route path="/company-profile" element={<CompanyProfilePage />} />
      <Route path="/roles" element={<RolesConfigPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/teams/:id" element={<TeamDashboardPage />} />
    </Routes>
  )
}
