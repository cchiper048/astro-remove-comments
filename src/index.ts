import type { AstroIntegration, AstroConfig } from "astro";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";

import { removeHtmlComments } from "./utils/remove-html-comments.js";
import { removeScriptComments } from "./utils/remove-script-comments.js";
import { removeStyleComments } from "./utils/remove-style-comments.js";

export interface RemoveCommentsOptions {
  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;
}

export default function createRemoveCommentsIntegration(
  options: RemoveCommentsOptions = {}
): AstroIntegration {
  const { verbose = false } = options;

  /**
   * Recursively find all .html files in a directory
   */
  async function findHtmlFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findHtmlFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        files.push(fullPath);
      }
    }
    return files;
  }

  return {
    name: "astro-remove-comments",
    hooks: {
      "astro:config:setup": ({ logger }) => {
        logger.info("Initializing astro-remove-comments integration");
        if (verbose) {
          logger.info(`Configuration: verbose=${verbose}`);
        }
      },
      "astro:build:done": async ({ dir, logger }) => {
        try {
          const outputDir = fileURLToPath(dir);
          const htmlFiles = await findHtmlFiles(outputDir);

          if (htmlFiles.length === 0) {
            logger.warn("No HTML files found in the build output");
            return;
          }

          let processedFiles = 0;
          let removedHtmlComments = 0;
          let removedScriptComments = 0;
          let removedStyleComments = 0;

          await Promise.all(
            htmlFiles.map(async (filePath) => {
              try {
                const content = await fs.readFile(filePath, "utf-8");
                const htmlResult = await removeHtmlComments(content);

                let newContent = htmlResult.content;
                let modified = htmlResult.modified;
                removedHtmlComments += htmlResult.removedCount;

                const dom = new JSDOM(newContent);
                const document = dom.window.document;

                // Process <script> tags
                const scriptTags = document.querySelectorAll("script");

                for (const script of scriptTags) {
                  const scriptContent = script.textContent || "";
                  if (scriptContent.trim()) {
                    const scriptResult = await removeScriptComments(
                      scriptContent
                    );
                    if (scriptResult.modified) {
                      script.textContent = scriptResult.content;
                      modified = true;
                      removedScriptComments += scriptResult.removedCount;
                    }
                  }
                }

                // Process <style> tags
                const styleTags = document.querySelectorAll("style");
                for (const style of styleTags) {
                  const styleContent = style.textContent || "";
                  if (styleContent.trim()) {
                    const result = await removeStyleComments(styleContent);
                    if (result.modified) {
                      style.textContent = result.content;
                      modified = true;
                      removedStyleComments += result.removedCount;
                    }
                  }
                }

                if (modified) {
                  newContent = dom.serialize();
                  await fs.writeFile(filePath, newContent, "utf-8");
                  processedFiles++;
                  if (verbose) {
                    logger.info(`Processed: ${filePath}`);
                  }
                }
              } catch (error) {
                logger.error(
                  `Failed to process ${filePath}: ${(error as Error).message}`
                );
              }
            })
          );

          logger.info(
            `Completed: Processed ${processedFiles}/${htmlFiles.length} HTML files, ` +
              `removed ${removedHtmlComments} HTML comments, ` +
              `${removedScriptComments} script comments, ` +
              `${removedStyleComments} style comments`
          );
        } catch (error) {
          logger.error(
            `Error in astro-remove-comments: ${(error as Error).message}`
          );
        }
      },
    },
  };
}
