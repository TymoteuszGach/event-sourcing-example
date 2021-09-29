import {Event} from "event-sourcing/modules/events";
import {failure, Result, success} from "event-sourcing/modules/primitives";
import {isAggregate} from "event-sourcing/modules/aggregates";
import {aggregateUser, getUserStreamName, getStore, User, UserEvent} from "../user";
import {Command} from "event-sourcing/modules/commands";
import {AggregateUpdater, getAndUpdate} from "event-sourcing/modules/stream";

export type RegisterUser = Command<'RegisterUser', { name: string, surname: string, email: string }>
export type UserRegistered = Event<'UserRegistered', 'v1', { time: Date, name: string, surname: string, email: string }>

export function applyUserRegisteredEvent(currentState: User | Record<string, never>, event: UserRegistered): Result<User> {
  if (isAggregate(currentState)) {
    return failure("user already registered")
  }
  return success({
    type: 'User',
    name: event.data.name,
    surname: event.data.surname,
    email: event.data.email
  })
}

export async function registerUser(command: RegisterUser): Promise<Result<UserEvent>> {
  const streamName = getUserStreamName(command.data.email);
  return getAndUpdate(getStore(), streamName, aggregateUser, processUserRegistration(command))
}

function processUserRegistration(command: RegisterUser): AggregateUpdater<User, UserEvent> {
  return {
    update: (user: User | Record<string, never>): Result<UserEvent> => {
      const userRegistered: UserRegistered = {
        data: {
          name: command.data.name,
          surname: command.data.surname,
          email: command.data.email,
          time: new Date()
        },
        type: 'UserRegistered',
        version: 'v1'
      }

      const updatedUserResult = applyUserRegisteredEvent(user, userRegistered)

      if (updatedUserResult.isError) {
        return updatedUserResult.wrap("cannot register user")
      }

      return success(userRegistered)
    }
  }
}