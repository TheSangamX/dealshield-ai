// Reads the open Gmail thread out of the DOM. Gmail's class names are obfuscated
// but have been stable for years; keep every selector here so they're easy to update.
const SELECTORS = {
  main: 'div[role="main"]',
  subject: 'h2.hP',
  message: 'div.adn',
  sender: '.gD',
  recipients: '.g2',
  date: '.g3',
  body: '.a3s.aiL, .a3s',
};

// Quoted history, signatures and hidden preheaders are noise for negotiation analysis.
const STRIP_SELECTOR = [
  '.gmail_quote',
  'blockquote',
  '.gmail_signature',
  '[data-smartmail="gmail_signature"]',
  '[style*="display:none"]',
  '[style*="display: none"]',
  'style',
  'script',
].join(',');

const BLOCK_TAGS = new Set([
  'ADDRESS', 'ARTICLE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIELDSET', 'FORM',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'LI', 'OL', 'P', 'PRE', 'SECTION',
  'TABLE', 'TR', 'UL',
]);

/**
 * Returns the thread currently open in Gmail, or null when no thread is open.
 *
 * Shape: { threadId, subject, url, messages: [{ id, sender, to, date, body }], capturedAt }
 * Only expanded messages have a body in the DOM; the last one is the active email.
 */
export function parseOpenThread(doc = document) {
  const main = doc.querySelector(SELECTORS.main);
  const subjectEl = main?.querySelector(SELECTORS.subject);
  if (!subjectEl) return null;

  const messages = [...main.querySelectorAll(SELECTORS.message)]
    .map(parseMessage)
    .filter((message) => message && message.body);
  if (messages.length === 0) return null;

  return {
    threadId:
      subjectEl.getAttribute('data-legacy-thread-id') ||
      subjectEl.getAttribute('data-thread-perm-id') ||
      location.hash,
    subject: subjectEl.textContent.trim(),
    url: location.href,
    messages,
    capturedAt: new Date().toISOString(),
  };
}

function parseMessage(el) {
  const bodyEl = el.querySelector(SELECTORS.body);
  if (!bodyEl) return null;

  const senderEl = el.querySelector(SELECTORS.sender);
  const dateEl = el.querySelector(SELECTORS.date);

  return {
    id: el.getAttribute('data-legacy-message-id') || el.getAttribute('data-message-id') || '',
    sender: {
      name: senderEl?.getAttribute('name') || senderEl?.textContent.trim() || '',
      email: senderEl?.getAttribute('email') || '',
    },
    to: [...el.querySelectorAll(SELECTORS.recipients)]
      .map((r) => r.getAttribute('email'))
      .filter(Boolean),
    date: dateEl?.getAttribute('title') || dateEl?.textContent.trim() || '',
    body: extractText(bodyEl),
  };
}

// innerText on a detached clone ignores layout, so line breaks are rebuilt from block tags.
function extractText(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll(STRIP_SELECTOR).forEach((node) => node.remove());

  let out = '';
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.nodeValue;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === 'BR') {
          out += '\n';
          continue;
        }
        const isBlock = BLOCK_TAGS.has(child.tagName);
        if (isBlock) out += '\n';
        walk(child);
        if (isBlock) out += '\n';
        else if (child.tagName === 'TD' || child.tagName === 'TH') out += ' ';
      }
    }
  };
  walk(clone);

  return out
    .replace(/ /g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
