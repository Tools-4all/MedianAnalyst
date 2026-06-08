import { useState, useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Extension } from '@tiptap/core';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { useOutletContext } from 'react-router-dom';
import {
  createNewsletterPost,
  deleteNewsletterPost,
  updateNewsletterPost,
  uploadNewsletterImage,
  watchNewsletterPosts,
} from '../services/newsletterService';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace('px', '') || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Palatino Linotype, serif', label: 'Palatino Linotype' },
  { value: 'Garamond, serif', label: 'Garamond' },
  { value: 'Segoe UI, sans-serif', label: 'Segoe UI' },
  { value: 'Calibri, sans-serif', label: 'Calibri' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

const FONT_SIZE_OPTIONS = ['12', '14', '16', '18', '20', '24', '28', '32'];

const INITIAL_FORM = {
  title: '',
  summary: '',
  contentHtml: '<p></p>',
  imageUrl: '',
  publishedDate: '',
  featured: false,
};

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function parseDateParts(dateValue) {
  if (!dateValue || !dateValue.includes('-')) {
    return { year: '', month: '', day: '' };
  }

  const [year, month, day] = dateValue.split('-');
  return { year: year || '', month: month || '', day: day || '' };
}

function formatPublishDate(parts) {
  if (!parts.year || !parts.month || !parts.day) {
    return '';
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function toFormValues(post) {
  return {
    title: post.title || '',
    summary: post.summary || '',
    contentHtml: post.contentHtml || post.content || '<p></p>',
    imageUrl: post.imageUrl || '',
    publishedDate: post.publishedAt
      ? new Date(post.publishedAt).toISOString().split('T')[0]
      : '',
    featured: Boolean(post.featured),
  };
}

function ToolbarButton({ label, isActive = false, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-md border text-xs font-label-sm transition-colors ${
        isActive
          ? 'bg-primary text-on-primary border-primary'
          : 'bg-white text-on-surface border-outline-variant hover:border-secondary'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

export default function AdminBlogsPage() {
  const { currentUser } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [editingPostId, setEditingPostId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [composeMode, setComposeMode] = useState('split');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const [textColor, setTextColor] = useState('#202124');
  const [highlightColor, setHighlightColor] = useState('#fff59d');

  const dateParts = useMemo(
    () => parseDateParts(formValues.publishedDate),
    [formValues.publishedDate],
  );
  const livePreviewHtml = useMemo(
    () => DOMPurify.sanitize(formValues.contentHtml || '<p></p>'),
    [formValues.contentHtml],
  );
  const yearOptions = useMemo(
    () => Array.from({ length: 10 }, (_, index) => String(2026 + index)),
    [],
  );

  const plainText = useMemo(() => {
    const temp = document.createElement('div');
    temp.innerHTML = formValues.contentHtml || '';
    return temp.textContent || temp.innerText || '';
  }, [formValues.contentHtml]);
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = wordCount ? Math.max(1, Math.ceil(wordCount / 220)) : 0;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextAlign.configure({ types: ['paragraph'], alignments: ['left', 'center', 'right'] }),
      Placeholder.configure({ placeholder: 'Write your blog post...' }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
    ],
    content: INITIAL_FORM.contentHtml,
    editorProps: {
      attributes: {
        class:
          'min-h-[420px] rounded-b-xl border border-outline-variant border-t-0 bg-white px-5 py-5 focus:outline-none prose prose-sm max-w-none',
        style: 'font-family: Arial, sans-serif; font-size: 16px; line-height: 1.75;',
      },
    },
    onUpdate({ editor: currentEditor }) {
      const html = currentEditor.getHTML();
      setFormValues((current) =>
        current.contentHtml === html
          ? current
          : {
              ...current,
              contentHtml: html,
            },
      );
    },
  });

  const selectedFontFamily = editor?.getAttributes('textStyle').fontFamily || 'Arial, sans-serif';
  const selectedFontSize = editor?.getAttributes('textStyle').fontSize || '16';

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const desiredHtml = formValues.contentHtml || '<p></p>';
    if (editor.getHTML() !== desiredHtml) {
      editor.commands.setContent(desiredHtml, { emitUpdate: false });
    }
  }, [editor, formValues.contentHtml]);

  useEffect(() => {
    const unsubscribe = watchNewsletterPosts(
      (nextPosts) => {
        setPosts(nextPosts);
      },
      (error) => {
        setFormError(error.message || 'Failed to load newsletter posts.');
      },
    );

    return unsubscribe;
  }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDatePartChange = (part, value) => {
    const nextParts = {
      ...dateParts,
      [part]: value,
    };

    setFormValues((current) => ({
      ...current,
      publishedDate: formatPublishDate(nextParts),
    }));
  };

  const resetForm = () => {
    setEditingPostId('');
    setFormValues(INITIAL_FORM);
    setFormError('');
    setUploadNotice('');
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setFormValues(toFormValues(post));
    setFormError('');
    setUploadNotice('');
    if (editor) {
      editor.commands.setContent(post.contentHtml || post.content || '<p></p>', {
        emitUpdate: false,
      });
    }
  };

  const validateImage = (file) => {
    if (!file) {
      return 'Please choose an image file.';
    }
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Image must be 5MB or smaller.';
    }
    return '';
  };

  const insertImageIntoEditor = (imageUrl, fileName = 'Image') => {
    if (!editor) {
      return;
    }

    editor.chain().focus().setImage({ src: imageUrl, alt: fileName }).run();
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImage(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError('');
    setUploadNotice('');
    setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadNewsletterImage(file, currentUser?.email || 'admin');

      setFormValues((current) => ({
        ...current,
        imageUrl: uploadedUrl,
      }));

      insertImageIntoEditor(uploadedUrl, file.name);

      setUploadNotice('Image uploaded and inserted into content.');
    } catch (error) {
      setFormError(error.message || 'Image upload failed.');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleInlineImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateImage(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError('');
    setUploadNotice('');
    setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadNewsletterImage(file, currentUser?.email || 'admin');
      insertImageIntoEditor(uploadedUrl, file.name);
      setUploadNotice('Inline image uploaded successfully.');
    } catch (error) {
      setFormError(error.message || 'Inline image upload failed.');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingPostId) {
        await updateNewsletterPost(editingPostId, formValues);
      } else {
        await createNewsletterPost(formValues);
      }
      resetForm();
    } catch (error) {
      setFormError(error.message || 'Failed to save post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (postId) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) {
      return;
    }

    setDeleteTarget(post);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteNewsletterPost(deleteTarget.id);
      if (editingPostId === deleteTarget.id) {
        resetForm();
      }
      setDeleteTarget(null);
    } catch (error) {
      setFormError(error.message || 'Failed to delete post.');
    }
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-title-lg text-primary">
              {editingPostId ? 'Editing Blog Post' : 'New Blog Post'}
            </h2>
            <p className="font-label-sm text-on-surface-variant">
              {wordCount} words {readingMinutes > 0 ? `• ${readingMinutes} min read` : ''}
            </p>
          </div>

          <div className="flex rounded-lg border border-outline-variant overflow-hidden">
            {['write', 'split', 'preview'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setComposeMode(mode)}
                className={`px-4 py-2 text-xs font-label-sm capitalize ${
                  composeMode === mode
                    ? 'bg-primary text-on-primary'
                    : 'bg-white text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            placeholder="Blog title"
            className="w-full border border-outline-variant rounded-xl px-4 py-3 bg-white font-title-lg"
            required
          />

          <textarea
            name="summary"
            value={formValues.summary}
            onChange={handleInputChange}
            rows={3}
            placeholder="Summary for newsletter archive"
            className="w-full border border-outline-variant rounded-xl px-4 py-3 bg-white"
          />

          <div className={`grid gap-4 ${composeMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
            {(composeMode === 'write' || composeMode === 'split') && (
              <div>
                <div className="flex flex-wrap items-center gap-2 rounded-t-xl border border-outline-variant border-b-0 bg-surface-container-low px-2 py-2">
                  <ToolbarButton
                    label="B"
                    isActive={editor?.isActive('bold')}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  />
                  <ToolbarButton
                    label="I"
                    isActive={editor?.isActive('italic')}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  />
                  <ToolbarButton
                    label="U"
                    isActive={editor?.isActive('underline')}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  />
                  <ToolbarButton
                    label="S"
                    isActive={editor?.isActive('strike')}
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                  />
                  <ToolbarButton
                    label="Left"
                    isActive={editor?.isActive({ textAlign: 'left' })}
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  />
                  <ToolbarButton
                    label="Center"
                    isActive={editor?.isActive({ textAlign: 'center' })}
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  />
                  <ToolbarButton
                    label="Right"
                    isActive={editor?.isActive({ textAlign: 'right' })}
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  />
                  <ToolbarButton
                    label="Sub"
                    isActive={editor?.isActive('subscript')}
                    onClick={() => editor?.chain().focus().toggleSubscript().run()}
                  />
                  <ToolbarButton
                    label="Sup"
                    isActive={editor?.isActive('superscript')}
                    onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                  />
                  <ToolbarButton
                    label="Undo"
                    onClick={() => editor?.chain().focus().undo().run()}
                    disabled={!editor?.can().chain().focus().undo().run()}
                  />
                  <ToolbarButton
                    label="Redo"
                    onClick={() => editor?.chain().focus().redo().run()}
                    disabled={!editor?.can().chain().focus().redo().run()}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 border border-outline-variant border-t-0 bg-white px-3 py-2">
                  <select
                    value={selectedFontFamily}
                    onChange={(event) => {
                      const fontFamily = event.target.value;
                      if (!editor) {
                        return;
                      }
                      editor.chain().focus().setFontFamily(fontFamily).run();
                    }}
                    className="border border-outline-variant rounded-md px-2 py-1 text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>

                  <select
                    value={selectedFontSize}
                    onChange={(event) => {
                      const fontSize = event.target.value;
                      if (!editor) {
                        return;
                      }
                      editor.chain().focus().setFontSize(fontSize).run();
                    }}
                    className="border border-outline-variant rounded-md px-2 py-1 text-sm"
                  >
                    {FONT_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 text-xs font-label-sm text-on-surface-variant">
                    Text
                    <input
                      type="color"
                      value={textColor}
                      onChange={(event) => {
                        const color = event.target.value;
                        setTextColor(color);
                        editor?.chain().focus().setColor(color).run();
                      }}
                      className="h-8 w-8 border border-outline-variant rounded"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs font-label-sm text-on-surface-variant">
                    Highlight
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(event) => {
                        const color = event.target.value;
                        setHighlightColor(color);
                        editor?.chain().focus().setHighlight({ color }).run();
                      }}
                      className="h-8 w-8 border border-outline-variant rounded"
                    />
                  </label>

                  <ToolbarButton
                    label="Link"
                    isActive={editor?.isActive('link')}
                    onClick={() => {
                      if (!editor) {
                        return;
                      }
                      const previousUrl = editor.getAttributes('link').href;
                      const url = window.prompt('Enter URL', previousUrl || 'https://');
                      if (url === null) {
                        return;
                      }
                      if (url === '') {
                        editor.chain().focus().unsetLink().run();
                        return;
                      }
                      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                    }}
                  />
                  <ToolbarButton
                    label="Image"
                    onClick={() => inlineImageInputRef.current?.click()}
                  />
                  <ToolbarButton
                    label="Clear"
                    onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
                  />
                </div>

                <input
                  ref={inlineImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                  className="hidden"
                />

                <EditorContent editor={editor} />
              </div>
            )}

            {(composeMode === 'preview' || composeMode === 'split') && (
              <div className="min-h-[520px] rounded-xl border border-outline-variant bg-white px-5 py-5 overflow-auto">
                <h3 className="font-title-lg text-primary mb-2">Live Preview</h3>
                <p className="font-body-md text-on-surface-variant mb-4">{formValues.summary || 'No summary yet.'}</p>
                {formValues.imageUrl && (
                  <img
                    src={formValues.imageUrl}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-lg border border-outline-variant mb-4"
                  />
                )}
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: livePreviewHtml }} />
              </div>
            )}
          </div>

          {formError && <p className="text-error font-label-sm">{formError}</p>}
          {uploadNotice && <p className="text-secondary font-label-sm">{uploadNotice}</p>}
        </form>
      </div>

      <aside className="space-y-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-4">
          <h3 className="font-title-lg text-primary">Blog Post Settings</h3>

          <div className="space-y-2">
            <label className="font-label-sm text-on-surface-variant">Featured image URL</label>
            <input
              name="imageUrl"
              value={formValues.imageUrl}
              onChange={handleInputChange}
              placeholder="https://..."
              className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-white"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-dashed border-outline-variant p-3 bg-surface-container-low">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="w-full border border-outline-variant rounded-lg px-4 py-2 font-label-sm bg-white disabled:opacity-70"
            >
              {isUploadingImage ? 'Uploading image...' : 'Upload Featured Image'}
            </button>
            <p className="text-xs text-on-surface-variant">JPG, PNG, WEBP up to 5MB.</p>
          </div>

          <div className="space-y-2">
            <p className="font-label-sm text-on-surface-variant">Publish Date</p>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={dateParts.month}
                onChange={(event) => handleDatePartChange('month', event.target.value)}
                className="border border-outline-variant rounded-lg px-2 py-2 bg-white text-sm"
              >
                <option value="">Month</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>

              <select
                value={dateParts.day}
                onChange={(event) => handleDatePartChange('day', event.target.value)}
                className="border border-outline-variant rounded-lg px-2 py-2 bg-white text-sm"
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0')).map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              <select
                value={dateParts.year}
                onChange={(event) => handleDatePartChange('year', event.target.value)}
                className="border border-outline-variant rounded-lg px-2 py-2 bg-white text-sm"
              >
                <option value="">Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-outline-variant px-3 py-2 bg-white">
            <span className="font-label-sm text-on-surface">Mark as featured</span>
            <input
              type="checkbox"
              name="featured"
              checked={formValues.featured}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
          </label>

          <div className="space-y-2">
            <button
              type="button"
              onClick={(event) => handleSubmit(event)}
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary rounded-lg px-4 py-2 font-label-sm disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : editingPostId ? 'Update Post' : 'Publish Post'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full border border-outline-variant rounded-lg px-4 py-2 font-label-sm"
            >
              Reset Form
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <h3 className="font-title-lg text-primary mb-3">Existing Posts</h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {posts.length === 0 && (
              <p className="font-body-md text-on-surface-variant">No posts yet.</p>
            )}

            {posts.map((post) => (
              <article key={post.id} className="border border-outline-variant rounded-lg p-3 space-y-2 bg-white">
                <h4 className="font-title-lg text-primary line-clamp-2">{post.title || 'Untitled'}</h4>
                <p className="font-label-sm text-on-surface-variant">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : 'No publish date'}
                  {post.featured ? ' • Featured' : ''}
                </p>
                {post.summary && (
                  <p className="font-body-md text-on-surface-variant line-clamp-2">{post.summary}</p>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-secondary font-label-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => requestDelete(post.id)}
                    className="text-error font-label-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </aside>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4">
            <h3 className="font-headline-sm text-primary">Delete Post?</h3>
            <p className="font-body-md text-on-surface-variant">
              This will permanently delete "{deleteTarget.title || 'Untitled'}".
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="border border-outline-variant rounded-lg px-4 py-2 font-label-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="bg-error text-on-error rounded-lg px-4 py-2 font-label-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
