import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ok } from "../../common/utils/mock-response";
import { AuthService } from "./auth.service";
import { LoginDto, LogoutDto } from "./dto/auth.dto";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Headers("user-agent") userAgent: string | undefined, @Headers("x-forwarded-for") ip: string | undefined) {
    return ok(await this.authService.adminLogin(dto, { ip, userAgent }));
  }

  @Post("logout")
  async logout(@Body() _dto: LogoutDto, @Headers("authorization") authorization: string | undefined) {
    return ok(await this.authService.adminLogout(authorization));
  }

  @Get("me")
  async me(@Headers("authorization") authorization: string | undefined) {
    return ok(await this.authService.adminMe(authorization));
  }
}
