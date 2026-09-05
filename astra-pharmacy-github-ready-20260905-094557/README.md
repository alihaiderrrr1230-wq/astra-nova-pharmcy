# Astra Pharmacy — صيدلية أسترا

نظام إدارة صيدلية متكامل بـ React 18 + Vite + Tailwind CSS، بواجهة عربية RTL بهوية **Aurora Frost** (زجاج سائل visionOS).

## المميزات

- 💊 **60+ دواء** موزعين على 12 حالة مرضية
- 🛒 **نقطة بيع (POS)** مع ماسح باركود حقيقي
- 🗺️ **خريطة أرفف** مرئية مع إضاءة عند البحث
- 📦 **إدارة متجر** كاملة (إضافة/تعديل/حذف) + قائمة احتياجات (NPS) قابلة للتعديل
- 👥 **بيانات رئيسية** (موظفون، موزعون، أرشيف فواتير)
- 💰 **حسابات وجرد** يومية/أسبوعية/شهرية/سنوية بالدينار العراقي + قسم خسائر صريح للأدوية المنتهية
- 🔐 **PIN** للأمان مع جلسة دائمة
- 🌙 **وضع ليلي/نهاري** + تصميم متجاوب لكل الأحجام
- 💾 **localStorage** كامل — يعمل أوفلاين، ما في سيرفر

## التشغيل محلياً

```bash
# 1) تثبيت المكتبات
npm install

# 2) تشغيل وضع التطوير
npm run dev
# افتح http://localhost:5173

# 3) بناء النسخة النهائية
npm run build

# 4) معاينة البناء
npm run preview
```

## PIN الافتراضي

`1234` — يمكن تغييره من **الإدارة** → تبويب **تغيير الرمز**.

## النشر على Vercel (الأسهل)

### من خلال GitHub (موصى به)

#### 1) ارفع المشروع على GitHub

**الطريقة أ — واجهة ويب (الأسهل):**
1. روح [github.com/new](https://github.com/new)
2. سمّ المشروع `astra-pharmacy` (أو أي اسم)
3. **لا تضف** أي ملف (README, .gitignore, license) — سنرفع كل شي
4. اضغط **Create repository**
5. من صفحة المشروع الجديدة، اضغط **uploading an existing file**
6. اسحب كل ملفات المشروع (ما عدا `node_modules` و `dist`) للمربع
7. اضغط **Commit changes**

**الطريقة ب — من سطر الأوامر (لو عندك Git):**
```bash
git init
git add .
git commit -m "Initial commit: Astra Pharmacy v4"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/astra-pharmacy.git
git push -u origin main
```

#### 2) اربط Vercel بـ GitHub

1. روح [vercel.com/new](https://vercel.com/new)
2. سجّل دخول بحساب GitHub
3. اختر مستودع `astra-pharmacy`
4. **Framework Preset** → رح يكشفه تلقائياً كـ **Vite**
5. اضغط **Deploy**
6. انتظر 1-2 دقيقة → رح تحصل على رابط `https://astra-pharmacy-xxx.vercel.app`

#### 3) كل تحديث لاحق

ادفع تغييراتك على GitHub:
```bash
git add .
git commit -m "وصف التعديل"
git push
```
Vercel رح ينشر تلقائياً خلال ثوانٍ.

### مباشرة من Vercel CLI (بدون GitHub)

```bash
npm install -g vercel
vercel login
vercel        # للمعاينة
vercel --prod # للنشر
```

## هيكل المشروع

```
astra-pharmacy/
├── public/                  # ملفات ثابتة (الشعار، الـ favicon)
├── src/
│   ├── components/         # مكوّنات مشتركة
│   │   ├── AuroraBackground.jsx
│   │   ├── BarcodeModal.jsx
│   │   ├── GlassCard.jsx
│   │   ├── Logo.jsx
│   │   ├── OmniSearch.jsx
│   │   ├── PinPad.jsx
│   │   ├── ShelfMap.jsx
│   │   └── TopNav.jsx
│   ├── pages/              # صفحات التطبيق
│   │   ├── Admin.jsx
│   │   ├── Finance.jsx
│   │   ├── Home.jsx
│   │   ├── Inventory.jsx
│   │   ├── MasterData.jsx
│   │   ├── POS.jsx
│   │   ├── Settings.jsx
│   │   ├── ShelfMap.jsx
│   │   └── StoreManagement.jsx
│   ├── store/              # الحالة العامة (useAstraStore.js)
│   ├── data/               # البيانات الأولية (mockData.js)
│   ├── utils/              # أدوات مشتركة (format.js)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── vercel.json             # إعدادات Vercel (SPA routing)
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── package.json
└── package-lock.json
```

## الترخيص

خاص — جميع الحقوق محفوظة.
