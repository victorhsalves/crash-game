import { Controller, Get } from "@nestjs/common";
import { GetCurrentRoundUseCase } from "../../application/use-cases/get-current-round/get-current-round.use-case";
import { CurrentRoundResponseDto } from "../dtos/current-round-response.dto";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";

@Controller()
export class GamesController {
  public constructor(private readonly getCurrentRoundUseCase: GetCurrentRoundUseCase) {}

  @Get("health")
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "games" };
  }

  @Get("rounds/current")
  async getCurrentRound(): Promise<CurrentRoundResponseDto> {
    const gameRound = await this.getCurrentRoundUseCase.execute();

    return CurrentRoundResponseDto.fromDomain(gameRound);
  }
}
