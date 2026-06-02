import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * NewsletterPage
 * 
 * "Economic Insights & Analysis" — a newsletter archive page.
 * Designed to be connected to a database/CMS in the future.
 * Currently renders static placeholder articles to establish the UI pattern.
 */

// ─── Static article data (will be replaced by DB fetch in the future) ────────
const FEATURED_ARTICLE = {
  id: 'yield-curve-manufacturing-2024',
  date: 'October 24, 2024',
  title: 'The Yield Curve & Domestic Manufacturing Rebound',
  summary:
    "In this edition, we dive deep into the recent shifts in the treasury yields and how localized manufacturing initiatives are providing an unexpected buffer against global volatility. We analyze why the 'median' consumer is showing more resilience than traditional models predicted...",
  image: '/newsletter-featured.png',
};

const ARCHIVE_ARTICLES = [
  {
    id: 'inflation-emerging-markets',
    month: 'September 2024',
    title: 'Inflationary Pressures in Emerging Markets',
  },
  {
    id: 'ai-labor-efficiency',
    month: 'August 2024',
    title: 'The Impact of AI on Labor Efficiency Models',
  },
  {
    id: 'fiscal-policy-bonds',
    month: 'July 2024',
    title: 'Fiscal Policy Shifts & Long-Term Bond Stability',
  },
  {
    id: 'fed-rate-trajectory',
    month: 'June 2024',
    title: 'Fed Rate Trajectory & Housing Market Outlook',
  },
  {
    id: 'global-trade-rebalancing',
    month: 'May 2024',
    title: 'Global Trade Rebalancing After the Supply Chain Reset',
  },
];

// ─── Archive Item Sub-component ──────────────────────────────────────────────
function ArchiveItem({ article, isExpanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-outline-variant hover:border-secondary transition-all group cursor-pointer"
    >
      <div className="space-y-1">
        <p className="font-label-sm text-secondary">{article.month}</p>
        <h4 className="font-title-lg text-primary group-hover:text-secondary transition-colors">
          {article.title}
        </h4>
      </div>
      <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors shrink-0 ml-4">
        {isExpanded ? 'remove' : 'add'}
      </span>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function NewsletterPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const visibleArticles = showAll ? ARCHIVE_ARTICLES : ARCHIVE_ARTICLES.slice(0, 3);
  const totalEditions = ARCHIVE_ARTICLES.length;

  return (
    <div className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-[1000px] mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <header className="mb-10 space-y-4">
        <h1 className="font-display-lg text-primary">
          Economic Insights &amp; Analysis
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl">
          Periodic writings from 'MedianAnalyst' exploring complex economic
          trends, market analysis, and the data-driven insights that define our
          global financial landscape.
        </p>
      </header>

      {/* ── Featured / Latest Edition ───────────────────────────────────── */}
      <article
        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-10"
        style={{
          boxShadow: '0 4px 20px -2px rgba(27, 38, 59, 0.08)',
          borderLeft: '4px solid var(--color-secondary)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter p-gutter">
          {/* Text side */}
          <div className="space-y-3 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full font-label-sm uppercase tracking-wider">
                Latest Edition
              </span>
              <span className="text-outline font-label-sm">
                {FEATURED_ARTICLE.date}
              </span>
            </div>
            <h2 className="font-headline-md text-primary">
              {FEATURED_ARTICLE.title}
            </h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {FEATURED_ARTICLE.summary}
            </p>
            <div className="pt-4">
              <button className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                Read Full Edition
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Image side */}
          <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden rounded-lg">
            <img
              src={FEATURED_ARTICLE.image}
              alt="Economic Analysis visualization"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </article>

      {/* ── Newsletter Archive ──────────────────────────────────────────── */}
      <div className="bg-surface-container-low p-gutter rounded-xl space-y-6">
        {/* Archive header */}
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

        {/* Archive list */}
        <div className="grid grid-cols-1 gap-4">
          {visibleArticles.map((article) => (
            <ArchiveItem
              key={article.id}
              article={article}
              isExpanded={expandedId === article.id}
              onToggle={() =>
                setExpandedId(expandedId === article.id ? null : article.id)
              }
            />
          ))}
        </div>

        {/* Mobile toggle */}
        {totalEditions > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-secondary font-bold font-label-sm py-2 hover:underline sm:hidden"
          >
            {showAll ? 'Show Less' : `View All ${totalEditions} Editions`}
          </button>
        )}
      </div>

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
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
