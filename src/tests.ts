import {
  availableAmount,
  cliExecute,
  containsText,
  create,
  equip,
  getProperty,
  handlingChoice,
  haveEffect,
  itemAmount,
  maximize,
  myBasestat,
  myBuffedstat,
  myClass,
  myGardenType,
  myHp,
  myMaxhp,
  myThrall,
  myTurncount,
  numericModifier,
  print,
  retrieveItem,
  runChoice,
  runCombat,
  setAutoAttack,
  setLocation,
  totalFreeRests,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
  $thralls,
  adventureMacroAuto,
  get,
  have,
  Mood,
  PropertiesManager,
  SongBoom,
  TunnelOfLove,
  Witchess,
} from "libram";
import { adventureMacro, Macro, saberYr, withMacro } from "./combat";
import {
  ensureEffect,
  ensureMpSausage,
  ensureMpTonic,
  ensureNpcEffect,
  ensureOutfit,
  ensurePotionEffect,
  ensurePullEffect,
  ensureSong,
  incrementProperty,
  mapMonster,
  myFamiliarWeight,
  pullIfPossible,
  sausageFightGuaranteed,
  setChoice,
  tryEquip,
  tryUse,
} from "./lib";
import { ResourceTracker } from "./resources";
import { SynthesisPlanner } from "./synthesis";

function useDefaultFamiliar() {
  useFamiliar($familiar`Hovering Sombrero`);
}

export const testLog: { [index: string]: { turns: number; seconds: number } } = {};

export type TestContext = {
  propertyManager: PropertiesManager;
  resources: ResourceTracker;
  synthesisPlanner: SynthesisPlanner;
};

export abstract class Test {
  context: TestContext;

  constructor(context: TestContext) {
    this.context = context;
  }

  isDone(): boolean {
    return get("csServicesPerformed").includes(this.name);
  }

  run(): void {
    if (!this.isDone()) {
      print();
      print("=======================================");
      print(`Beginning test ${this.constructor.name}.`, "blue");
      const startTime = Date.now();
      const startTurns = myTurncount();
      this.prepare();
      // cliExecute(`outfit save CS ${this.constructor.name}`);
      ensureOutfit(`CS ${this.constructor.name}`);
      print(`Executing test ${this.constructor.name}, predicting ${this.predictedTurns()} turns.`);
      visitUrl("council.php");
      runChoice(this.id);
      if (!this.isDone()) {
        throw `Failed to do test ${this.constructor.name}. Maybe we are out of turns.`;
      }
      const log = {
        turns: myTurncount() - startTurns,
        seconds: (Date.now() - startTime) / 1000,
      };
      print(
        `Finished test ${this.constructor.name}. ` +
          `Took ${log.seconds.toFixed(1)} seconds and ${log.turns} turns.`,
        "blue"
      );
      testLog[this.constructor.name] = log;
    }
  }

  abstract get id(): number;
  abstract get name(): string;
  abstract predictedTurns(): number;
  abstract prepare(): void;
}

export class CoilWireTest extends Test {
  get id(): number {
    return 11;
  }

  get name(): string {
    return "Coil Wire";
  }

  predictedTurns(): number {
    return 60;
  }

  prepare(): void {
    // FIXME: Outfit
    cliExecute("fold makeshift garbage shirt");

    // equip($item`Iunion Crown`);
    // equip($slot`shirt`, $item`makeshift garbage shirt`);
    // equip($item`Fourth of May Cosplay Saber`);
    // equip($item`Kramco Sausage-o-Matic™`);
    // equip($item`Cargo Cultist Shorts`);
    // equip($slot`acc1`, $item`Retrospecs`);
    // equip($slot`acc2`, $item`Powerful Glove`);
    // equip($slot`acc3`, $item`Lil' Doctor™ bag`);
    ensureOutfit("CS Leveling");
  }
}

export class HpTest extends Test {
  get id(): number {
    return 1;
  }

  get name(): string {
    return "Donate Blood";
  }

  predictedTurns(): number {
    return Math.max(1, 60 - Math.floor((myMaxhp() - myBuffedstat($stat`Muscle`) - 3) / 30));
  }

