# Panduan Deploy ke Netlify - Smart Retail POS

## 🎯 Overview

Deploy Smart Retail POS ke Netlify dengan **data sync real-time** yang tetap berfungsi. Semua fitur (Supabase realtime, Google Sheets sync) akan berjalan normal di Netlify.

## 🚀 Cara Deploy ke Netlify

### **1. Persiapan Repository**

```bash
# Clone repository
git clone https://github.com/username/smart-retail-pos.git
cd smart-retail-pos

# Install dependencies
npm install

# Build untuk production
npm run build
```

### **2. Setup Environment Variables**

#### **Di Netlify Dashboard:**
1. Buat site baru di Netlify
2. Go to **Site settings > Build & deploy > Environment**
3. Add environment variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key

# Google Apps Script
VITE_GOOGLE_SCRIPTS_URL=https://script.google.com/macros/s/your-script-id/exec

# App Config
VITE_APP_NAME=Smart Retail POS
VITE_APP_VERSION=1.0.0
```

#### **Atau via .env file:**
```bash
# Copy .env.example ke .env.production
cp .env.example .env.production

# Edit dengan nilai actual
nano .env.production
```

### **3. Build Configuration**

File `netlify.toml` sudah disiapkan:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **4. Deploy Options**

#### **Option 1: Git Integration (Recommended)**
```bash
# Push ke GitHub
git add .
git commit -m "Ready for Netlify deployment"
git push origin main

# Connect Netlify ke GitHub repository
# Auto-deploy on every push
```

#### **Option 2: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### **Option 3: Drag & Drop**
1. Run `npm run build`
2. Drag `dist` folder ke Netlify dashboard

## 🔄 Data Sync Setelah Deploy

### **1. Supabase Real-time (✅ Tetap Berfungsi)**

```javascript
// src/hooks/useSupabaseRealtime.ts
// Real-time subscriptions tetap bekerja di Netlify
const { data, error } = useSupabaseRealtime({
  enableAutoSync: true,
  syncInterval: 30000
});
```

**Kenapa tetap berfungsi?**
- Supabase adalah cloud service
- WebSocket connections supported di Netlify
- No server-side code required

### **2. Google Sheets Sync (✅ Tetap Berfungsi)**

```javascript
// src/lib/googleSheets.ts
// Auto-sync ke Google Sheets tetap bekerja
export const autoSyncToSheets = async () => {
  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'autoSyncAllData', data })
  });
};
```

**Kenapa tetap berfungsi?**
- Google Apps Script adalah web service
- CORS sudah diatur di Apps Script
- Fetch API works di Netlify

### **3. Local Storage & State Management (✅ Tetap Berfungsi)**

```javascript
// src/contexts/AppContext.tsx
// State management tetap bekerja normal
const [products, setProducts] = useState([]);
const [transactions, setTransactions] = useState([]);
```

## 📊 Data Flow di Netlify

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   User      │    │   Netlify    │    │  Supabase   │
│   Browser   │◄──►│   Static     │◄──►│  Database   │
│             │    │   Files      │    │  (Cloud)    │
└─────────────┘    └──────────────┘    └─────────────┘
         │                   │                   │
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Local     │    │   Real-time   │    │   Google    │
│  Storage    │    │   Sync       │    │   Sheets    │
│             │    │              │    │  (Backup)   │
└─────────────┘    └──────────────┘    └─────────────┘
```

## 🔧 Konfigurasi Tambahan

### **1. Custom Domain**

```bash
# Di Netlify Dashboard
Domain settings → Add custom domain → your-domain.com

# Update DNS records
A record: 75.2.60.5
CNAME record: netlify.app
```

### **2. SSL Certificate**
- Otomatis disediakan oleh Netlify
- HTTPS enabled by default
- No additional configuration needed

### **3. Form Handling**
```javascript
// Jika ada contact forms
// netlify.toml
[[redirects]]
  from = "/api/contact"
  to = "/.netlify/functions/contact"
  status = 200
```

## 🚨 Troubleshooting

### **1. Supabase Connection Issues**

**Problem:** Real-time sync tidak berfungsi
```bash
# Check console errors
# Verify environment variables
# Test Supabase connection
```

