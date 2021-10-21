import axios from "axios"
import prisma from '../prisma'
import { sign } from "jsonwebtoken"
import 'dotenv/config'

interface IAccesTokenResponse {
  access_token: string
}

interface IUserResponde {
  avatar_url: string,
  login: string,
  name: string,
  id: number
}

class AuthenticateUserService {
  async execute( code: string ) {
    const url = 'https://github.com/login/oauth/access_token'

     const { data: accessTokenResponse } = await axios.post<IAccesTokenResponse>(url, null, {
       params: {
         client_id: process.env.GITHUB_CLIENT_ID,
         client_secret: process.env.GITHUB_CLIENT_SECRET,
         code
       },
       headers: {
         "Accept": "application/json"
       }
     })
    
     const response = await axios.get<IUserResponde>('htpps://api.github.com/user', {
       headers: {
         authorization: `Bearer ${accessTokenResponse.access_token}`
       }
     })

     const { login, id, avatar_url, name } = response.data
    
     let user = await prisma.user.findFirst({
       where:{
         github_id: id
       }
     })

     if(!user){
       user = await prisma.user.create({
         data:{
           github_id: id,
           login,
           name,
           avatar_url
         }
       })
     }

     const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id
        }
      },
        process.env.jwt,
        {
          subject: user.id,
          expiresIn: '1d'
        }
      )

     return { token, user }

  }
}

export { AuthenticateUserService }