  prepare(): void {
    if (!have($effect`That's Just Cloud-Talk, Man`)) {
      visitUrl("place.php?whichplace=campaway&action=campaway_sky");
    }

    // Boxing Daycare
    ensureEffect($effect`Uncucumbered`);

    this.context.resources.wish($effect`New and Improved`);

    this.context.resources.deck("rope");

    ensureEffect($effect`Inscrutable Gaze`);
    ensureEffect($effect`Thaumodynamic`);
    ensureEffect($effect`You Learned Something Maybe!`);

    retrieveItem($item`codpiece`);

    // FIXME: Outfit
    // equip($item`Iunion Crown`);
    // equip($slot`shirt`, $item`makeshift garbage shirt`);
    // equip($item`Fourth of May Cosplay Saber`);
    // equip($slot`off-hand`, $item`none`);
    // equip($item`Cargo Cultist Shorts`);
    // equip($slot`acc1`, $item`Retrospecs`);
    // equip($slot`acc2`, $item`Powerful Glove`);
    // equip($slot`acc3`, $item`Lil' Doctor™ Bag`);
    ensureOutfit("CS Leveling");

    // Prep Sweet Synthesis.
    if (myGardenType() === "peppermint") {
      cliExecute("garden pick");
    } else {
      print(
        "WARNING: This script is built for peppermint garden. Switch gardens or find other candy.",
        "red"
      );
    }

    if (availableAmount($item`li'l ninja costume`) === 0 && !get("_bagOfCandy")) {
      withMacro(Macro.skill("Chest X-Ray"), () => {
        ensureMpTonic(50);
        useFamiliar($familiar`Stocking Mimic`);
        mapMonster($location`The Haiku Dungeon`, $monster`amateur ninja`);
        runCombat();
      });
    }

    if (get("_candySummons") === 0) {
      useSkill(1, $skill`Summon Crimbo Candy`);
    }

    useSkill(1, $skill`Chubby and Plump`);

    this.context.synthesisPlanner.synthesize($effect`Synthesis: Learning`);
    this.context.synthesisPlanner.synthesize($effect`Synthesis: Smart`);

    // Use ten-percent bonus
    tryUse(1, $item`a ten-percent bonus`);

    if (!have($effect`Holiday Yoked`) || !have($item`Sacramento wine`)) {
      useFamiliar($familiar`Ghost of Crimbo Carols`);
      withMacro(Macro.kill(), () => Witchess.fightPiece($monster`Witchess Bishop`));
    }

    ensureEffect($effect`Starry-Eyed`);
    ensureEffect($effect`Triple-Sized`);
    ensureEffect($effect`Feeling Excited`);
    ensureEffect($effect`Hulkien`);
    ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);

    if (!have($effect`Purity of Spirit`)) {
      this.context.resources.clipArt($item`cold-filtered water`);
      use($item`cold-filtered water`);
    }

    // Plan is for these buffs to fall all the way through to item -> hot res -> fam weight.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    // Chateau rest
    while (get("timesRested") < totalFreeRests()) {
      visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
    }

    ensureEffect($effect`Song of Bravado`);

    // Should be 50% myst for now.
    ensureEffect($effect`Blessing of your favorite Bird`);

    if (availableAmount($item`flask of baconstone juice`) > 0) {
      ensureEffect($effect`Baconstoned`);
    }

    const mood = new Mood();
    mood.skill($skill`Blood Bond`);
    mood.skill($skill`Blood Bubble`);
    mood.skill($skill`Carol of the Hells`);
    mood.skill($skill`Inscrutable Gaze`);
    mood.skill($skill`Leash of Linguini`);
    mood.skill($skill`Pride of the Puffin`);
    mood.skill($skill`Singer's Faithful Ocelot`);
    mood.skill($skill`Stevedave's Shanty of Superiority`);
    mood.execute();

    // LOV Tunnel
    if (!TunnelOfLove.isUsed()) {
      useDefaultFamiliar();
      Macro.if_("monstername LOV Enforcer", Macro.attack().repeat())
        .if_("monstername LOV Engineer", Macro.skill($skill`Saucegeyser`).repeat())
        .if_("monstername LOV Equivocator", Macro.pickpocket().kill())
        .setAutoAttack();

      TunnelOfLove.fightAll(
        "LOV Epaulettes",
        "Open Heart Surgery",
        "LOV Extraterrestrial Chocolate"
      );

      if (handlingChoice()) throw "Did not get all the way through LOV.";

      if (itemAmount($item`LOV Extraterrestrial Chocolate`) > 0) {
        use($item`LOV Extraterrestrial Chocolate`);
      }

      equip($item`LOV Epaulettes`);
    }

