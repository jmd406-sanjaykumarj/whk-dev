import { useMsal } from '@azure/msal-react'
import { Button } from '@ui/components/ui/button'
import { loginRequest } from '@/lib/auth/msalConfig'
import { useNavigate } from 'react-router-dom';
export const MicrosoftSSOButton = () => {
  const { instance } = useMsal()
  const navigate = useNavigate();

  const handleMicrosoftLogin = () => {
    console.log("login request", loginRequest);
    // console.log("MSAL instance", instance);
    
    const accounts = instance.getAllAccounts();

    if (accounts.length > 0) {
      // User already signed in, navigate directly
      navigate('/app/chat', { replace: true });
      return;
    }
    
    instance.loginRedirect(loginRequest).catch((error) => {
      console.error('Microsoft login error:', error)
    })
  }

  return (
    <Button
      onClick={handleMicrosoftLogin}
      variant="outline"
      className="w-full h-12 mb-6 text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors bg-transparent"
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 23 23">
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
      Sign in with Microsoft
    </Button>
  )
}