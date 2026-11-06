# TK Checkbox-Links

Theme-**Komponente** für das *TK Forum – IT-Infrastruktur Community* Theme.

Rein kosmetische Ergänzung zur Pflicht-Checkbox beim Registrieren (angelegt
als Benutzerfeld vom Typ **„Bestätigung"**, siehe unten): verwandelt
bestimmte Wörter in der Beschriftung – z. B. „Datenschutzerklärung" und
„Nutzungsbedingungen" – in anklickbare Links.

## Voraussetzung: die eigentliche Pflicht-Checkbox

Diese Komponente ersetzt **nicht** die Checkbox-Pflicht selbst – die kommt
nativ aus Discourse:

> **Admin → Anpassen → Benutzerfelder** → Neues Feld → Feldtyp **„Bestätigung"**
> → Text z. B. „Ich akzeptiere die Datenschutzerklärung und die
> Nutzungsbedingungen" → *Beim Registrieren anzeigen* + *Erforderlich* beide an.

Damit blockiert Discourse selbst die Registrierung, bis die Box angehakt
ist – zuverlässig, ohne eigenen Code.

## Was diese Komponente zusätzlich macht

Der Text eines Benutzerfelds kann selbst keine Links enthalten (nur
Klartext). Diese Komponente durchsucht nach dem Laden **jedes** `<label>`
im Forum und verlinkt die konfigurierten Wörter – aber nur, wenn:

- **alle** konfigurierten Wörter gleichzeitig im selben Label vorkommen
  (verhindert Zufallstreffer an anderer Stelle im Forum), und
- das Label **kein** Eingabe-/Button-/Link-Element enthält – die Checkbox
  selbst (und damit Discourses Pflicht-Validierung) wird dadurch **nie**
  angefasst.

Der Registrierungs-Dialog ist ein Modal (kein Seitenwechsel), daher läuft
die Suche zusätzlich über einen `MutationObserver`, der auf sein Erscheinen
wartet (pro Frame gebündelt, nicht bei jeder einzelnen DOM-Änderung).

## Einstellungen

| Einstellung | Zweck |
| --- | --- |
| `link_rules` | Ein Eintrag pro Zeile: `Suchwort,Ziel-URL`. Standard: `Datenschutzerklärung,/privacy` + `Nutzungsbedingungen,/tos`. |
| `open_in_new_tab` | Links in neuem Tab öffnen (Standard: an) – damit das halb ausgefüllte Formular nicht verloren geht. |

Passt der Wortlaut des Benutzerfelds nicht zu `link_rules`, wird einfach
nichts verlinkt (kein Fehler) – `link_rules` entsprechend anpassen.

## Installation

Ordner `TK-Checkbox-Links/` zippen → Admin → **Anpassen → Themes →
Komponente installieren → Von deinem Gerät** → dem Theme **„TK Forum –
IT-Infrastruktur Community"** als übergeordnetes Theme zuweisen.

**Voraussetzung:** Discourse ≥ 3.4.
