// Rich-text sanitiser/converter for article bodies. Pure, no DOM APIs -- safe
// to run in Node during SSR (print route) and in the browser (editor).
//
// sanitizeHtml is a TRUST BOUNDARY: allowlist-only, string/regex based (no
// DOMParser) so it works identically on the server.

const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "u", "s", "sup", "sub", "br",
  "p", "div", "span", "ul", "ol", "li", "h3", "h4", "blockquote",
]);

// Elements whose entire subtree must be dropped, not just unwrapped.
const REMOVE_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "link", "meta",
  "form", "input", "textarea", "select", "button", "svg",
]);

// These REMOVE_TAGS are void elements in real HTML (no closing tag ever
// follows) -- never wait for a closing tag or the rest of the document
// gets swallowed.
const VOID_REMOVE = new Set(["link", "meta", "input"]);

const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

const ENTITY_RE = /&(?!(?:amp|lt|gt|quot|#39|apos|nbsp|#\d+|#x[0-9a-fA-F]+);)/g;

function escapeText(s: string): string {
  return s.replace(ENTITY_RE, "&amp;").replace(/</g, "&lt;");
}

function extractStyleAttr(attrsStr: string): string {
  const re = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrsStr))) {
    if (m[1].toLowerCase() === "style") return m[2] ?? m[3] ?? m[4] ?? "";
  }
  return "";
}

/** Keep only the handful of declarations the editor toolbar can produce. */
function sanitizeStyle(styleValue: string): string {
  const kept: string[] = [];
  for (const decl of styleValue.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim().toLowerCase();
    if (prop === "text-align" && /^(left|right|center|justify)$/.test(value)) {
      kept.push(`text-align: ${value}`);
    } else if (prop === "font-weight" && /^(bold|normal|[1-9]00)$/.test(value)) {
      kept.push(`font-weight: ${value}`);
    } else if (prop === "font-style" && /^(italic|normal)$/.test(value)) {
      kept.push(`font-style: ${value}`);
    } else if (prop === "text-decoration" && /^(underline|line-through|none)$/.test(value)) {
      kept.push(`text-decoration: ${value}`);
    }
  }
  return kept.join("; ");
}

export function sanitizeHtml(html: string): string {
  try {
    let out = "";
    let lastIndex = 0;
    const removeStack: string[] = [];
    TAG_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TAG_RE.exec(html))) {
      const text = html.slice(lastIndex, match.index);
      lastIndex = TAG_RE.lastIndex;
      const isClosing = match[0].startsWith("</");
      const tagName = match[1].toLowerCase();
      const attrsStr = match[2] ?? "";

      if (removeStack.length > 0) {
        // Inside a hard-removed subtree: drop text, only track nesting so we
        // know when the removed element actually closes.
        if (!isClosing && REMOVE_TAGS.has(tagName) && !VOID_REMOVE.has(tagName)) {
          removeStack.push(tagName);
        } else if (isClosing && tagName === removeStack[removeStack.length - 1]) {
          removeStack.pop();
        }
        continue;
      }

      out += escapeText(text);

      if (REMOVE_TAGS.has(tagName)) {
        if (!isClosing && !VOID_REMOVE.has(tagName) && !/\/\s*$/.test(attrsStr)) {
          removeStack.push(tagName);
        }
        continue;
      }

      if (!ALLOWED_TAGS.has(tagName)) continue; // unwrap: drop tag, keep children

      if (tagName === "br") {
        if (!isClosing) out += "<br>";
        continue;
      }

      if (isClosing) {
        out += `</${tagName}>`;
      } else {
        const style = sanitizeStyle(extractStyleAttr(attrsStr));
        out += style ? `<${tagName} style="${style}">` : `<${tagName}>`;
      }
    }
    out += escapeText(html.slice(lastIndex));
    return out;
  } catch {
    // Never throw on malformed input -- fall back to plain escaped text.
    return textToHtml(htmlToText(html));
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

export function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<\/(p|div|li|h3|h4)>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]*>/g, "");
  s = decodeEntities(s);
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

export function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return escaped.replace(/\n/g, "<br>");
}

export function bodyToHtml(block: { body: string; bodyHtml?: string }): string {
  return block.bodyHtml ? sanitizeHtml(block.bodyHtml) : textToHtml(block.body ?? "");
}
