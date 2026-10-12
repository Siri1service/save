import { Category, EmailLog, EmailTemplate, Transaction, UserProfile, Workspace, WorkspaceMember } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-001',
    email: 'somchai@save.app',
    full_name: 'สมชาย ใจดี',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    last_sign_in_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'admin-001',
    email: 'admin@save.app',
    full_name: 'ผู้ดูแลระบบ (Admin)',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    last_sign_in_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
  {
    id: 'user-002',
    email: 'wipha@shop.co.th',
    full_name: 'วิภา สุขเจริญ',
    role: 'user',
    status: 'active',
    last_sign_in_at: new Date(Date.now() - 14 * 86400000).toISOString(), // 14 days ago
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'user-003',
    email: 'inactive.user@mail.com',
    full_name: 'เกรียงไกร สถิตย์ (ไม่ได้ใช้งาน 94 วัน)',
    role: 'user',
    status: 'active',
    last_sign_in_at: new Date(Date.now() - 94 * 86400000).toISOString(), // 94 days ago (> 90 days!)
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
  },
  {
    id: 'user-004',
    email: 'suspended.test@mail.com',
    full_name: 'นเรศน์ ระงับใช้งาน',
    role: 'user',
    status: 'suspended',
    last_sign_in_at: new Date(Date.now() - 110 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-001',
    owner_id: 'user-001',
    name: 'บัญชีส่วนบุคคล',
    type: 'personal',
    description: 'บันทึกค่าใช้จ่ายและเงินออมส่วนตัว',
    currency: 'THB',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    role: 'owner',
  },
  {
    id: 'ws-002',
    owner_id: 'user-001',
    name: 'ร้านกาแฟ Minimal Coffee Lab',
    type: 'shop',
    description: 'รายรับการขายเครื่องดื่ม และต้นทุนวัตถุดิบร้าน',
    currency: 'THB',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    role: 'owner',
  },
];

