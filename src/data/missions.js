export const MISSION_TEXT = Object.freeze({
  scrap_sale: {
    title: "Platz schaffen",
    desc: "Der Hof ist übernommen, aber vor Scheune und Zufahrt liegt noch alter Schrott.",
    goal: "Verkaufe den sichtbaren Schrott. Der Händler holt ihn mit einem LKW ab.",
  },
  friend_gift: {
    title: "Ein alter Freund",
    desc: "Ein Freund hat noch einen alten Traktor und eine Sämaschine für deinen Neustart.",
    goal: "Nimm die Maschinenlieferung am Hof an.",
  },
  first_seed: {
    title: "Die erste Saat",
    desc: "Das erste Feld ist bereits vorbereitet. Jetzt fehlt nur noch Weizensaatgut.",
    goal: "Bestelle Weizensaat und säe dein erstes Feld mit dem Traktor.",
  },
  first_harvest: {
    title: "Die erste Ernte",
    desc: "Der Weizen wächst sichtbar auf dem Feld und läuft auch während einer Spielpause weiter.",
    goal: "Warte bis zur Reife, ernte mit dem Mähdrescher und lagere den Weizen im Silo ein.",
  },
  first_order: {
    title: "Der erste Auftrag",
    desc: "Aus der ersten Ernte kann jetzt erstmals Geld mit einem normalen Auftrag verdient werden.",
    goal: "Liefere 5 Weizen über den Hof-Ladeplatz.",
  },
  storage_upgrade: {
    title: "Mehr Platz",
    desc: "Mit wachsender Produktion wird das kleine Silo schnell zu eng.",
    goal: "Verbessere das Silo auf Level 2. Ein Handwerkerfahrzeug baut es sichtbar aus.",
  },
  miller_intro: {
    title: "Die alte Mühle",
    desc: "Der Müller interessiert sich für deinen Weizen und möchte die Mühle wieder in Betrieb nehmen.",
    goal: "Aktiviere die Mühle und stelle aus 5 Weizen dein erstes Mehl her.",
  },
  workshop_chickens: {
    title: "Werkstatt & Hühner",
    desc: "Die alten Hofmaschinen brauchen Pflege. Gleichzeitig entsteht Platz für die ersten Tiere.",
    goal: "Verbessere die Werkstatt. Danach werden Traktor und Mähdrescher restauriert und Hühner geliefert.",
  },
  eggs_baker: {
    title: "Eier für den Bäcker",
    desc: "Die Hühner brauchen Weizen. Aus ihren Eiern entsteht der nächste Teil der Produktionskette.",
    goal: "Füttere die Hühner, sammle Eier und liefere 1 Mehl + 2 Eier an den Bäcker.",
  },
  cows_milk: {
    title: "Milch vom Hof",
    desc: "Der Bäcker braucht jetzt Milch. Dafür kommen die ersten Kühe auf den Hof.",
    goal: "Lass 2 Kühe liefern, füttere sie, sammle Milch und liefere 1 Mehl + 1 Milch an den Bäcker.",
  },
  tutorial_done: {
    title: "Dein Hof lebt",
    desc: "Die Einführung ist abgeschlossen. Hof, Felder, Tiere und erste Produktionsketten funktionieren.",
    goal: "Freies Spiel ab Level 10. Weitere Talbereiche werden in späteren Versionen ausgebaut.",
  },
});


export const TUTORIAL_FLOW = Object.freeze([
  Object.freeze({ missionId: "scrap_sale", level: 1 }),
  Object.freeze({ missionId: "friend_gift", level: 2 }),
  Object.freeze({ missionId: "first_seed", level: 3 }),
  Object.freeze({ missionId: "first_harvest", level: 4 }),
  Object.freeze({ missionId: "first_order", level: 5 }),
  Object.freeze({ missionId: "storage_upgrade", level: 6 }),
  Object.freeze({ missionId: "miller_intro", level: 6 }),
  Object.freeze({ missionId: "workshop_chickens", level: 7 }),
  Object.freeze({ missionId: "eggs_baker", level: 8 }),
  Object.freeze({ missionId: "cows_milk", level: 9 }),
  Object.freeze({ missionId: "tutorial_done", level: 10 }),
]);

export const TUTORIAL_MISSION_IDS = Object.freeze(
  TUTORIAL_FLOW.map(entry => entry.missionId),
);
