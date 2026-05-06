import { Injectable } from "@nestjs/common";
import { mockHelpArticles } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class HelpService {
  list() {
    return mockHelpArticles;
  }

  get(slug: string) {
    return mockHelpArticles.find((article) => article.slug === slug) ?? mockHelpArticles[0];
  }

  create() {
    return todo("TODO: create HelpArticle.");
  }

  update() {
    return todo("TODO: update HelpArticle.");
  }
}