export const INITIAL_MEMBERS: WorkspaceMember[] = [
  {
    id: 'mem-001',
    workspace_id: 'ws-001',
    user_id: 'user-001',
    email: 'somchai@save.app',
    full_name: 'สมชาย ใจดี',
    role: 'owner',
    status: 'accepted',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'mem-002',
    workspace_id: 'ws-002',
    user_id: 'user-001',
    email: 'somchai@save.app',
    full_name: 'สมชาย ใจดี',
    role: 'owner',
    status: 'accepted',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'mem-003',
    workspace_id: 'ws-002',
    user_id: 'user-002',
    email: 'wipha@shop.co.th',
    full_name: 'วิภา สุขเจริญ (ผู้จัดการร้าน)',
    role: 'editor',
    status: 'accepted',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Personal Categories
  { id: 'cat-001', workspace_id: 'ws-001', name: 'เงินเดือน', type: 'income', icon: 'Wallet', color: '#10b981', is_default: true },
  { id: 'cat-002', workspace_id: 'ws-001', name: 'รายได้เสริม / ฟรีแลนซ์', type: 'income', icon: 'TrendingUp', color: '#06b6d4', is_default: true },
  { id: 'cat-003', workspace_id: 'ws-001', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', is_default: true },
  { id: 'cat-004', workspace_id: 'ws-001', name: 'เดินทางและรถยนต์', type: 'expense', icon: 'Car', color: '#3b82f6', is_default: true },
  { id: 'cat-005', workspace_id: 'ws-001', name: 'ช้อปปิ้งและไลฟ์สไตล์', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', is_default: true },
  { id: 'cat-006', workspace_id: 'ws-001', name: 'บิลค่าสาธารณูปโภค', type: 'expense', icon: 'Receipt', color: '#64748b', is_default: true },

  // Shop Categories
  { id: 'cat-101', workspace_id: 'ws-002', name: 'ยอดขายหน้าร้าน (POS)', type: 'income', icon: 'Coins', color: '#10b981', is_default: true },
  { id: 'cat-102', workspace_id: 'ws-002', name: 'ยอดขายเดลิเวอรี (Grab/Lineman)', type: 'income', icon: 'TrendingUp', color: '#14b8a6', is_default: true },
  { id: 'cat-103', workspace_id: 'ws-002', name: 'วัตถุดิบเมล็ดกาแฟและนม', type: 'expense', icon: 'Coffee', color: '#f59e0b', is_default: true },
  { id: 'cat-104', workspace_id: 'ws-002', name: 'ค่าเช่าสถานที่', type: 'expense', icon: 'Home', color: '#ef4444', is_default: true },
  { id: 'cat-105', workspace_id: 'ws-002', name: 'ค่าจ้างพนักงานพาร์ทไทม์', type: 'expense', icon: 'Users', color: '#8b5cf6', is_default: true },
  { id: 'cat-106', workspace_id: 'ws-002', name: 'ค่าไฟฟ้าและน้ำประปา', type: 'expense', icon: 'Zap', color: '#64748b', is_default: true },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Personal transactions
  {
    id: 'tx-001',
    workspace_id: 'ws-001',
    category_id: 'cat-001',
    category_name: 'เงินเดือน',
    category_color: '#10b981',
    type: 'income',
    amount: 52000,
    date: new Date().toISOString().split('T')[0],
    title: 'เงินเดือนประจำเดือน',
    notes: 'โอนเข้าบัญชีหลัก',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-002',
    workspace_id: 'ws-001',
    category_id: 'cat-003',
    category_name: 'อาหารและเครื่องดื่ม',
    category_color: '#f97316',
    type: 'expense',
    amount: 280,
    date: new Date().toISOString().split('T')[0],
    title: 'มื้อกลางวันและกาแฟ',
    notes: 'สเต็กและลาเต้เย็น',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-003',
    workspace_id: 'ws-001',
    category_id: 'cat-004',
    category_name: 'เดินทางและรถยนต์',
    category_color: '#3b82f6',
    type: 'expense',
    amount: 1500,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    title: 'เติมน้ำมันรถยนต์',
    notes: 'ปั๊ม ปตท.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tx-004',
    workspace_id: 'ws-001',
    category_id: 'cat-002',
    category_name: 'รายได้เสริม / ฟรีแลนซ์',
    category_color: '#06b6d4',
    type: 'income',
    amount: 14500,
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    title: 'รับงานออกแบบกราฟิก',
    notes: 'ลูกค้าบริษัท ABC',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'tx-005',
    workspace_id: 'ws-001',
    category_id: 'cat-005',
    category_name: 'ช้อปปิ้งและไลฟ์สไตล์',
    category_color: '#ec4899',
    type: 'expense',
    amount: 1990,
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    title: 'ซื้อหูฟังบลูทูธ',
    notes: 'ลดราคาโปรโมชั่น',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },

  // Shop transactions
  {
    id: 'tx-101',
    workspace_id: 'ws-002',
    category_id: 'cat-101',
    category_name: 'ยอดขายหน้าร้าน (POS)',
    category_color: '#10b981',
    type: 'income',
    amount: 8940,
    date: new Date().toISOString().split('T')[0],
    title: 'ยอดขายเครื่องดื่มช่วงเช้า-บ่าย',
    notes: 'ขายได้ 92 แก้ว',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-102',
    workspace_id: 'ws-002',
    category_id: 'cat-103',
    category_name: 'วัตถุดิบเมล็ดกาแฟและนม',
    category_color: '#f59e0b',
    type: 'expense',
    amount: 3200,
    date: new Date().toISOString().split('T')[0],
    title: 'สั่งซื้อเมล็ดกาแฟคั่วพิเศษ 5 kg',
    notes: 'โรงคั่วเชียงใหม่',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-103',
    workspace_id: 'ws-002',
    category_id: 'cat-102',
    category_name: 'ยอดขายเดลิเวอรี (Grab/Lineman)',
    category_color: '#14b8a6',
    type: 'income',
    amount: 4560,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    title: 'ยอดสรุปโอนจาก Delivery',
    notes: 'หัก GP เรียบร้อย',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'inactivity_90d',
    name: 'แจ้งเตือนไม่ได้ใช้งานเกิน 90 วัน (ก่อนลบข้อมูล)',
    subject: '[SAVE Alert] แจ้งเตือน: บัญชีของท่านไม่ได้เข้าใช้งานเกิน 90 วัน',
    description: 'แจ้งเตือนผู้ใช้ที่ไม่มีความเคลื่อนไหว เพื่อป้องกันการลบข้อมูลตามนโยบายความเป็นส่วนตัว',
    content: `เรียน คุณ {NAME},

ระบบตรวจพบว่า บัญชีของคุณ ({EMAIL}) ไม่ได้มีการเข้าสู่ระบบหรือทำรายการใดๆ เป็นเวลากว่า 90 วัน (เข้าใช้งานล่าสุดเมื่อ: {LAST_ACTIVE})

ตามนโยบายการจัดเก็บและรักษาความปลอดภัยของข้อมูล ระบบจะดำเนินการล้างฐานข้อมูลประวัติของบัญชีที่ไม่มีความเคลื่อนไหวภายใน 15 วันข้างหน้า

หากท่านยังต้องการเก็บรักษาข้อมูลรายรับ-รายจ่ายของท่าน กรุณาเข้าสู่ระบบทันทีเพื่อยืนยันการใช้งานต่อเนื่อง:
👉 เข้าสู่ระบบ: https://save-app.vercel.app

ขอแสดงความนับถือ,
ทีมงานดูแลระบบ SAVE Financial App`,
  },
  {
    id: 'welcome',
    name: 'ต้อนรับสมาชิกใหม่',
    subject: 'ยินดีต้อนรับสู่ SAVE - บริหารการเงินของคุณอย่างง่ายดาย',
    description: 'อีเมลต้อนรับสำหรับผู้ใช้ที่ลงทะเบียนใหม่ พร้อมคำแนะนำการเริ่มต้นใช้งาน',
    content: `สวัสดีคุณ {NAME},

ยินดีต้อนรับสู่ SAVE แพลตฟอร์มบันทึกรายรับ-รายจ่ายแบบ Minimal & Modern!

คุณสามารถเริ่มต้นสร้างกระเป๋าเงินส่วนบุคคล หรือร้านค้าของคุณได้ทันที รวมถึง:
- แบ่งหมวดหมู่รายรับ-รายจ่ายได้อิสระ
- เชิญเพื่อนร่วมงานเข้ามาดูหรือบันทึกข้อมูลร่วมกัน
- ดูสรุปสถิติแบบเรียลไทม์ และส่งออกเป็น PDF/CSV ได้ทุกเมื่อ

เข้าใช้งานได้ทุกที่ทั้งบนมือถือและคอมพิวเตอร์

ขอขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา,
ทีมงาน SAVE`,
  },
  {
    id: 'notice',
    name: 'แจ้งอัปเดตระบบและความปลอดภัย',
    subject: '[SAVE] ประกาศปรับปรุงระบบและการอัปเกรดความปลอดภัย',
    description: 'ประกาศสำคัญสำหรับการบำรุงรักษาหรืออัปเดตฟีเจอร์ใหม่',
    content: `เรียน ผู้ใช้งานทุกท่าน,

ทีมงาน SAVE ได้ทำการอัปเกรดระบบการเข้ารหัสและความปลอดภัยของฐานข้อมูล พร้อมทั้งเพิ่มประสิทธิภาพในการสร้างรายงาน PDF และการทำงานร่วมกันในร้านค้า

ระบบพร้อมให้บริการตามปกติด้วยความรวดเร็วยิ่งขึ้น

ขอบคุณสำหรับความไว้วางใจ,
ทีมงาน SAVE`,
  },
];

export const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'log-001',
    recipient_email: 'inactive.user@mail.com',
    recipient_user_id: 'user-003',
    subject: '[SAVE Alert] แจ้งเตือน: บัญชีของท่านไม่ได้เข้าใช้งานเกิน 90 วัน',
    template_type: 'inactivity_90d',
    content: 'ระบบส่งแจ้งเตือนการไม่ได้เข้าใช้งานเกิน 90 วัน เรียบร้อยแล้ว',
    status: 'sent',
    sent_by: 'admin-001',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];
