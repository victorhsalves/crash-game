import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { RegisterUserUseCase } from "../application/use-cases/register-user/register-user.use-case";
import { RegisterDto } from "./dtos/register.dto";

@Controller("auth")
export class AuthRegistrationController {
  public constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto): Promise<void> {
    return this.registerUserUseCase.execute(dto);
  }
}
