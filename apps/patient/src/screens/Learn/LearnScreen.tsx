/**
 * Learn Screen
 * Educational articles organized by category with recommendations
 */

import { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Heart,
  Brain,
  Apple,
  Dumbbell,
  Pill,
  Sun,
  FileText,
  Loader2,
  AlertCircle,
  Scan,
} from 'lucide-react';
import { useArticles, useArticleCategories, useRecommendedArticles } from '../../hooks/learn/useArticles';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import TabBanner from '../../components/layout/TabBanner';

// Category icon mapping
const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Heart: Heart,
  Brain: Brain,
  Apple: Apple,
  Dumbbell: Dumbbell,
  Pill: Pill,
  Sun: Sun,
  FileText: FileText,
  Scan: Scan,
};

// Category color themes - matching dashboard style
export const categoryColors: Record<string, {
  bg: string;
  bgHover: string;
  border: string;
  borderActive: string;
  text: string;
  glow: string;
}> = {
  'Heart Health': {
    bg: 'bg-rose-500/10',
    bgHover: 'hover:bg-rose-500/15',
    border: 'border-rose-500/20',
    borderActive: 'border-rose-500/40',
    text: 'text-rose-400',
    glow: 'bg-rose-500/10',
  },
  'Brain Health': {
    bg: 'bg-violet-500/10',
    bgHover: 'hover:bg-violet-500/15',
    border: 'border-violet-500/20',
    borderActive: 'border-violet-500/40',
    text: 'text-violet-400',
    glow: 'bg-violet-500/10',
  },
  'Nutrition': {
    bg: 'bg-emerald-500/10',
    bgHover: 'hover:bg-emerald-500/15',
    border: 'border-emerald-500/20',
    borderActive: 'border-emerald-500/40',
    text: 'text-emerald-400',
    glow: 'bg-emerald-500/10',
  },
  'Exercise': {
    bg: 'bg-sky-500/10',
    bgHover: 'hover:bg-sky-500/15',
    border: 'border-sky-500/20',
    borderActive: 'border-sky-500/40',
    text: 'text-sky-400',
    glow: 'bg-sky-500/10',
  },
  'Medications': {
    bg: 'bg-orange-500/10',
    bgHover: 'hover:bg-orange-500/15',
    border: 'border-orange-500/20',
    borderActive: 'border-orange-500/40',
    text: 'text-orange-400',
    glow: 'bg-orange-500/10',
  },
  'Mental Health': {
    bg: 'bg-pink-500/10',
    bgHover: 'hover:bg-pink-500/15',
    border: 'border-pink-500/20',
    borderActive: 'border-pink-500/40',
    text: 'text-pink-400',
    glow: 'bg-pink-500/10',
  },
  'Imaging': {
    bg: 'bg-cyan-500/10',
    bgHover: 'hover:bg-cyan-500/15',
    border: 'border-cyan-500/20',
    borderActive: 'border-cyan-500/40',
    text: 'text-cyan-400',
    glow: 'bg-cyan-500/10',
  },
  'Lifestyle': {
    bg: 'bg-lime-500/10',
    bgHover: 'hover:bg-lime-500/15',
    border: 'border-lime-500/20',
    borderActive: 'border-lime-500/40',
    text: 'text-lime-400',
    glow: 'bg-lime-500/10',
  },
};

// Default amber color for unknown categories
const defaultCategoryColor = {
  bg: 'bg-amber-500/10',
  bgHover: 'hover:bg-amber-500/15',
  border: 'border-amber-500/20',
  borderActive: 'border-amber-500/40',
  text: 'text-amber-400',
  glow: 'bg-amber-500/10',
};

export function getCategoryColor(category: string) {
  return categoryColors[category] || defaultCategoryColor;
}

// Category sort order (first = highest priority)
const categorySortOrder: string[] = [
  'Heart Health',
  'Brain Health',
  'Lifestyle',
  'Nutrition',
  'Exercise',
  'Mental Health',
  'Medications',
  'Imaging',
];

function getCategorySortIndex(category: string): number {
  const index = categorySortOrder.indexOf(category);
  return index === -1 ? 999 : index; // Unknown categories go to the end
}

export default function LearnScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { categories, loading: categoriesLoading } = useArticleCategories();
  const { articles: recommendedArticles, loading: recommendedLoading } = useRecommendedArticles();
  const { articles: allArticles, loading: articlesLoading, error } = useArticles(
    selectedCategory === 'all' ? undefined : selectedCategory
  );

  // Filter and sort articles by search query and category
  const filteredArticles = allArticles
    .filter((article) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.snippet.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => getCategorySortIndex(a.category) - getCategorySortIndex(b.category));

  // If an article is selected, show the detail view
  if (selectedArticleId) {
    return (
      <ArticleDetail
        articleId={selectedArticleId}
        onBack={() => setSelectedArticleId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <TabBanner tab="learn" design={2} />

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400" />
          <p className="text-sm text-red-400">Failed to load articles. Please try again.</p>
        </div>
      )}

      {/* Recommended Section */}
      {!searchQuery && recommendedArticles.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-400" />
            <h2 className="text-sm font-medium text-text-secondary">Recommended for You</h2>
          </div>

          {recommendedLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-amber-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recommendedArticles.slice(0, 6).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticleId(article.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                : 'bg-surface border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            <BookOpen size={16} />
            <span className="text-[11px] font-medium">All</span>
          </button>

          {categoriesLoading ? (
            <div className="col-span-4 flex items-center justify-center py-4">
              <Loader2 size={16} className="text-text-muted animate-spin" />
            </div>
          ) : (
            categories.slice(0, 4).map((category) => {
              const IconComponent = categoryIcons[category.icon] || FileText;
              const isSelected = selectedCategory === category.name;
              const colors = getCategoryColor(category.name);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? `${colors.bg} border ${colors.borderActive} ${colors.text}`
                      : `bg-surface border border-border text-text-secondary ${colors.bgHover} hover:text-text-primary`
                  }`}
                >
                  <IconComponent size={16} />
                  <span className="text-[11px] font-medium">{category.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Articles List */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-text-secondary">
            {searchQuery
              ? `Search Results (${filteredArticles.length})`
              : selectedCategory === 'all'
              ? 'All Articles'
              : selectedCategory}
          </h2>
          {!searchQuery && (
            <span className="text-xs text-text-muted">{filteredArticles.length} articles</span>
          )}
        </div>

        {articlesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-amber-400 animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary">No articles found</p>
            {searchQuery && (
              <p className="text-sm text-text-muted mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => setSelectedArticleId(article.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
