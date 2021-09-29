import { Event } from "event-sourcing/modules/events"
import { Result, success } from "event-sourcing/modules/primitives"
import { EventStore } from "event-sourcing/modules/streams"

export interface StreamMap<StreamEvent extends Event> {
  [name: string]: Array<StreamEvent>
}

function *empty<StreamEvent extends Event>(): Generator<StreamEvent>{}

function *generate<StreamEvent extends Event>(stream: Array<StreamEvent>): Generator<StreamEvent> {
  for (let streamEvent of stream) {
    yield streamEvent
  }
}

export class InMemoryEventStore<StreamEvent extends Event> implements EventStore<StreamEvent>{
  private readonly streams: StreamMap<StreamEvent>

  constructor() {
    this.streams = {};
  }

  async append(streamName: string, event: StreamEvent): Promise<Result<boolean>>{
    if(!this.streams[streamName]){
      this.streams[streamName] = new Array<StreamEvent>()
    }
    this.streams[streamName].push(event)
    return success(true)
  }

  async read(streamName: string): Promise<Result<Generator<StreamEvent>>>{
    if(!this.streams[streamName]){
      return success(empty())
    }
    return success(generate(this.streams[streamName]))
  }
}