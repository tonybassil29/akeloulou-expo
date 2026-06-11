# Akel Loulou - Expo Go SDK 54

Akel Loulou (Les Recettes de Tante Lau) — Lebanese recipe app built with **Expo SDK 54** and **React Native**.

## Features
- Browse Lebanese recipes
- Recipe detail with ingredients, steps, and video
- Gallery with categorized food photos
- Frigo Magique (find recipes by ingredients)
- Weekly Menu Planner
- Admin dashboard (add/edit/delete recipes)
- Recipe Suggestions & Search
- Favorites
- Dark mode support

## Tech Stack
- **Expo SDK 54** (~54.0.0)
- **React Native 0.81**
- **React 19.1**
- **Expo Router** (file-based navigation)
- **TypeScript**
- **Supabase** (backend)
- **Cloudinary** (image upload)
- **@expo/vector-icons** (Ionicons)

## Getting Started

### Prerequisites
- Node.js 20+
- Expo Go app on your iOS/Android device (updated to latest version)

### Installation
```bash
git clone https://github.com/tonybassil29/akeloulou-expo.git
cd akeloulou-expo
npm install
```

### Run with Expo Go
```bash
npx expo start
```
Scan the QR code with your **phone's Camera app** (not Expo Go's scanner).

### Run on iOS Simulator (Mac only)
```bash
npx expo start --ios
```

### Run on Android Emulator
```bash
npx expo start --android
```

## Important Notes
- **Do NOT run `npx expo install <package>`** — it will upgrade Expo SDK to the latest version. Use `npm install <package>` instead.
- The `.npmrc` file sets `legacy-peer-deps=true` to avoid peer dependency conflicts.

## Project Structure
```
app/                # Expo Router screens
  (tabs)/           # Tab navigation (Home, Gallery, About, Frigo, Menu)
  admin/            # Admin screens (Login, Dashboard, Recipes, Add, Edit)
  recipe/[id].tsx   # Recipe detail
  suggestion.tsx    # Search & suggestions
components/ui/      # Shared UI components
services/           # API services (Supabase, Cloudinary, Auth)
hooks/              # Custom React hooks
constants/          # Colors, Config
lib/                # Supabase client
types/              # TypeScript types
```

## Backend
- Supabase: https://psdjlvukfmnirfmlopdm.supabase.co
- Cloudinary: dqqir

## License
MIT