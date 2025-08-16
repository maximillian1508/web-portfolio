export const pageMap: Record<string, { name: string; number: number }> = {
  "/": { name: "Home", number: 1 },
  "/about": { name: "About", number: 2 },
  "/projects": { name: "Projects", number: 3 },
  "/contact": { name: "Contact", number: 4 },
};

export type PageInfo = {
  name: string;
  number: number;
};

export type PageMap = typeof pageMap;