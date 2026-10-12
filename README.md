# 💸 SAVE - Minimal & Modern Financial Tracker (Multi-Platform)

ระบบบันทึกรายรับ-รายจ่ายที่ออกแบบด้วยสไตล์ **Minimal & Modern Style** รองรับการทำงานแบบ **Cross-Platform ทุกอุปกรณ์** ทั้ง **Web App, iOS และ Android** พัฒนาด้วย React Native Architecture เชื่อมต่อฐานข้อมูลและการตรวจสอบสิทธิ์ด้วย **Supabase** พร้อม Deploy บน **Vercel** ได้ทันที

---

## ✨ จุดเด่นและฟังก์ชันการทำงานหลัก (Core Features)

### 1. 📱 รองรับทุกแพลตฟอร์ม (Cross-Platform)
- **Web App**: พัฒนาด้วย React Native Web + Vite โหลดเร็วเป็นพิเศษ พร้อม Deploy ขึ้น **Vercel** ได้ทันทีด้วยไฟล์คอนฟิก `vercel.json`
- **iOS & Android**: โครงสร้างรองรับ React Native & Expo (`app.json`) พร้อมสำหรับ Build เป็นไฟล์ Native App (.apk / .ipa / TestFlight)

### 2. 🎨 ดีไซน์สไตล์ Minimal & Modern
- สลับธีม Dark/Light ได้ และจดจำธีมที่เลือกไว้ในอุปกรณ์
- ธีมสี Monochromatic สบายตา เรียบหรู ตัดกับสีสถานะการเงิน (Emerald Green สำหรับรายรับ, Rose Red สำหรับรายจ่าย)
- Typography สองภาษา (Prompt สำหรับภาษาไทย และ Inter สำหรับตัวเลข/ภาษาอังกฤษ)
- Responsive Layout 100% ปรับมุมมองอัตโนมัติทั้งบนหน้าจอมือถือ แท็บเล็ต และคอมพิวเตอร์

### 3. 💼 แยกบัญชี "ส่วนบุคคล" และ "ร้านค้า" ใน User เดียวกัน (Multi-Workspace)
- ใน 1 บัญชีผู้ใช้ สามารถสร้าง, สลับ, และลบ กระเป๋าเงินส่วนบุคคลและร้านค้า/ธุรกิจได้ไม่จำกัด
- ป้องกันข้อมูลปะปนกันระหว่างเงินใช้จ่ายส่วนตัวกับเงินหมุนเวียนในธุรกิจ
- มีการคำนวณและสรุปยอดคงเหลือสุทธิ (Net Balance), อัตราการออม (Savings Rate) และสัดส่วนกำไร (Margin) แยกตามบัญชี

### 4. 👥 ระบบเชิญเพื่อนร่วมกระเป๋า & กำหนดสิทธิ์ (Collaboration & Roles)
- สามารถเชิญเพื่อน, หุ้นส่วน หรือพนักงาน ผ่าน Email เพื่อเข้าถึงบัญชีเดียวกัน
- กำหนดระดับสิทธิ์การเข้าถึงได้ 3 ระดับ:
  - **เจ้าของ (Owner)**: สิทธิ์เต็มรูปแบบ จัดการสมาชิกและลบบัญชี
  - **ผู้แก้ไข (Editor)**: สามารถบันทึก, แก้ไข, ลบรายการรายรับ-รายจ่าย และจัดการหมวดหมู่ได้
  - **ผู้เข้าชม (Viewer)**: ดูสรุป สถิติ และส่งออกรายงาน (PDF/CSV) เท่านั้น ไม่สามารถแก้ไขข้อมูล

### 5. 🏷️ จัดการหมวดหมู่ได้อิสระ (Custom Categories)
- เพิ่มและลบหมวดหมู่ของตนเองได้ตามต้องการ
- ปรับแต่งสีและไอคอนประจำหมวดหมู่เพื่อการแสดงผลที่ชัดเจน
- แยกหมวดหมู่ฝั่งรายรับและรายจ่ายอย่างเป็นระเบียบ

### 6. 📄 ส่งออกรายงานรูปแบบ PDF และ CSV (Export Reports)
- **PDF Report**: จัดรูปแบบสไตล์ Financial Statement สวยงาม แสดงหัวกระดาษ, สรุปรายรับ-รายจ่าย, สัดส่วนคงเหลือ และตารางบันทึกรายการ
- **CSV (Excel Ready)**: เข้ารหัสด้วย **UTF-8 BOM (`\uFEFF`)** ทำให้เปิดบน Microsoft Excel บน Windows และ Mac ได้ทันทีโดยที่ตัวอักษรภาษาไทยไม่เป็นภาษาต่างดาว

