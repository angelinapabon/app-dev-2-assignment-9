import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ArticlesContext = createContext();

export function ArticlesProvider({ children }) {
  // Current logged-in user
  const { user } = useAuth();

  // Saved articles grouped by username: { alice: [...], bob: [...] }
  const [savedArticlesByUser, setSavedArticlesByUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedArticlesByUser')) || {};
    } catch {
      return {}; // fall back if stored data is bad
    }
  });

  // Save to localStorage whenever saved articles change
  useEffect(() => {
    localStorage.setItem('savedArticlesByUser', JSON.stringify(savedArticlesByUser));
  }, [savedArticlesByUser]);

  // Current user's saved articles (empty list if logged out)
  const getUserSavedArticles = () => {
    if (!user) return [];
    return savedArticlesByUser[user.username] || [];
  };

  // Add an article to the current user's list
  const saveArticle = (article) => {
    if (!user) return;
    setSavedArticlesByUser(prev => {
      const current = prev[user.username] || [];
      // Skip if already saved
      if (current.find(a => a.url === article.url)) {
        return prev;
      }
      return { ...prev, [user.username]: [...current, article] };
    });
  };

  // Remove an article from the current user's list
  const removeArticle = (url) => {
    if (!user) return;
    setSavedArticlesByUser(prev => ({
      ...prev,
      [user.username]: (prev[user.username] || []).filter(a => a.url !== url)
    }));
  };

  // Is this article in the current user's list?
  const isArticleSaved = (url) => {
    return getUserSavedArticles().some(a => a.url === url);
  };

  // Admin use: everyone's saved articles (Step 7)
  const getAllUserArticles = () => {
    return savedArticlesByUser;
  };

  return (
    <ArticlesContext.Provider
      value={{
        getUserSavedArticles,
        saveArticle,
        removeArticle,
        isArticleSaved,
        getAllUserArticles
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

export const useArticles = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within ArticlesProvider');
  }
  return context;
};