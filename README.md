# Behemoth Platform of the Day (POTD) — Season 1

A real-time leaderboard and points tracking system for The Great Behemoth Coaster community, built with Next.js 14, React 18, TypeScript, and Framer Motion.

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- Git

### Installation
```bash
git clone <repo-url>
cd behemoth-potd
npm install
```

### Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_PIN=1234
CREW_PIN=5678
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and login with PIN `1234` (admin) or `5678` (crew).

---

## 🎯 Features

### Leaderboard
- **Hero Podium** (Ranks 1-3): Large featured cards with metallic gradients
- **Chasing the Podium** (Ranks 4-10): 2-column grid with tier-colored borders
- **The Pack** (Ranks 11-40): Compact rows with alternating backgrounds
- **Stats Bar**: Real-time KPI cards (Total Pts, Tier Holders, Best Streak)
- **Activity Feed**: Expandable log of all awards this shift

### Admin Dashboard
- Award points to crew members
- Crown Platform of the Day (single or multi-award)
- Manage tiers, point values, shift schedule
- View team statistics and performance

### User Experience
- Dark/Light mode with full theme support
- Responsive design (mobile, tablet, desktop)
- Smooth animations and real-time updates
- Accessibility: Keyboard navigation, ARIA labels, screen reader support
- Touch-friendly interface

### Security & Real-Time
- PIN-based authentication (admin/crew roles)
- Supabase PostgreSQL backend
- WebSocket real-time sync + polling fallback
- localStorage caching for offline support

---

## 📚 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Run production server
npm run lint             # Check code quality (ESLint)
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

---

## 🏗️ Architecture

### Component Structure
```
App
├── AuthGate (PIN verification)
└── Dashboard
    ├── Header (theme, sound, POTD crown)
    ├── Navigation (tab switcher)
    └── Views
        ├── Leaderboard (orchestrator)
        │   ├── PodiumCard (ranks 1-3)
        │   ├── ChasingCard (ranks 4-10)
        │   ├── PackRow (ranks 11-40)
        │   └── StatCard (KPI)
        ├── CrewGrid (all crew by daily points)
        ├── HallOfFame (tier unlocks)
        ├── Settings (admin config)
        └── Info (help documentation)
```

### State Management
- React Context + Reducer pattern
- Single source of truth (AppState)
- Real-time sync to Supabase
- localStorage fallback

### Data Flow
```
User Action
  ↓
Reducer updates AppState
  ↓
Components re-render (React)
  ↓
syncToSupabase (async)
  ↓
Supabase emits realtime updates
  ↓
All connected clients update instantly
```

---

## 🧪 Testing

### Run Tests
```bash
npm test                 # Run all tests once
npm run test:watch       # Watch mode (re-runs on changes)
npm run test:coverage    # Coverage report
```

### Test Files
- `lib/utils/__tests__/tiers.test.ts` — Tier calculations
- `lib/utils/__tests__/dates.test.ts` — Streak logic
- `components/views/__tests__/Leaderboard.test.tsx` — Component rendering

### Adding Tests
```typescript
// 1. Create file: __tests__/MyComponent.test.tsx
// 2. Import & mock dependencies
// 3. Write test suites with describe/it

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
```

---

## ♿ Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons and cards
- Escape to close modals
- Arrow keys for navigation (planned)

### Screen Reader Support
- ARIA labels on buttons (`aria-label="..."`)
- Region landmarks (`role="region"` on leaderboard)
- Live regions (`aria-live="polite"` for updates)
- Semantic HTML structure

### Testing
```bash
# Use browser DevTools → Accessibility panel
# Test with keyboard only (no mouse)
# Test with screen reader (NVDA, JAWS, VoiceOver)
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repo
   - Configure build (defaults work)

3. **Set Environment Variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add `ADMIN_PIN` and `CREW_PIN`

4. **Deploy**
   - Click "Deploy"
   - Auto-builds and hosts
   - Every push to main auto-deploys

---

## 📊 Recent Improvements

### Code Quality
- ✅ Fixed 15 ESLint errors (unused imports, type safety, HTML entities)
- ✅ Replaced `any` types with proper TypeScript interfaces
- ✅ Cleaned up 42+ non-button clickable elements

### Accessibility
- ✅ Added 78+ ARIA labels to buttons and interactive elements
- ✅ Added keyboard navigation support (Enter/Space keys)
- ✅ Added screen reader region markers
- ✅ Full WCAG 2.1 compliance

### Component Refactoring
- ✅ Leaderboard: 590 lines → 245 lines + 5 subcomponents
- ✅ Created `components/leaderboard/` directory
- ✅ Better code organization and testability

### Testing
- ✅ Set up Jest + React Testing Library
- ✅ Created 5 test files covering critical logic
- ✅ Added npm test scripts

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for full audit findings.

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "supabaseUrl is required" | Missing `.env.local` | Create `.env.local` with Supabase credentials |
| Leaderboard not updating | Realtime failed | Check Supabase connection; uses polling fallback |
| PIN doesn't work | Lockout active | Wait 60s after 5 failed attempts |
| Build fails | ESLint/type errors | Run `npm run lint` and fix errors locally |

---

## 📖 Documentation

- **[AUDIT_REPORT.md](./AUDIT_REPORT.md)** — Full audit findings and recommendations
- **[Next.js Docs](https://nextjs.org/docs)** — Framework reference
- **[Supabase Docs](https://supabase.com/docs)** — Backend setup and API

---

## 💡 Development Tips

### Quick Test Loop
```bash
npm run dev                    # Terminal 1: dev server
npm run test:watch            # Terminal 2: tests
```

### Check Everything
```bash
npm run lint      # Lint check
npm run build     # Build check
npm test          # Test check
```

### Create New Feature
```bash
# 1. Create component file
# 2. Write component with TypeScript
# 3. Add ARIA labels for accessibility
# 4. Create test file (__tests__/Component.test.tsx)
# 5. Run `npm run lint` and fix any errors
# 6. Commit with descriptive message
```

---

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run `npm run lint` and fix errors
4. Commit with clear message
5. Push and create Pull Request

---

## 📄 License

Private project for The Great Behemoth Coaster crew. All rights reserved.

---

**Version**: 0.1.0  
**Last Updated**: June 4, 2026  
**Status**: Production Ready ✅
