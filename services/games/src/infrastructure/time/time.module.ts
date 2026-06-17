import { Module } from "@nestjs/common";
import { CLOCK } from "../../application/common/tokens";
import { SystemClock } from "./system-clock";

@Module({
  providers: [
    {
      provide: CLOCK,
      useClass: SystemClock,
    },
  ],
  exports: [CLOCK],
})
export class TimeModule {}
