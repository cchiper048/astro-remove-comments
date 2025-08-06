import { JSDOM } from "jsdom";

/**
 * Removes all HTML comments from a string using a DOM parser.
 * @param content - The HTML content to process.
 * @returns Promise resolving to an object containing the processed content, modification status, and count of removed comments.
 */
export async function removeHtmlComments(content: string): Promise<{
  content: string;
  modified: boolean;
  removedCount: number;
}> {
  try {
    const dom = new JSDOM(content);
    const document = dom.window.document;
    let removedCount = 0;

    // Recursively remove comments from a node and its children
    const removeComments = (node: Node): void => {
      if (node.nodeType === node.COMMENT_NODE) {
        node.parentNode?.removeChild(node);
        removedCount++;
        return;
      }
      // Create a copy of childNodes to avoid issues with live collection modification
      Array.from(node.childNodes).forEach((child) => removeComments(child));
    };

    // Start removal from the document body
    removeComments(document);

    const newContent = dom.serialize();
    return {
      content: newContent,
      modified: content !== newContent,
      removedCount,
    };
  } catch (error) {
    throw new Error(
      `Failed to process HTML content: ${(error as Error).message}`
    );
  }
}
