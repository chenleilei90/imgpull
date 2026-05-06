import { IsOptional, IsString } from "class-validator";

export class EstimateTaskDto {
  @IsString()
  sourceImage: string;

  @IsString()
  targetImage: string;
}

export class CreateImageTaskDto extends EstimateTaskDto {
  @IsString()
  targetRegistryId: string;

  @IsOptional()
  @IsString()
  architecture?: string;

  @IsString()
  idempotencyKey: string;
}

export class TaskActionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
