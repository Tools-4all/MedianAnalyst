import { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { isFirebaseConfigured } from '../lib/firebase';
import { watchNewsletterPosts } from '../services/newsletterService';

function formatDisplayDate(dateValue) {
  if (!dateValue) {
    return 'Unscheduled';
  }

  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMonthLabel(dateValue) {
  if (!dateValue) {
    return 'No Date';
  }

  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function RenderHtml({ html }) {
  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(html || ''), [html]);

  if (!sanitizedHtml) {
    return null;
  }

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

function ArchiveItem({ article, isExpanded, onToggle }) {
  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(article.contentHtml || article.content || ''),
    [article.contentHtml, article.content],
  );

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:border-secondary transition-all group cursor-pointer"
      >
        <div className="space-y-1 text-left">
          <p className="font-label-sm text-secondary">{article.month}</p>
          <h4 className="font-title-lg text-primary group-hover:text-secondary transition-colors">
            {article.title}
          </h4>
        </div>
        <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors shrink-0 ml-4">
          {isExpanded ? 'remove' : 'add'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-outline-variant/60">
          {article.summary && (
            <p className="font-body-md text-on-surface-variant">{article.summary}</p>
          )}
          {sanitizedHtml && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function NewsletterPage() {
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(isFirebaseConfigured);
  const [loadError, setLoadError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    const unsubscribe = watchNewsletterPosts(
      (nextPosts) => {
        setPosts(nextPosts);
        setIsLoadingPosts(false);
      },
      (error) => {
        setLoadError(error.message || 'Failed to load newsletter posts.');
        setIsLoadingPosts(false);
      },
    );

    return unsubscribe;
  }, []);

  const featuredArticle = useMemo(() => {
    const markedFeatured = posts.find((post) => post.featured);
    return markedFeatured || posts[0] || null;
  }, [posts]);

  const archiveArticles = useMemo(() => {
    if (!featuredArticle) {
      return [];
    }

    return posts.filter((post) => post.id !== featuredArticle.id);
  }, [posts, featuredArticle]);

  const visibleArticles = showAll ? archiveArticles : archiveArticles.slice(0, 3);
  const totalEditions = archiveArticles.length;

  return (
    <div className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-[1000px] mx-auto">
      <header className="mb-10 space-y-4">
        <h1 className="font-display-lg text-primary">Economic Insights &amp; Analysis</h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl">
          Periodic writings from 'MedianAnalyst' exploring complex economic
          trends, market analysis, and the data-driven insights that define our
          global financial landscape.
        </p>
      </header>

      {featuredArticle && (
        <article
          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-10"
          style={{
            boxShadow: '0 4px 20px -2px rgba(27, 38, 59, 0.08)',
            borderLeft: '4px solid var(--color-secondary)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter p-gutter">
            <div className="space-y-3 flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full font-label-sm uppercase tracking-wider">
                  Latest Edition
                </span>
                <span className="text-outline font-label-sm">
                  {formatDisplayDate(featuredArticle.publishedAt)}
                </span>
              </div>
              <h2 className="font-headline-md text-primary">{featuredArticle.title}</h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed">
                {featuredArticle.summary || 'No summary yet.'}
              </p>
              <RenderHtml html={featuredArticle.contentHtml || featuredArticle.content} />
            </div>

            <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden rounded-lg bg-surface-container">
              {featuredArticle.imageUrl ? (
                <img
                  src={featuredArticle.imageUrl}
                  alt="Featured newsletter visual"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-outline font-label-sm">
                  No featured image
                </div>
              )}
            </div>
          </div>
        </article>
      )}

      <div className="bg-surface-container-low p-gutter rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">archive</span>
            Newsletter Archive
          </h3>
          {totalEditions > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-secondary font-bold font-label-sm hover:underline hidden sm:block"
            >
              {showAll ? 'Show Less' : `View All ${totalEditions} Editions`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {!featuredArticle && !isLoadingPosts && !loadError && (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p className="font-body-md text-on-surface-variant">
                No newsletter posts published yet.
              </p>
            </div>
          )}

          {visibleArticles.map((article) => (
            <ArchiveItem
              key={article.id}
              article={{
                ...article,
                month: formatMonthLabel(article.publishedAt),
              }}
              isExpanded={expandedId === article.id}
              onToggle={() =>
                setExpandedId(expandedId === article.id ? null : article.id)
              }
            />
          ))}
        </div>

        {totalEditions > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-secondary font-bold font-label-sm py-2 hover:underline sm:hidden"
          >
            {showAll ? 'Show Less' : `View All ${totalEditions} Editions`}
          </button>
        )}
      </div>

      {(isLoadingPosts || loadError) && (
        <div className="mt-6 text-sm text-on-surface-variant/70">
          {isLoadingPosts && <p>Loading live newsletter posts...</p>}
          {loadError && <p>Failed to load newsletter posts. {loadError}</p>}
        </div>
      )}

      <div className="mt-10 text-center text-xs text-on-surface-variant/60">
        <p>
          Disclaimer: Information provided is for educational and perspective
          purposes only and does not constitute financial advice. Past performance
          of the DJIA or any other asset is not indicative of future results.
        </p>
        <p className="mt-2">© All rights reserved.</p>
      </div>
    </div>
  );
}
