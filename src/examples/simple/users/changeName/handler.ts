import {failure, Result, success} from "event-sourcing/modules/primitives"
import {isAggregate} from "event-sourcing/modules/aggregates";
import {aggregateUser, getUserStreamName, getStore, User, UserEvent} from "../user";
import {AggregateUpdater, getAndUpdate} from "event-sourcing/modules/streams";
import {Command} from "event-sourcing/modules/commands";
import {Event} from "event-sourcing/modules/events"

export type ChangeUserName = Command<'ChangeUserName', { email: string, newName: string }>
export type UserNameChanged = Event<'UserNameChanged', 'v1', { email: string, newName: string }>

export function applyUserNameChangedEvent(currentState: User | Record<string, never>, event: UserNameChanged): Result<User> {
  if (!isAggregate(currentState)) {
    return failure("user not registered")
  }
  return success({
    ...currentState,
    name: event.data.newName
  })
}

export async function changeUserName(command: ChangeUserName): Promise<Result<UserEvent>> {
  const streamName = getUserStreamName(command.data.email);
  return getAndUpdate(getStore(), streamName, aggregateUser, processChangeUserName(command))
}

function processChangeUserName(command: ChangeUserName): AggregateUpdater<User, UserEvent> {
  return {
    update: (user: User | Record<string, never>): Result<UserEvent> => {
      const userNameChanged: UserNameChanged = {
        data: {
          email: command.data.email,
          newName: command.data.newName
        },
        type: 'UserNameChanged',
        version: 'v1'
      }

      const updatedUserResult = applyUserNameChangedEvent(user, userNameChanged)
      
      if (updatedUserResult.isError) {
        return updatedUserResult.wrap("cannot change user name")
      }

      return success(userNameChanged)
    }
  }
}