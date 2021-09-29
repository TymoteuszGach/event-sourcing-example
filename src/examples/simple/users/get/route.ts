import {NextFunction, Request, Response, Router} from 'express';
import {getUser} from "./handler";

export const route = (router: Router) =>
  router.get(
    '/:email',
    async function (request: Request, response: Response, next: NextFunction) {
      try {
        if(!isEmail(request.params.email)){
          next({status: 400, message: "email not provided"})
          return
        }
        const result = await getUser(request.params.email)

        if (result.isError) {
          console.log(result)
          response.sendStatus(404)
          return
        }
        response.send(result.value)
        response.sendStatus(200)
      } catch (error) {
        next(error)
      }
    }
  )

function isEmail(email: any): email is string {
  return email !== ""
}