import { Allow, IsOptional, IsString } from "class-validator";

export class UpdateSystemConfigDto {
  @Allow()
  valueJson: unknown;

  @IsOptional()
  @IsString()
  group?: string;
}
