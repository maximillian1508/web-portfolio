import type { AstroGlobal } from "astro";
import { ui, defaultLang } from "./ui";

export function getLangFromAstro(astro: AstroGlobal): keyof typeof ui {
  return (astro.currentLocale as keyof typeof ui) || "en";
}

export function getLangFromUrl(url: URL): keyof typeof ui {
  const pathname = url.pathname;

  // Handle Indonesian routes
  if (pathname === "/id" || pathname.startsWith("/id/")) {
    return "id";
  }

  // Default to English
  return "en";
}

export function getLocalelessPath(pathname: string, lang: string): string {
  if (lang === defaultLang) return pathname;

  // For Indonesian, remove /id prefix
  if (lang === "id") {
    if (pathname === "/id") return "/";
    return pathname.replace(/^\/id/, "") || "/";
  }

  return pathname;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(path: string) {
    const keys = path.split(".");
    let value: any = ui[lang];
    let fallbackValue: any = ui[defaultLang];

    for (const key of keys) {
      value = value?.[key];
      fallbackValue = fallbackValue?.[key];
    }

    return value || fallbackValue || path;
  };
}

export function getLocaleUrl(lang: string, path: string): string {
  if (lang === defaultLang) {
    return path;
  }

  if (path === "/") {
    return `/${lang}`;
  }

  return `/${lang}${path}`;
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    return getLocaleUrl(l, path);
  };
}

export function getAlternateUrls(url: URL) {
  const currentPath = url.pathname;
  const baseUrl = url.origin;

  let basePath = currentPath;
  if (currentPath === "/id") {
    basePath = "/";
  } else if (currentPath.startsWith("/id/")) {
    basePath = currentPath.replace(/^\/id/, "");
  }

  return {
    en: `${baseUrl}${basePath}`,
    id: basePath === "/" ? `${baseUrl}/id` : `${baseUrl}/id${basePath}`,
    default: `${baseUrl}${basePath}`,
  };
}
