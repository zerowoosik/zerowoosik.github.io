/**
 * Custom remark plugin to transform :::info, :::tip, :::warning blocks
 * into styled callout HTML containers.
 *
 * Usage in MDX/MD files:
 *   :::info
 *   Your info content here.
 *   :::
 *
 *   :::tip
 *   Your tip content here.
 *   :::
 *
 *   :::warning
 *   Your warning content here.
 *   :::
 */

import type { Plugin } from "unified";
import type { Root, Paragraph, Text } from "mdast";
import { visit } from "unist-util-visit";

const CALLOUT_TYPES: Record<
    string,
    { icon: string; className: string }
> = {
    info: {
        icon: "info",
        className: "callout-info",
    },
    tip: {
        icon: "lightbulb",
        className: "callout-tip",
    },
    warning: {
        icon: "warning",
        className: "callout-warning",
    },
};

const remarkCallout: Plugin<[], Root> = () => {
    return (tree: Root) => {
        const nodesToReplace: { index: number; parent: Root; html: string }[] = [];

        // Walk through all paragraph nodes to find :::type patterns
        visit(tree, "paragraph", (node: Paragraph, index, parent) => {
            if (index === undefined || index === null || !parent) return;

            // Get the full text content of the paragraph
            const textContent = node.children
                .filter((child): child is Text => child.type === "text")
                .map((child) => child.value)
                .join("");

            // Check if this paragraph starts with :::type
            const openMatch = textContent.match(/^:::(info|tip|warning)\s*/);
            if (!openMatch) return;

            const type = openMatch[1] as keyof typeof CALLOUT_TYPES;
            const config = CALLOUT_TYPES[type];

            // Case 1: Single paragraph contains both ::: opener and ::: closer
            // e.g., ":::info some content here :::"
            const singleLineMatch = textContent.match(
                /^:::(info|tip|warning)\s+([\s\S]*?)\s*:::$/
            );
            if (singleLineMatch) {
                const content = singleLineMatch[2].trim();
                const html = buildCalloutHtml(config, content);
                nodesToReplace.push({ index, parent: parent as Root, html });
                return;
            }

            // Case 2: Multi-line — search for closing ::: in subsequent siblings
            const siblings = (parent as Root).children;
            let closingIndex = -1;
            let contentParts: string[] = [];

            // Get content after the opening :::type on the same line
            const afterOpen = textContent.replace(/^:::(info|tip|warning)\s*/, "").trim();
            if (afterOpen) {
                contentParts.push(afterOpen);
            }

            for (let i = index + 1; i < siblings.length; i++) {
                const sibling = siblings[i];
                // Check if this sibling is a paragraph containing just ":::"
                if (sibling.type === "paragraph") {
                    const siblingText = (sibling as Paragraph).children
                        .filter((child): child is Text => child.type === "text")
                        .map((child) => child.value)
                        .join("");

                    if (siblingText.trim() === ":::") {
                        closingIndex = i;
                        break;
                    }

                    // Check if it ends with :::
                    const endsWithClose = siblingText.match(/^([\s\S]*?)\s*:::$/);
                    if (endsWithClose) {
                        contentParts.push(endsWithClose[1].trim());
                        closingIndex = i;
                        break;
                    }

                    contentParts.push(siblingText.trim());
                }
            }

            if (closingIndex !== -1) {
                const content = contentParts.join("<br/>");
                const html = buildCalloutHtml(config, content);

                // Replace the range [index, closingIndex] with a single HTML node
                // We'll mark the range for replacement
                const count = closingIndex - index + 1;
                (parent as Root).children.splice(index, count, {
                    type: "html",
                    value: html,
                } as any);
            }
        });

        // Handle single-line replacements (from Case 1)
        // Process in reverse order to maintain valid indices
        for (let i = nodesToReplace.length - 1; i >= 0; i--) {
            const { index, parent, html } = nodesToReplace[i];
            parent.children.splice(index, 1, {
                type: "html",
                value: html,
            } as any);
        }
    };
};

function buildCalloutHtml(
    config: { icon: string; className: string },
    content: string
): string {
    return `<div class="callout-block ${config.className}">
  <span class="material-symbols-outlined callout-icon">${config.icon}</span>
  <div class="callout-content">${content}</div>
</div>`;
}

export default remarkCallout;
