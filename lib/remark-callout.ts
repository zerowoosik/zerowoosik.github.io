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
import type { Root, Paragraph, Text, PhrasingContent } from "mdast";
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

/**
 * Recursively serialize an mdast inline node to HTML string.
 * Supports: text, link, strong, emphasis, inlineCode, delete, break, image, html.
 */
function serializeNode(node: PhrasingContent, insideLink = false): string {
    switch (node.type) {
        case "text":
            return insideLink ? escapeHtml(node.value) : autolinkUrls(escapeHtml(node.value));
        case "link":
            return `<a href="${escapeAttr(node.url)}"${node.title ? ` title="${escapeAttr(node.title)}"` : ""} target="_blank" rel="noopener noreferrer">${serializeChildrenRaw(node.children)}</a>`;
        case "strong":
            return `<strong>${serializeChildren(node.children)}</strong>`;
        case "emphasis":
            return `<em>${serializeChildren(node.children)}</em>`;
        case "inlineCode":
            return `<code>${escapeHtml(node.value)}</code>`;
        case "delete":
            return `<del>${serializeChildren(node.children)}</del>`;
        case "break":
            return `<br/>`;
        case "image":
            return `<img src="${escapeAttr(node.url)}" alt="${escapeAttr(node.alt || "")}"${node.title ? ` title="${escapeAttr(node.title)}"` : ""} />`;
        case "html":
            return node.value;
        default:
            // Fallback: try to extract value or children
            if ("value" in node) return escapeHtml((node as any).value);
            if ("children" in node) return serializeChildren((node as any).children);
            return "";
    }
}

function serializeChildren(children: PhrasingContent[]): string {
    return children.map((c) => serializeNode(c, false)).join("");
}

/** Serialize children without autolink (used inside <a> tags to avoid nesting) */
function serializeChildrenRaw(children: PhrasingContent[]): string {
    return children.map((c) => serializeNode(c, true)).join("");
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Convert plain-text URLs (http:// or https://) into clickable <a> tags.
 * Also handles escaped colons (\:) commonly found in MDX.
 */
function autolinkUrls(text: string): string {
    // First, unescape \: that MDX might produce
    const unescaped = text.replace(/\\:/g, ":");
    // Match URLs starting with http:// or https://
    return unescaped.replace(
        /https?:\/\/[^\s<>&"')\]]+/g,
        (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
}

/**
 * Get plain text content from a paragraph node (used for pattern matching).
 */
function getPlainText(children: PhrasingContent[]): string {
    return children
        .map((child) => {
            if (child.type === "text") return child.value;
            if ("children" in child) return getPlainText((child as any).children);
            if ("value" in child) return (child as any).value;
            return "";
        })
        .join("");
}

/**
 * Serialize paragraph children to HTML, optionally stripping a leading
 * prefix (e.g., ":::info ") from the first text node.
 */
function serializeChildrenWithPrefix(
    children: PhrasingContent[],
    prefixToStrip?: string
): string {
    if (!prefixToStrip) return serializeChildren(children);

    // Clone children so we don't mutate the original AST
    const cloned = [...children];
    // Strip the prefix from the first text node
    for (let i = 0; i < cloned.length; i++) {
        const child = cloned[i];
        if (child.type === "text") {
            const stripped = child.value.replace(prefixToStrip, "");
            if (stripped.length === 0) {
                // Remove this node entirely
                cloned.splice(i, 1);
            } else {
                cloned[i] = { ...child, value: stripped };
            }
            break;
        }
    }
    return serializeChildren(cloned);
}

/**
 * Strip trailing ":::" from the serialized HTML of paragraph children,
 * and also check for it in plain text.
 */
function stripTrailingFence(children: PhrasingContent[]): { html: string; hadFence: boolean } {
    const plainText = getPlainText(children);
    const endsWithFence = /\s*:::$/.test(plainText);

    if (!endsWithFence) {
        return { html: serializeChildren(children), hadFence: false };
    }

    // Find and strip the trailing ::: from the last text node
    const cloned = [...children];
    for (let i = cloned.length - 1; i >= 0; i--) {
        const child = cloned[i];
        if (child.type === "text" && /:::/.test(child.value)) {
            const newValue = child.value.replace(/\s*:::\s*$/, "");
            if (newValue.length === 0) {
                cloned.splice(i, 1);
            } else {
                cloned[i] = { ...child, value: newValue };
            }
            break;
        }
    }
    return { html: serializeChildren(cloned), hadFence: true };
}

const remarkCallout: Plugin<[], Root> = () => {
    return (tree: Root) => {
        const nodesToReplace: { index: number; parent: Root; html: string }[] = [];

        // Walk through all paragraph nodes to find :::type patterns
        visit(tree, "paragraph", (node: Paragraph, index, parent) => {
            if (index === undefined || index === null || !parent) return;

            // Get the plain text content for pattern matching
            const textContent = getPlainText(node.children);

            // Check if this paragraph starts with :::type
            const openMatch = textContent.match(/^:::(info|tip|warning)\s*/);
            if (!openMatch) return;

            const type = openMatch[1] as keyof typeof CALLOUT_TYPES;
            const config = CALLOUT_TYPES[type];
            const openPrefix = openMatch[0]; // e.g., ":::info " or ":::warning\n"

            // Case 1: Single paragraph contains both ::: opener and ::: closer
            const singleLineMatch = textContent.match(
                /^:::(info|tip|warning)\s+([\s\S]*?)\s*:::$/
            );
            if (singleLineMatch) {
                // Serialize children, strip open prefix and trailing :::
                const withoutPrefix = serializeChildrenWithPrefix(node.children, openPrefix);
                // Strip trailing :::
                const content = withoutPrefix.replace(/\s*:::\s*$/, "").trim();
                const html = buildCalloutHtml(config, content);
                nodesToReplace.push({ index, parent: parent as Root, html });
                return;
            }

            // Case 2: Multi-line — search for closing ::: in subsequent siblings
            const siblings = (parent as Root).children;
            let closingIndex = -1;
            let contentParts: string[] = [];

            // Get content after the opening :::type on the same line
            const afterOpenHtml = serializeChildrenWithPrefix(node.children, openPrefix).trim();
            if (afterOpenHtml) {
                contentParts.push(afterOpenHtml);
            }

            for (let i = index + 1; i < siblings.length; i++) {
                const sibling = siblings[i];
                if (sibling.type === "paragraph") {
                    const siblingPlainText = getPlainText((sibling as Paragraph).children);

                    if (siblingPlainText.trim() === ":::") {
                        closingIndex = i;
                        break;
                    }

                    // Check if it ends with :::
                    const { html: siblingHtml, hadFence } = stripTrailingFence((sibling as Paragraph).children);
                    if (hadFence) {
                        contentParts.push(siblingHtml.trim());
                        closingIndex = i;
                        break;
                    }

                    contentParts.push(serializeChildren((sibling as Paragraph).children).trim());
                }
            }

            if (closingIndex !== -1) {
                const content = contentParts.join("<br/>");
                const html = buildCalloutHtml(config, content);

                // Replace the range [index, closingIndex] with a single HTML node
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
