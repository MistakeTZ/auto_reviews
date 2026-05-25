import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  userName?: string;
  pros?: string;
  cons?: string;
  photosCount?: number;
  hasVideo?: boolean;
}

export interface Rule {
  id: string;
  name: string;
  target: 'general' | 'specific_nm';
  nmId?: string; // If specific_nm
  conditionRatingOperator: 'exact' | 'less_than' | 'more_than';
  conditionRating: number | null;
  conditionKeyword: string;
  actionType: 'template' | 'gpt';
  actionText: string;
  withVideo?: boolean;
  withPhoto?: boolean;
  withName?: boolean;
  priority?: number;
  sendNotification?: boolean;
  isEditedFeedback?: boolean;
}

export interface NotificationMethod {
  id: number;
  userId: number;
  type: 'email' | 'telegram' | 'max';
  value: string;
  isActive?: boolean;
}

interface AppState {
  isAuthenticated: boolean;
  jwtToken: string | null;
  apiToken: string | null;
  userName: string | null;
  userUuid: string | null;
  language: 'en' | 'ru';
  reviews: Review[];
  rules: Rule[];
  products: Product[];
  notificationMethods: NotificationMethod[];
  
  // Subscription & Referral Fields
  subscriptionExpiresAt: string | null;
  tariffType: 'trial' | 'full' | null;
  trialActivated: boolean;
  hasActiveSubscription: boolean;
  referralCode: string | null;
  referredById: number | null;
  referrals: any[];

