import { isAggregate } from "event-sourcing/modules/aggregates";
import {failure, Result, success } from "event-sourcing/modules/primitives";
import { aggregate } from "event-sourcing/modules/streams";
import {aggregateUser, getStore, getUserStreamName, User} from "../user";

export async function getUser(email: string): Promise<Result<User>> {
  const streamName = getUserStreamName(email);
  const readEventsResult = await getStore().read(streamName)
  if(readEventsResult.isError){
    return readEventsResult.wrap("cannot read events from stream")
  }
  const userResult = await aggregate(readEventsResult.value, aggregateUser)
  if (userResult.isError) {
    return userResult.wrap("cannot build user")
  }
  if(!isAggregate(userResult.value)){
    return failure("user not found")
  }
  return success(userResult.value)
}