    if (availableAmount($item`very pointy crown`) === 0 && get("_witchessFights") < 5) {
      setAutoAttack(0);
      withMacro(Macro.attack().repeat(), () => Witchess.fightPiece($monster`Witchess Queen`));
    }
    if (availableAmount($item`battle broom`) === 0 && get("_witchessFights") < 5) {
      setAutoAttack(0);
      withMacro(Macro.attack().repeat(), () => Witchess.fightPiece($monster`Witchess Witch`));
    }

    // Professor 9x free sausage fight @ NEP
    if (sausageFightGuaranteed()) {
      useFamiliar($familiar`Pocket Professor`);
      tryEquip($item`Pocket Professor memory chip`);

      // equip($item`Kramco Sausage-o-Matic™`);
      // equip($slot`acc1`, $item`hewn moon-rune spoon`);
      // equip($slot`acc2`, $item`Brutal brogues`);
      // equip($slot`acc3`, $item`Beach Comb`);
      ensureOutfit("CS Professor");

      adventureMacroAuto(
        $location`Noob Cave`,
        Macro.if_("!monstername sausage goblin", Macro.abort())
          .trySkill(Skill.get("Lecture on Relativity"))
          .kill()
      );
    }

    ensureOutfit("CS Leveling");

    // 17 free NEP fights
    while (
      get("_neverendingPartyFreeTurns") < 10 ||
      get("_chestXRayUsed") < 3 ||
      get("_shatteringPunchUsed") < 3 ||
      !get("_gingerbreadMobHitUsed")
    ) {
      useDefaultFamiliar();

      // NEP noncombat. Fight.
      setChoice(1324, 5);

      adventureMacroAuto(
        $location`The Neverending Party`,
        Macro.externalIf(
          get("_neverendingPartyFreeTurns") === 10,
          Macro.trySkill("Chest X-Ray", "Shattering Punch", "Gingerbread Mob Hit").abort()
        ).kill()
      );
    }

    // Reset location so maximizer doesn't get confused.
    setLocation($location`none`);

    if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
    else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

    ensureEffect($effect`Song of Starch`);
    // ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    // ensureEffect($effect`Disdain of the War Snapper`);
    // ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ Balm`);

    useFamiliar($familiar`Left-Hand Man`);

    // FIXME: Outfit
    // maximize("hp", false);
  }
}

function statTurns(stat: Stat) {
  let baseStat = stat;
  if ($thralls`Elbow Macaroni, Penne Dreadful`.includes(myThrall())) {
    baseStat = $stat`Mysticality`;
  }
  return Math.max(1, 60 - Math.floor((myBuffedstat(stat) - myBasestat(baseStat)) / 30));
}

export class MuscleTest extends Test {
  get id(): number {
    return 2;
  }

  get name(): string {
    return "Feed The Children";
  }

  predictedTurns(): number {
    return statTurns($stat`Muscle`);
  }

  prepare(): void {
    if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
    else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    // ensureSong($effect`Power Ballad of the Arrowsmith`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    // ensureEffect($effect`Disdain of the War Snapper`);
    // ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ Balm`);

    useFamiliar($familiar`Left-Hand Man`);
    maximize("muscle", false);

    for (const increaser of [
      () => ensureEffect($effect`Lack of Body-Building`), // will stay on all the way to weapon damage.
      () => ensureEffect($effect`Ham-Fisted`),
    ]) {
      if (this.predictedTurns() > 1) increaser();
    }
    if (this.predictedTurns() > 1) {
      throw "Not enough muscle to cap.";
    }
  }
}

export class MysticalityTest extends Test {
  get id(): number {
    return 3;
  }

  get name(): string {
    return "Build Playground Mazes";
  }

  predictedTurns(): number {
    return statTurns($stat`Mysticality`);
  }

