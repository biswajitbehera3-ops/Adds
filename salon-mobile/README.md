# Salon (mobile)

> **Start here: [`BUILD-SPEC.md`](BUILD-SPEC.md)** is the master checklist of everything the app must contain. The app isn't built until every component there is decided.

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

## Building the app for a new salon
Each salon gets its own build. The look (brown glass), the business rules and the privacy features are the same for every salon. Only these change:
- `src/config/salon-details.json`: business details, grievance officer, provider, contract, retention.
- `src/config/salon.ts`: services, prices, add-ons, wallet bonus tiers, referral reward, message templates.
- `assets/brand/`: the salon's logo and intro video (licensed; see `legal/licenses.md`).

Then `npm run legal` builds that salon's policies, and `npm run release-check` must pass before an APK is made. Full steps: `legal/README.md`.
