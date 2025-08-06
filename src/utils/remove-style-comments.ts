import { parse, stringify } from "css";

/**
 * Removes all CSS comments from style content using css parser.
 * @param styleContent - The CSS content to process.
 * @returns Promise resolving to an object containing the processed content, modification status, and count of removed comments.
 */
export async function removeStyleComments(styleContent: string): Promise<{
  content: string;
  modified: boolean;
  removedCount: number;
}> {
  try {
    let removedCount = 0;

    // Parse CSS content into an AST
    const ast = parse(styleContent, { silent: true });

    // Recursively remove comments from the AST
    function removeComments(node: any): void {
      if (node.type === "comment") {
        removedCount++;
        return;
      }
      if (node.rules) {
        // Filter out comment nodes from rules array
        node.rules = node.rules.filter((rule: any) => {
          if (rule.type === "comment") {
            removedCount++;
            return false;
          }
          removeComments(rule);
          return true;
        });
      }
      if (node.declarations) {
        // Filter out comment nodes from declarations array
        node.declarations = node.declarations.filter((decl: any) => {
          if (decl.type === "comment") {
            removedCount++;
            return false;
          }
          return true;
        });
      }
      // Recurse through other nested nodes
      for (const key in node) {
        if (Array.isArray(node[key])) {
          node[key].forEach(removeComments);
        } else if (node[key] && typeof node[key] === "object") {
          removeComments(node[key]);
        }
      }
    }

    // Remove comments from the AST
    removeComments(ast);

    // Generate new CSS content without comments
    const newContent = stringify(ast, { compress: false });

    return {
      content: newContent,
      modified: styleContent !== newContent,
      removedCount,
    };
  } catch (error) {
    throw new Error(
      `Failed to process style content: ${(error as Error).message}`
    );
  }
}
