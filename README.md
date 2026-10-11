# 🏋️ NestFit: Smart Dumbbell & Offline Workout Companion

A fast, responsive, **mobile-first, offline-ready** strength training web application designed to track your workouts, customize your weekly splits, and calculate exact, balanced weight combinations for modular dumbbell and barbell kits.

Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**. Fully pre-configured for **Cloudflare Pages** deployment with **Pages Functions** and **Cloudflare D1 SQLite** database support.

---

## 🌟 Key Features

* **⚡ Offline-First & Private**: Works 100% in your browser without requiring external servers or logins. All workout sessions, sets, and logs are saved locally via `localStorage`.
* **👤 User Accounts & Cloudflare D1 Sync**:
  * **Guest Mode**: Full access out of the box with zero barrier to entry.
  * **User Registration & Login**: Create an account to securely save and sync custom workout splits across all your devices using Cloudflare Pages Functions and D1.
* **📅 Custom Workout Schedule & Split Templates**:
  * **Pre-Made Split Templates**: 1-tap switching between classic training splits:
    * **Hybrid Strength & Hypertrophy (5-Day)** (Default)
    * **Push / Pull / Legs (6-Day High Frequency)**
    * **Push / Pull / Legs (3-Day Essential)**
    * **Upper / Lower Split (4-Day)**
    * **Full Body Compound Blast (3-Day)**
    * **Body Part / Bro Split (5-Day)**
  * **Day-by-Day Fine Tuning**: Assign any workout focus to any day of the week (Push, Pull, Legs, Upper, Lower, Full Body, Chest, Back, Shoulders, Arms, or Rest).
* **🔧 Calibrated Modular Hardware Calculator**:
  * Accurate physical modeling for modular dumbbell handles, central barbell connector, spinlock nuts, and cast iron plates.
  * **Short-End Sleeve Safety Constraint**: Enforces physical sleeve capacity (maximum **3 plates per side** on short dumbbell sleeves) so threads always engage with spinlock nuts safely.
  * **Bilateral Symmetrical Loading**: Ensures equal plate distribution on both sides of each bar.
  * Supports **Single Dumbbell** (up to 11.0 kg), **Dumbbell Pair** (up to 9.5 kg each), and **Connected Barbell** (up to 19.0 kg).
* **📱 Mobile-First Minimalist UI**:
  * **Fixed Bottom Navigation Bar**: One-handed navigation (`Today`, `Dumbbell`, `Exercises`, `Gear & Logs`) that automatically hides during active workouts for maximum screen space.
  * **Compact 7-Day Schedule**: Sleek 1-row schedule strip replacing bulky multi-row grids.
  * **Safe-Area Padding**: Full support for iOS and Android edge-to-edge screens (`viewport-fit=cover`).
* **🔄 In-Session Customization & Set Steppers**:
  * **Set Steppers**: Easily adjust or remove sets (`− / +`) for each exercise before starting.
  * **In-Runner Set Removal**: Remove unwanted sets dynamically during workouts with automatic re-indexing.
  * **Exercise Removal & Swapping**: Remove individual exercises from the daily plan or swap them with muscle-matched alternatives.
* **⚡ Super Sets & 🔥 Till Failure (AMRAP)**:
  * Link adjacent movements as paired Super Sets with dedicated 15s transition timers.
  * Mark individual sets to failure (`AMRAP`) to track maximal progressive overload.
* **⏱️ Guided Workout Session Runner**:
  * Real-time set logging with weight, reps, and dynamic rest chronometer with audio alerts.
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

## ☁️ Deploying to Cloudflare Pages & D1 Database

### 1. Cloudflare Pages Deployment
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository `DaLonelyCat/NestFit`.
3. Configure build settings:
   * **Framework preset**: `Vite`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
4. Click **Save and Deploy**.

### 2. Optional: Enable Cloudflare D1 User Database
To enable cross-device account syncing in production:
1. In Cloudflare Dashboard, go to **Workers & Pages** > **D1 SQL Database** > **Create Database** (e.g. `nestfit-db`).
2. Run the SQL schema from [`schema.sql`](./schema.sql) in the D1 Console:
   ```bash
   npx wrangler d1 execute nestfit-db --file=./schema.sql
   ```
3. In your Pages project settings: **Settings** > **Functions** > **D1 database bindings**:
   * **Variable name**: `DB`
   * **D1 database**: `nestfit-db`
4. Re-deploy your Pages project. All user accounts and custom schedules will now persist to Cloudflare D1!

---

## 📄 License

This project is licensed under the **MIT License**.
