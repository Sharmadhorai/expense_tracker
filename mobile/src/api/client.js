import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Use your computer's local IP for physical device over Wi-Fi
const BASE_URL = 'http://192.168.1.8:8000'

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('et_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['et_token', 'et_user'])
    }
    return Promise.reject(err)
  }
)

export default API
export { BASE_URL }