### 7. 🔐 ระบบสมัครสมาชิก & แยกบทบาท (User & Admin)
- รองรับระบบ Login และ Register ด้วย Supabase Auth
- ผู้สมัครใหม่ได้รับสิทธิ์ **ผู้ใช้งานทั่วไป (User)** เท่านั้น
- สิทธิ์ **ผู้ดูแลระบบ (Admin)** กำหนดได้โดยผู้ดูแลระบบในฐานข้อมูลเท่านั้น
- ตรวจสอบสถานะบัญชีก่อนเข้าสู่ระบบ และปฏิเสธบัญชีที่ถูกระงับ

### 8. 🛡️ แผงควบคุมสำหรับผู้ดูแลระบบ (Admin Dashboard) & ระบบ Email
- **จัดการผู้ใช้ (User Management)**: ค้นหา, ดูรายชื่อ, สลับสถานะ (Active / Suspended), แก้ไขบทบาท (User / Admin) และลบผู้ใช้
- **ตรวจสอบการเข้าใช้งานล่าสุด (Last Active Tracking)**: แสดงวันที่และจำนวนวันที่ไม่ได้เข้าใช้งาน พร้อมระบบแจ้งเตือนสีแดงอัตโนมัติหาก **ไม่ได้เข้าใช้งานเกิน 90 วัน**
- **ส่ง Email ตามรูปแบบเทมเพลต (Email Dispatcher)**:
  - ⚠️ *แจ้งเตือนไม่ได้ใช้งานเกิน 90 วัน (ก่อนดำเนินการล้างฐานข้อมูล)* พร้อมระบุชื่อ วันที่เข้าใช้งานล่าสุด และปุ่มลิงก์ยืนยัน
  - ✉️ *ยินดีต้อนรับสมาชิกใหม่*
  - 📢 *ประกาศอัปเดตระบบและความปลอดภัย*
  - ✍️ *กำหนดเนื้อหาอิสระ (Custom Email)*
  - รองรับการส่งแจ้งเตือนแบบกลุ่ม (Batch Notify) สำหรับผู้ใช้ทั้งหมดที่ไม่ได้เข้าใช้งานเกิน 90 วัน
  - เก็บบันทึกประวัติการส่งอีเมลใน `email_logs`

---

## 🚀 เริ่มต้นใช้งานในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันแอปพลิเคชัน
```bash
npm run dev
```
เปิดบราวเซอร์ที่ `http://localhost:3000`

### 3. ตรวจสอบการ Build
```bash
npm run build
```
ไฟล์ Production จะถูกสร้างในโฟลเดอร์ `dist/`

---

## ☁️ การนำขึ้นโฮสต์บน Vercel (Deploy to Vercel)

