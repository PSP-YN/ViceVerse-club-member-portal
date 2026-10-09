# ViceVerse Club Member Portal

Welcome to the **ViceVerse Club Member Portal**. This is a Next.js 16 (App Router) application designed with a unique "GTA Vice City" / Synthwave aesthetic for a club management system.

## 🌟 Features

- **GTA Vice City Theme:** Custom neon UI engine powered by Tailwind CSS v4 and standard CSS variables.
- **Mission Hub:** A centralized dashboard showing team operations and telemetry.
- **Intel & Roster:** View team dossiers and operational status.
- **Communications Network:** Real-time (Supabase-backed) read-only announcements system for members.
- **Demo Mode:** Bypass authentication for evaluators and testers via a streamlined 1-click `vv_demo_auth` integration.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository and navigate to the root directory:
   ```bash
   git clone https://github.com/PSP-YN/ViceVerse-club-member-portal.git
   cd ViceVerse-club-member-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4, Lucide React
- **Backend/Auth:** Supabase
- **Deployment:** Vercel

## 📂 Project Structure

- `/src/app/` - Next.js App Router pages (Dashboard, Login, API routes)
- `/src/app/globals.css` - GTA Vice City design token configuration
- `/src/components/` - Reusable UI components (ViceVerseLogo, etc.)
- `/src/lib/` - Supabase client setup, database schema, and utility functions
- `/docs/` - Original project PDFs and documentation
- `TEAM_CONTRIBUTION_GAP_ANALYSIS.md` - Analysis of missing features required from the other two team members.

## 🚀 Deployment (Vercel)

The project is fully configured for Vercel deployment. Because the project was migrated from a subdirectory to the root, standard Vercel automatic builds will now succeed without any custom Root Directory configurations.

To deploy, simply connect your GitHub repository to Vercel and it will automatically build using the `npm run build` command.
