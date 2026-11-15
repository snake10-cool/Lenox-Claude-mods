# Lenox Claude-Mods

| Plugin | Inhalt |
|---|---|
| **snake-hub** | Panel „🐍 Snake-Hub“ mit Schaltern. **Animierte Themes:** Herbstlaub (fallende Blätter), Sakura (Kirschblüten), Mitternacht (Sterne, Sternschnuppe), Ozean (Wellen, Blasen), Wald (Tannen, Glühwürmchen), Herbstnacht (dunkle Blätter unter dem Mond), Schnee, Regen, Lagerfeuer, Aus. Dazu Hell/Dunkel/Wie Windows und Hintergrund-Stärke (dezent, normal, kräftig). Blätter, Blüten und Flocken reagieren, wenn man mit der Maus darüberfährt. **Mods:** Animierter Hintergrund, automatischer Fortschrittsbalken, Leiste über dem Eingabefeld, Aktivitäts-Feed, Statistik, Schnellknöpfe, Sitzungs-Uhr, Pausen-Erinnerung, Datei-Schutz, Fertig-Meldung. **Skills an/aus** für alle Skills unten plus „Kurz & knapp“ und „Immer Deutsch“. |
| **snake-skills** | Skills: Spiel bauen, Bug-Jagd, Flutter-Release, Einfach erklärt, Game-Guide |

Befehle (funktionieren auch ohne Panel): `/hub`, `/look <herbst|herbstnacht|sakura|mitternacht|ozean|wald|schnee|regen|lagerfeuer|aus>`, `/modus <dunkel|hell|auto>`, `/blaetter <dezent|normal|kraeftig>`, `/mod <name>`, `/skill <name>`, `/mehr-details`.

Panel und Theme erscheinen nur in einer **lokalen** Sitzung der Desktop- oder Handy-App.

## Installieren

```
/plugin install snake-hub --marketplace snake10-cool/Lenox-Claude-mods
/plugin install snake-skills --marketplace snake10-cool/Lenox-Claude-mods
```

Desktop-App: Plus neben dem Eingabefeld → Plugins → Marketplace hinzufügen → beide Plugins hinzufügen.

## Snake-Desktop (Windows)

Ein kleines Programm, das die Hintergründe des Snake-Hub über den **ganzen Bildschirm** fallen lässt, auch über die Taskleiste. Alle Klicks gehen durch, es stört also nie.

- **Herunterladen:** Releases → „Snake-Desktop (neueste Version)“ → `Snake-Desktop-Setup.exe` (installieren) oder `Snake-Desktop-Portable.exe` (ohne Installation).
- **Steuern:** über das Blatt-Symbol im Infobereich der Taskleiste (Rechtsklick: Theme, Stärke, Hell/Dunkel, mit Windows starten, Beenden; Linksklick: an/aus) oder direkt im Snake-Hub-Panel in Claude. Beide teilen sich die Datei `%USERPROFILE%\.snake-hub\desktop.json`.
- **Updates:** Ab Version 0.4 prüft Snake-Desktop beim Start und alle 4 Stunden selbst auf Updates und installiert sie still. Von Hand: Rechtsklick aufs Blatt-Symbol → „Nach Updates suchen“.
- Windows zeigt beim ersten Start eventuell „Der Computer wurde durch Windows geschützt“, weil das Programm nicht signiert ist: **Weitere Informationen → Trotzdem ausführen**.

## Snake-Hub aktualisieren

Der Hub meldet sich selbst, wenn es eine neue Version gibt (Hinweis oben im Panel und `/hub-update`). Dann: Plugins → Marketplace `lenox-claude-mods` synchronisieren → Snake hub aktualisieren → neue Sitzung. Bietet die App beim Marketplace automatische Updates an, einfach einschalten.
