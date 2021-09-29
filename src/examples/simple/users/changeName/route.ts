import {NextFunction, Request, Response, Router} from 'express';
import {ChangeUserName, changeUserName} from './handler';
import {isCommand} from "event-sourcing/modules/commands";

export const route = (router: Router) =>
  router.post(
    '/changeName',
    async function (request: Request, response: Response, next: NextFunction) {
      try {
        const command = mapRequestToCommand(request)

        if (!isCommand(command)) {
          next({status: 400, message: command})
          return
        }

        const result = await changeUserName(command)

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
): ChangeUserName | 'MISSING_EMAIL' | 'MISSING_NAME' {
  if (typeof request.body.email !== 'string') {
    return 'MISSING_EMAIL'
  }

  if (typeof request.body.name !== 'string') {
    return 'MISSING_NAME'
  }

  return {
    type: 'ChangeUserName',
    data: {
      email: request.body.email,
      newName: request.body.newName
    },
  };
}