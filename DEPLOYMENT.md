# 🚀 Deployment Kılavuzu

## GitHub Pages

### Otomatik Deployment

1. **GitHub repository ayarları:**
   - Settings → Pages → Source: GitHub Actions

2. **GitHub Actions workflow oluştur:**

`.github/workflows/deploy.yml` dosyası:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. **Vite config güncelle:**

```ts
// vite.config.ts
export default defineConfig({
  base: '/LAVORAWORKFLOW/', // Repo adınız
  // ...
});
```

4. **Push et:**
```bash
git add .
git commit -m "Add deployment workflow"
git push origin main
```

## Vercel

### Hızlı Deployment

1. [Vercel'e git](https://vercel.com)
2. GitHub ile bağlan
3. Repository'yi seç
4. Deploy butonuna bas

**Otomatik ayarlar:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## Netlify

### Drag & Drop

1. `npm run build` çalıştır
2. [Netlify'a git](https://netlify.com)
3. `dist/` klasörünü sürükle bırak

### Git Integration

1. Netlify'da "New site from Git"
2. Repository'yi seç
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build & Run

```bash
docker build -t lavora-workflow .
docker run -p 8080:80 lavora-workflow
```

## Geleneksel Hosting

### FTP ile Upload

1. Build oluştur:
```bash
npm run build
```

2. `dist/` klasörünün tüm içeriğini sunucunuza yükleyin

3. Web server config (Apache):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. Nginx config:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Environment Variables

Production için `.env.production`:

```env
VITE_API_URL=https://api.yourserver.com
VITE_APP_TITLE=Lavora Workflow
```

Build sırasında otomatik kullanılır.

## Performance Checklist

- ✅ Build optimize edildi (gzip: ~71KB)
- ✅ Code splitting aktif
- ✅ Lazy loading hazır
- ✅ Images optimize
- ✅ Cache strategy belirlendi

## SSL/HTTPS

Tüm modern hosting sağlayıcıları (Vercel, Netlify, GitHub Pages) otomatik SSL sağlar.

Kendi sunucunuz için: [Let's Encrypt](https://letsencrypt.org/)

---

**🎉 Deployment başarılı olduğunda uygulamanız canlıda!**
