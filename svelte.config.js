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
    csrf: {
      checkOrigin: process.env.NODE_ENV === 'production'
    },
    csp: {
      directives: {
        'default-src': ['self'],
        'img-src': ['self', 'data:', 'https:'],
        'style-src': ['self', 'unsafe-inline'],
        'connect-src': [
          'self',
          'https://api.deepseek.com',
          'https://api.github.com',
          'https://raw.githubusercontent.com',
          'https://*.githubusercontent.com'
        ]
      }
    },
  },
  preprocess: [vitePreprocess(), mdsvex(mdsvex_opts)],
  extensions: [".svelte", ".svx", ".md"],
};

export default config;
