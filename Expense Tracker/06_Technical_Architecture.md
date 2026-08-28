# Technical Architecture

Given the constraints:
1. **Android-First:** Needs to feel native on a phone.
2. **Web (for UI):** Built with web technologies.
3. **Local/Offline:** Data stays entirely on the device.

## Recommended Stack: Expo (React Native) + SQLite

### 1. Framework: Expo (React Native)
- **Why:** It allows you to build a true Android app using React (web technologies). It provides excellent native performance, access to the device file system (for CSV exports), and a massive ecosystem of UI libraries.
- **Routing:** Expo Router (file-based routing, similar to Next.js).

### 2. Local Database: `expo-sqlite`
- **Why:** An embedded SQLite database that runs locally on the Android device. 
- **Benefits:** 
  - Zero cloud dependency (completely private).
  - Supports complex queries (e.g., "Sum all expenses where purpose = University").
  - Extremely fast.
- **ORM (Optional but recommended):** Drizzle ORM or WatermelonDB to make querying the local SQLite database easier and strongly typed.

### 3. State Management: Zustand + React Query
- **Zustand:** For simple global UI state (e.g., currently selected theme).
- **React Query (TanStack Query):** To fetch and cache data from the local SQLite database, keeping the UI instantly in sync when a transaction is added or deleted.

### 4. Styling: NativeWind (Tailwind for React Native)
- **Why:** Allows you to style components using Tailwind CSS utility classes, ensuring a clean, modern UI while keeping the codebase lean.

## 5. Development & Testing Workflow
- **Expo Go App:** Testing and development will run via `npx expo start`. You can scan the displayed QR code using the **Expo Go** app on your Android phone to instantly run and test the app live on your device without needing to compile APKs for every tweak.

## 6. Backup & Restore Architecture
- **Export (JSON):** Serializes all SQLite tables (`transactions`, `purposes`, `categories`, `settings`) into a single structured JSON file and saves it using `expo-file-system` and `expo-sharing` to the Android device's storage.
- **Restore (JSON):** Parses the selected JSON backup file, validates schema integrity, clears existing SQLite records (or merges based on UUIDs), and re-populates the database in a single atomic transaction.
