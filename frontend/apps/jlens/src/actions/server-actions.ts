import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

const UnknownError = "Unknown Error";

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error("API call error:", error)

		if (error.response) {
			// if (error.response.status === 401) {
			// 	window.location.href = "/login"
			// } else {
			// }
            return Promise.reject({
				error: error.response.data || error.message || UnknownError,
			})
		}

		return Promise.reject({ error: error.message || "Network Error" })
	}
)



export const login = async (email: string, password: string) => {
	console.log("Logging in with email:", email)
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const loginWithMicrosoft = async ({
  name,
  email,
  id,
}: {
  name: string
  email: string
  id: string
}) => {
  const response = await apiClient.post('/auth/microsoft-login', {
    name,
    email,
    id,
  })
  return response.data
}

export const checkUserExists = async (email: string) => {
  const res = await apiClient.get(`/auth/user-exists?email=${encodeURIComponent(email)}`)
  console.log(res, "checkUserExists response");
  
  return res.data
}

export const signupWithMicrosoft = async ({
  name,
  email,
  id,
}: {
  name: string
  email: string
  id: string
}) => {
  const response = await apiClient.post('/auth/signup-microsoft', {
    name,
    email,
    id,
  })
  return response.data
}