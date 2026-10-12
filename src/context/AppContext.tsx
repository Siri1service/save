import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Category,
  EmailLog,
  EmailTemplate,
  FilterPeriod,
  Transaction,
  TransactionType,
  UserProfile,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceType,
} from '../types';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase, LOCAL_STORAGE_KEYS } from '../lib/supabase';
import {
  EMAIL_TEMPLATES,
  INITIAL_CATEGORIES,
  INITIAL_EMAIL_LOGS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_WORKSPACES,
} from '../lib/mockData';

interface AppContextType {
  // Workspaces
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspaceId: (id: string) => void;
  createWorkspace: (name: string, type: WorkspaceType, description?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, name: string, description?: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  
  // Workspace Members
  members: WorkspaceMember[];
  inviteMember: (email: string, role: WorkspaceRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (name: string, type: TransactionType, icon: string, color: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  moveCategory: (id: string, direction: -1 | 1) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'workspace_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Filters & State
  period: FilterPeriod;
  setPeriod: (period: FilterPeriod) => void;
  typeFilter: 'all' | 'income' | 'expense';
  setTypeFilter: (type: 'all' | 'income' | 'expense') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;

  // Financial Stats for active workspace and period
  stats: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    savingsRate: number;
    incomeByCategory: { name: string; amount: number; color: string; percentage: number }[];
    expenseByCategory: { name: string; amount: number; color: string; percentage: number }[];
  };

  // Admin Features
  allUsers: UserProfile[];
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => Promise<void>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  deleteTransactionsByDateRange: (startDate: string, endDate: string) => Promise<number>;
  emailTemplates: EmailTemplate[];
  emailLogs: EmailLog[];
  sendEmailToUser: (recipientEmail: string, templateType: string, customSubject?: string, customContent?: string, recipientUserId?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  // State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Filters
  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Admin state
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Initialize data from Supabase or localStorage
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspaceId('');
      setTransactions([]);
      setCategories([]);
      return;
    }

    const loadData = async () => {
      if (isSupabaseConfigured) {
        try {
          // Fetch workspaces
          const { data: wsData, error: workspacesError } = await supabase.from('workspaces').select('*');
          if (workspacesError) throw workspacesError;
          const accessibleWorkspaces = wsData || [];
          setWorkspaces(accessibleWorkspaces);
          const invitedWorkspaceId = localStorage.getItem('save_app_invited_workspace_id');
          const initialWorkspace = accessibleWorkspaces.find((workspace) => workspace.id === invitedWorkspaceId)
            || accessibleWorkspaces[0];
          setActiveWorkspaceId(initialWorkspace?.id || '');
          if (initialWorkspace?.id === invitedWorkspaceId) {
            localStorage.removeItem('save_app_invited_workspace_id');
          }

          // Fetch admin users if admin
          if (isAdmin) {
            const { data: usersData } = await supabase.from('profiles').select('*');
            if (usersData) setAllUsers(usersData);

            const { data: logsData } = await supabase.from('email_logs').select('*').order('created_at', { ascending: false });
            if (logsData) setEmailLogs(logsData);
          }
        } catch (e) {
          console.error('Supabase fetch error:', e);
        }
      } else {
        // Load mock/local data
        const savedWorkspaces = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.WORKSPACES) || 'null') || INITIAL_WORKSPACES;
        // Filter workspaces accessible by current user or admin
        const accessibleWs = isAdmin
          ? savedWorkspaces
          : savedWorkspaces.filter((w: Workspace) => w.owner_id === user.id);

        setWorkspaces(accessibleWs);
        if (accessibleWs.length > 0) {
          setActiveWorkspaceId(accessibleWs[0].id);
        }

        const savedCategories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES) || 'null') || INITIAL_CATEGORIES;
        setCategories(savedCategories);

