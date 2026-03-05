export const pageMap = {
  "/": { nameKey: "common:header.home" as const, number: 1 },
  "/about": { nameKey: "common:header.about" as const, number: 2 },
  "/projects": { nameKey: "common:header.projects" as const, number: 3 },
  "/hub": { nameKey: "common:header.hub" as const, number: 4 },
  "/contact": { nameKey: "common:header.contact" as const, number: 5 },
} as const;

export type PageInfo = (typeof pageMap)[keyof typeof pageMap];
export type PageMap = typeof pageMap;