  prepare(): void {
    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureEffect($effect`Quiet Judgement`);
    // ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);

    useFamiliar($familiar`Left-Hand Man`);
    // FIXME: Outfit
    // maximize("mysticality", false);
    if (this.predictedTurns() > 1) {
      throw "Not enough mysticality to cap.";
    }
  }
}

export class MoxieTest extends Test {
  get id(): number {
    return 4;
  }

  get name(): string {
    return "Feed Conspirators";
  }

  predictedTurns(): number {
    return statTurns($stat`Moxie`);
  }

  prepare(): void {
    if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Penne Dreadful`);
    else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

    // Beach Comb
    ensureEffect($effect`Pomp & Circumsands`);

    use(1, $item`Bird-a-Day calendar`);
    ensureEffect($effect`Blessing of the Bird`);

    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureEffect($effect`Quiet Desperation`);
    // ensureEffect($effect`Disco Fever`);
    // ensureEffect($effect`Blubbered Up`);
    // ensureNpcEffect($effect`Butt-Rock Hair`, 5, $item`hair spray`);
    // use(availableAmount($item`rhinestone`), $item`rhinestone`);
    // if (!have($effect`Unrunnable Face`)) {
    //   tryUse(1, $item`runproof mascara`);
    // }

    useFamiliar($familiar`Left-Hand Man`);
    maximize("moxie", false);
    if (this.predictedTurns() > 1) {
      throw "Not enough moxie to cap.";
    }
  }
}

export class ItemTest extends Test {
  get id(): number {
    return 9;
  }

  get name(): string {
    return "Make Margaritas";
  }

  predictedTurns(): number {
    const denominator = have($effect`Steely-Eyed Squint`) ? 15 : 30;
    return Math.max(
      1,
      60 -
        Math.floor(numericModifier("Item Drop") / denominator) -
        Math.floor(numericModifier("Booze Drop") / 15)
    );
  }

  prepare(): void {
    ensureMpSausage(500);

    useFamiliar($familiar`Trick-or-Treating Tot`);

    if (haveEffect($effect`Bat-Adjacent Form`) === 0) {
      if (get("_reflexHammerUsed") >= 3) throw "Out of reflex hammers!";
      equip($item`vampyric cloake`);
      equip($slot`acc3`, $item`Lil' Doctor™ bag`);
      adventureMacro(
        $location`The Dire Warren`,
        Macro.skill($skill`Become a Bat`).skill($skill`Reflex Hammer`)
      );
    }

    /*
  // Tune moon sign to Opossum.
  if (!getPropertyBoolean('moonTuned')) {
    if (get('_campAwaySmileBuffs') === 0) {
      visitUrl('place.php?whichplace=campaway&action=campaway_sky');
    }

    // Unequip spoon.
    equip($slot`acc1`, $item`Retrospecs`);
    equip($slot`acc2`, $item`Powerful Glove`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

    // Actually tune the moon. To Opossum.
    visitUrl('inv_use.php?whichitem=10254&doit=96&whichsign=5');
  }
  */

    ensureEffect($effect`Fat Leon's Phat Loot Lyric`);
    ensureEffect($effect`Singer's Faithful Ocelot`);
    ensureEffect($effect`The Spirit of Taking`);
    ensureEffect($effect`items.enh`);

    this.context.synthesisPlanner.synthesize($effect`Synthesis: Collection`);

    ensureEffect($effect`Nearly All-Natural`); // bag of grain
    ensureEffect($effect`Steely-Eyed Squint`);

    ensureEffect($effect`There's No N in Love`);

    this.context.resources.wish($effect`Infernal Thirst`);

    // Fortune of the Wheel
    // this.context.resources.deck("wheel");

    // FIXME: Outfit
    maximize(
      "item, 2 booze drop, -equip broken champagne bottle, -equip surprisingly capacious handbag",
      false
    );
  }
}

export class HotTest extends Test {
  get id(): number {
    return 10;
  }

  get name(): string {
    return "Clean Steam Tunnels";
  }

  predictedTurns(): number {
    return Math.max(1, 60 - numericModifier("Hot Resistance"));
  }

