import { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"

interface IPayload {
  sub: string
}

export function isAuthenticate(request: Request, response: Response, 
next: NextFunction){
  const authToken = request.headers.authorization

  if(!authToken){
    return response.status(401).json({
      errorCode: "token.invalid"
    })
  }

  const [, token] = authToken.split(" ")

  try {
    
    const { sub } = verify(token, process.env.jwt) as IPayload
    request.userId = sub
    return next()
    
  } catch (err) {
    return response.status(401).json({
      error: err.message
    })
  }
 
  
}