export const pageMap = {
  "/": { nameKey: "header.home" as const, number: 1 },
  "/about": { nameKey: "header.about" as const, number: 2 },
  "/projects": { nameKey: "header.projects" as const, number: 3 },
  "/contact": { nameKey: "header.contact" as const, number: 4 },
} as const;

export type PageInfo = (typeof pageMap)[keyof typeof pageMap];
export type PageMap = typeof pageMap;