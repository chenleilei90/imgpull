import { IsEnum, IsOptional, IsString } from "class-validator";

export enum RegistryProviderDto {
  aliyun_acr = "aliyun_acr",
  tencent_tcr = "tencent_tcr",
  volcengine = "volcengine",
  huawei_swr = "huawei_swr",
  harbor = "harbor",
  generic = "generic"
}

export class CreateRegistryAccountDto {
  @IsString()
  name: string;

  @IsEnum(RegistryProviderDto)
  provider: RegistryProviderDto;

  @IsString()
  registryUrl: string;

  @IsString()
  namespace: string;

  @IsOptional()
  @IsString()
  usernameEncrypted?: string;
}

export class UpdateRegistryAccountDto extends CreateRegistryAccountDto {}
