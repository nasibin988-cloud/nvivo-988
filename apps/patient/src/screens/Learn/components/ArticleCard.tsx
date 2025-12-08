/**
 * Article Card Component
 * Displays an article preview with image, title, category, and metadata
 * Grid-optimized layout for 3-column display with subtle category coloring
 */

import { Clock, BookOpen } from 'lucide-react';
import type { Article } from '../../../hooks/learn/useArticles';
import { getCategoryColor } from '../LearnScreen';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  const colors = getCategoryColor(article.category);

  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col overflow-hidden rounded-2xl ${colors.bg} border ${colors.border} hover:border-white/20 transition-all duration-300 group text-left relative`}
    >
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 ${colors.glow} opacity-30 blur-xl pointer-events-none`} />

      {/* Article Image */}
      <div className="relative">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-36 object-cover"
          />
        ) : (
          <div className={`w-full h-36 ${colors.bg} flex items-center justify-center`}>
            <BookOpen size={36} className={`${colors.text} opacity-60`} />
          </div>
        )}
        {/* Color accent bar at bottom of image */}
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${colors.bg}`} style={{ opacity: 0.8 }} />
      </div>

      {/* Article Content */}
      <div className="p-3 flex flex-col flex-1 relative">
        <h3 className={`font-medium text-text-primary text-xs leading-relaxed line-clamp-2 mb-3 group-hover:${colors.text} transition-colors`}>
          {article.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className={`text-[10px] ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full truncate border ${colors.border}`}>
            {article.category}
          </span>
          <div className="flex items-center gap-1 text-text-muted flex-shrink-0">
            <Clock size={10} />
            <span className="text-[10px]">{article.readTime}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