        const savedTransactions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS) || 'null') || INITIAL_TRANSACTIONS;
        setTransactions(savedTransactions);

        const savedMembers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.MEMBERS) || 'null') || INITIAL_MEMBERS;
        setMembers(savedMembers);

        const savedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USERS) || 'null') || INITIAL_USERS;
        setAllUsers(savedUsers);

        const savedLogs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.EMAIL_LOGS) || 'null') || INITIAL_EMAIL_LOGS;
        setEmailLogs(savedLogs);
      }
    };

    loadData();
  }, [user, isAdmin]);

  // Load workspace-specific data when active workspace changes
  useEffect(() => {
    if (!activeWorkspaceId) return;

    if (isSupabaseConfigured) {
      const fetchWorkspaceDetails = async () => {
        const [categoriesResult, transactionsResult, membersResult] = await Promise.all([
          supabase.from('categories').select('*').eq('workspace_id', activeWorkspaceId),
          supabase.from('transactions').select('*').eq('workspace_id', activeWorkspaceId).order('date', { ascending: false }),
          supabase.from('workspace_members').select('*').eq('workspace_id', activeWorkspaceId),
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (transactionsResult.error) throw transactionsResult.error;
        if (membersResult.error) throw membersResult.error;

        const workspaceCategories = categoriesResult.data || [];
        setCategories((previous) => [
          ...previous.filter((category) => category.workspace_id !== activeWorkspaceId),
          ...workspaceCategories,
        ]);
        const categoryById = new Map(workspaceCategories.map((category) => [category.id, category]));
        const workspaceTransactions = (transactionsResult.data || []).map((transaction) => {
          const category = categoryById.get(transaction.category_id);
          return {
            ...transaction,
            amount: Number(transaction.amount),
            category_name: category?.name,
            category_color: category?.color,
          };
        });
        setTransactions((previous) => [
          ...previous.filter((transaction) => transaction.workspace_id !== activeWorkspaceId),
          ...workspaceTransactions,
        ]);
        const workspaceMembers: WorkspaceMember[] = (membersResult.data || []).map((member) => ({
          ...member,
          email: member.invited_email || (member.user_id === user?.id ? user?.email || 'สมาชิกใน workspace' : 'สมาชิกใน workspace'),
        }));
        setMembers((previous) => [
          ...previous.filter((member) => member.workspace_id !== activeWorkspaceId),
          ...workspaceMembers,
        ]);
      };
      void fetchWorkspaceDetails().catch((error) => {
        console.error('Failed to load workspace data:', error);
      });
    }
  }, [activeWorkspaceId, user]);

  // Currently active workspace object
  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId]);

  // Current categories for active workspace
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.workspace_id === activeWorkspaceId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [categories, activeWorkspaceId]);

  // Current members for active workspace
  const activeMembers = useMemo(() => {
    return members.filter((m) => m.workspace_id === activeWorkspaceId);
  }, [members, activeWorkspaceId]);

  // Workspace actions
  const createWorkspace = async (name: string, type: WorkspaceType, description?: string): Promise<Workspace> => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      owner_id: user?.id || 'anonymous',
      name,
      type,
      description,
      currency: 'THB',
      created_at: new Date().toISOString(),
      role: 'owner',
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('workspaces').insert({
        owner_id: user?.id,
        name,
        type,
        description,
        currency: 'THB',
      }).select().single();
      if (error) throw error;
      if (!data) throw new Error('ไม่พบข้อมูลกระเป๋าที่บันทึก');
      setWorkspaces((prev) => [data, ...prev]);
      setActiveWorkspaceId(data.id);
      return data;
    }

    // Default categories for new workspace
    const defaultCats: Category[] = type === 'shop' ? [
      { id: `cat-${Date.now()}-1`, workspace_id: newWs.id, name: 'ยอดขายหน้าร้าน', type: 'income', icon: 'Coins', color: '#10b981', is_default: true },
      { id: `cat-${Date.now()}-2`, workspace_id: newWs.id, name: 'ยอดขายเดลิเวอรี', type: 'income', icon: 'TrendingUp', color: '#06b6d4', is_default: true },
      { id: `cat-${Date.now()}-3`, workspace_id: newWs.id, name: 'ต้นทุนสินค้า/วัตถุดิบ', type: 'expense', icon: 'Coffee', color: '#f59e0b', is_default: true },
      { id: `cat-${Date.now()}-4`, workspace_id: newWs.id, name: 'ค่าเช่า/สถานที่', type: 'expense', icon: 'Home', color: '#ef4444', is_default: true },
      { id: `cat-${Date.now()}-5`, workspace_id: newWs.id, name: 'ค่าจ้างพนักงาน', type: 'expense', icon: 'Users', color: '#8b5cf6', is_default: true },
    ] : [
      { id: `cat-${Date.now()}-1`, workspace_id: newWs.id, name: 'เงินเดือน', type: 'income', icon: 'Wallet', color: '#10b981', is_default: true },
      { id: `cat-${Date.now()}-2`, workspace_id: newWs.id, name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', is_default: true },
      { id: `cat-${Date.now()}-3`, workspace_id: newWs.id, name: 'เดินทาง', type: 'expense', icon: 'Car', color: '#3b82f6', is_default: true },
      { id: `cat-${Date.now()}-4`, workspace_id: newWs.id, name: 'ช้อปปิ้ง', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', is_default: true },
    ];

    const updatedWorkspaces = [newWs, ...workspaces];
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem(LOCAL_STORAGE_KEYS.WORKSPACES, JSON.stringify(updatedWorkspaces));

    const updatedCats = [...categories, ...defaultCats];
    setCategories(updatedCats);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCats));

    setActiveWorkspaceId(newWs.id);
    return newWs;
  };

  const deleteWorkspace = async (id: string) => {
    if (workspaces.length <= 1) {
      alert('ไม่สามารถลบกระเป๋าเงินทั้งหมดได้ ต้องมีอย่างน้อย 1 รายการ');
      return;
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('workspaces').delete().eq('id', id);
      if (error) throw error;
    }

    const updatedWorkspaces = workspaces.filter((w) => w.id !== id);
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem(LOCAL_STORAGE_KEYS.WORKSPACES, JSON.stringify(updatedWorkspaces));

    // Also remove associated transactions and categories
    const updatedTx = transactions.filter((t) => t.workspace_id !== id);
    setTransactions(updatedTx);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTx));

    const updatedCats = categories.filter((c) => c.workspace_id !== id);
    setCategories(updatedCats);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCats));

    setActiveWorkspaceId(updatedWorkspaces[0]?.id || '');
  };

  const updateWorkspace = async (id: string, name: string, description?: string) => {
    const workspace = workspaces.find((item) => item.id === id);
    if (!workspace) throw new Error('ไม่พบ workspace ที่ต้องการแก้ไข');
    if (!isAdmin && workspace.owner_id !== user?.id) throw new Error('เฉพาะเจ้าของ workspace เท่านั้นที่แก้ไขชื่อได้');

    const normalizedName = name.trim();
    if (!normalizedName) throw new Error('กรุณากรอกชื่อ workspace');

    const normalizedDescription = description?.trim() || '';
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workspaces')
        .update({ name: normalizedName, description: normalizedDescription || null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('ไม่พบ workspace ที่แก้ไข');
      setWorkspaces((previous) => previous.map((item) => item.id === id ? data : item));
      return;
    }

    const updated = workspaces.map((item) => item.id === id
      ? { ...item, name: normalizedName, description: normalizedDescription || undefined }
      : item);
    setWorkspaces(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.WORKSPACES, JSON.stringify(updated));
  };

  // Member collaboration
  const inviteMember = async (email: string, role: WorkspaceRole) => {
    if (!activeWorkspaceId) throw new Error('กรุณาเลือก workspace ก่อนส่งคำเชิญ');

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('workspace_members').insert({
        workspace_id: activeWorkspaceId,
        user_id: null,
        invited_email: email.trim().toLowerCase(),
        role,
        status: 'pending',
      }).select().single();
      if (error) throw error;
      if (!data) throw new Error('ไม่พบข้อมูลคำเชิญที่สร้าง');

      setMembers((previous) => [{
        ...data,
        email: data.invited_email || email.trim().toLowerCase(),
      }, ...previous]);
      return;
    }

    throw new Error('การเชิญสมาชิกต้องเชื่อมต่อ Supabase ก่อน');
  };

  const removeMember = async (memberId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('workspace_members').delete().eq('id', memberId);
      if (error) throw error;
    }
    const updated = members.filter((m) => m.id !== memberId);
    setMembers(updated);
    if (!isSupabaseConfigured) localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
  };

  const updateMemberRole = async (memberId: string, role: WorkspaceRole) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('workspace_members').update({ role }).eq('id', memberId);
      if (error) throw error;
    }
    const updated = members.map((m) => (m.id === memberId ? { ...m, role } : m));
    setMembers(updated);
    if (!isSupabaseConfigured) localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
  };

  // Category Actions
  const addCategory = async (name: string, type: TransactionType, icon: string, color: string) => {
    if (!activeWorkspaceId) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      workspace_id: activeWorkspaceId,
      name,
      type,
      icon,
      color,
      sort_order: categories.filter((category) => category.workspace_id === activeWorkspaceId && category.type === type)
        .reduce((maxOrder, category) => Math.max(maxOrder, category.sort_order ?? -1), -1) + 1,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').insert({
        workspace_id: activeWorkspaceId,
        name,
        type,
        icon,
        color,
        sort_order: categories.filter((category) => category.workspace_id === activeWorkspaceId && category.type === type)
          .reduce((maxOrder, category) => Math.max(maxOrder, category.sort_order ?? -1), -1) + 1,
        is_default: false,
      }).select().single();
      if (error) throw error;
      if (!data) throw new Error('ไม่พบข้อมูลหมวดหมู่ที่บันทึก');
      setCategories((previous) => [...previous, data]);
      return;
    }

    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  const moveCategory = async (id: string, direction: -1 | 1) => {
    const current = categories.find((category) => category.id === id && category.workspace_id === activeWorkspaceId);
    if (!current) throw new Error('ไม่พบหมวดหมู่ที่ต้องการจัดลำดับ');

    const siblings = categories
      .filter((category) => category.workspace_id === current.workspace_id && category.type === current.type)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const currentIndex = siblings.findIndex((category) => category.id === id);
    const adjacent = siblings[currentIndex + direction];
    if (!adjacent) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase.rpc('swap_category_order', {
        p_category_id: current.id,
        p_adjacent_category_id: adjacent.id,
      });
      if (error) throw error;
    }

    const reordered = [...siblings];
    [reordered[currentIndex], reordered[currentIndex + direction]] =
      [reordered[currentIndex + direction], reordered[currentIndex]];
    const orderedCategories = reordered.map((category, index) => ({ ...category, sort_order: index }));
    const changedById = new Map(orderedCategories.map((category) => [category.id, category]));
    const updated = categories.map((category) => changedById.get(category.id) || category);
    setCategories(updated);
    if (!isSupabaseConfigured) localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (isSupabaseConfigured) {
      const { id: _id, workspace_id: _workspaceId, created_at: _createdAt, ...categoryUpdates } = updates;
      const { data, error } = await supabase
        .from('categories')
        .update(categoryUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('ไม่พบหมวดหมู่ที่ต้องการแก้ไข');
      setCategories((previous) => previous.map((category) => (category.id === id ? data : category)));
      return;
    }
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    }
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  // Transaction Actions
  const addTransaction = async (data: Omit<Transaction, 'id' | 'workspace_id' | 'created_at'>) => {
    if (!activeWorkspaceId) return;

    const matchedCat = categories.find((category) => category.id === data.category_id);
    if (isSupabaseConfigured && (!matchedCat || matchedCat.workspace_id !== activeWorkspaceId)) {
      throw new Error('กรุณาเลือกหมวดหมู่ของกระเป๋าปัจจุบัน');
    }
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}`,
      workspace_id: activeWorkspaceId,
      category_name: matchedCat?.name || data.category_name,
      category_color: matchedCat?.color || data.category_color,
      created_by: user?.id,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: savedTransaction, error } = await supabase.from('transactions').insert({
        workspace_id: activeWorkspaceId,
        category_id: data.category_id || null,
        type: data.type,
        amount: data.amount,
        date: data.date,
        title: data.title,
        notes: data.notes || null,
        receipt_url: data.receipt_url || null,
        created_by: user?.id || null,
      }).select().single();
      if (error) throw error;
      if (!savedTransaction) throw new Error('ไม่พบรายการที่บันทึก');
      setTransactions((previous) => [{
        ...savedTransaction,
        amount: Number(savedTransaction.amount),
        category_name: matchedCat?.name,
        category_color: matchedCat?.color,
      }, ...previous]);
      return;
    }

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (isSupabaseConfigured) {
      const { id: _id, workspace_id: _workspaceId, created_at: _createdAt, category_name: _categoryName, category_icon: _categoryIcon, category_color: _categoryColor, ...transactionUpdates } = updates;
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error('ไม่พบรายการที่ต้องการแก้ไข');
      const category = categories.find((item) => item.id === data.category_id);
      setTransactions((previous) => previous.map((transaction) => (
        transaction.id === id
          ? { ...data, amount: Number(data.amount), category_name: category?.name, category_color: category?.color }
          : transaction
      )));
      return;
    }
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  const deleteTransaction = async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    }
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  // Filtered transactions calculation
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions
      .filter((t) => t.workspace_id === activeWorkspaceId)
      .filter((t) => {
        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchCat = t.category_name?.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchNotes) return false;
        }

        // Period filter
        if (period === 'today') {
          return t.date === todayStr;
        }
        if (period === 'week') {
          const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
          return t.date >= oneWeekAgo;
        }
        if (period === 'month') {
          const thisMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
          return t.date.startsWith(thisMonthPrefix);
        }
        if (period === 'year') {
          const thisYearPrefix = todayStr.substring(0, 4); // YYYY
          return t.date.startsWith(thisYearPrefix);
        }
        if (period === 'custom') {
          if (customStartDate && t.date < customStartDate) return false;
          if (customEndDate && t.date > customEndDate) return false;
          return true;
        }
        return true; // 'all'
      })
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  }, [transactions, activeWorkspaceId, typeFilter, searchQuery, period, customStartDate, customEndDate]);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const incomeCatMap: Record<string, { amount: number; color: string }> = {};
    const expenseCatMap: Record<string, { amount: number; color: string }> = {};

    filteredTransactions.forEach((t) => {
      const catName = t.category_name || 'ทั่วไป';
      const catColor = t.category_color || '#6366f1';

      if (t.type === 'income') {
        totalIncome += t.amount;
        if (!incomeCatMap[catName]) incomeCatMap[catName] = { amount: 0, color: catColor };
        incomeCatMap[catName].amount += t.amount;
      } else {
        totalExpense += t.amount;
        if (!expenseCatMap[catName]) expenseCatMap[catName] = { amount: 0, color: catColor };
        expenseCatMap[catName].amount += t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    const incomeByCategory = Object.entries(incomeCatMap).map(([name, val]) => ({
      name,
      amount: val.amount,
      color: val.color,
      percentage: totalIncome > 0 ? Math.round((val.amount / totalIncome) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    const expenseByCategory = Object.entries(expenseCatMap).map(([name, val]) => ({
      name,
      amount: val.amount,
      color: val.color,
      percentage: totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      incomeByCategory,
      expenseByCategory,
    };
  }, [filteredTransactions]);

  // Admin Actions
  const updateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
    if (!isAdmin) throw new Error('ไม่มีสิทธิ์จัดการสถานะผู้ใช้');
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
      if (error) throw error;
    }
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, status } : u));
    setAllUsers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    if (!isAdmin) throw new Error('ไม่มีสิทธิ์เปลี่ยนบทบาทผู้ใช้');
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
      if (error) throw error;
    }
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, role } : u));
    setAllUsers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin) throw new Error('ไม่มีสิทธิ์ลบผู้ใช้');
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
    }
    const updated = allUsers.filter((u) => u.id !== userId);
    setAllUsers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  const deleteTransactionsByDateRange = async (startDate: string, endDate: string): Promise<number> => {
    if (!isAdmin) throw new Error('ไม่มีสิทธิ์ลบรายการย้อนหลัง');
    if (!isSupabaseConfigured) throw new Error('ต้องเชื่อมต่อฐานข้อมูล Supabase ก่อนลบรายการ');
    if (!startDate || !endDate || startDate > endDate) {
      throw new Error('กรุณาระบุช่วงวันที่ให้ถูกต้อง');
    }

    const { data, error } = await supabase.rpc('admin_delete_transactions_by_date_range', {
      p_start_date: startDate,
      p_end_date: endDate,
    });
    if (error) throw error;

    const deletedCount = Number(data);
    if (!Number.isSafeInteger(deletedCount) || deletedCount < 0) {
      throw new Error('ฐานข้อมูลส่งผลการลบกลับมาไม่ถูกต้อง');
    }

    setTransactions((previous) => previous.filter(
      (transaction) => transaction.date < startDate || transaction.date > endDate
    ));
    return deletedCount;
  };

  const sendEmailToUser = async (
    recipientEmail: string,
    templateType: string,
    customSubject?: string,
    customContent?: string,
    recipientUserId?: string
  ) => {
    if (!isAdmin) throw new Error('ไม่มีสิทธิ์ส่งอีเมลจากระบบ');
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateType);
    const subject = customSubject || template?.subject || 'ข้อความแจ้งเตือนจากระบบ SAVE';
    const content = customContent || template?.content || '';

    const newLog: EmailLog = {
      id: `log-${Date.now()}`,
      recipient_email: recipientEmail,
      recipient_user_id: recipientUserId,
      subject,
      template_type: templateType,
      content,
      status: 'sent',
      sent_by: user?.id || 'admin',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('email_logs').insert(newLog);
      if (error) throw error;
    }

    const updated = [newLog, ...emailLogs];
    setEmailLogs(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(updated));
  };

  return (
    <AppContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspaceId,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        members: activeMembers,
        inviteMember,
        removeMember,
        updateMemberRole,
        categories: activeCategories,
        addCategory,
        updateCategory,
        moveCategory,
        deleteCategory,
        transactions,
        filteredTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        period,
        setPeriod,
        typeFilter,
        setTypeFilter,
        searchQuery,
        setSearchQuery,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        stats,
        allUsers,
        updateUserStatus,
        updateUserRole,
        deleteUser,
        deleteTransactionsByDateRange,
        emailTemplates: EMAIL_TEMPLATES,
        emailLogs,
        sendEmailToUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
