import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { AuthService } from "./auth.service";
import { LoginDto, LogoutDto, RegisterDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return ok(this.authService.register(dto));
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Headers("user-agent") userAgent: string | undefined, @Headers("x-forwarded-for") ip: string | undefined) {
    return ok(await this.authService.login(dto, { ip, userAgent }));
  }

  @Post("logout")
  async logout(@Body() _dto: LogoutDto, @Headers("authorization") authorization: string | undefined) {
    return ok(await this.authService.logout(authorization));
  }

  @Get("me")
  async me(@Headers("authorization") authorization: string | undefined) {
    return ok(await this.authService.me(authorization));
  }
}
