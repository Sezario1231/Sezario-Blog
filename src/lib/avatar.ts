import { createHash } from "node:crypto";

export function emailToGravatar(email: string, size = 96): string {
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
