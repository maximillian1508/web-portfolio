// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Language interface
export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Post interface (language-agnostic)
export interface Post {
  id: string;
  is_published: boolean;
  featured_image: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

// Post Translation interface (language-specific content)
export interface PostTranslation {
  id: string;
  post_id: string;
  language_id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Combined interface for convenience (post with single translation)
export interface PostWithTranslation extends Post {
  translation: PostTranslation;
  language: Language;
}

// Post with all translations
export interface PostWithTranslations extends Post {
  translations: (PostTranslation & { language: Language })[];
}

// ============================================================================
// API HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch all active languages
 */
export async function getLanguages(baseUrl?: string): Promise<Language[]> {
  try {
    const url = baseUrl || '';
    const response = await fetch(`${url}/api/languages`);

    if (!response.ok) {
      console.error('Error fetching languages:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data as Language[];
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
}

/**
 * Fetch all published posts with their translations for a given language
 */
export async function getPublishedPosts(languageCode: string, baseUrl?: string): Promise<PostWithTranslation[]> {
  try {
    const url = baseUrl || '';
    const response = await fetch(`${url}/api/blog/posts?language=${languageCode}&published=true`);

    if (!response.ok) {
      console.error('Error fetching posts:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data as PostWithTranslation[];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Fetch a single post by slug and language
 */
export async function getPostBySlug(
  slug: string,
  languageCode: string,
  baseUrl?: string
): Promise<PostWithTranslation | null> {
  try {
    const url = baseUrl || '';
    const response = await fetch(`${url}/api/blog/posts?slug=${slug}&language=${languageCode}`);

    if (!response.ok) {
      console.error('Error fetching post:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data as PostWithTranslation;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

/**
 * Get recent posts for a given language
 */
export async function getRecentPosts(
  languageCode: string,
  limit: number = 5,
  baseUrl?: string
): Promise<PostWithTranslation[]> {
  try {
    const url = baseUrl || '';
    const response = await fetch(`${url}/api/blog/posts?language=${languageCode}&published=true&limit=${limit}`);

    if (!response.ok) {
      console.error('Error fetching recent posts:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data as PostWithTranslation[];
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}

/**
 * Get a post with all its translations (for dashboard/editor)
 */
export async function getPostWithTranslations(
  postId: string,
  baseUrl?: string
): Promise<PostWithTranslations | null> {
  try {
    const url = baseUrl || '';
    const response = await fetch(`${url}/api/blog/posts/${postId}`);

    if (!response.ok) {
      console.error('Error fetching post with translations:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data as PostWithTranslations;
  } catch (error) {
    console.error('Error fetching post with translations:', error);
    return null;
  }
}
