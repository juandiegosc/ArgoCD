/**
 * parseMarkdown — Minimal Markdown-to-HTML converter.
 *
 * Supported syntax:
 *   # Heading 1   → <h1>Heading 1</h1>
 *   ## Heading 2  → <h2>Heading 2</h2>
 *   ### Heading 3 → <h3>Heading 3</h3>
 *   **bold**      → <strong>bold</strong>
 *   *italic*      → <em>italic</em>
 *   - item        → <li>item</li> (grouped in <ul>)
 *   plain text    → <p>plain text</p>
 *
 * Security: <script> tags in the raw input are escaped to prevent XSS.
 * Empty input returns "".
 *
 * Requirements: 5.3, 5.4, 5.5, 5.6, 5.7
 */
export function parseMarkdown(raw: string): string {
  if (raw === '') return '';

  // Escape <script> tags to prevent XSS before any processing.
  const sanitized = raw
    .replace(/<script\b[^>]*>/gi, '&lt;script&gt;')
    .replace(/<\/script>/gi, '&lt;/script&gt;');

  const lines = sanitized.split('\n');
  const output: string[] = [];
  let inList = false;

  for (const line of lines) {
    // --- Headings (must be checked before inline formatting) ---
    if (line.startsWith('### ')) {
      if (inList) { output.push('</ul>'); inList = false; }
      const content = applyInline(line.slice(4));
      output.push(`<h3>${content}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { output.push('</ul>'); inList = false; }
      const content = applyInline(line.slice(3));
      output.push(`<h2>${content}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { output.push('</ul>'); inList = false; }
      const content = applyInline(line.slice(2));
      output.push(`<h1>${content}</h1>`);
      continue;
    }

    // --- List item ---
    if (line.startsWith('- ')) {
      if (!inList) { output.push('<ul>'); inList = true; }
      const content = applyInline(line.slice(2));
      output.push(`<li>${content}</li>`);
      continue;
    }

    // --- Empty line: close open list, skip blank line ---
    if (line.trim() === '') {
      if (inList) { output.push('</ul>'); inList = false; }
      continue;
    }

    // --- Plain paragraph ---
    if (inList) { output.push('</ul>'); inList = false; }
    const content = applyInline(line);
    output.push(`<p>${content}</p>`);
  }

  // Close any unclosed list at end of input.
  if (inList) output.push('</ul>');

  return output.join('\n');
}

/**
 * Apply inline formatting: **bold** and *italic*.
 * Bold must be processed before italic to avoid partial matches.
 */
function applyInline(text: string): string {
  // **bold** → <strong>bold</strong>
  let result = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // *italic* → <em>italic</em>  (single asterisk, not preceded/followed by another)
  result = result.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
  return result;
}
