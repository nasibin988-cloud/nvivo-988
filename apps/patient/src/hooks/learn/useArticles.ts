/**
 * Hook to fetch articles from Firebase
 */

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getDb, connectEmulators } from '@nvivo/shared';

// Connect to emulators in development
connectEmulators();

const db = getDb();

export interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  readTime: string;
  isRecommended: boolean;
  imageUrl: string;
  snippet: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ArticleCategory {
  id: string;
  name: string;
  icon: string;
  articleCount: number;
}

export function useArticles(categoryFilter?: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const articlesRef = collection(db, 'articles');

        let q;
        if (categoryFilter && categoryFilter !== 'all') {
          q = query(
            articlesRef,
            where('category', '==', categoryFilter)
          );
        } else {
          q = query(articlesRef);
        }

        const snapshot = await getDocs(q);
        const fetchedArticles: Article[] = [];

        snapshot.forEach((doc) => {
          fetchedArticles.push({
            id: doc.id,
            ...doc.data(),
          } as Article);
        });

        setArticles(fetchedArticles);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [categoryFilter]);

  return { articles, loading, error };
}

export function useArticle(articleId: string | null) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      if (!articleId) {
        setArticle(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'articles', articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle({
            id: docSnap.id,
            ...docSnap.data(),
          } as Article);
        } else {
          setArticle(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [articleId]);

  return { article, loading, error };
}

export function useArticleCategories() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const categoriesRef = collection(db, 'articleCategories');
        const q = query(categoriesRef, orderBy('articleCount', 'desc'));
        const snapshot = await getDocs(q);

        const fetchedCategories: ArticleCategory[] = [];
        snapshot.forEach((doc) => {
          fetchedCategories.push({
            id: doc.id,
            ...doc.data(),
          } as ArticleCategory);
        });

        setCategories(fetchedCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useRecommendedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        setLoading(true);
        const articlesRef = collection(db, 'articles');
        const q = query(
          articlesRef,
          where('isRecommended', '==', true),
          orderBy('title')
        );

        const snapshot = await getDocs(q);
        const fetchedArticles: Article[] = [];

        snapshot.forEach((doc) => {
          fetchedArticles.push({
            id: doc.id,
            ...doc.data(),
          } as Article);
        });

        setArticles(fetchedArticles);
        setError(null);
      } catch (err) {
        console.error('Error fetching recommended articles:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommended();
  }, []);

  return { articles, loading, error };
}
