import { IsInt, IsOptional, IsString } from "class-validator";

export class WorkerHeartbeatDto {
  @IsOptional()
  @IsString()
  workerId?: string;

  @IsString()
  status: string;

  @IsInt()
  currentTasks: number;
}

export class ClaimTaskDto {
  @IsOptional()
  @IsString()
  capabilities?: string;
}

export class WorkerStageDto {
  @IsInt()
  attemptNo: number;

  @IsString()
  stage: string;

  @IsString()
  status: string;
}

export class WorkerLogDto {
  @IsInt()
  attemptNo: number;

  @IsString()
  level: string;

  @IsString()
  message: string;
}

export class WorkerResultDto {
  @IsInt()
  attemptNo: number;

  @IsOptional()
  @IsString()
  errorCode?: string;
}
