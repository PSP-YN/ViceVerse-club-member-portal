import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function createFallbackClient() {
  const createQueryBuilder = () => ({
    select: () => createQueryBuilder(),
    eq: () => createQueryBuilder(),
    order: () => createQueryBuilder(),
    limit: () => createQueryBuilder(),
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({
      eq: async () => ({ data: null, error: null }),
    }),
  });

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        data: { user: null },
        error: null,
      }),
    },
    from: () => createQueryBuilder(),
  } as any;
}

export async function createClient() {
  if (!hasSupabaseConfig()) {
    return createFallbackClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
