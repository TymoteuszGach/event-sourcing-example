import { Router } from 'express'
import { route as routeChangeName } from './changeName'
import { route as routeRegister } from './register'
import {route as routeGet } from './get'

export const usersRouter = Router()
routeChangeName(usersRouter)
routeRegister(usersRouter)
routeGet(usersRouter)