โปรเจกต์นี้ได้รับการตั้งค่าไฟล์ [vercel.json](file:///d:/App/save/vercel.json) ไว้เรียบร้อยแล้ว:

### วิธีที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ)
1. นำโค้ดขึ้น GitHub / GitLab
2. ไปที่ [vercel.com](https://vercel.com) แล้วกด **Add New Project**
3. เลือก Repository นี้
4. Vercel จะตรวจพบการตั้งค่าอัตโนมัติ:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. ในแท็บ **Environment Variables** ให้ใส่ค่าจริงจาก Supabase (จำเป็นสำหรับสมัครสมาชิกและเข้าสู่ระบบ):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. กด **Deploy**

### วิธีที่ 2: Deploy ผ่าน Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

---

## 🗄️ การเชื่อมต่อฐานข้อมูล Supabase

1. ไปที่ [supabase.com](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** ใน Supabase
3. เปิดไฟล์ [supabase/schema.sql](file:///d:/App/save/supabase/schema.sql) ในโปรเจกต์นี้ แล้วคัดลอกคำสั่งทั้งหมดไปรัน (Run) ใน SQL Editor
   - สร้างตาราง `profiles`, `workspaces`, `workspace_members`, `categories`, `transactions`, `email_logs`
   - ตั้งค่าความปลอดภัย **Row Level Security (RLS)** ป้องกันการเข้าถึงข้อมูลข้ามผู้ใช้
   - สร้าง Trigger อัตโนมัติเมื่อสมัครสมาชิกใหม่ เพื่อสร้างบัญชีและหมวดหมู่ตั้งต้น
4. ไปที่ **Project Settings -> API** คัดลอก:
   - `Project URL`
   - `anon public key`
5. สร้างไฟล์ `.env` ในโฟลเดอร์หลัก แล้วระบุค่า:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

In Supabase **Authentication -> URL Configuration**, set the Site URL to the production domain and add `https://save-tau-eight.vercel.app/**` to Redirect URLs. Email signup must be enabled. Configure a custom SMTP provider in **Authentication -> SMTP Settings** for reliable delivery of confirmation links.

To make the trusted `siri1service@gmail.com` account an administrator, first sign up and confirm that email, then run `supabase/promote_siri1service_admin.sql` in the Supabase SQL Editor and sign in again. The public signup form cannot grant administrator access; never expose the Supabase service-role key in the app.

If using an existing database, run `supabase/migrations/20261012_auth_access_control.sql` and then `supabase/migrations/20261012_workspace_invitations.sql` in the Supabase SQL Editor. The invitation migration is required for shared-workspace invitations, but login remains available if it has not yet been applied. For a new database, run the updated `supabase/schema.sql`. Workspace owners can invite an email as an editor or viewer; the invited person must sign up or log in using that same email to claim access to the shared workspace. If Supabase URL and anon key are not configured, signup and login stay disabled; the app no longer creates demo accounts.

---

## 📱 การ Build สำหรับ iOS และ Android (Expo)

โปรเจกต์นี้รองรับ React Native Architecture:
```bash
# ติดตั้ง Expo CLI หากต้องการรันบนมือถือ
npx expo start
```
และสามารถใช้ Expo Application Services (EAS) เพื่อ Build ไฟล์สำหรับ Store:
```bash
# ติดตั้ง EAS CLI
npm install -g eas-cli

# สั่ง Build สำหรับ Android (.apk หรือ .aab)
eas build --platform android

# สั่ง Build สำหรับ iOS
eas build --platform ios
```

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
save/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx            # แผงควบคุม Admin, ตรวจสอบผู้ใช้, จัดการ Email
│   │   ├── CategoryModal.tsx         # จัดการเพิ่ม/ลบหมวดหมู่
│   │   ├── Charts.tsx                # แถบแสดงสัดส่วนรายรับ-รายจ่าย (Progress Bar)
│   │   ├── ExportModal.tsx           # หน้าต่างเลือกส่งออก PDF หรือ CSV
│   │   ├── Header.tsx                # แถบนำทางด้านบน, สลับกระเป๋า/ร้านค้า, เมนูผู้ใช้
│   │   ├── Icon.tsx                  # Universal Icon component (Lucide)
│   │   ├── InviteMemberModal.tsx     # ระบบเชิญเพื่อน และตั้งค่าสิทธิ์ Owner/Editor/Viewer
│   │   ├── SummaryCard.tsx           # การ์ดสรุปยอดคงเหลือ รายรับ รายจ่าย อัตราการออม
│   │   ├── TransactionModal.tsx      # บันทึกและแก้ไขรายการรายรับ-รายจ่าย
│   │   └── WorkspaceModal.tsx        # สลับ สร้าง ลบ บัญชีส่วนบุคคลและร้านค้า
│   ├── context/
│   │   ├── AppContext.tsx            # State จัดการข้อมูลการเงิน สมาชิก หมวดหมู่ และสถิติ
│   │   └── AuthContext.tsx           # State ตรวจสอบสิทธิ์ผู้ใช้และบทบาท User/Admin
│   ├── lib/
│   │   ├── exportUtils.ts            # ฟังก์ชันสร้างไฟล์ PDF Statement และ Thai UTF-8 CSV
│   │   ├── mockData.ts               # ข้อมูลจำลองและเทมเพลตอีเมลสำหรับทดสอบ
│   │   ├── supabase.ts               # ไคลเอ็นต์เชื่อมต่อ Supabase
│   │   └── theme.ts                  # Design Tokens สไตล์ Minimal & Modern
│   ├── screens/
│   │   ├── AuthScreen.tsx            # หน้าเข้าสู่ระบบและสมัครสมาชิก (แยก User/Admin)
│   │   ├── DashboardScreen.tsx       # หน้าแดชบอร์ดสรุปภาพรวมทางการเงิน
│   │   └── TransactionsScreen.tsx    # หน้าดูประวัติย้อนหลัง ค้นหา และกรองข้อมูล
│   └── types/
│       └── index.ts                  # TypeScript Interfaces และ Types ทั้งหมด
├── supabase/
│   └── schema.sql                    # SQL Migration ครบวงจร พร้อม RLS และ Triggers
├── App.tsx                           # Root Component ของ React Native
├── index.html                        # HTML Template
├── index.tsx                         # Web Entry Point
├── package.json                      # การจัดการ Dependencies
├── tsconfig.json                     # TypeScript Config
├── vercel.json                       # Vercel Deployment & Routing Config
└── vite.config.ts                    # Vite & React Native Web Build Config
```

#   s a v e  
 