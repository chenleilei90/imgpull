import { Injectable } from "@nestjs/common";
import { mockMembershipPlans } from "../../common/mock-data";

@Injectable()
export class MembershipService {
  listPlans() {
    return {
      plans: mockMembershipPlans,
      p0Note: "P0 exposes membership plan query only. Membership purchase is reserved for later."
    };
  }
}
