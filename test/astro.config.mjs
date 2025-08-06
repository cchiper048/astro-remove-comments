// @ts-check
import { defineConfig } from "astro/config";
import commentRemover from "astro-remove-comments";

// https://astro.build/config
export default defineConfig({
  integrations: [commentRemover()],
});
