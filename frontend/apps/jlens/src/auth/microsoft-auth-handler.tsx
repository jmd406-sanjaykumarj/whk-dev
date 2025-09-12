// src/auth/microsoft-auth-handler.tsx
import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { useNavigate } from 'react-router-dom'
import { loginWithMicrosoft, signupWithMicrosoft, checkUserExists } from '@/actions/server-actions'
import { toast } from 'sonner'
import Loading from '@/components/loader'

const MicrosoftAuthHandler = () => {
  const { instance } = useMsal()
  console.log(instance, "MSAL instance in MicrosoftAuthHandler");

  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise()
        if (response) {
          console.log('Redirect response:', response)
          const idTokenClaims = response.idTokenClaims as any

          const name = idTokenClaims.name
          const email = idTokenClaims.email || idTokenClaims.preferred_username
          const id = idTokenClaims.oid

          console.log('MS Login Response:', { name, email, id })

          const userExistsResponse = await checkUserExists(email)
          // console.log('User exists response:', userExistsResponse);

          const exists = userExistsResponse?.exists
          // console.log('User exists:', exists);

          let serverResponse
          if (exists) {
            const accounts = instance.getAllAccounts();
            if (accounts.length > 0) {
              console.log("User already signed in, navigating to chat", accounts.length);
            }
            serverResponse = await loginWithMicrosoft({ name, email, id });
          } else {
            await signupWithMicrosoft({ name, email, id });
            serverResponse = await loginWithMicrosoft({ name, email, id });
          }
          sessionStorage.setItem('token', serverResponse.access_token)
          sessionStorage.setItem('email', email)
          sessionStorage.setItem('name', name)

          toast.success('Logged in with Microsoft!')
          navigate('/app')
        }
      } catch (err) {
        console.error('Error handling redirect response:', err)
        toast.error('Microsoft login failed.')
        navigate('/login')
      } finally {
        setLoading(false) 
      }
    }

    handleRedirect()
  }, [])
  
  if (loading) {
    return <Loading />
  }

  return null
}

export default MicrosoftAuthHandler