  login: (token: string) => void;
  logout: () => void;
  setLanguage: (lang: 'en' | 'ru') => void;
  fetchMe: () => Promise<void>;
  fetchProducts: (refresh?: boolean, replace?: boolean) => Promise<void>;
  fetchRules: () => Promise<void>;
  fetchReviews: (page?: number, pageSize?: number, status?: string) => Promise<any>;
  setToken: (token: string) => Promise<void>;
  addRule: (rule: Omit<Rule, 'id'>) => Promise<void>;
  updateRule: (id: string, rule: Partial<Rule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  markReviewAsAnswered: (id: string, text: string) => Promise<void>;
  fetchNotificationMethods: () => Promise<void>;
  addNotificationMethod: (method: Omit<NotificationMethod, 'id' | 'userId'>) => Promise<void>;
  deleteNotificationMethod: (id: number) => Promise<void>;
  applyReferralCode: (code: string) => Promise<void>;
  buySubscription: () => Promise<void>;
  fetchReferralsList: () => Promise<any[]>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      jwtToken: null,
      apiToken: null,
      userName: null,
      userUuid: null,
      language: 'ru',
      products: [],
      reviews: [],
      rules: [],
      notificationMethods: [],
      subscriptionExpiresAt: null,
      tariffType: null,
      trialActivated: false,
      hasActiveSubscription: false,
      referralCode: null,
      referredById: null,
      referrals: [],

      login: (token: string) => set({ isAuthenticated: true, jwtToken: token }),

      logout: () => set({
        isAuthenticated: false,
        jwtToken: null,
        apiToken: null,
        userName: null,
        userUuid: null,
        reviews: [],
        rules: [],
        products: [],
        notificationMethods: [],
        subscriptionExpiresAt: null,
        tariffType: null,
        trialActivated: false,
        hasActiveSubscription: false,
        referralCode: null,
        referredById: null,
        referrals: [],
      }),

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
            set({
              apiToken: data.wb_api_token,
              userName: data.name,
              userUuid: data.uuid,
              subscriptionExpiresAt: data.subscription_expires_at,
              tariffType: data.tariff_type,
              trialActivated: data.trial_activated,
              hasActiveSubscription: data.has_active_subscription,
              referralCode: data.referral_code,
              referredById: data.referred_by_id,
            });
          } else if (res.status === 401) {
            get().logout();
          }
        } catch (e) {
          console.error(e);
        }
      },

      fetchProducts: async (refresh = false, replace = false) => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          const qs = refresh
            ? `?refresh=true&replace=${replace ? 'true' : 'false'}`
            : '';
          const res = await fetch(`${API_URL}/products/${qs}`, {
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
            set({
              rules: data.map((r: any) => ({
                ...r,
                id: String(r.id),
                nmId: r.nm_id,
                conditionRatingOperator: r.condition_rating_operator,
                conditionRating: r.condition_rating,
                conditionKeyword: r.condition_keyword,
                actionType: r.action_type ?? 'template',
                actionText: r.action_text,
                withVideo: r.with_video,
                withPhoto: r.with_photo,
                withName: r.with_name,
                priority: r.priority,
                sendNotification: r.send_notification,
                isEditedFeedback: r.is_edited_feedback,
              }))
            });
          }
        } catch (e) {
          console.error(e);
        }
      },

      fetchReviews: async (page?: number, pageSize?: number, status?: string) => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          let url = `${API_URL}/reviews/`;
          const params = new URLSearchParams();
          if (page !== undefined) params.append('page', String(page));
          if (pageSize !== undefined) params.append('page_size', String(pageSize));
          if (status !== undefined) params.append('status', status);
          const qs = params.toString();
          if (qs) url += `?${qs}`;

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            const mapReview = (r: any) => ({
              ...r,
              id: String(r.id),
              nmId: r.nm_id,
              productName: r.product_name,
              autoAnswerText: r.auto_answer_text,
              userName: r.user_name,
              pros: r.pros,
              cons: r.cons,
              photosCount: r.photos_count,
              hasVideo: r.has_video
            });

            if (page !== undefined && pageSize !== undefined) {
              return {
                items: data.items.map(mapReview),
                total: data.total,
                page: data.page,
                pageSize: data.page_size,
                pages: data.pages
              };
            } else {
              const items = data.map(mapReview);
              set({ reviews: items });
              return items;
            }
          }
        } catch (e) {
          console.error(e);
        }
      },

      setToken: async (token: string) => {
        const { jwtToken } = get();
        if (!jwtToken) return;
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
          await get().fetchProducts(true, true);
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || data.message || 'Failed to verify token');
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
            action_type: rule.actionType,
            action_text: rule.actionText,
            with_video: rule.withVideo || false,
            with_photo: rule.withPhoto || false,
            with_name: rule.withName || false,
            send_notification: rule.sendNotification || false,
            is_edited_feedback: rule.isEditedFeedback || false,
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
              actionType: r.action_type ?? 'template',
              actionText: r.action_text,
              withVideo: r.with_video,
              withPhoto: r.with_photo,
              withName: r.with_name,
              priority: r.priority,
              sendNotification: r.send_notification,
              isEditedFeedback: r.is_edited_feedback
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

      updateRule: async (id, updatedFields) => {
        const { jwtToken, rules } = get();
        if (!jwtToken) return;
        try {
          const payload: any = {};
          if (updatedFields.name !== undefined) payload.name = updatedFields.name;
          if (updatedFields.target !== undefined) payload.target = updatedFields.target;
          if (updatedFields.nmId !== undefined) payload.nm_id = updatedFields.nmId || null;
          if (updatedFields.conditionRatingOperator !== undefined) payload.condition_rating_operator = updatedFields.conditionRatingOperator;
          if (updatedFields.conditionRating !== undefined) payload.condition_rating = updatedFields.conditionRating;
          if (updatedFields.conditionKeyword !== undefined) payload.condition_keyword = updatedFields.conditionKeyword || null;
          if (updatedFields.actionType !== undefined) payload.action_type = updatedFields.actionType;
          if (updatedFields.actionText !== undefined) payload.action_text = updatedFields.actionText;
          if (updatedFields.withVideo !== undefined) payload.with_video = updatedFields.withVideo;
          if (updatedFields.withPhoto !== undefined) payload.with_photo = updatedFields.withPhoto;
          if (updatedFields.withName !== undefined) payload.with_name = updatedFields.withName;
          if (updatedFields.priority !== undefined) payload.priority = updatedFields.priority;
          if (updatedFields.sendNotification !== undefined) payload.send_notification = updatedFields.sendNotification;
          if (updatedFields.isEditedFeedback !== undefined) payload.is_edited_feedback = updatedFields.isEditedFeedback;

          const res = await fetch(`${API_URL}/rules/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`
            },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const r = await res.json();
            const updatedRule: Rule = {
              id: String(r.id),
              name: r.name,
              target: r.target,
              nmId: r.nm_id,
              conditionRatingOperator: r.condition_rating_operator,
              conditionRating: r.condition_rating,
              conditionKeyword: r.condition_keyword,
              actionType: r.action_type ?? 'template',
              actionText: r.action_text,
              withVideo: r.with_video,
              withPhoto: r.with_photo,
              withName: r.with_name,
              priority: r.priority,
              sendNotification: r.send_notification,
              isEditedFeedback: r.is_edited_feedback
            };
            set({
              rules: rules.map(rule => rule.id === id ? updatedRule : rule)
            });
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
      },

      fetchNotificationMethods: async () => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/settings/notifications`, {
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({
              notificationMethods: data.map((m: any) => ({
                id: m.id,
                userId: m.user_id,
                type: m.type,
                value: m.value,
                isActive: m.is_active
              }))
            });
          }
        } catch (e) {
          console.error(e);
        }
      },

      addNotificationMethod: async (method) => {
        const { jwtToken, notificationMethods } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/settings/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
              type: method.type,
              value: method.value,
              is_active: method.isActive !== undefined ? method.isActive : true
            })
          });
          if (res.ok) {
            const m = await res.json();
            const newMethod: NotificationMethod = {
              id: m.id,
              userId: m.user_id,
              type: m.type,
              value: m.value,
              isActive: m.is_active
            };
            set({ notificationMethods: [...notificationMethods, newMethod] });
          }
        } catch (e) {
          console.error(e);
        }
      },

      deleteNotificationMethod: async (id) => {
        const { jwtToken, notificationMethods } = get();
        if (!jwtToken) return;
        try {
          const res = await fetch(`${API_URL}/settings/notifications/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            set({
              notificationMethods: notificationMethods.filter(m => m.id !== id)
            });
          }
        } catch (e) {
          console.error(e);
        }
      },

      applyReferralCode: async (code: string) => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        const res = await fetch(`${API_URL}/settings/apply-referral`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`
          },
          body: JSON.stringify({ code })
        });
        if (res.ok) {
          await get().fetchMe();
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || data.message || 'Failed to apply referral code');
        }
      },

      buySubscription: async () => {
        const { jwtToken } = get();
        if (!jwtToken) return;
        const res = await fetch(`${API_URL}/settings/buy-subscription`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        });
        if (res.ok) {
          await get().fetchMe();
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || data.message || 'Failed to buy subscription');
        }
      },

      fetchReferralsList: async () => {
        const { jwtToken } = get();
        if (!jwtToken) return [];
        try {
          const res = await fetch(`${API_URL}/settings/referrals-list`, {
            headers: { Authorization: `Bearer ${jwtToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ referrals: data });
            return data;
          }
        } catch (e) {
          console.error(e);
        }
        return [];
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
