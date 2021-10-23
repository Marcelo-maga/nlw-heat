import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";


type User = {
  id: string,
  name: string,
  avatar_url: string,
  login: string,
}

type AuthContextData = {
  user: User | null
  signInUrl: string,
  signOut: () => void,
}

type AuthProvider = {
  children: ReactNode
}

type AuthResponse = {
  token: string,
  user: User
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider(props: AuthProvider) {
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${'ba66fe369a08598f4c69'}`

  const [user, setUser] = useState<User | null>(null)

  async function signIn(githubCode: string){
    const response = await api.post<AuthResponse>('/authenticate', {
      code: githubCode
    })

    const { token, user } = response.data
    localStorage.setItem('@dowhile:token', token)
    
    api.defaults.headers.common.authorization = `Bearer ${token}`
    setUser(user)
  }

  async function signOut() {
    setUser(null)
    localStorage.removeItem('@dowhile:token')
  }

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token')
    if(token){
      api.defaults.headers.common.authorization = `Bearer ${token}`
      api.get<User>('/profile').then(response => {
        setUser(response.data)
      })
    }
  }, [])

  useEffect(() => {
    const url = window.location.href
    const hashGitHubCode = url.includes('?code=')
    if(hashGitHubCode){
      const [urlWithCode, githubCode] = url.split('?code=')
      window.history.pushState({}, '', urlWithCode)
      signIn(githubCode)
    }
  }, [])



  return(
    <AuthContext.Provider value={{signInUrl, user, signOut}}>
      {props.children}
    </AuthContext.Provider>
  )
}