**Solution:**
```javascript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### **2. Google Sheets Sync Issues**

**Problem:** Auto-sync ke sheets gagal
```bash
# Check CORS settings
# Verify Apps Script URL
# Test API endpoint
```

**Solution:**
```javascript
// gas-web-app/Code.gs
function doPost(e) {
  // Enable CORS
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}
```

### **3. Build Errors**

**Problem:** Build gagal di Netlify
```bash
# Check package.json scripts
# Verify dependencies
# Update Node.js version
```

**Solution:**
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 📈 Performance Optimization

### **1. Build Optimization**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'sonner']
        }
      }
    }
  }
});
```

### **2. Caching Strategy**

```toml
# netlify.toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

### **3. CDN Configuration**

```bash
# Netlify Edge Functions (opsional)
# Untuk API caching atau data preprocessing
```

## 🔐 Security Considerations

### **1. Environment Variables**
```bash
# Jangan hardcode credentials
# Gunakan environment variables
# Jangan expose secrets di client-side code
```

### **2. Supabase RLS**
```sql
-- Pastikan RLS policies aktif
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;

-- Buat policies yang sesuai
CREATE POLICY "Users can view their own data" ON produk 
FOR SELECT USING (unit_id = auth.jwt() ->> 'unit_id');
```

### **3. CORS Configuration**
```javascript
// Google Apps Script
function doPost(e) {
  // Restrict origins di production
  const allowedOrigins = ['https://your-domain.netlify.app'];
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', allowedOrigins.join(','));
}
```

## 📊 Monitoring & Analytics

### **1. Netlify Analytics**
```bash
# Enable di Netlify Dashboard
# Track page views and user behavior
# Monitor performance metrics
```

### **2. Error Tracking**
```javascript
// src/lib/errorTracking.js
export const trackError = (error, context) => {
  console.error('App Error:', error, context);
  
  // Send to error tracking service
  if (import.meta.env.PROD) {
    // Sentry, LogRocket, etc.
  }
};
```

### **3. Performance Monitoring**
```javascript
// src/lib/performance.js
export const trackSyncPerformance = (operation, duration) => {
  if (import.meta.env.DEV) {
    console.log(`${operation} took ${duration}ms`);
  }
  
  // Send to analytics in production
};
```

## 🚀 Deployment Checklist

### **Pre-Deployment Checklist:**
- [ ] Environment variables configured
- [ ] Build passes successfully
- [ ] Supabase connection tested
- [ ] Google Apps Script deployed
- [ ] CORS settings verified
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics enabled

### **Post-Deployment Checklist:**
- [ ] Test all features
- [ ] Verify real-time sync
- [ ] Test Google Sheets sync
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Performance testing
- [ ] User acceptance testing

## 🔄 CI/CD Pipeline

### **GitHub Actions (Optional)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      with:
        args: deploy --prod --dir=dist
```

## 📞 Support & Maintenance

### **Regular Maintenance:**
1. **Weekly**: Check Netlify build logs
2. **Monthly**: Update dependencies
3. **Quarterly**: Review security policies
4. **Annually**: Renew custom domains

### **Backup Strategy:**
1. **Code**: GitHub repository
2. **Data**: Supabase + Google Sheets
3. **Configuration**: Netlify environment variables
4. **Assets**: Netlify deploy history

---

## 🎉 Summary

**✅ Bisa deploy ke Netlify dengan semua fitur sync aktif:**

1. **Supabase Real-time** → Tetap berfungsi ✓
2. **Google Sheets Sync** → Tetap berfungsi ✓  
3. **Local Storage** → Tetap berfungsi ✓
4. **Auto-sync** → Tetap berfungsi ✓
5. **Multi-device sync** → Tetap berfungsi ✓

**🚀 Keuntungan deploy ke Netlify:**
- **Free hosting** untuk static sites
- **HTTPS by default**
- **Global CDN**
- **Auto-deploy** dari Git
- **Custom domains**
- **Form handling**
- **Edge functions**

**Data Anda akan tetap sinkron dan update terbaru di semua device!**
