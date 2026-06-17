import { Module } from "@nestjs/common";
import { ApplicationModule } from "../../application/application.module";
import { RoundLifecycleScheduler } from "./round-lifecycle.scheduler";

@Module({
  imports: [ApplicationModule],
  providers: [RoundLifecycleScheduler],
})
export class LifecycleModule {}