  prepare(): void {
    ensureMpTonic(500);

    useFamiliar($familiar`Exotic Parrot`);

    // eslint-disable-next-line libram/verify-constants
    if (!have($effect`Fireproof Foam Suit`)) {
      // eslint-disable-next-line libram/verify-constants
      equip($slot`weapon`, $item`industrial fire extinguisher`);
      equip($slot`off-hand`, $item`Fourth of May Cosplay Saber`);
      equip($item`vampyric cloake`);
      this.context.propertyManager.setChoices({ [1387]: 3 });
      adventureMacro(
        $location`The Dire Warren`,
        Macro.skill($skill`Become a Cloud of Mist`)
          .skill($skill`Fire Extinguisher: Foam Yourself`)
          .skill($skill`Use the Force`)
      );
    }

    // These should have fallen through all the way from leveling.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    // ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    if (
      availableAmount($item`sleaze powder`) > 0 ||
      availableAmount($item`lotion of sleaziness`) > 0
    ) {
      ensurePotionEffect($effect`Sleazy Hands`, $item`lotion of sleaziness`);
    }

    ensureEffect($effect`Feeling Peaceful`);
    // Reward
    ensureEffect($effect`Amazing`);

    // Beach comb buff.
    ensureEffect($effect`Hot-Headed`);

    useFamiliar($familiar`Exotic Parrot`);
    if (availableAmount($item`cracker`) === 0) {
      retrieveItem($item`box of Familiar Jacks`);
      use($item`box of Familiar Jacks`);
    }

    // Mafia sometimes can't figure out that multiple +weight things would get us to next tier.
    // FIXME: Outfit
    maximize("hot res, 0.01 familiar weight", false);
  }
}

export class NoncombatTest extends Test {
  get id(): number {
    return 8;
  }

  get name(): string {
    return "Be a Living Statue";
  }

  predictedTurns(): number {
    return Math.max(1, 60 - 3 * Math.floor(numericModifier("Combat Rate") / 5));
  }

  prepare(): void {
    if (getProperty("_horsery") !== "dark horse") cliExecute("horsery dark");

    if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
    ensureEffect($effect`Blood Bond`);
    ensureEffect($effect`Leash of Linguini`);

    equip($slot`acc2`, $item`Powerful Glove`);

    ensureEffect($effect`The Sonata of Sneakiness`);
    ensureEffect($effect`Smooth Movements`);
    ensureEffect($effect`Invisible Avatar`);
    ensureEffect($effect`Silent Running`);
    ensureEffect($effect`Become Superficially interested`);
    ensureEffect($effect`Feeling Lonely`);

    useFamiliar($familiar`Disgeist`);

    // Pastamancer d1 is -combat.
    ensureEffect($effect`Blessing of the Bird`);
    ensureEffect($effect`Blessing of your favorite Bird`);

    maximize("-combat, 0.0familiar weight, equip Kremlin's Greatest Briefcase", false);

    // Rewards
    ensureEffect($effect`Throwing Some Shade`);

    if (Math.round(numericModifier("combat rate")) > -39) {
      throw "Not enough -combat to cap.";
    }
  }
}

export class FamiliarTest extends Test {
  get id(): number {
    return 5;
  }

  get name(): string {
    return "Breed More Collies";
  }

  predictedTurns(): number {
    return Math.max(1, 60 - Math.floor(myFamiliarWeight() / 5));
  }

  prepare(): void {
    if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
    ensureEffect($effect`Blood Bond`);
    ensureEffect($effect`Leash of Linguini`);

    // These should have fallen through all the way from leveling.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    if (haveEffect($effect`Meteor Showered`) === 0) {
      equip($item`Fourth of May Cosplay Saber`);
      useFamiliar($familiar`none`);
      adventureMacro(
        $location`The Dire Warren`,
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
      );
      if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty("_meteorShowerUses");
    }

    // NC reward
    ensureEffect($effect`Robot Friends`);

    useFamiliar($familiar`Exotic Parrot`);
    maximize("familiar weight", false);
  }
}

export class WeaponTest extends Test {
  get id(): number {
    return 6;
  }

  get name(): string {
    return "Reduce Gazelle Population";
  }

  predictedTurns(): number {
    return Math.max(
      1,
      60 -
        Math.floor(numericModifier("weapon damage") / 25) -
        Math.floor(numericModifier("weapon damage percent") / 25)
    );
  }

