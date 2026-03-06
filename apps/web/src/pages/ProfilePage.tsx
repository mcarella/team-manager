import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'

export default function ProfilePage() {
  const { currentUserId } = useStore()
  const navigate = useNavigate()

  // Profile is now integrated into OnboardingPage
  if (currentUserId) {
    navigate('/onboarding', { replace: true })
  } else {
    navigate('/', { replace: true })
  }
  return null
}
