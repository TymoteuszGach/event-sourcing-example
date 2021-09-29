import {NextFunction, Request, Response, Router} from 'express';
import {registerUser, RegisterUser} from './handler';
import {isCommand} from "event-sourcing/modules/commands";

export const route = (router: Router) =>
  router.post(
    '/register',
    async function (request: Request, response: Response, next: NextFunction) {
      try {
        const command = mapRequestToCommand(request)

        if (!isCommand(command)) {
          next({status: 400, message: command})
          return
        }

        const result = await registerUser(command)

        if (result.isError) {
          response.sendStatus(404)
          return
        }
        response.sendStatus(200)
      } catch (error) {
        next(error)
      }
    }
  )

function mapRequestToCommand(
  request: Request
): RegisterUser | 'MISSING_EMAIL' | 'MISSING_NAME' | 'MISSING_SURNAME' {
  if (typeof request.body.email !== 'string') {
    return 'MISSING_EMAIL'
  }

  if (typeof request.body.name !== 'string') {
    return 'MISSING_NAME'
  }

  if (typeof request.body.surname !== 'string') {
    return 'MISSING_SURNAME'
  }

  return {
    type: 'RegisterUser',
    data: {
      email: request.body.email,
      name: request.body.name,
      surname: request.body.surname
    },
  };
}