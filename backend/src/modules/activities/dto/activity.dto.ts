import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateActivityDto {
  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  rewardPoints: number;
}

export class UpdateActivityDto extends CreateActivityDto {
  @IsOptional()
  @IsString()
  status?: string;
}
