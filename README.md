# Share v1 Player

A minimal Next.js player for tokenized music and video assets on SHARE Protocol.

- Hosted player: http://share-v1-player.vercel.app
- Example music asset: https://share-v1-player.vercel.app/assets/base/0x4754FE39AFAE67F886088774A047607CC6CFA693

## What this repository does

The app reads asset metadata from onchain contracts, checks access state, and renders one of three experiences:

1. **Audio** (`AudioView`)
2. **Video** (`VideoView`)
3. **Collection / playlist** (`CollectionView`)

It also provides USDC payment controls when access is required.

## PFA and PFA collection fundamentals

This app follows the Protocol for Access (PFA) asset model, where each asset contract exposes metadata via `tokenURI(0)`.

### 1) `tokenURI` gets the data

- The player reads `tokenURI` from the asset contract:
  - `tokenURI(0)` on the PFA/ERC-721 contract.
- The URI response returns metadata JSON used to render audio, video, or collection views.

### 2) Metadata schema (returned from `tokenURI`)

At a minimum, the player expects fields like:

- `title` (string)
- `artist` (string)
- `image` or `artwork` (string URL)
- `type` (`audio` | `video` | `collection`)
- `audio` and/or `video` / `video_hls` (media URLs depending on type)
- `collection` (array of child item URIs for playlist/album assets)
- optional release and creator fields used in UI state

### 3) Payments happen via SHARE Protocol

- The player reads price data from the SHARE Protocol contract.
- To unlock a paid asset, it submits:
  1. USDC `approve(...)`
  2. SHARE Protocol `access(...)`
- For logged-in users, this is sent through the Privy smart wallet flow.

### 4) Access after payment

- After payment is confirmed onchain, grant state becomes active for the connected wallet.
- Once granted, the paid content can be read by SHARE-compatible apps whenever that same wallet is connected.
- Metadata requests include a wallet signature; in this player, that signature is requested silently via Privy after login (no extra signature prompt UI).

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
