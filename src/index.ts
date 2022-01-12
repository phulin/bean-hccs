import {
  autosell,
  canInteract,
  cliExecute,
  equip,
  myClass,
  myLevel,
  myPrimestat,
  mySpleenUse,
  print,
  retrieveItem,
  runChoice,
  setAutoAttack,
  use,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $classes,
  $effect,
  $effects,
  $familiar,
  $item,
  $stat,
  AsdonMartin,
  Clan,
  get,
  have,
  Mood,
  PropertiesManager,
  set,
} from "libram";

import { ensureEffect, ensureItem, shrug, tryUse } from "./lib";
import { globalOptions } from "./options";
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
  // Buy toy accordion
  ensureItem(1, $item`toy accordion`);

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
    visitUrl("choice.php?option=1&whichchoice=1331&g=2&local%5B%5D=1&local%5B%5D=2");
    // Make sure initiative-tracking works.
    visitUrl("place.php?whichplace=town_right&action=townright_vote");
  }

  // Sell pork gems + tent
  visitUrl("tutorial.php?action=toot");
  tryUse(1, $item`letter from King Ralph XI`);
  tryUse(1, $item`pork elf goodies sack`);

  // Pantogram.
  // Hilarity is better for later farming than NC
  // if (!have($item`pantogram pants`)) {
  //   ensureItem(1, $item`hermit permit`);
  //   retrieveItem(1, $item`ten-leaf clover`);
  //   cliExecute("pantogram mysticality|hot|drops of blood|hilarity|your dreams|silent");
  // }
}

export function main(argString = ""): void {
  const args = argString.split(" ");
  for (const arg of args) {
    if (arg.match(/level/)) {
      globalOptions.levelAggressively = true;
    } else if (arg.length > 0) {
      print(`Invalid argument ${arg} passed. Run garbo help to see valid arguments.`, "red");
      return;
    }
  }

  const validClasses = $classes`Seal Clubber, Turtle Tamer, Pastamancer, Sauceror`;
  if (!validClasses.includes(myClass())) {
    throw `Invalid class ${myClass()}`;
  }

  // Sweet Synthesis plan.
  // This is the sequence of synthesis effects; we will, if possible, come up with a plan for allocating candy to each of these.
  const synthesisPlanner = new SynthesisPlanner(
    myPrimestat() === $stat`Muscle`
      ? $effects`Synthesis: Movement, Synthesis: Strong, Synthesis: Collection`
      : $effects`Synthesis: Learning, Synthesis: Smart, Synthesis: Collection`
  );

  const propertyManager = new PropertiesManager();

  propertyManager.set({
    autoSatisfyWithNPCs: true,
    autoSatisfyWithCoinmasters: true,
    battleAction: "custom combat script",
    hpAutoRecovery: 0.6,
    hpAutoRecoveryTarget: 0.95,
    requireBoxServants: false,
  });

  // Turn off Lil' Doctor quests.
  propertyManager.setChoices({ [1340]: 3 });

  const resources = ResourceTracker.deserialize(get("_hccs_resourceTracker") || "{}");

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

  Clan.join("Bonus Adventures from Hell");

  const startTime = Date.now();

  try {
    if (myLevel() === 1 && mySpleenUse() === 0) {
      while (get("_universeCalculated") < get("skillLevel144")) {
        cliExecute("numberology 69");
      }
    }

    if (get("_deckCardsDrawn") < 5) resources.deck("1952");
    autosell(1, $item`1952 Mickey Mantle card`);

    breakfast();

    if (!get("_borrowedTimeUsed")) {
      if (!have($item`borrowed time`)) resources.tome($item`borrowed time`);
      use($item`borrowed time`);
    }

    visitUrl("council.php");

    new CoilWireTest(context).run();
    new HpTest(context).run();
    new MuscleTest(context).run();
    new MysticalityTest(context).run();
    new MoxieTest(context).run();

    tryUse(1, $item`astral six-pack`);
    resources.consumeTo(5, $item`astral pilsner`);

    new ItemTest(context).run();
    new HotTest(context).run();
    new NoncombatTest(context).run();

    new FamiliarTest(context).run();

    new WeaponTest(context).run();

    ensureEffect($effect`Simmering`);
    new SpellTest(context).run();

    if (get("csServicesPerformed").split(",").length !== 11) {
      throw "Something went wrong with tests...";
    }

    if (!canInteract()) {
      visitUrl(`choice.php?whichchoice=1089&option=30`);
    }

    const time = (Date.now() - startTime) / 1000;
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    print("============================================", "green");
    print(`Run finished! Run took a total of ${minutes}m${seconds.toFixed(1)}s.`, "green");
    print("============================================", "green");
    print();
    resources.summarize();

    shrug($effect`Cowrruption`);
    retrieveItem($item`bitchin' meatcar`);
    cliExecute("pull all");

    if (AsdonMartin.installed()) {
      // Get 1110 turns of Driving Observantly.
      new Mood().drive(AsdonMartin.Driving.Observantly).execute(1110);
      use($item`portable Mayo Clinic`);
      retrieveItem($item`Mayo Minder™`);
      cliExecute("mayominder adv");
    }

    useFamiliar($familiar`Shorter-Order Cook`);
    equip($item`blue plate`);

    use($item`can of Rain-Doh`);
  } finally {
    setAutoAttack(0);
    cliExecute("ccs default");

    set("_hccs_resourceTracker", resources.serialize());
    propertyManager.resetAll();
  }
}
