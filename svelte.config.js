import adapter from "@sveltejs/adapter-netlify";
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { mdsvex } from "mdsvex";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const mdsvex_opts = {
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
  },

  preprocess: [vitePreprocess(), mdsvex(mdsvex_opts)],
  extensions: [".svelte", ".svx", ".md"],
};

export default config;
