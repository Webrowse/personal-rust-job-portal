import { useCallback, useEffect, useState } from 'react';
import { supabase, ADMIN_EMAIL } from '../lib/supabase';
import type { JobSource } from '../types';
import type { User } from '@supabase/supabase-js';

interface UseSupabaseReturn {
  sources: JobSource[];
  loading: boolean;
  error: string | null;
  user: User | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  addSource: (url: string, isRssFeed?: boolean) => Promise<void>;
  updateSource: (id: string, updates: Partial<JobSource>) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  refreshSources: () => Promise<void>;
}

export function useSupabase(): UseSupabaseReturn {
  const [sources, setSources] = useState<JobSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch sources
  const refreshSources = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('job_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setSources([]);
    } else {
      // Transform from snake_case to camelCase
      const transformed = (data || []).map((row) => ({
        id: row.id,
        url: row.url,
        name: row.name,
        favicon: row.favicon,
        notes: row.notes || '',
        tags: row.tags || [],
        isRssFeed: row.is_rss_feed,
        isFavorite: row.is_favorite,
        lastOpened: row.last_opened,
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at,
      }));
      setSources(transformed);
    }

    setLoading(false);
  }, []);

  // Load sources on mount
  useEffect(() => {
    refreshSources();
  }, [refreshSources]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Add source (admin only)
  const addSource = useCallback(async (url: string, isRssFeed?: boolean) => {
    if (!isAdmin) {
      setError('Only admin can add sources');
      return;
    }

    const id = crypto.randomUUID();
    const name = new URL(url).hostname;

    const { error: insertError } = await supabase.from('job_sources').insert({
      id,
      url,
      name,
      is_rss_feed: isRssFeed || false,
      tags: [],
      notes: '',
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      await refreshSources();
    }
  }, [isAdmin, refreshSources]);

  // Update source (admin only)
  const updateSource = useCallback(async (id: string, updates: Partial<JobSource>) => {
    if (!isAdmin) {
      setError('Only admin can update sources');
      return;
    }

    // Transform camelCase to snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.favicon !== undefined) dbUpdates.favicon = updates.favicon;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.isRssFeed !== undefined) dbUpdates.is_rss_feed = updates.isRssFeed;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    if (updates.lastOpened !== undefined) dbUpdates.last_opened = updates.lastOpened;

    const { error: updateError } = await supabase
      .from('job_sources')
      .update(dbUpdates)
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshSources();
    }
  }, [isAdmin, refreshSources]);

  // Delete source (admin only)
  const deleteSource = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Only admin can delete sources');
      return;
    }

    const { error: deleteError } = await supabase
      .from('job_sources')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      await refreshSources();
    }
  }, [isAdmin, refreshSources]);

  return {
    sources,
    loading,
    error,
    user,
    isAdmin,
    signIn,
    signOut,
    addSource,
    updateSource,
    deleteSource,
    refreshSources,
  };
}
