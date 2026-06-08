import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Link } from 'react-router-dom';
import {
  adminEmails,
  auth,
  isAdminAllowlistConfigured,
  isFirebaseConfigured,
} from '../lib/firebase';
import {
  createNewsletterPost,
  deleteNewsletterPost,
  uploadNewsletterImage,
  updateNewsletterPost,
  watchNewsletterPosts,
} from '../services/newsletterService';

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

function isAllowedAdmin(email) {
  if (!email || adminEmails.size === 0) {
    return false;
  }

  return adminEmails.has(email.toLowerCase());
}

function getAuthErrorMessage(error) {
  const code = error?.code || '';

  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Invalid email or password.';
  }

  if (code === 'auth/user-not-found') {
    return 'This user does not exist in Firebase Authentication.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Wait a moment and try again.';
  }

  return error?.message || 'Login failed.';
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

function ToolbarButton({ label, isActive, onClick, disabled = false }) {
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

export default function AdminNewsletterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(
    () => Boolean(auth && isFirebaseConfigured),
  );
  const [authError, setAuthError] = useState('');
  const [resetNotice, setResetNotice] = useState('');

  const [posts, setPosts] = useState([]);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [editingPostId, setEditingPostId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [composeMode, setComposeMode] = useState('split');

  const isAdmin = useMemo(() => isAllowedAdmin(currentUser?.email), [currentUser]);
  const dateParts = useMemo(
    () => parseDateParts(formValues.publishedDate),
    [formValues.publishedDate],
  );
  const yearOptions = useMemo(() => {
    const startYear = 2026;
    return Array.from({ length: 10 }, (_, index) => String(startYear + index));
  }, []);
  const livePreviewHtml = useMemo(
    () => DOMPurify.sanitize(formValues.contentHtml || '<p></p>'),
    [formValues.contentHtml],
  );

  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Image,
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Write your blog post...' }),
    ],
    content: INITIAL_FORM.contentHtml,
    editorProps: {
      attributes: {
        class:
          'min-h-[420px] rounded-b-xl border border-outline-variant border-t-0 bg-white px-5 py-5 focus:outline-none prose prose-sm max-w-none',
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

  const wordCount = editor
    ? editor
        .getText()
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
  const readingMinutes = wordCount ? Math.max(1, Math.ceil(wordCount / 220)) : 0;

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsCheckingAuth(false);
      if (!user) {
        setPosts([]);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      return undefined;
    }

    const unsubscribe = watchNewsletterPosts(
      (nextPosts) => {
        setPosts(nextPosts);
      },
      (error) => {
        setFormError(error.message || 'Failed to load newsletter posts.');
      },
    );

    return unsubscribe;
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const desiredHtml = formValues.contentHtml || '<p></p>';
    if (editor.getHTML() !== desiredHtml) {
      editor.commands.setContent(desiredHtml, { emitUpdate: false });
    }
  }, [editor, formValues.contentHtml]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!auth) {
      setAuthError('Firebase Auth is not configured.');
      return;
    }

    setAuthError('');
    setResetNotice('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!isAllowedAdmin(credential.user.email)) {
        await signOut(auth);
        setAuthError('Your account is not allowed to access this admin panel.');
      }
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  };

  const handleResetPassword = async () => {
    if (!auth) {
      setAuthError('Firebase Auth is not configured.');
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setAuthError('Enter your email first, then click Reset Password.');
      return;
    }

    setAuthError('');
    setResetNotice('');

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setResetNotice('Password reset email sent. Check your inbox and spam folder.');
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
    setPosts([]);
    setEditingPostId('');
    setFormValues(INITIAL_FORM);
    setUploadNotice('');
    setComposeMode('split');
  };

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

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setFormValues(toFormValues(post));
    setFormError('');
    setUploadNotice('');
  };

  const resetForm = () => {
    setEditingPostId('');
    setFormValues(INITIAL_FORM);
    setFormError('');
    setUploadNotice('');
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFormError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be 5MB or smaller.');
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

      if (editor) {
        editor.chain().focus().setImage({ src: uploadedUrl, alt: file.name }).run();
      }

      setUploadNotice('Image uploaded and inserted into content.');
    } catch (error) {
      setFormError(error.message || 'Image upload failed.');
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

  const addLink = () => {
    if (!editor || !linkUrl.trim()) {
      return;
    }

    editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    setLinkUrl('');
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
          <h1 className="font-headline-md text-primary">Admin Setup Required</h1>
          <p className="font-body-md text-on-surface-variant">
            Firebase is not configured yet. Add your Vite Firebase variables and reload the app.
          </p>
          <Link to="/" className="text-secondary font-label-sm hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdminAllowlistConfigured) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4">
          <h1 className="font-headline-md text-primary">Admin Allowlist Required</h1>
          <p className="font-body-md text-on-surface-variant">
            Set <strong>VITE_ADMIN_EMAILS</strong> in your .env file to at least one admin email.
          </p>
          <Link to="/" className="text-secondary font-label-sm hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-2xl mx-auto">Checking authentication...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-md mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h1 className="font-headline-sm text-primary mb-4">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-email" className="font-label-sm text-on-surface-variant">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-password" className="font-label-sm text-on-surface-variant">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 bg-white"
                required
              />
            </div>

            {authError && <p className="text-error font-label-sm">{authError}</p>}
            {resetNotice && <p className="text-secondary font-label-sm">{resetNotice}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-on-primary rounded-lg px-4 py-2 font-label-sm"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={handleResetPassword}
              className="w-full border border-outline-variant rounded-lg px-4 py-2 font-label-sm"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="max-w-xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-3">
          <h1 className="font-headline-sm text-primary">Access Denied</h1>
          <p className="font-body-md text-on-surface-variant">
            Your account is authenticated but not allowlisted for admin access.
          </p>
          <button onClick={handleLogout} className="text-secondary font-label-sm hover:underline">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 md:px-8 py-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <header className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h1 className="font-headline-sm text-primary">Blog Studio</h1>
            <p className="font-label-sm text-on-surface-variant">Signed in as {currentUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-outline-variant rounded-lg px-4 py-2 font-label-sm"
          >
            Sign out
          </button>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-title-lg text-primary">
                  {editingPostId ? 'Editing Post' : 'New Blog Post'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="title"
                  value={formValues.title}
                  onChange={handleInputChange}
                  placeholder="Post title"
                  className="md:col-span-2 w-full border border-outline-variant rounded-xl px-4 py-3 bg-white font-title-lg"
                  required
                />
                <textarea
                  name="summary"
                  value={formValues.summary}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Summary that appears on archive cards"
                  className="md:col-span-2 w-full border border-outline-variant rounded-xl px-4 py-3 bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 rounded-t-xl border border-outline-variant border-b-0 bg-surface-container-low px-2 py-2">
                  <ToolbarButton label="B" isActive={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} />
                  <ToolbarButton label="I" isActive={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} />
                  <ToolbarButton label="U" isActive={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
                  <ToolbarButton label="H1" isActive={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} />
                  <ToolbarButton label="H2" isActive={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
                  <ToolbarButton label="H3" isActive={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
                  <ToolbarButton label="Bullet" isActive={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
                  <ToolbarButton label="Number" isActive={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
                  <ToolbarButton label="Task" isActive={editor?.isActive('taskList')} onClick={() => editor?.chain().focus().toggleTaskList().run()} />
                  <ToolbarButton label="Quote" isActive={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
                  <ToolbarButton label="Left" isActive={editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()} />
                  <ToolbarButton label="Center" isActive={editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()} />
                  <ToolbarButton label="Undo" isActive={false} onClick={() => editor?.chain().focus().undo().run()} />
                  <ToolbarButton label="Redo" isActive={false} onClick={() => editor?.chain().focus().redo().run()} />
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-outline-variant bg-white px-2 py-2">
                  <input
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 min-w-[220px] border border-outline-variant rounded-md px-2 py-1 text-sm"
                  />
                  <ToolbarButton label="Add Link" onClick={addLink} disabled={!linkUrl.trim()} />
                  <ToolbarButton label="Remove Link" onClick={() => editor?.chain().focus().unsetLink().run()} />
                  <ToolbarButton label="Clear" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} />
                </div>
              </div>

              <div className={`grid gap-4 ${composeMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                {(composeMode === 'write' || composeMode === 'split') && (
                  <div>
                    <EditorContent editor={editor} />
                  </div>
                )}

                {(composeMode === 'preview' || composeMode === 'split') && (
                  <div className="min-h-[420px] rounded-xl border border-outline-variant bg-white px-5 py-5 overflow-auto">
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
              <h3 className="font-title-lg text-primary">Post Settings</h3>

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
                  onClick={handleSubmit}
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
        </section>
      </div>

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
    </div>
  );
}
