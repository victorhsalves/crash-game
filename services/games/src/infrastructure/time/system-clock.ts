import { Injectable } from "@nestjs/common";
import type { Clock } from "../../domain/ports/clock.port";

@Injectable()
export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}
