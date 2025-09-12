import { useNavigate } from 'react-router-dom'
import  LoginForm  from '@/auth/login-form'
import { login } from '@/actions/server-actions'
import { useState } from 'react'
import { toast } from 'sonner'

const Home = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await login(email, password)
      console.log('Login success:', result)
      toast.success('Login successful!')
      navigate('/app')
      sessionStorage.setItem('token', result.access_token)
      sessionStorage.setItem('email', email)


      // Redirect to dashboard
     
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex">
      <div className="flex-1 flex items-center justify-center bg-background">
        <LoginForm onEmailLogin={handleEmailLogin} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default Home
