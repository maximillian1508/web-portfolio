/**
 * Route translations for different languages
 * Maps original route names to localized URLs
 * Example: "about" -> "tentang" for Indonesian
 * English routes use original names (not included here)
 */
export const routes: Record<string, Record<string, string>> = {
  id: {
    about: "tentang",
    contact: "kontak",
    projects: "proyek",
    blog: "blog",
    // Add more route translations as needed
  },
};
