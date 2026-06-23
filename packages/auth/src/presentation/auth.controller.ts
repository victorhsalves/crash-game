import { Body, Controller, Get, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "../application/authenticated-user.interface";
import { CurrentUser } from "./current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
