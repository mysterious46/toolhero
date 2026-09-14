# 🚀 Deployment & Launch Guide - iLoveTools

This guide provides step-by-step instructions for deploying **iLoveTools** for 100% free with zero backend server costs to **Firebase Hosting**, **Vercel**, or **Netlify**.

---

## 📦 Step 1: Create Production Build

Run the production build command:
```bash
npm run build
```
This generates the optimized static bundle inside the `dist/` directory.

---

## 🔥 Option 1: Deploy with Firebase Hosting (Recommended)

### 1. Install Firebase CLI
```bash
npx -y firebase-tools@latest login
```

### 2. Initialize & Deploy
```bash
npx -y firebase-tools@latest init hosting
```
* Select your Firebase Project (or create a new one).
* Set public directory to: `dist`
* Configure as single-page app: `Yes`
* Set up automatic builds with GitHub: `No` (optional)

### 3. Deploy
```bash
npx -y firebase-tools@latest deploy --only hosting
```
🎉 Your site will be live at `https://<your-project-id>.web.app`!

---

## ⚡ Option 2: Deploy with Vercel

1. Install Vercel CLI:
   ```bash
   npx vercel
   ```
2. Follow the prompts (Select `my_tools` folder ➔ Set root directory `./` ➔ Build command `npm run build` ➔ Output directory `dist`).
3. Your site will be live instantly on a `.vercel.app` domain!

---

## 🌐 Option 3: Deploy with Netlify

1. Install Netlify CLI:
   ```bash
   npx netlify-cli deploy --prod --dir=dist
   ```
2. Your site will be live instantly on a `.netlify.app` domain!

---

## 🏷️ Custom Domain Setup (e.g. `ilove-tools.com`)

1. Go to your Hosting Dashboard (Firebase / Vercel / Netlify).
2. Click **Add Custom Domain** and enter your domain name (e.g. `ilove-tools.com`).
3. Add the provided `A` or `CNAME` DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare).
4. Free SSL Certificates (HTTPS) are provisioned automatically!
