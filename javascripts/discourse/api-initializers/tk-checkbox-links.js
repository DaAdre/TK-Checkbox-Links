import { apiInitializer } from "discourse/lib/api";

/**
 * Rein kosmetisch: verwandelt bestimmte Woerter im Text von <label>-
 * Elementen (z. B. dem Pflicht-Benutzerfeld "Datenschutzerklärung &
 * Nutzungsbedingungen" bei der Registrierung) in anklickbare Links,
 * gesteuert ueber die Einstellung `link_rules` ("Suchwort,URL" pro Zeile).
 *
 * Sicherheitsregeln (wichtig, weil das die Registrierung betrifft):
 *  - Ein <label> wird NIE angefasst, wenn es selbst ein Eingabe-/Button-
 *    /Link-Element enthaelt - die Checkbox und ihre Pflicht-Validierung
 *    bleiben dadurch garantiert unberuehrt.
 *  - Nur wenn ALLE konfigurierten Woerter im selben Label vorkommen, wird
 *    ueberhaupt etwas ersetzt (verhindert Zufallstreffer an anderer Stelle
 *    im Forum).
 *  - Laeuft in einem try/catch; ein Fehler hier darf nie etwas anderes
 *    beeintraechtigen.
 */
function splitList(value) {
  const raw = Array.isArray(value) ? value.join("|") : String(value || "");
  return raw
    .split("|")
    .map((row) => row.trim())
    .filter(Boolean);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default apiInitializer((api) => {
  const rules = splitList(settings.link_rules)
    .map((row) => {
      const i = row.indexOf(",");
      if (i === -1) {
        return null;
      }
      return [row.slice(0, i).trim(), row.slice(i + 1).trim()];
    })
    .filter((rule) => rule && rule[0] && rule[1]);

  if (!rules.length) {
    return;
  }

  const targetAttrs = settings.open_in_new_tab
    ? ' target="_blank" rel="noopener"'
    : "";

  function linkify() {
    try {
      document.querySelectorAll("label").forEach((label) => {
        if (label.dataset.tkLinkified) {
          return;
        }
        if (label.querySelector("input, textarea, select, button, a")) {
          return;
        }
        const text = label.textContent || "";
        if (!rules.every(([word]) => text.includes(word))) {
          return;
        }
        let html = label.innerHTML;
        rules.forEach(([word, url]) => {
          const re = new RegExp(escapeRegExp(word), "g");
          html = html.replace(
            re,
            `<a href="${url}"${targetAttrs}>${word}</a>`
          );
        });
        label.innerHTML = html;
        label.dataset.tkLinkified = "true";
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[tk-checkbox-links] error", error);
    }
  }

  // Der Registrierungs-Dialog ist ein Modal, kein Routenwechsel ->
  // onPageChange reicht nicht, daher zusaetzlich per MutationObserver auf
  // sein Erscheinen warten. Pro Frame gebuendelt (nicht pro Mutation), um
  // die haeufigen DOM-Aenderungen einer Discourse-Seite nicht zu belasten.
  let scheduled = false;
  function scheduleLinkify() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      linkify();
    });
  }

  if ("MutationObserver" in window) {
    new MutationObserver(scheduleLinkify).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  api.onPageChange(linkify);
  linkify();
});
