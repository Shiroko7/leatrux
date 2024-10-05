import path from "node.path";
import { defineMDSveXConfig } from "mdsvex";
import { fileURLToPath } from "node:url"

const dirname = path.resolve(fileURLToPath(import.meta.url), "../"); 

const config = defineMDSveXConfig({
    extensions: [".md", ".svx", ".svelte"],
    layout: {
        default: path.join(dirname,"./src/routes/essence/+layout.svelte")
    },
});

export default config
