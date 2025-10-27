import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  frontmatterPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  BlockTypeSelect,
  InsertCodeBlock,
  type MDXEditorMethods,
  DiffSourceToggleWrapper,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  ShowSandpackInfo,
  ChangeCodeMirrorLanguage,
  ConditionalContents,
  Separator,
  HighlightToggle,
  StrikeThroughSupSubToggles,
  ChangeAdmonitionType,
  InsertFrontmatter
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useRef, useState, useEffect } from "react";
import type { Language, PostWithTranslations } from "../../lib/blog";

interface MDXEditorWrapperProps {
  postId?: string;
}

export function MDXEditorWrapper({ postId }: MDXEditorWrapperProps) {
  const editorRef = useRef<MDXEditorMethods>(null);

  // Languages
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // Post data
  const [post, setPost] = useState<PostWithTranslations | null>(null);
  const [featuredImage, setFeaturedImage] = useState("");
  const [globalPublished, setGlobalPublished] = useState(false);

  // Translation data (per language)
  const [translations, setTranslations] = useState<
    Record<
      string,
      {
        id?: string;
        slug: string;
        title: string;
        description: string;
        content: string;
        isPublished: boolean;
      }
    >
  >({});

  // UI state
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load languages and post data
  useEffect(() => {
    loadLanguages();
    if (postId) {
      loadPost(postId);
    }
  }, [postId]);

  const loadLanguages = async () => {
    try {
      const response = await fetch("/api/languages");
      if (!response.ok) throw new Error("Failed to load languages");

      const data = await response.json();
      setLanguages(data);

      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].code);
      }
    } catch (error) {
      console.error("Error loading languages:", error);
      setMessage("❌ Error loading languages");
    }
  };

  const loadPost = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/posts/${id}`);
      if (!response.ok) throw new Error("Failed to load post");

      const data: PostWithTranslations = await response.json();
      setPost(data);
      setFeaturedImage(data.featured_image || "");
      setGlobalPublished(data.is_published);

      // Populate translations
      const translationsData: Record<string, any> = {};
      data.translations.forEach((t) => {
        translationsData[t.language.code] = {
          id: t.id,
          slug: t.slug,
          title: t.title,
          description: t.description || "",
          content: t.content,
          isPublished: t.is_published,
        };
      });
      setTranslations(translationsData);

      // Set active tab to first available translation
      if (data.translations.length > 0) {
        setActiveTab(data.translations[0].language.code);
      }
    } catch (error) {
      console.error("Error loading post:", error);
      setMessage("❌ Error loading post");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const updateTranslation = (
    lang: string,
    field: string,
    value: any,
    autoGenerateSlug = true
  ) => {
    setTranslations((prev) => {
      const existingTranslation = prev[lang] || {
        slug: "",
        title: "",
        description: "",
        content: "# Your post title\n\nStart writing...",
        isPublished: false,
      };

      return {
        ...prev,
        [lang]: {
          ...existingTranslation,
          [field]: value,
          // Auto-generate slug from title when typing title
          ...(field === "title" && autoGenerateSlug
            ? { slug: generateSlug(value) }
            : {}),
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const activeTranslation = translations[activeTab];

      if (!activeTranslation?.slug || !activeTranslation?.title) {
        setMessage(
          `❌ Please fill in slug and title for ${activeTab.toUpperCase()}`
        );
        setSaving(false);
        return;
      }

      // Get current content from editor
      const content = editorRef.current?.getMarkdown() || "";

      if (!content || content.trim() === "") {
        setMessage("❌ Content cannot be empty");
        setSaving(false);
        return;
      }

      // Update translation content
      updateTranslation(activeTab, "content", content);

      let postIdToUse = postId;

      // If creating new post
      if (!postId) {
        const createResponse = await fetch("/api/blog/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_code: activeTab,
            slug: activeTranslation.slug,
            title: activeTranslation.title,
            description: activeTranslation.description || null,
            content,
            is_published: activeTranslation.isPublished,
            featured_image: featuredImage || null,
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || "Failed to create post");
        }

        const newPost = await createResponse.json();
        postIdToUse = newPost.id;

        // Update URL with new post ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("postId", newPost.id);
        window.history.replaceState({}, "", newUrl.toString());

        setMessage("✅ Post created successfully!");
        await loadPost(newPost.id);
      } else {
        // Update existing post
        // 1. Update global post settings
        await fetch(`/api/blog/posts?id=${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_published: globalPublished,
            featured_image: featuredImage || null,
          }),
        });

        // 2. Update or create translation
        if (activeTranslation.id) {
          // Update existing translation
          const updateResponse = await fetch(
            `/api/blog/translations?id=${activeTranslation.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                slug: activeTranslation.slug,
                title: activeTranslation.title,
                description: activeTranslation.description || null,
                content,
                is_published: activeTranslation.isPublished,
              }),
            }
          );

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.error || "Failed to update translation");
          }
        } else {
          // Create new translation
          const createResponse = await fetch("/api/blog/translations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              post_id: postId,
              language_code: activeTab,
              slug: activeTranslation.slug,
              title: activeTranslation.title,
              description: activeTranslation.description || null,
              content,
              is_published: activeTranslation.isPublished,
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.error || "Failed to create translation");
          }
        }

        setMessage("✅ Saved successfully!");
        await loadPost(postId);
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-white">Loading post...</div>
      </div>
    );
  }

  const activeTranslation = translations[activeTab] || {
    slug: "",
    title: "",
    description: "",
    content: "# Your post title\n\nStart writing...",
    isPublished: false,
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {postId ? "Edit Post" : "Create New Post"}
        </h1>
      </div>

      {/* Language Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex gap-2">
          {languages.map((lang) => {
            const hasTranslation = translations[lang.code]?.id;
            return (
              <button
                key={lang.code}
                onClick={() => setActiveTab(lang.code)}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  activeTab === lang.code
                    ? "text-cyan-400 border-b-2 border-cyan-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {lang.native_name}
                {hasTranslation && (
                  <span className="ml-2 text-xs text-green-400">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Global Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Featured Image URL
            </label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="global-published"
              checked={globalPublished}
              onChange={(e) => setGlobalPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="global-published" className="text-sm text-gray-300">
              Publish post globally (all translations)
            </label>
          </div>
        </div>
      </div>

      {/* Translation Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {languages.find((l) => l.code === activeTab)?.native_name} Translation
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Title *
            </label>
            <input
              type="text"
              value={activeTranslation.title}
              onChange={(e) =>
                updateTranslation(activeTab, "title", e.target.value)
              }
              placeholder="My Awesome Blog Post"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Slug (URL) *
            </label>
            <input
              type="text"
              value={activeTranslation.slug}
              onChange={(e) =>
                updateTranslation(
                  activeTab,
                  "slug",
                  generateSlug(e.target.value),
                  false
                )
              }
              placeholder="my-awesome-blog-post"
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Preview: /blog/{activeTranslation.slug || "your-slug"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Description (for SEO)
            </label>
            <textarea
              value={activeTranslation.description}
              onChange={(e) =>
                updateTranslation(activeTab, "description", e.target.value)
              }
              placeholder="A brief description (recommended 150-160 characters)"
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {activeTranslation.description.length} characters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="translation-published"
              checked={activeTranslation.isPublished}
              onChange={(e) =>
                updateTranslation(activeTab, "isPublished", e.target.checked)
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="translation-published"
              className="text-sm text-gray-300"
            >
              Publish this translation
            </label>
          </div>
        </div>
      </div>

      {/* MDX Editor */}
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="border-b border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-white">Content</h2>
        </div>
        <div className="p-4">
          <MDXEditor
            key={activeTab}
            ref={editorRef}
            markdown={activeTranslation.content}
            plugins={[
              // Plugins must be loaded in the correct order
              headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              imagePlugin({
                imageAutocompleteSuggestions: [],
                disableImageResize: true,
              }),
              tablePlugin(),
              frontmatterPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
              codeMirrorPlugin({
                codeBlockLanguages: {
                  js: "JavaScript",
                  jsx: "JavaScript (React)",
                  ts: "TypeScript",
                  tsx: "TypeScript (React)",
                  css: "CSS",
                  html: "HTML",
                  python: "Python",
                  bash: "Bash",
                  json: "JSON",
                  sql: "SQL",
                  yaml: "YAML",
                  markdown: "Markdown",
                  txt: "Plain Text",
                },
              }),
              directivesPlugin({
                directiveDescriptors: [AdmonitionDirectiveDescriptor],
              }),
              diffSourcePlugin({ viewMode: "rich-text" }),
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <DiffSourceToggleWrapper>
                    <ConditionalContents
                      options={[
                        {
                          when: (editor) => editor?.editorType === "codeblock",
                          contents: () => <ChangeCodeMirrorLanguage />,
                        },
                        {
                          when: (editor) => editor?.editorType === "sandpack",
                          contents: () => <ShowSandpackInfo />,
                        },
                        {
                          fallback: () => (
                            <>
                              <UndoRedo />
                              <Separator />

                              <BlockTypeSelect />
                              <Separator />

                              <BoldItalicUnderlineToggles />
                              <CodeToggle />
                              <Separator />

                              <StrikeThroughSupSubToggles />
                              <Separator />

                              <ListsToggle />
                              <Separator />

                              <CreateLink />
                              <InsertImage />
                              <Separator />

                              <InsertTable />
                              <InsertThematicBreak />
                              <Separator />

                              <InsertCodeBlock />
                              <Separator />

                              <InsertFrontmatter />
                            </>
                          ),
                        },
                      ]}
                    />
                  </DiffSourceToggleWrapper>
                ),
              }),
            ]}
            contentEditableClassName="prose prose-invert max-w-none min-h-[500px] px-4 py-2 text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <div
            className={`text-sm ${
              message.startsWith("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
