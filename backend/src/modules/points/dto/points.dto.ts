import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AdminAdjustPointsDto {
  @IsInt()
  @Min(1)
  points: number;

  @IsString()
  idempotencyKey: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
