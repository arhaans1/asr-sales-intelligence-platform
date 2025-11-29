import { supabase } from '@/db/supabase';
import type {
  Profile,
  Prospect,
  Product,
  Funnel,
  FunnelSession,
  Metrics,
  Note,
  ProspectWithProducts,
} from '@/types/database';

export const profilesApi = {
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    return data;
  },

  async updateUserRole(userId: string, role: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    return data;
  },
};

export const prospectsApi = {
  async getAll(): Promise<Prospect[]> {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Prospect | null> {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getWithProducts(id: string): Promise<ProspectWithProducts | null> {
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (prospectError) throw prospectError;
    if (!prospect) return null;

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('prospect_id', id)
      .order('created_at', { ascending: true });

    if (productsError) throw productsError;

    return {
      ...prospect,
      products: Array.isArray(products) ? products : [],
    };
  },

  async create(prospect: Omit<Prospect, 'id' | 'created_at' | 'updated_at'>): Promise<Prospect> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('prospects')
      .insert({ ...prospect, user_id: user.id })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create prospect');
    return data;
  },

  async update(id: string, updates: Partial<Prospect>): Promise<Prospect> {
    const { data, error } = await supabase
      .from('prospects')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Prospect not found');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('prospects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async search(query: string): Promise<Prospect[]> {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .or(`business_name.ilike.%${query}%,contact_name.ilike.%${query}%,niche_description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async filterByStatus(status: string): Promise<Prospect[]> {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export const productsApi = {
  async getByProspectId(prospectId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create product');
    return data;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Product not found');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async setPrimary(prospectId: string, productId: string): Promise<void> {
    await supabase
      .from('products')
      .update({ is_primary: false })
      .eq('prospect_id', prospectId);

    const { error } = await supabase
      .from('products')
      .update({ is_primary: true })
      .eq('id', productId);

    if (error) throw error;
  },
};

export const funnelsApi = {
  async getByProspectId(prospectId: string): Promise<Funnel[]> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Funnel | null> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(funnel: Omit<Funnel, 'id' | 'created_at' | 'updated_at'>): Promise<Funnel> {
    const { data, error } = await supabase
      .from('funnels')
      .insert(funnel)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create funnel');
    return data;
  },

  async update(id: string, updates: Partial<Funnel>): Promise<Funnel> {
    const { data, error } = await supabase
      .from('funnels')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Funnel not found');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('funnels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const sessionsApi = {
  async getByProspectId(prospectId: string): Promise<FunnelSession[]> {
    const { data, error } = await supabase
      .from('funnel_sessions')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<FunnelSession | null> {
    const { data, error } = await supabase
      .from('funnel_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(session: Omit<FunnelSession, 'id' | 'created_at' | 'updated_at'>): Promise<FunnelSession> {
    const { data, error } = await supabase
      .from('funnel_sessions')
      .insert(session)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create session');
    return data;
  },

  async update(id: string, updates: Partial<FunnelSession>): Promise<FunnelSession> {
    const { data, error } = await supabase
      .from('funnel_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Session not found');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('funnel_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const metricsApi = {
  async getByFunnelId(funnelId: string): Promise<Metrics | null> {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('funnel_id', funnelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getBySessionId(sessionId: string): Promise<Metrics | null> {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(metrics: Omit<Metrics, 'id' | 'created_at' | 'updated_at'>): Promise<Metrics> {
    const { data, error } = await supabase
      .from('metrics')
      .insert(metrics)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create metrics');
    return data;
  },

  async update(id: string, updates: Partial<Metrics>): Promise<Metrics> {
    const { data, error } = await supabase
      .from('metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Metrics not found');
    return data;
  },
};

export const notesApi = {
  async getByProspectId(prospectId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getBySessionId(sessionId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create note');
    return data;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Note not found');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
