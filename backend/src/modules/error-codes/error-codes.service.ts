import { Injectable } from "@nestjs/common";
import { mockErrorCodes } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class ErrorCodesService {
  list() {
    return mockErrorCodes;
  }

  get(code: string) {
    return mockErrorCodes.find((item) => item.code === code) ?? mockErrorCodes[0];
  }

  update() {
    return todo("TODO: update ErrorCode user-facing message and suggestion.");
  }
}
