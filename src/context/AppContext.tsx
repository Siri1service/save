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
          const { data: wsData } = await supabase.from('workspaces').select('*');
          if (wsData && wsData.length > 0) {
            setWorkspaces(wsData);
            setActiveWorkspaceId(wsData[0].id);
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
          : savedWorkspaces.filter((w: Workspace) => w.owner_id === user.id || w.id === 'ws-001' || w.id === 'ws-002');

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
        const { data: cats } = await supabase.from('categories').select('*').eq('workspace_id', activeWorkspaceId);
        if (cats) setCategories(cats);

        const { data: txs } = await supabase.from('transactions').select('*').eq('workspace_id', activeWorkspaceId).order('date', { ascending: false });
        if (txs) setTransactions(txs);

        const { data: mems } = await supabase.from('workspace_members').select('*').eq('workspace_id', activeWorkspaceId);
        if (mems) setMembers(mems);
      };
      fetchWorkspaceDetails();
    }
  }, [activeWorkspaceId]);

  // Currently active workspace object
  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId]);

  // Current categories for active workspace
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.workspace_id === activeWorkspaceId);
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
      if (!error && data) {
        setWorkspaces((prev) => [data, ...prev]);
        setActiveWorkspaceId(data.id);
        return data;
      }
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
      await supabase.from('workspaces').delete().eq('id', id);
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

  // Member collaboration
  const inviteMember = async (email: string, role: WorkspaceRole) => {
    if (!activeWorkspaceId) return;

    const newMember: WorkspaceMember = {
      id: `mem-${Date.now()}`,
      workspace_id: activeWorkspaceId,
      user_id: `user-inv-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      role,
      status: 'accepted',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await supabase.from('workspace_members').insert({
        workspace_id: activeWorkspaceId,
        invited_email: email,
        role,
        status: 'accepted',
      });
    }

    const updated = [newMember, ...members];
    setMembers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
  };

  const removeMember = async (memberId: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('workspace_members').delete().eq('id', memberId);
    }
    const updated = members.filter((m) => m.id !== memberId);
    setMembers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
  };

  const updateMemberRole = async (memberId: string, role: WorkspaceRole) => {
    if (isSupabaseConfigured) {
      await supabase.from('workspace_members').update({ role }).eq('id', memberId);
    }
    const updated = members.map((m) => (m.id === memberId ? { ...m, role } : m));
    setMembers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
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
      is_default: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      await supabase.from('categories').insert(newCat);
    }

    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (isSupabaseConfigured) {
      await supabase.from('categories').update(updates).eq('id', id);
    }
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('categories').delete().eq('id', id);
    }
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  };

  // Transaction Actions
  const addTransaction = async (data: Omit<Transaction, 'id' | 'workspace_id' | 'created_at'>) => {
    if (!activeWorkspaceId) return;

    const matchedCat = categories.find((c) => c.id === data.category_id);
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
      await supabase.from('transactions').insert(newTx);
    }

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (isSupabaseConfigured) {
      await supabase.from('transactions').update(updates).eq('id', id);
    }
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  const deleteTransaction = async (id: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('transactions').delete().eq('id', id);
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
    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({ status }).eq('id', userId);
    }
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, status } : u));
    setAllUsers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({ role }).eq('id', userId);
    }
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, role } : u));
    setAllUsers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  const deleteUser = async (userId: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('profiles').delete().eq('id', userId);
    }
    const updated = allUsers.filter((u) => u.id !== userId);
    setAllUsers(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  const sendEmailToUser = async (
    recipientEmail: string,
    templateType: string,
    customSubject?: string,
    customContent?: string,
    recipientUserId?: string
  ) => {
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
      await supabase.from('email_logs').insert(newLog);
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
        deleteWorkspace,
        members: activeMembers,
        inviteMember,
        removeMember,
        updateMemberRole,
        categories: activeCategories,
        addCategory,
        updateCategory,
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
