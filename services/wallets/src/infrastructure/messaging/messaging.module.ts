import { MessagingModule } from "@crash/messaging";
import { Module } from "@nestjs/common";
import { InternalTestEventController } from "./internal-test-event.controller";

@Module({
  imports: [MessagingModule.forRoot()],
  controllers: [InternalTestEventController],
})
export class MessagingInfrastructureModule {}
