import { nanoid } from "nanoid";

export function generateRsvpSlug(): string {
  return nanoid(8);
}
