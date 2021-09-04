import {
  autosell,
  canInteract,
  cliExecute,
  myLevel,
  mySpleenUse,
  print,
  runChoice,
  visitUrl,
} from "kolmafia";
import { $effect, $effects, $item, get, Mood, PropertiesManager, set } from "libram";

import { ensureEffect, ensureItem, shrug, tryUse } from "./lib";
import { ResourceTracker } from "./resources";
import { SynthesisPlanner } from "./synthesis";
import {
  CoilWireTest,
  FamiliarTest,
  HotTest,
  HpTest,
  ItemTest,
  MoxieTest,
  MuscleTest,
  MysticalityTest,
  NoncombatTest,
  SpellTest,
  WeaponTest,
} from "./tests";

function breakfast() {
  if (!get("_chateauDeskHarvested")) {
    // Chateau juice bar
    visitUrl("place.php?whichplace=chateau&action=chateau_desk2");
    autosell(1, $item`gremlin juice`);
  }

  // Upgrade saber for fam wt
  if (get("_saberMod") === 0) {
    visitUrl("main.php?action=may4");
    runChoice(4);
  }

  // Vote.
  if (get("_voteModifier") === "") {
    visitUrl("place.php?whichplace=town_right&action=townright_vote");
    visitUrl("choice.php?option=1&whichchoice=1331&g=2&local%5B%5D=2&local%5B%5D=3");
  }

  // // Sell pork gems + tent
  // visitUrl("tutorial.php?action=toot");
  // tryUse(1, $item`letter from King Ralph XI`);
  // tryUse(1, $item`pork elf goodies sack`);
  // autosell(5, $item`baconstone`);
  // autosell(5, $item`porquoise`);
  // autosell(5, $item`hamethyst`);
}

// Sweet Synthesis plan.
// This is the sequence of synthesis effects; we will, if possible, come up with a plan for allocating candy to each of these.
const synthesisPlanner = new SynthesisPlanner(
  $effects`Synthesis: Learning, Synthesis: Smart, Synthesis: Collection`
);

const propertyManager = new PropertiesManager();

propertyManager.set({ autoSatisfyWithNPCs: true });
propertyManager.set({ autoSatisfyWithCoinmasters: true });

// Turn off Lil' Doctor quests.
propertyManager.setChoices({ [1340]: 3 });

const resources = ResourceTracker.deserialize(get("_hccs_resourceTracker") ?? "{}");

const context = { synthesisPlanner, resources, propertyManager };

Mood.setDefaultOptions({
  // mpSources: [],
  songSlots: [
    $effects`Stevedave's Shanty of Superiority`,
    $effects`Ur-Kel's Aria of Annoyance`,
    $effects`Power Ballad of the Arrowsmith, The Magical Mojomuscular Melody, The Moxious Madrigal, Ode to Booze, Jackasses' Symphony of Destruction`,
    $effects`Carlweather's Cantata of Confrontation, The Sonata of Sneakiness, Fat Leon's Phat Loot Lyric, Polka of Plenty`,
  ],
});

cliExecute("mood apathetic");

// All combat handled by our consult script (hccs_combat.js).
cliExecute("ccs bean-hccs");

const startTime = Date.now();

try {
  if (myLevel() === 1 && mySpleenUse() === 0) {
    while (get("_universeCalculated") < get("skillLevel144")) {
      cliExecute("numberology 69");
    }
  }

  breakfast();

  if (get("_deckCardsDrawn") < 5) resources.deck("1952");
  autosell(1, $item`1952 Mickey Mantle card`);

  // Buy toy accordion
  ensureItem(1, $item`toy accordion`);

  new CoilWireTest(context).run();
  new HpTest(context).run();
  new MuscleTest(context).run();
  new MysticalityTest(context).run();
  new MoxieTest(context).run();

  tryUse(1, $item`astral six-pack`);
  resources.consumeTo(3, $item`astral pilsner`);

  new ItemTest(context).run();
  new HotTest(context).run();
  new NoncombatTest(context).run();

  new FamiliarTest(context).run();

  resources.consumeTo(13, $item`emergency margarita`);
  resources.consumeTo(15, $item`Sockdollager`);
  new WeaponTest(context).run();

  ensureEffect($effect`Simmering`);
  resources.consumeTo(10, $item`weird gazelle steak`);
  new SpellTest(context).run();

  if (get("csServicesPerformed").split(",").length !== 11) {
    throw "Something went wrong with tests...";
  }

  if (!canInteract()) {
    visitUrl(`choice.php?whichchoice=1089&option=30`);
  }

  const time = Date.now() - startTime;
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  print("============================================", "green");
  print(`Run finished! Run took a total of ${minutes}m${seconds.toFixed(1)}s.`, "green");
  print("============================================", "green");
  print();
  resources.summarize();

  shrug($effect`Cowrruption`);
} finally {
  cliExecute("ccs default");
  cliExecute("boombox food");

  set("_hccs_resourceTracker", resources.serialize());
  propertyManager.resetAll();
}
