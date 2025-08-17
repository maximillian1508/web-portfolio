import { ui, defaultLang, showDefaultLang } from "./ui";
import { getRelativeLocaleUrl } from "astro:i18n";

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

interface AlternateUrls {
  en: string;
  id: string;
  default: string;
}

type TranslationPath<T> = T extends string
  ? never
  : {
      [K in keyof T]: T[K] extends string
        ? K
        : T[K] extends Record<string, any>
        ? `${K & string}.${TranslationPath<T[K]> & string}`
        : never;
    }[keyof T];

type GetNestedValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? GetNestedValue<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

export function useTranslations(lang: keyof typeof ui) {
  return function t<P extends TranslationPath<(typeof ui)[typeof defaultLang]>>(
    path: P
  ): GetNestedValue<(typeof ui)[typeof defaultLang], P> {
    const keys = path.split(".");
    let value: any = ui[lang];
    let fallbackValue: any = ui[defaultLang];

    for (const key of keys) {
      value = value?.[key];
      fallbackValue = fallbackValue?.[key];
    }

    return (value || fallbackValue) as GetNestedValue<
      (typeof ui)[typeof defaultLang],
      P
    >;
  };
}

export function getLocalelessPath(pathname: string, lang: string): string {
  if (lang === defaultLang) return pathname;
  return pathname.replace(`/${lang}`, "") || "/";
}

export function getLocaleUrl(lang: string, path: string): string {
  const url = getRelativeLocaleUrl(lang, path);
  return url.replace(/\/$/, "") || "/";
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    if (path === "/") {
      return !showDefaultLang && lang === defaultLang ? "/" : `/${lang}`;
    }
    return !showDefaultLang && l === defaultLang ? path : `/${l}${path}`;
  };
}

export function getAlternateUrls(url: URL): AlternateUrls {
  const currentPath = url.pathname;
  const baseUrl = url.origin;

  const basePath = currentPath.replace(/^\/id/, "") || "/";

  return {
    en: `${baseUrl}${basePath}`,
    id: `${baseUrl}/id${basePath}`,
    default: `${baseUrl}${basePath}`,
  };
}
