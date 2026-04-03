# Debug Aplikasi Blank Putih - Smart Retail POS

## 🔍 **Masalah: Aplikasi Blank Putih**

### **Gejala:**
- Halaman loading tapi hanya tampil putih
- Tidak ada error di console
- Tidak ada content yang muncul
- Loading spinner tidak berhenti

---

## 🚀 **Quick Fix Steps**

### **1. Buka Browser Console**
```bash
# Tekan F12 atau Ctrl+Shift+I
# Lihat tab Console untuk error messages
# Perhatikan error yang muncul
```

### **2. Clear Browser Cache**
```bash
# Chrome/Edge: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Pilih "All time" dan "Cached images and files"
```

### **3. Restart Development Server**
```bash
# Stop server (Ctrl+C)
# Jalankan ulang:
npm run dev
```

---

## 🔧 **Common Issues & Solutions**

### **Issue 1: Port Conflict**

**Symptoms:**
- Error: "Port 5173 is already in use"
- Server tidak bisa start

**Solution:**
```bash
# 1. Kill process di port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# 2. Atau gunakan port lain
npm run dev -- --port 3000

# 3. Atau update vite.config.ts
server: {
  port: 3000, // Ganti port
}
```

### **Issue 2: Module Import Error**

**Symptoms:**
- Error: "Cannot find module '@/components/...'"
- Error: "Module not found"

**Solution:**
```bash
# 1. Pastikan path alias benar
# Di vite.config.ts:
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}

# 2. Restart development server
npm run dev
```

### **Issue 3: React Component Error**

**Symptoms:**
- Error: "Component is not defined"
- Error: "Cannot read property of undefined"

**Solution:**
```bash
# 1. Check browser console
# 2. Lihat error boundary di App.tsx
# 3. Pastikan semua imports benar
```

### **Issue 4: CSS/Tailwind Error**

**Symptoms:**
- Layout tanpa styling
- Error: "Cannot resolve tailwindcss"

**Solution:**
```bash
# 1. Reinstall dependencies
npm install

# 2. Rebuild CSS
npm run build:dev

# 3. Check Tailwind config
npx tailwindcss -i ./src/index.css -o ./dist/output.css
```

---

## 🛠️ **Advanced Debugging**

### **Check Network Tab**
```bash
# Di Developer Tools > Network:
# Lihat failed requests:
- 404 errors untuk assets
- Failed CSS/JS loads
- CORS errors
```

### **Check Elements Tab**
```bash
# Di Developer Tools > Elements:
# Pastikan:
- <div id="root"> ada
- CSS files loaded
- No broken layouts
```

### **Enable Verbose Logging**
```javascript
# Di browser console:
localStorage.setItem('debug', 'true');
localStorage.setItem('verbose', 'true');

# Reload halaman
window.location.reload();
```

---

## 🔄 **Fixed Configuration**

### **1. main.tsx (Fixed)**
```typescript
// Error handling dan DOM ready check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(<App />);
    } else {
      console.error('Root element not found');
    }
  });
} else {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error('Root element not found');
  }
}
```

### **2. vite.config.ts (Fixed)**
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Allow external connections
    port: 5173, // Standard Vite port
    hmr: {
      overlay: true, // Enable error overlay
    },
    open: true, // Auto-open browser
  },
  // ... rest of config
}));
```

---

## 📊 **Verification Steps**

### **1. Check Server Start**
```bash
# Expected output:
  VITE v5.4.19  ready in 323 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

### **2. Check Browser**
```bash
# Buka: http://localhost:5173
# Expected:
- Loading screen muncul
- Console tidak ada error
- Aplikasi terload dengan benar
```

### **3. Check Console**
```bash
# Expected logs:
"Root element found"
"App rendered successfully"
"Supabase client initialized"
```

---

## 🚨 **Emergency Solutions**

### **If Still Blank:**
```bash
# 1. Reset ke state awal
git checkout HEAD -- src/
npm install
npm run dev

# 2. Use different browser
# Coba Firefox, Chrome, Edge

# 3. Disable extensions
# Matikan ad-blocker, dll

# 4. Incognito mode
# Buka di incognito/private window
```

### **Complete Reinstall:**
```bash
# 1. Delete node_modules dan package-lock
rmdir /s node_modules
del package-lock.json

# 2. Clean install
npm cache clean --force
npm install

# 3. Start dev server
npm run dev
```

---

## 📋 **Debug Checklist**

### **Pre-Run Checklist:**
- [ ] Node.js version >= 18
- [ ] npm install berhasil
- [ ] Port 5173 available
- [ ] Browser cache cleared
- [ ] Extensions disabled

### **Post-Run Checklist:**
- [ ] Server start tanpa error
- [ ] Browser console clean
- [ ] Aplikasi terload dengan benar
- [ ] Semua assets loaded
- [ ] Interactive elements work

---

## 📞 **Get Help**

### **Information to Collect:**
```bash
# Screenshot dari:
1. Browser console (semua error)
2. Network tab failed requests
3. Terminal output server start
4. Elements tab DOM structure
```

### **Common Error Messages:**
```bash
❌ "Cannot find module '@/components/...'"
   → Import path error

❌ "Uncaught TypeError: Cannot read property '...' of undefined"
   → Component state/props error

❌ "Failed to load resource: the server responded with status 404"
   → File not found error

❌ "WebSocket connection failed"
   → Supabase connection error
```

---

## 🔮 **Prevention Tips**

### **Best Practices:**
1. **Always check console** untuk errors
2. **Clear cache** setiap major changes
3. **Use consistent port** untuk development
4. **Keep dependencies updated**
5. **Test in multiple browsers**

### **Development Workflow:**
```bash
# 1. Start clean
npm install
npm run dev

# 2. Monitor console
# Buka Developer Tools

# 3. Test incrementally
# Add features satu per satu

# 4. Commit working state
git add .
git commit -m "Feature working"
```

---

**🎯 Setelah mengikuti debugging ini, aplikasi seharusnya tidak blank lagi!**

**Langkah pertama: Buka browser console dan lihat error yang muncul untuk mengetahui akar masalahnya.**
