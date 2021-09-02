import {
  useFamiliar,
  equip,
  availableAmount,
  use,
  autosell,
  haveEffect,
  cliExecute,
  print,
  visitUrl,
  eat,
  useSkill,
  containsText,
  setProperty,
  myLevel,
  mySpleenUse,
  runChoice,
  myMp,
  myMeat,
  itemAmount,
  mpCost,
  myMaxmp,
  effectModifier,
  myInebriety,
  drink,
  canInteract,
} from 'kolmafia';
import {
  $familiar,
  $item,
  $effect,
  $effects,
  $skill,
  $slot,
  $location,
  get,
  Mood,
  PropertiesManager,
} from 'libram';

import {
  ensureItem,
  getPropertyInt,
  sausageFightGuaranteed,
  tryUse,
  shrug,
  ensureOde,
} from './lib';
import { SynthesisPlanner } from './synthesis';
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
} from './tests';

function ensureCandyHeartEffect(candyHeart: Item) {
  const effect = effectModifier(candyHeart, 'Effect');
  if (haveEffect(effect) === 0) {
    while (
      myMeat() >= (get('_sausagesMade') + 1) * 111 &&
      myMp() + 999 < myMaxmp() &&
      myMp() < mpCost($skill`Summon Candy Heart`)
    ) {
      eat(1, $item`magical sausage`);
    }

    while (mpCost($skill`Summon Candy Heart`) < myMp() && itemAmount(candyHeart) === 0) {
      useSkill(1, $skill`Summon Candy Heart`);

      while (
        myMeat() >= (get('_sausagesMade') + 1) * 111 &&
        myMp() + 999 < myMaxmp() &&
        myMp() < mpCost($skill`Summon Candy Heart`)
      ) {
        eat(1, $item`magical sausage`);
      }
    }

    if (itemAmount(candyHeart) > 0) use(1, candyHeart);
  }
}

// Sweet Synthesis plan.
// This is the sequence of synthesis effects; we will, if possible, come up with a plan for allocating candy to each of these.
const synthesisPlanner = new SynthesisPlanner(
  $effects`Synthesis: Learning, Synthesis: Smart, Synthesis: Collection`
);

Mood.setDefaultOptions({
  // mpSources: [],
  songSlots: [
    $effects`Stevedave's Shanty of Superiority`,
    $effects`Ur-Kel's Aria of Annoyance`,
    $effects`Power Ballad of the Arrowsmith, The Magical Mojomuscular Melody, The Moxious Madrigal, Ode to Booze, Jackasses' Symphony of Destruction`,
    $effects`Carlweather's Cantata of Confrontation, The Sonata of Sneakiness, Fat Leon's Phat Loot Lyric, Polka of Plenty`,
  ],
});

const propertyManager = new PropertiesManager();

propertyManager.set({ autoSatisfyWithNPCs: true });
propertyManager.set({ autoSatisfyWithCoinmasters: true });

// Initialize council.
visitUrl('council.php');

cliExecute('mood apathetic');

// All combat handled by our consult script (hccs_combat.ash).
cliExecute('ccs bean-hccs');

// Turn off Lil' Doctor quests.
propertyManager.setChoices({ [1340]: 3 });

const context = { synthesisPlanner, propertyManager };

try {
  if (myLevel() === 1 && mySpleenUse() === 0) {
    while (get('_universeCalculated') < get('skillLevel144')) {
      cliExecute('numberology 69');
    }
  }

  if (!get('_chateauDeskHarvested')) {
    // Chateau juice bar
    visitUrl('place.php?whichplace=chateau&action=chateau_desk2');
    autosell(1, $item`gremlin juice`);
  }

  // Sell pork gems + tent
  visitUrl('tutorial.php?action=toot');
  tryUse(1, $item`letter from King Ralph XI`);
  tryUse(1, $item`pork elf goodies sack`);
  autosell(5, $item`baconstone`);
  autosell(5, $item`porquoise`);
  autosell(5, $item`hamethyst`);

  if (get('_deckCardsDrawn') < 5) cliExecute('play 1952');
  autosell(1, $item`1952 Mickey Mantle card`);

  // Buy toy accordion
  ensureItem(1, $item`toy accordion`);

  // Upgrade saber for fam wt
  visitUrl('main.php?action=may4');
  runChoice(4);

  // Vote.
  visitUrl('place.php?whichplace=town_right&action=townright_vote');
  visitUrl('choice.php?option=1&whichchoice=1331&g=2&local%5B%5D=2&local%5B%5D=3');

  new CoilWireTest(context).run();
  new HpTest(context).run();
  new MuscleTest(context).run();
  new MysticalityTest(context).run();
  new MoxieTest(context).run();

  if (myInebriety() < 3) {
    tryUse(1, $item`astral six-pack`);
    ensureOde(3 - myInebriety());
    drink(3 - myInebriety(), $item`astral pilsner`);
  }

  new ItemTest(context).run();
  new HotTest(context).run();
  new NoncombatTest(context).run();

  // Drink smart drink - get more turns from that
  new FamiliarTest(context).run();
  new WeaponTest(context).run();
  // Eat weird gazelle steak.
  new SpellTest(context).run();

  if (get('csServicesPerformed').split(',').length !== 11) {
    throw 'Something went wrong with tests...';
  }

  if (!canInteract()) {
    visitUrl(`choice.php?whichchoice=1089&option=30`);
  }

  shrug($effect`Cowrruption`);
} finally {
  cliExecute('ccs default');
  cliExecute('boombox food');

  propertyManager.resetAll();
}
