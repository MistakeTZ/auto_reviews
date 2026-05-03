import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'http://localhost:8000/api';

export interface Product {
  nmId: string;
  name: string;
}

export interface Review {
  id: string;
  nmId: string;
  productName: string;
  rating: number;
  text: string;
  date: string;
  status: 'pending' | 'auto-answered' | 'manual-review';
  autoAnswerText?: string;
  wb_review_id: string;
}

export interface Rule {
  id: string;
  name: string;
  target: 'general' | 'specific_nm';
  nmId?: string; // If specific_nm
  conditionRatingOperator: 'exact' | 'less_than' | 'more_than';
  conditionRating: number | null;
  conditionKeyword: string;
  actionText: string;
}

interface AppState {
  isAuthenticated: boolean;
  jwtToken: string | null;
  apiToken: string | null;
  language: 'en' | 'ru';
  reviews: Review[];
  rules: Rule[];
  products: Product[];
  login: (token: string) => void;
  logout: () => void;
  setLanguage: (lang: 'en' | 'ru') => void;
  fetchMe: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchRules: () => Promise<void>;
  fetchReviews: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  addRule: (rule: Omit<Rule, 'id'>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  markReviewAsAnswered: (id: string, text: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      jwtToken: null,
      apiToken: null,
      language: 'ru',
      products: [],
      reviews: [],
      rules: [],
      
      login: (token: string) => set({ isAuthenticated: true, jwtToken: token }),
      
      logout: () => set({ isAuthenticated: false, jwtToken: null, apiToken: null, reviews: [], rules: [], products: [] }),
      
      setLanguage: (lang) => set({ language: lang }),
      
      fetchMe: async () => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ apiToken: data.wb_api_token });
          } else if (res.status === 401) {
            get().logout();
          }
        } catch (e) {
          console.error(e);
        }
      },

      fetchProducts: async () => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/products/`, {
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ products: data });
          }
        } catch (e) {
          console.error(e);
        }
      },

      fetchRules: async () => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/rules/`, {
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ rules: data.map((r: any) => ({ ...r, id: String(r.id), nmId: r.nm_id, conditionRatingOperator: r.condition_rating_operator, conditionRating: r.condition_rating, conditionKeyword: r.condition_keyword, actionText: r.action_text })) });
          }
        } catch (e) {
          console.error(e);
        }
      },

      fetchReviews: async () => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/reviews/`, {
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ reviews: data.map((r: any) => ({ ...r, id: String(r.id), nmId: r.nm_id, productName: r.product_name, autoAnswerText: r.auto_answer_text })) });
          }
        } catch (e) {
          console.error(e);
        }
      },

      setToken: async (token: string) => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/settings/token`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}` 
            },
            body: JSON.stringify({ token })
          });
          if (res.ok) {
            set({ apiToken: token });
          }
        } catch (e) {
          console.error(e);
        }
      },

      addRule: async (rule) => {
        const { jwtToken, rules } = get();
        if (!jwtToken) return;
        try {
          const payload = {
            name: rule.name,
            target: rule.target,
            nm_id: rule.nmId || null,
            condition_rating_operator: rule.conditionRatingOperator,
            condition_rating: rule.conditionRating,
            condition_keyword: rule.conditionKeyword || null,
            action_text: rule.actionText
          };
          const res = await fetch(`${API_URL}/rules/`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}` 
            },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const r = await res.json();
            const newRule: Rule = {
              id: String(r.id),
              name: r.name,
              target: r.target,
              nmId: r.nm_id,
              conditionRatingOperator: r.condition_rating_operator,
              conditionRating: r.condition_rating,
              conditionKeyword: r.condition_keyword,
              actionText: r.action_text
            };
            set({ rules: [...rules, newRule] });
          }
        } catch (e) {
          console.error(e);
        }
      },

      deleteRule: async (id: string) => {
        const { jwtToken, rules } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/rules/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            set({ rules: rules.filter(r => r.id !== id) });
          }
        } catch (e) {
          console.error(e);
        }
      },

      markReviewAsAnswered: async (id: string, text: string) => {
        const { jwtToken, reviews } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/reviews/${id}/reply`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}` 
            },
            body: JSON.stringify({ text })
          });
          if (res.ok) {
            set({
              reviews: reviews.map(r => r.id === id ? { ...r, status: 'manual-review', autoAnswerText: text } : r)
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }),
    {
      name: 'auto-reviews-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        jwtToken: state.jwtToken, 
        language: state.language,
        apiToken: state.apiToken 
      }),
    }
  )
);
