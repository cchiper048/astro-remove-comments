import { parse } from "acorn";
import { generate } from "astring";

/**
 * Removes all JavaScript comments from script content using acorn parser.
 * @param scriptContent - The JavaScript content to process.
 * @returns Promise resolving to an object containing the processed content, modification status, and count of removed comments.
 */
export async function removeScriptComments(scriptContent: string): Promise<{
  content: string;
  modified: boolean;
  removedCount: number;
}> {
  try {
    let removedCount = 0;
    const ast = parse(scriptContent, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: true,
      onComment: () => {
        removedCount++;
      },
    });

    // Generate new code without comments
    const newContent = generate(ast, {
      comments: false, // Skip all comments during code generation
    });

    return {
      content: newContent,
      modified: scriptContent !== newContent,
      removedCount,
    };
  } catch (error) {
    throw new Error(
      `Failed to process script content: ${(error as Error).message}`
    );
  }
}
