import {Aggregate} from "event-sourcing/modules/aggregates";
import {applyUserRegisteredEvent, UserRegistered} from "./register";
import {applyUserNameChangedEvent, UserNameChanged} from "./changeName";
import {Result} from "event-sourcing/modules/primitives";
import {InMemoryEventStore} from "../core/eventstore/inMemory";

export type User = Aggregate<'User'> & {
  name: string,
  surname: string,
  email: string
}

export type UserEvent = UserRegistered | UserNameChanged

export function aggregateUser(currentState: User | Record<string, never>, event: UserEvent): Result<User> {
  switch (event.type) {
    case 'UserRegistered':
      return applyUserRegisteredEvent(currentState, event)
    case 'UserNameChanged':
      return applyUserNameChangedEvent(currentState, event)
  }
}

export function getUserStreamName(email: string): string {
  return `user-${email}`
}

export const getStore = () => store ??= new InMemoryEventStore<UserEvent>()

let store: InMemoryEventStore<UserEvent>