  prepare(): void {
    if (haveEffect($effect`Do You Crush What I Crush?`) === 0) {
      useFamiliar($familiar`Ghost of Crimbo Carols`);
      adventureMacro($location`The Dire Warren`, Macro.skill($skill`Feel Hatred`));
    }

    ensureEffect($effect`Carol of the Bulls`);
    ensureEffect($effect`Song of the North`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Frenzied, Bloody`);
    ensureEffect($effect`Scowl of the Auk`);
    ensureEffect($effect`Disdain of the War Snapper`);
    ensureEffect($effect`Tenacity of the Snapper`);
    ensureSong($effect`Jackasses' Symphony of Destruction`);

    ensureEffect($effect`Billiards Belligerence`);

    if (availableAmount($item`vial of hamethyst juice`) > 0) {
      ensureEffect($effect`Ham-Fisted`);
    }

    // Beach Comb
    if (!containsText(getProperty("_beachHeadsUsed"), "6")) {
      ensureEffect($effect`Lack of Body-Building`);
    }

    if (availableAmount($item`LOV Elixir #3`) > 0) ensureEffect($effect`The Power of LOV`);

    // Pastamancer d1 is weapon damage.
    ensureEffect($effect`Blessing of the Bird`);

    // Get flimsy hardwood scraps.
    visitUrl("shop.php?whichshop=lathe");
    if (availableAmount($item`flimsy hardwood scraps`) > 0) {
      retrieveItem(1, $item`ebony epee`);
    }

    // Paint ungulith (Saber YR)
    if (!get("_chateauMonsterFought")) {
      useFamiliar($familiar`Ghost of Crimbo Carols`);
      equip($item`Fourth of May Cosplay Saber`);
      this.context.propertyManager.setChoices({ [1387]: 3 });
      Macro.skill($skill`Meteor Shower`)
        .skill($skill`Use the Force`)
        .setAutoAttack();
      visitUrl("place.php?whichplace=chateau&action=chateau_painting", false);
      runCombat();
      saberYr();
    }

    SongBoom.setSong("These Fists Were Made for Punchin'");

    // Corrupted marrow
    ensureEffect($effect`Cowrruption`);

    ensureEffect($effect`Bow-Legged Swagger`);

    // FIXME: Outfit
    maximize("weapon damage", false);

    if (this.predictedTurns() > 3) {
      throw "Something went wrong with weapon damage.";
    }
  }
}

export class SpellTest extends Test {
  get id(): number {
    return 7;
  }

  get name(): string {
    return "Make Sausage";
  }

  predictedTurns(): number {
    return Math.max(
      1,
      60 -
        Math.floor(numericModifier("spell damage") / 50 + 0.001) -
        Math.floor(numericModifier("spell damage percent") / 50 + 0.001)
    );
  }

  prepare(): void {
    ensureEffect($effect`Simmering`);

    ensureEffect($effect`Song of Sauce`);
    ensureEffect($effect`Carol of the Hells`);
    ensureEffect($effect`Arched Eyebrow of the Archmage`);
    ensureSong($effect`Jackasses' Symphony of Destruction`);

    // Pool buff
    ensureEffect($effect`Mental A-cue-ity`);

    // Beach Comb
    ensureEffect($effect`We're All Made of Starfish`);

    useSkill(1, $skill`Spirit of Cayenne`);

    if (availableAmount($item`flask of baconstone juice`) > 0) {
      ensureEffect($effect`Baconstoned`);
    }

    pullIfPossible(1, $item`Staff of Simmering Hatred`, 0);

    ensurePullEffect($effect`Pisces in the Skyces`, $item`tobiko marble soda`);

    this.context.resources.tome($skill`Summon Sugar Sheets`);
    if (availableAmount($item`sugar chapeau`) === 0 && availableAmount($item`sugar sheet`) > 0) {
      create(1, $item`sugar chapeau`);
    }

    if (haveEffect($effect`Meteor Showered`) === 0 && get("_meteorShowerUses") < 5) {
      equip($item`Fourth of May Cosplay Saber`);
      adventureMacroAuto(
        $location`The Dire Warren`,
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
      );
      if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty("_meteorShowerUses");
    }

    if (availableAmount($item`LOV Elixir #6`) > 0) ensureEffect($effect`The Magic of LOV`);

    useFamiliar($familiar`Left-Hand Man`);

    maximize("spell damage", false);
  }
}
