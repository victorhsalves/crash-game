import { ApiProperty } from "@nestjs/swagger";

export class ApiErrorResponseDto {
  @ApiProperty({ example: 422 })
  statusCode!: number;

  @ApiProperty({ example: "DuplicateBetError" })
  error!: string;

  @ApiProperty({ example: "Player already has a bet in this round" })
  message!: string;
}
