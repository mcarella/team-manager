import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Retired: peer evaluation is now embedded in /assessment/skills and /assessment/leadership
export default function PeerSkillAssessmentPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/assessment/skills', { replace: true })
  }, [navigate])
  return null
}
