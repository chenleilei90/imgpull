import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum PayChannelDto {
  manual = "manual",
  alipay = "alipay",
  wechat = "wechat"
}

export class CreateOrderDto {
  @IsString()
  orderType: string;

  @IsOptional()
  @IsString()
  packageId?: string;

  @IsEnum(PayChannelDto)
  payChannel: PayChannelDto;

  @IsString()
  idempotencyKey: string;
}

export class ManualRechargeDto {
  @IsInt()
  userId: number;

  @IsInt()
  @Min(1)
  amountCents: number;

  @IsInt()
  @Min(1)
  points: number;

  @IsEnum(PayChannelDto)
  payChannel: PayChannelDto;

  @IsString()
  remark: string;

  @IsString()
  idempotencyKey: string;
}
