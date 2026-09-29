# Leatrux Archives

The companion site for **Leatrux**, a homebrew D&D 5e campaign set on the world
of Amaterra. It's where the players go to look up house rules, buy things from
merchants, read up on the lore, and ask an AI sage what happened three sessions
ago because nobody took notes.

Built with SvelteKit, mdsvex, Tailwind + daisyUI, and deployed on Netlify.

## What's in it

**System rules**
- **Setting & homebrew rules** (`/setting`) — the table's house rules.
- **Alchemy** (`/alchemy`) — rules, recipes and a herbolarium of ingredients.
- **Blacksmithing** (`/blacksmithing`) — crafting rules, mining and blueprints.
- **Additional classes** (`/classes`) — prestige-style classes (Arcane Archer,
  Arcane Trickster, Bloodrager, Dragon Disciple, Duellist), several adapted from
  Pathfinder 1e.
- **Essences** (`/essence`) — elemental essence paths (acid, air, earth, fire,
  lightning, metal, poison, water) tied to the Phudara tribes.

**Campaign resources**
- **Merchants** (`/shop`) — per-merchant inventories with category filters and
  fuzzy search, plus a weapons catalogue and item detail pages.
- **Phudara tribes** (`/continents/phudara`) — Llamarada, Lluvia and Espora,
  each with its own mission board.
- **DM's Assistant** (`/chat`) — a chat bot that answers questions about the
  campaign using the lore notes as context (see below).
- **Maps** (`/maps`).

Longer-form lore also lives on the campaign's
[Obsidian Publish site](https://publish.obsidian.md/leatrux/).

## How the DM's Assistant works

It's a small retrieval-augmented chat, no vector database required:

1. `npm run index` (`scripts/generate-notes-index.ts`) walks the Markdown lore
   in `static/Public/` and writes `static/notes-index.json`.
2. In the browser, `src/lib/vectorStore.ts` loads that index and scores notes
   against the question with stemmed keyword matching (`src/lib/stemmer.ts`).
3. The best-matching notes go into the system prompt, and the conversation is
   sent to `src/routes/api/proxy/chat/+server.ts`, a server route that proxies
   to Google's Gemini 2.0 Flash and streams the answer back. The API key never
   reaches the browser.

Chat history is kept in the browser's `localStorage`.

## Development

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run index   # build the lore index the chat bot searches
npm run dev
```

For the DM's Assistant to answer, create a `.env` file with a Gemini API key:

```bash
VITE_GEMINI_API_KEY=your-key-here
```

Other scripts:

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run build`   | Production build (Netlify adapter)                |
| `npm run preview` | Serve the production build locally                |
| `npm run check`   | Type-check with `svelte-check`                    |

## Project layout

```
src/routes/        pages; rules and class text are mdsvex (.svx) files
src/lib/           chat retrieval (index loader, stemmer) and client
src/components/    shared components
static/Public/     campaign lore as Markdown (articles, NPCs, story events…)
scripts/           build-time tooling (lore index generator)
```

## Deployment

Netlify runs `npm run build && npm run index` and publishes `build/`
(see `netlify.toml`). Set `VITE_GEMINI_API_KEY` in the Netlify environment.

## License

- **Code** is [MIT](LICENSE).
- **Written content** (campaign articles and lore in `static/Public/`, homebrew
  rules, classes and essence paths in the `.svx` pages) is
  [CC BY 4.0](LICENSE-CONTENT): use and adapt it freely, with credit.
- **Third-party material is not covered.** D&D and third-party spells, feats and
  items are linked to 5e.tools and remain © Wizards of the Coast and their
  respective publishers; some classes adapt mechanics from Pathfinder 1e (© Paizo).
