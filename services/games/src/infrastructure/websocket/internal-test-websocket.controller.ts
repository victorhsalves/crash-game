import {
  EVENT_BROADCASTER,
  WebSocketModule,
  type EventBroadcaster,
} from "@crash/websocket";
import { Controller, Inject, Post } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

interface PublishTestWebSocketResponse {
  readonly published: true;
}

@ApiExcludeController()
@Controller("internal")
export class InternalTestWebSocketController {
  public constructor(
    @Inject(EVENT_BROADCASTER) private readonly broadcaster: EventBroadcaster,
  ) {}

  @Post("test-websocket")
  public async publishTestEvent(): Promise<PublishTestWebSocketResponse> {
    await this.broadcaster.broadcast("infrastructure.test", {
      message: "ping from games",
    });

    return { published: true };
  }
}
