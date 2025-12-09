/**
 * Article Detail Component
 * Displays full article content with markdown rendering
 */

import {
  ArrowLeft,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useArticle } from '../../../hooks/learn/useArticles';
import { getCategoryColor } from '../LearnScreen';
import QuizQuestion from './QuizQuestion';

interface ParsedQuiz {
  questionNumber: number;
  question: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface ArticleDetailProps {
  articleId: string;
  onBack: () => void;
}

export default function ArticleDetail({ articleId, onBack }: ArticleDetailProps) {
  const { article, loading, error } = useArticle(articleId);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev);
    // TODO: Save bookmark state to Firebase
  }, []);

  const handleShare = useCallback(async () => {
    if (!article) return;
    try {
      await navigator.share({
        title: article.title,
        text: article.snippet,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl hover:bg-surface transition-colors"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <h1 className="text-lg font-semibold">Article</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <p className="text-text-secondary text-center">Article not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-amber-500/15 text-amber-400 rounded-xl text-sm font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Parse quiz questions from content
  const parseQuizzes = (content: string): ParsedQuiz[] => {
    const quizzes: ParsedQuiz[] = [];

    // Match quiz question blocks
    // Format: **1. Question?**\n* (A) Option\n* (B) Option\n_Answer: A - Explanation_
    const questionRegex = /\*\*(\d+)\.\s*(.+?)\*\*\s*((?:\*\s*\([A-Z]\).+?\n?)+)\s*_Answer:\s*([A-Z])\s*-\s*(.+?)_/g;

    let match;
    while ((match = questionRegex.exec(content)) !== null) {
      const questionNumber = parseInt(match[1]);
      const question = match[2].trim();
      const optionsBlock = match[3];
      const correctAnswer = match[4];
      const explanation = match[5].trim();

      // Parse options
      const optionRegex = /\*\s*\(([A-Z])\)\s*(.+?)(?=\n\*|\n_|$)/g;
      const options: { letter: string; text: string }[] = [];
      let optMatch;
      while ((optMatch = optionRegex.exec(optionsBlock)) !== null) {
        options.push({
          letter: optMatch[1],
          text: optMatch[2].trim(),
        });
      }

      quizzes.push({
        questionNumber,
        question,
        options,
        correctAnswer,
        explanation,
      });
    }

    return quizzes;
  };

  // Simple markdown to HTML conversion
  const renderContent = (content: string) => {
    if (!content) {
      return <p className="text-text-secondary text-sm">No content available.</p>;
    }

    // Parse quizzes first
    const quizzes = parseQuizzes(content);

    // Remove quiz blocks from content for regular rendering
    let cleanContent = content;
    quizzes.forEach(() => {
      // Remove the quiz question blocks
      cleanContent = cleanContent.replace(
        /\*\*\d+\.\s*.+?\*\*\s*(?:\*\s*\([A-Z]\).+?\n?)+\s*_Answer:\s*[A-Z]\s*-\s*.+?_/g,
        '{{QUIZ_PLACEHOLDER}}'
      );
    });

    // Split by lines
    const lines = cleanContent.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let quizIndex = 0;
    let inQuizSection = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 mb-4 ml-4">
            {listItems.map((item, i) => (
              <li
                key={i}
                className="text-text-secondary text-sm leading-relaxed flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-2 flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    // Format inline elements (bold, italic, links)
    const formatInline = (text: string): string => {
      return text
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary font-medium">$1</strong>')
        // Italic (but not in the middle of words)
        .replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>')
        // Code inline
        .replace(/`(.+?)`/g, '<code class="bg-surface px-1.5 py-0.5 rounded text-amber-400 text-xs">$1</code>')
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-amber-400 hover:underline">$1</a>');
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check for quiz placeholder
      if (trimmedLine.includes('{{QUIZ_PLACEHOLDER}}')) {
        flushList();
        // Render the quiz questions for this section
        if (inQuizSection && quizIndex < quizzes.length) {
          // Render all remaining quizzes for this section
          const sectionQuizzes = quizzes.slice(quizIndex);
          sectionQuizzes.forEach((quiz, i) => {
            elements.push(
              <QuizQuestion
                key={`quiz-${quizIndex + i}`}
                questionNumber={quiz.questionNumber}
                question={quiz.question}
                options={quiz.options}
                correctAnswer={quiz.correctAnswer}
                explanation={quiz.explanation}
              />
            );
          });
          quizIndex = quizzes.length;
        }
        return;
      }

      // Empty line
      if (!trimmedLine) {
        flushList();
        return;
      }

      // H2 heading
      if (trimmedLine.startsWith('## ')) {
        flushList();
        const text = trimmedLine.replace('## ', '');
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-lg font-semibold text-text-primary mt-6 mb-3"
          >
            {text}
          </h2>
        );
        return;
      }

      // H3 heading - check for quiz section
      if (trimmedLine.startsWith('### ')) {
        flushList();
        const text = trimmedLine.replace('### ', '');

        // Check if this is a quiz section
        if (text.toLowerCase().includes('check your understanding')) {
          inQuizSection = true;
          elements.push(
            <div key={`quiz-header-${index}`} className="mt-8 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-lg">🧠</span>
                </div>
                <h3 className="text-base font-semibold text-text-primary">
                  {text}
                </h3>
              </div>
              <p className="text-xs text-text-muted">
                Test your knowledge with these questions
              </p>
            </div>
          );
          // Render quizzes immediately after the header
          quizzes.forEach((quiz, i) => {
            elements.push(
              <QuizQuestion
                key={`quiz-${i}`}
                questionNumber={quiz.questionNumber}
                question={quiz.question}
                options={quiz.options}
                correctAnswer={quiz.correctAnswer}
                explanation={quiz.explanation}
              />
            );
          });
          return;
        }

        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-base font-semibold text-text-primary mt-5 mb-2"
          >
            {text}
          </h3>
        );
        return;
      }

      // Skip quiz content lines (they're rendered by QuizQuestion component)
      if (inQuizSection) {
        // Skip lines that are part of quiz questions/answers
        if (
          /^\*\*\d+\./.test(trimmedLine) || // Question start
          /^\*\s*\([A-Z]\)/.test(trimmedLine) || // Options
          trimmedLine.startsWith('_Answer:') // Answer
        ) {
          return;
        }
      }

      // List item
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const itemText = trimmedLine.replace(/^[\*\-]\s+/, '');
        listItems.push(itemText);
        return;
      }

      // Numbered list item
      if (/^\d+\.\s/.test(trimmedLine)) {
        const itemText = trimmedLine.replace(/^\d+\.\s+/, '');
        listItems.push(itemText);
        return;
      }

      // Regular paragraph
      flushList();

      elements.push(
        <p
          key={`p-${index}`}
          className="text-text-secondary text-sm leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmedLine) }}
        />
      );
    });

    flushList();
    return elements;
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-surface transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="p-2 rounded-xl hover:bg-surface transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck size={20} className="text-amber-400" />
              ) : (
                <Bookmark size={20} className="text-text-muted" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-surface transition-colors"
            >
              <Share2 size={20} className="text-text-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {article.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-amber-500/10 to-surface flex items-center justify-center">
          <BookOpen size={48} className="text-amber-400/40" />
        </div>
      )}

      {/* Article Content */}
      <div className="px-4 -mt-8 relative">
        {/* Category Badge */}
        {(() => {
          const colors = getCategoryColor(article.category);
          return (
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs ${colors.text} ${colors.bg} px-3 py-1 rounded-full border ${colors.border}`}>
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-text-muted">
                <Clock size={12} />
                <span className="text-xs">{article.readTime}</span>
              </div>
            </div>
          );
        })()}

        {/* Title */}
        <h1 className="text-xl font-bold text-text-primary mb-4 leading-snug">
          {article.title}
        </h1>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-xs text-text-muted bg-surface px-2.5 py-1 rounded-lg border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border mb-6" />

        {/* Content */}
        <article className="prose prose-invert prose-sm max-w-none">
          {renderContent(article.content)}
        </article>
      </div>
    </div>
  );
}
