import { Injectable } from "@nestjs/common";
import { mockAnnouncements } from "../../common/mock-data";
import { todo } from "../../common/utils/mock-response";

@Injectable()
export class AnnouncementsService {
  list() {
    return mockAnnouncements;
  }

  get(id: string) {
    return mockAnnouncements.find((announcement) => String(announcement.id) === id) ?? mockAnnouncements[0];
  }

  create() {
    return todo("TODO: create Announcement.");
  }

  update() {
    return todo("TODO: update Announcement.");
  }
}
