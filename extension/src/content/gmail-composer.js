// Puts a draft into Gmail's reply box. Selectors avoid aria-labels, which Gmail localizes.
const EDITOR = 'div[contenteditable="true"][g_editable="true"], div.Am.aiL[contenteditable="true"]';
const REPLY_BUTTON = 'div[role="main"] .ams.bkH, div[role="main"] [role="button"][data-tooltip^="Reply"]';
const EDITOR_TIMEOUT_MS = 3000;

const isVisible = (el) => el.offsetParent !== null;

function findEditor() {
  const editors = [...document.querySelectorAll(EDITOR)].filter(isVisible);
  return editors.at(-1) ?? null; // the most recently opened reply box
}

function waitForEditor() {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const editor = findEditor();
      if (editor || Date.now() - started > EDITOR_TIMEOUT_MS) resolve(editor);
      else setTimeout(tick, 100);
    };
    tick();
  });
}

/**
 * Inserts `text` at the top of the open reply box, clicking Reply first if none is open.
 * Resolves { ok: true } or { ok: false, error }.
 */
export async function insertDraft(text) {
  let editor = findEditor();
  if (!editor) {
    const replyButton = [...document.querySelectorAll(REPLY_BUTTON)].filter(isVisible).at(-1);
    if (!replyButton) return { ok: false, error: 'Open an email thread in Gmail to insert the reply.' };
    replyButton.click();
    editor = await waitForEditor();
    if (!editor) return { ok: false, error: "Couldn't open Gmail's reply box. Click Reply and try again." };
  }

  // Caret at the start, so the draft lands above Gmail's signature and quoted text.
  editor.focus();
  const range = document.createRange();
  range.setStart(editor, 0);
  range.collapse(true);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Gmail's editor stores one <div> per line (<div><br></div> for blank lines). execCommand keeps
  // Gmail's undo history and change tracking; fall back to DOM nodes if it's unsupported.
  const lines = text.split('\n');
  if (!document.execCommand('insertHTML', false, lines.map(lineHtml).join(''))) {
    const fragment = document.createDocumentFragment();
    for (const line of lines) {
      const div = document.createElement('div');
      if (line) div.textContent = line;
      else div.appendChild(document.createElement('br'));
      fragment.appendChild(div);
    }
    editor.prepend(fragment);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return { ok: true };
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lineHtml = (line) => `<div>${line ? escapeHtml(line) : '<br>'}</div>`;
