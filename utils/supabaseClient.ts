import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase configuration is missing. Please fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

declare global {
  interface Window {
    Clerk: {
      session?: {
        getToken: (options: { template: string }) => Promise<string>;
      };
    };
  }
}

let globalGetToken: (() => Promise<string | null>) | null = null;

export const setSupabaseTokenGetter = (fn: (() => Promise<string | null>) | null) => {
  globalGetToken = fn;
};

function createClerkSupabaseClient() {
  return createClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      global: {
        fetch: async (url, options = {}) => {
          let clerkToken = null;
          try {
            if (globalGetToken) {
              // Try the specifically injected getter first (usually template: 'supabase')
              clerkToken = await globalGetToken();
            }
            
            // If still no token and we are on web, try the session token directly as fallback
              if (!clerkToken && typeof window !== 'undefined' && window.Clerk?.session) {
              clerkToken = await window.Clerk.session.getToken({
                template: 'supabase',
              }) || await (window.Clerk.session as any).getToken();
            }
          } catch (e) {
            console.error('Error fetching Clerk token for Supabase:', e);
          }

          const headers = new Headers(options?.headers || {});
          
          // Debugging help: This will show up in your browser's F12 console
          const urlStr = typeof url === 'string' ? url : url.toString();
          if (urlStr.includes('/rest/v1/')) {
             console.log(`[Supabase Request] ${urlStr}`, {
               hasToken: !!clerkToken,
               apiKeySet: headers.has('apikey')
             });
          }

          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          // Force the apikey header to ensure Supabase knows the environment
          if (supabaseAnonKey && !headers.has('apikey')) {
            headers.set('apikey', supabaseAnonKey);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}

export const client = createClerkSupabaseClient();
