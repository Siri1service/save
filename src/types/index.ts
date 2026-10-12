export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  last_sign_in_at: string;
  created_at: string;
}

export type WorkspaceType = 'personal' | 'shop';
export type WorkspaceRole = 'owner' | 'editor' | 'viewer';
export type MemberStatus = 'pending' | 'accepted' | 'declined';

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  type: WorkspaceType; // Personal or Shop
  description?: string;
  currency: string;
  created_at: string;
  updated_at?: string;
  role?: WorkspaceRole; // current user's role in this workspace
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string | null;
  email: string;
  full_name?: string;
  role: WorkspaceRole;
  status: MemberStatus;
  created_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  sort_order?: number;
  is_default?: boolean;
  created_at?: string;
}

export interface Transaction {
  id: string;
  workspace_id: string;
  category_id?: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  receipt_url?: string;
  created_by?: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_user_id?: string;
  subject: string;
  template_type: string;
  content: string;
  status: 'sent' | 'failed' | 'queued';
  sent_by: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
}

export type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';
