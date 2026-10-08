# Salon (mobile)

Phone-first Expo / React Native app for one salon: Counter, Customers, Reminders, Refer & Earn, Owner
Dashboard. Each salon gets its own copy; customise `src/config/salon.ts`. Data lives on the phone
(AsyncStorage). Business rules mirror `../salon-app` and are tested in `tests/`.

```bash
npm install
npx expo start          # scan the QR with Expo Go on a phone
npx expo start --web    # browser preview
npx vitest run          # business-rule tests
npx tsc --noEmit        # typecheck
```

Product truth: `PRODUCT.md`. Design system: `DESIGN.md`. Direction contract: `.impeccable/surfaces/app-tsx.md`.
