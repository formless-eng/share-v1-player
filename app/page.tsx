export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Share v1 Player</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Minimal onchain media player</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-600 sm:text-base">
        Open a tokenized asset URL to load playback and purchase controls.
      </p>
      <div className="mt-8 space-y-3 text-sm">
        <a
          className="block rounded-full border border-zinc-300 px-5 py-3 text-zinc-800 transition hover:border-zinc-950 hover:text-zinc-950"
          href="http://share-v1-player.vercel.app"
        >
          Open hosted player
        </a>
        <a
          className="block rounded-full border border-zinc-300 px-5 py-3 text-zinc-800 transition hover:border-zinc-950 hover:text-zinc-950"
          href="https://share-v1-player.vercel.app/assets/base/0x4754FE39AFAE67F886088774A047607CC6CFA693"
        >
          Open sample music asset
        </a>
      </div>
    </main>
  );
}
