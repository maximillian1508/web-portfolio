import { ui, defaultLang, showDefaultLang, type TranslationKey } from "./ui";
import { routes } from "./routes";

/**
 * Extracts language code from URL path
 * Example: "/id/about" -> "id", "/about" -> "en" (defaultLang)
 */
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

/**
 * Returns translation function for specific language
 * Supports namespace:key format (e.g., "common:page")
 * Falls back to defaultLang if translation not found
 */
export function useTranslations(lang: keyof typeof ui) {
  return function t(
    key: TranslationKey,
    params?: Record<string, string | number>
  ) {
    let namespace: string;
    let translationKey: string;

    // If no colon, assume "common" namespace
    if (!key.includes(":")) {
      namespace = "common";
      translationKey = key;
    } else {
      [namespace, translationKey] = key.split(":");
      if (!namespace || !translationKey) {
        return key;
      }
    }

    // Support nested object access with dot notation (e.g., "nav.home")
    const getNestedValue = (obj: any, path: string): any => {
      return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    const translation =
      getNestedValue(ui[lang]?.[namespace], translationKey) ||
      getNestedValue(ui[defaultLang]?.[namespace], translationKey) ||
      key;

    return params && typeof translation === "string"
      ? interpolateParams(translation, params)
      : translation;
  };
}

/**
 * Replaces {{key}} placeholders in text with provided parameters
 */
function interpolateParams(
  text: string,
  params: Record<string, string | number>
): string {
  return Object.entries(params).reduce(
    (result, [key, value]) =>
      result.replace(new RegExp(`{{${key}}}`, "g"), String(value)),
    text
  );
}

/**
 * Returns path translation function for specific language
 * Translates routes like "about" -> "tentang" for Indonesian
 */
export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    // Handle root path
    if (path === "/") {
      return l === defaultLang && !showDefaultLang ? "/" : `/${l}`;
    }

    // Split path into segments
    const segments = path.split("/").filter((segment) => segment);

    // Translate each segment individually
    const translatedSegments = segments.map((segment) => {
      const hasTranslation =
        defaultLang !== l &&
        routes[l] !== undefined &&
        routes[l][segment] !== undefined;
      return hasTranslation ? routes[l][segment] : segment;
    });

    const translatedPath = "/" + translatedSegments.join("/");

    return !showDefaultLang && l === defaultLang
      ? translatedPath
      : `/${l}${translatedPath}`;
  };
}

/**
 * Get localized URL for a specific language and path
 */
export function getLocalizedUrl(lang: string, path: string): string {
  // Handle root path
  if (path === "/" || path === "") {
    return lang === defaultLang && !showDefaultLang ? "/" : `/${lang}`;
  }

  // Get translated path if available
  const pathSegments = path.split("/").filter((s) => s);
  const translatedSegments = pathSegments.map((segment) => {
    return routes[lang]?.[segment] || segment;
  });

  const translatedPath =
    pathSegments.length > 0 ? "/" + translatedSegments.join("/") : "/";

  if (lang === defaultLang && !showDefaultLang) {
    return translatedPath;
  }

  if (lang === defaultLang) {
    return translatedPath;
  }

  return `/${lang}${translatedPath}`;
}

/**
 * Get alternate URLs for hreflang tags
 */
export function getAlternateUrls(currentUrl: URL, languages: string[]) {
  const pathname = currentUrl.pathname;

  // Remove language prefix from current path
  let basePath = pathname;
  for (const lang of languages) {
    if (lang !== defaultLang && pathname.startsWith(`/${lang}`)) {
      basePath = pathname.replace(`/${lang}`, "") || "/";
      break;
    }
  }

  // Reverse translate the base path (e.g., "tentang" -> "about")
  const baseSegments = basePath.split("/").filter((s) => s);
  const originalSegments = baseSegments.map((segment) => {
    // Find original English route name
    for (const [lang, routeMap] of Object.entries(routes)) {
      for (const [original, translated] of Object.entries(routeMap)) {
        if (translated === segment) {
          return original;
        }
      }
    }
    return segment;
  });

  const originalPath = "/" + originalSegments.join("/");

  // Generate URLs for each language
  const urls: Record<string, string> = {};
  for (const lang of languages) {
    urls[lang] = `${currentUrl.origin}${getLocalizedUrl(lang, originalPath)}`;
  }

  return urls;
}
