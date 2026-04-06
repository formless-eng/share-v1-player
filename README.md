# Share v1 Player

A minimal Next.js player for tokenized music and video assets on Base.

- Hosted player: http://share-v1-player.vercel.app
- Example music asset: https://share-v1-player.vercel.app/assets/base/0x4754FE39AFAE67F886088774A047607CC6CFA693

## What this repository does

The app loads metadata for an asset contract, verifies access, and renders one of three experiences:

1. **Audio** (`AudioView`)
2. **Video** (`VideoView`)
3. **Collection / playlist** (`CollectionView`)

It also provides wallet login and USDC payment controls when access is required.

## How to read the code

Start here, in order:

1. **App shell + providers**
   - `app/layout.tsx` sets up React Query, Privy auth, wallet providers, and the hidden global player.
2. **Route entry points**
   - `app/page.tsx` is the landing page.
   - `app/assets/[assetChainName]/[contractAddress]/page.tsx` routes asset URLs to the player page.
3. **Asset page orchestration**
   - `app/pages/asset_page/AssetPage.tsx` fetches metadata/grants and chooses the correct media view.
4. **Data + state flows**
   - `app/hooks/useAssetData.ts` fetches onchain + signed metadata.
   - `app/hooks/useUpdateAssetContext.ts` syncs fetched data into app state.
   - `app/contexts/AssetContext.tsx` and `app/contexts/PlayerContext.tsx` hold global state.
5. **Media UIs**
   - `app/components/audio_view/*`
   - `app/components/video_view/*`
   - `app/components/collection_view/*`
6. **Payments + constants**
   - `app/pages/asset_page/PaymentControls.tsx`
   - `app/lib/constants.ts` and `app/lib/utils.ts`

## Build your own player

### 1) Prerequisites

- Node.js 20+
- npm 10+

### 2) Install

```bash
npm install
```

### 3) Configure environment

Create `.env.local`:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

Optional (if you want to customize network/contracts), update constants in:

- `app/lib/constants.ts`

### 4) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### 5) Build for production

```bash
npm run build
npm run start
```

## Customization tips

- **Branding / visuals:** edit Tailwind classes in `app/components/*` and global styles in `app/globals.css`.
- **Supported chains:** extend chain mappings and RPC config in `app/lib/constants.ts`.
- **Purchase flow:** adjust transaction behavior in `app/pages/asset_page/PaymentControls.tsx`.
- **Metadata shaping:** normalize API responses in `app/hooks/useUpdateAssetContext.ts`.

## License

MIT (see `LICENSE`).
