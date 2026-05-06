import { Injectable } from "@nestjs/common";
import { mockPointTransactions, mockUsers } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class PointsService {
  account() {
    const user = mockUsers[0];
    return {
      userId: user.id,
      balancePoints: user.balancePoints,
      frozenPoints: user.frozenPoints,
      version: 1
    };
  }

  transactions() {
    return mockPointTransactions;
  }

  adminAdjust() {
    return todo("TODO: admin_adjust transaction updates PointAccount and PointTransaction; no RechargeOrder or PaymentRecord.");
  }
}
