export const pageMap = {
  "/": { nameKey: "common:header.home" as const, number: 1 },
  "/about": { nameKey: "common:header.about" as const, number: 2 },
  "/projects": { nameKey: "common:header.projects" as const, number: 3 },
  "/contact": { nameKey: "common:header.contact" as const, number: 4 },
} as const;

export type PageInfo = (typeof pageMap)[keyof typeof pageMap];
export type PageMap = typeof pageMap;