/**
 * Article Card Component
 * Displays an article preview with image, title, category, and metadata
 * Grid-optimized layout for 3-column display
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
      className={`w-full flex flex-col overflow-hidden rounded-2xl ${colors.bg} border ${colors.border} hover:${colors.borderActive} transition-all group text-left`}
    >
      {/* Article Image */}
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-24 object-cover"
        />
      ) : (
        <div className={`w-full h-24 ${colors.bg} flex items-center justify-center`}>
          <BookOpen size={28} className={colors.text} />
        </div>
      )}

      {/* Article Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className={`font-medium text-text-primary text-xs line-clamp-2 mb-2 group-hover:${colors.text} transition-colors`}>
          {article.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-1">
          <span className={`text-[10px] ${colors.text} ${colors.bg} px-1.5 py-0.5 rounded-full truncate`}>
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
