import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { theme } from './src/lib/theme';
import { Header } from './src/components/Header';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { AdminPanel } from './src/components/AdminPanel';
import { AuthScreen } from './src/screens/AuthScreen';
import { TransactionModal } from './src/components/TransactionModal';
import { WorkspaceModal } from './src/components/WorkspaceModal';
import { InviteMemberModal } from './src/components/InviteMemberModal';
import { CategoryModal } from './src/components/CategoryModal';
import { ExportModal } from './src/components/ExportModal';
import { Transaction } from './src/types';
import { Icon } from './src/components/Icon';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const MainApp: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { mode: themeMode, toggleTheme } = useTheme();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'admin'>('dashboard');

  useEffect(() => {
    if (!isAdmin && activeTab === 'admin') setActiveTab('dashboard');
  }, [activeTab, isAdmin]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.bg,
          color: theme.colors.textSecondary,
          fontSize: '14px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="Wallet" size={20} color={theme.colors.primaryText} />
          </div>
          <div>กำลังโหลดระบบ...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleOpenAddTx = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: theme.colors.bg,
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWorkspaceModal={() => setIsWsModalOpen(true)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          paddingBottom: '80px', // padding for mobile bottom bar
        }}
      >
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onAddTransaction={handleOpenAddTx}
            onEditTransaction={handleEditTx}
            onViewAllTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsScreen
            onAddTransaction={handleOpenAddTx}
            onEditTransaction={handleEditTx}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </main>

      {/* Mobile Bottom Navigation Bar (Minimal & Clean) */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
          padding: '10px 16px',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
        }}
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: activeTab === 'dashboard' ? theme.colors.primary : theme.colors.textMuted,
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: activeTab === 'dashboard' ? '600' : '400',
          }}
        >
          <Icon name="LayoutDashboard" size={20} color={activeTab === 'dashboard' ? theme.colors.primaryText : theme.colors.textMuted} />
          <span>แดชบอร์ด</span>
        </button>

        <button
          onClick={handleOpenAddTx}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: theme.colors.primary,
            border: 'none',
            color: theme.colors.primaryText,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-6px)',
          }}
          title="บันทึกรายการ"
        >
          <Icon name="Plus" size={22} color={theme.colors.primaryText} />
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: activeTab === 'transactions' ? theme.colors.primary : theme.colors.textMuted,
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: activeTab === 'transactions' ? '600' : '400',
          }}
        >
          <Icon name="Clock" size={20} color={activeTab === 'transactions' ? theme.colors.primaryText : theme.colors.textMuted} />
          <span>ประวัติ</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: activeTab === 'admin' ? '#a5b4fc' : theme.colors.textMuted,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: activeTab === 'admin' ? '600' : '400',
            }}
          >
            <Icon name="Shield" size={20} color={activeTab === 'admin' ? '#a5b4fc' : '#71717a'} />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        editingTransaction={editingTransaction}
      />

      <WorkspaceModal
        isOpen={isWsModalOpen}
        onClose={() => setIsWsModalOpen(false)}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
