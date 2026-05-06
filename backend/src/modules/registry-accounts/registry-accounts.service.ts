import { Injectable } from "@nestjs/common";
import { mockRegistryAccounts } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class RegistryAccountsService {
  list() {
    return mockRegistryAccounts;
  }

  get(id: string) {
    return mockRegistryAccounts.find((registry) => String(registry.id) === id) ?? mockRegistryAccounts[0];
  }

  create() {
    return todo("TODO: encrypt username/password fields, never log plaintext registry credentials.");
  }

  update() {
    return todo("TODO: rotate encrypted credentials and increment secret version when changed.");
  }

  remove() {
    return todo("TODO: soft delete registry account and erase encrypted secret material.");
  }

  testConnection() {
    return todo("TODO: test login + push permission only; no real registry call in scaffold.");
  }
}
