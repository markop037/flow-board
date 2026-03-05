import axios from 'axios'
import { API_BASE } from './config'

const AUTH_BASE = `${API_BASE}/api/v1/auth`

export interface LoginPayload {
  username: string // email
  password: string
}

export interface SignUpPayload {
  email: string
  password: string
  full_name?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authApi = {
  login(payload: LoginPayload): Promise<TokenResponse> {
    const form = new URLSearchParams()
    form.set('username', payload.username)
    form.set('password', payload.password)
    return axios
      .post<TokenResponse>(`${AUTH_BASE}/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data)
  },

  signup(payload: SignUpPayload): Promise<TokenResponse> {
    return axios
      .post<TokenResponse>(`${AUTH_BASE}/signup`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((r) => r.data)
  },
}
