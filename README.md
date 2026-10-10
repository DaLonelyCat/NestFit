# 🏋️ NestFit: Smart Dumbbell & Offline Workout Companion

A fast, responsive, **mobile-first, offline-ready** strength training web application designed to track your workouts and calculate exact, balanced weight combinations for modular dumbbell and barbell kits.

Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**. Fully pre-configured for **Cloudflare Pages** deployment.

---

## 🌟 Key Features

* **⚡ Offline-First & Private**: Works 100% in your browser without requiring external database connections or logins. All workout sessions, sets, and logs are saved locally via `localStorage`.
* **🔧 Calibrated Modular Hardware Calculator**:
  * Accurate physical modeling for modular dumbbell handles, central barbell connector, spinlock nuts, and cast iron plates.
  * **Short-End Sleeve Safety Constraint**: Enforces physical sleeve capacity (maximum **3 plates per side** on short dumbbell sleeves) so threads always engage with spinlock nuts safely.
  * **Bilateral Symmetrical Loading**: Ensures equal plate distribution on both sides of each bar.
  * Supports **Single Dumbbell** (up to 11.0 kg), **Dumbbell Pair** (up to 9.5 kg each), and **Connected Barbell** (up to 19.0 kg).
* **📱 Mobile-First Minimalist UI**:
  * **Fixed Bottom Navigation Bar**: One-handed navigation (`Today`, `Dumbbell`, `Exercises`, `Gear & Logs`) that automatically hides during active workouts for maximum screen space.
  * **Compact 7-Day Schedule**: Sleek 1-row schedule strip replacing bulky multi-row grids.
  * **Safe-Area Padding**: Full support for iOS and Android edge-to-edge screens (`viewport-fit=cover`).
* **🔄 Full Workout Plan Customization**:
  * **Set Steppers**: Easily adjust or remove sets (`− / +`) for each exercise before starting.
  * **Exercise Removal & Swapping**: Remove individual exercises from the daily plan or swap them with muscle-matched alternatives.
  * **1-Tap Reset**: Instantly restore default program splits with one tap.
* **⚡ Super Sets & 🔥 Till Failure (AMRAP)**:
  * Link adjacent movements as paired Super Sets with dedicated 15s transition timers.
  * Mark individual sets to failure (`AMRAP`) to track maximal progressive overload.
* **⏱️ Guided Workout Session Runner**:
  * Real-time set logging with weight, reps, and in-runner set removal.
  * Dynamic rest chronometer with audio chime alerts.
  * Confetti celebration and automatic session summary on workout completion.
* **📖 175+ Exercise Movement Catalog**:
  * Categorized across Chest, Back, Arms, Shoulders, Legs, and Core.
  * Filterable by equipment (Dumbbell, Barbell, Bodyweight, Bench, Machine).
  * 1-click plate blueprint launcher for any weighted movement.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Run unit test suite
npm run test

# 4. Create production build
npm run build
```

---

## ☁️ Deploying to Cloudflare Pages

NestFit is pre-configured with `public/_redirects` (SPA routing fallback) and `public/_headers` (HTTP cache headers).

### Option A: Cloudflare Dashboard (Recommended)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository `DaLonelyCat/NestFit`.
3. Configure build settings:
   * **Framework preset**: `Vite`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
4. Click **Save and Deploy**.

### Option B: Wrangler CLI
```bash
npm run build
npx wrangler pages deploy dist --project-name=nestfit
```

---

## 📄 License

This project is licensed under the **MIT License**.
