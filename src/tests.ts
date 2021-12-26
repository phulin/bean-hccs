import {
  availableAmount,
  buy,
  cliExecute,
  containsText,
  create,
  equip,
  getClanName,
  getFuel,
  getProperty,
  getWorkshed,
  handlingChoice,
  haveEffect,
  itemAmount,
  maximize,
  mpCost,
  myBasestat,
  myBuffedstat,
  myClass,
  myFamiliar,
  myGardenType,
  myHp,
  myMaxhp,
  myPrimestat,
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
  toUrl,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $classes,
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
  Clan,
  get,
  have,
  Mood,
  PropertiesManager,
  SongBoom,
  SourceTerminal,
  TunnelOfLove,
  Witchess,
} from "libram";
import { adventureMacro, Macro, saberYr, withMacro } from "./combat";
import {
  ensureDough,
  ensureEffect,
  ensureMpSausage,
  ensureMpTonic,
  ensureNpcEffect,
  ensureOutfit,
  ensurePotionEffect,
  ensureSong,
  equalizeStat,
  incrementProperty,
  mapMonster,
  myFamiliarWeight,
  sausageFightGuaranteed,
  setChoice,
  tryEquip,
  tryUse,
} from "./lib";
import { globalOptions } from "./options";
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
      // ensureOutfit(`CS ${this.constructor.name}`);
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

  // Utility methods
  ensureInnerElf(): void {
    if (haveEffect($effect`Inner Elf`) === 0) {
      Clan.join("Hobopolis Vacation Home");
      try {
        useFamiliar($familiar`Machine Elf`);
        equip($slot`acc3`, $item`Kremlin's Greatest Briefcase`);
        this.context.propertyManager.setChoices({ [326]: 1 });
        ensureEffect($effect`Blood Bubble`);
        adventureMacro($location`The Slime Tube`, Macro.skill($skill`KGB tranquilizer dart`));
      } finally {
        Clan.join("Bonus Adventures from Hell");
      }
    }
  }
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
    cliExecute("fold makeshift garbage shirt");
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

    if (availableAmount($item`Flaskfull of Hollow`) > 0) {
      ensureEffect($effect`Merry Smithsness`);
    }

    if (myPrimestat() === $stat`Muscle`) {
      ensureEffect($effect`Muddled`);
      ensureEffect($effect`Muscle Unbound`);
      ensureEffect($effect`Lack of Body-Building`);
      this.context.resources.wish($effect`HGH-charged`);
      this.context.resources.ensurePullPotion($item`pressurized potion of puissance`, 30000);
      this.context.resources.ensurePullPotion($item`abstraction: purpose`, 30000);
      if (globalOptions.levelAggressively) {
        this.context.resources.deck("strength");
        this.context.resources.ensurePullPotion($item`Ferrigno's Elixir of Power`, 30000);
        this.context.resources.ensurePullPotion($item`Mer-kin strongjuice`, 30000);
        this.context.resources.wish($effect`New and Improved`);
      }
    } else {
      ensureEffect($effect`Uncucumbered`);
      ensureEffect($effect`Inscrutable Gaze`);
      ensureEffect($effect`Thaumodynamic`);
      ensureEffect($effect`We're All Made of Starfish`);
      this.context.resources.wish($effect`Different Way of Seeing Things`);
      this.context.resources.ensurePullPotion($item`pressurized potion of perspicacity`, 30000);
      this.context.resources.ensurePullPotion($item`abstraction: category`, 30000);
      if (globalOptions.levelAggressively) {
        this.context.resources.deck("magician");
        this.context.resources.ensurePullPotion($item`Hawking's Elixir of Brilliance`, 30000);
        this.context.resources.ensurePullPotion($item`Mer-kin smartjuice`, 30000);
        this.context.resources.wish($effect`New and Improved`);
      }

      if (!get("_preventScurvy")) useSkill($skill`Prevent Scurvy and Sobriety`);
      if (get("reagentSummons") === 0) useSkill($skill`Advanced Saucecrafting`);
      ensureEffect($effect`Mystically Oiled`);
    }

    if (!have($item`green mana`) && !have($effect`Giant Growth`)) {
      this.context.resources.pull($item`green mana`, 30000);
    }

    ensureEffect($effect`You Learned Something Maybe!`);

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
      equip($slot`off-hand`, $item`none`);
      SourceTerminal.educate($skill`Portscan`);
      withMacro(Macro.skill("Portscan", "Chest X-Ray"), () => {
        ensureMpTonic(50);
        useFamiliar($familiar`Stocking Mimic`);
        mapMonster($location`The Haiku Dungeon`, $monster`amateur ninja`);
        runCombat();
      });
      retrieveItem($item`bag of many confections`);
    }

    if (availableAmount($item`government cheese`) + availableAmount($item`government`) === 0) {
      equip($slot`off-hand`, $item`none`);
      setChoice(1387, 3); // Force drop items.
      adventureMacro(
        $location`Noob Cave`,
        Macro.externalIf(have($item`green mana`), Macro.skill("Giant Growth")).skill(
          $skill`Use the Force`
        )
      );
    }

    if (get("_candySummons") === 0) {
      useSkill(1, $skill`Summon Crimbo Candy`);
    }

    useSkill(1, $skill`Chubby and Plump`);

    if (availableAmount($item`Crimbo candied pecan`) === 3) {
      // Yahtzee!
      this.context.resources.pull($item`Crimbo fudge`, 4000);
    }

    while (get("libramSummons") < 6) {
      ensureMpTonic(mpCost($skill`Summon Candy Heart`));
      useSkill($skill`Summon Candy Heart`);
    }

    this.context.synthesisPlanner.synthesize(
      myPrimestat() === $stat`Muscle` ? $effect`Synthesis: Movement` : $effect`Synthesis: Learning`
    );
    this.context.synthesisPlanner.synthesize(
      myPrimestat() === $stat`Muscle` ? $effect`Synthesis: Strong` : $effect`Synthesis: Smart`
    );

    cliExecute("briefcase enchantment weapon hot -combat");

    // Depends on Ez's Bastille script.
    cliExecute(`bastille ${myPrimestat() === $stat`Muscle` ? "muscle" : "myst"} brutalist`);

    // Use ten-percent bonus
    tryUse(1, $item`a ten-percent bonus`);

    ensureEffect($effect`Starry-Eyed`);
    ensureEffect($effect`Favored by Lyle`);
    ensureEffect($effect`Triple-Sized`);
    ensureEffect($effect`Feeling Excited`);
    if (myPrimestat() === $stat`Muscle`) {
      ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`glittery mascara`);
    } else {
      ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);
    }

    // Plan is for these buffs to fall all the way through to item -> hot res -> fam weight.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Lack of Body-Building`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    // Chateau rest
    while (get("timesRested") < totalFreeRests()) {
      visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
    }

    if (!have($effect`Holiday Yoked`) || !have($item`Sacramento wine`)) {
      useFamiliar($familiar`Ghost of Crimbo Carols`);
      withMacro(Macro.kill(), () => Witchess.fightPiece($monster`Witchess Bishop`));
    }

    ensureEffect($effect`Song of Bravado`);

    // Should be 50% myst for now.
    ensureEffect($effect`Blessing of your favorite Bird`);

    if (
      myPrimestat() === $stat`Mysticality` &&
      availableAmount($item`flask of baconstone juice`) > 0
    ) {
      ensureEffect($effect`Baconstoned`);
    }

    const mood = new Mood();
    mood.skill($skill`Blood Bond`);
    mood.skill($skill`Blood Bubble`);
    mood.skill($skill`Carol of the Bulls`);
    mood.skill($skill`Carol of the Hells`);
    mood.skill($skill`Carol of the Thrills`);
    mood.skill($skill`Drescher's Annoying Noise`);
    mood.skill($skill`Get Big`);
    mood.skill($skill`Leash of Linguini`);
    mood.skill($skill`Pride of the Puffin`);
    mood.skill($skill`Rage of the Reindeer`);
    mood.skill($skill`Singer's Faithful Ocelot`);
    mood.skill($skill`Stevedave's Shanty of Superiority`);
    mood.skill($skill`Ur-Kel's Aria of Annoyance`);
    if (myPrimestat() === $stat`Mysticality`) mood.skill($skill`Inscrutable Gaze`);
    mood.execute();

    // LOV Tunnel
    if (!TunnelOfLove.isUsed()) {
      useDefaultFamiliar();
      Macro.if_(
        "monstername LOV Enforcer",
        Macro.externalIf(
          myPrimestat() === $stat`Muscle`,
          Macro.skill($skill`Micrometeorite`).item($item`Time-Spinner`)
        )
          .attack()
          .repeat()
      )
        .if_("monstername LOV Engineer", Macro.skill($skill`Weapon of the Pastalord`).repeat())
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
    }

    if (globalOptions.levelAggressively) {
      while (get("_snojoFreeFights") < 10) {
        equip($item`LOV Epaulettes`);
        useDefaultFamiliar();
        adventureMacroAuto($location`The X-32-F Combat Training Snowman`, Macro.attack().repeat());
      }
    }

    if (get("_godLobsterFights") < 2) {
      equip($item`LOV Epaulettes`);
      useFamiliar($familiar`God Lobster`);
      setChoice(1310, 1);
      while (get("_godLobsterFights") < 2) {
        tryEquip($item`God Lobster's Scepter`);
        visitUrl("main.php?fightgodlobster=1");
        withMacro(Macro.kill(), () => runCombat());
        visitUrl("choice.php");
        if (handlingChoice()) runChoice(1);
      }
    }

    if (availableAmount($item`dented scepter`) === 0 && get("_witchessFights") < 5) {
      setAutoAttack(0);
      equip($item`Fourth of May Cosplay Saber`);
      withMacro(Macro.skill($skill`Saucegeyser`).repeat(), () =>
        Witchess.fightPiece($monster`Witchess King`)
      );
    }
    if (availableAmount($item`battle broom`) === 0 && get("_witchessFights") < 5) {
      setAutoAttack(0);
      equip($item`Fourth of May Cosplay Saber`);
      withMacro(Macro.attack().repeat(), () => Witchess.fightPiece($monster`Witchess Witch`));
    }

    // Professor 9x free sausage fight @ NEP
    if (sausageFightGuaranteed()) {
      useFamiliar($familiar`Pocket Professor`);
      equip($item`LOV Epaulettes`);
      tryEquip($item`Pocket Professor memory chip`);

      equip($item`Kramco Sausage-o-Matic™`);
      // equip($slot`acc1`, $item`hewn moon-rune spoon`);
      // equip($slot`acc2`, $item`Brutal brogues`);
      // equip($slot`acc3`, $item`Beach Comb`);
      ensureOutfit("CS Professor");

      adventureMacroAuto(
        $location`Noob Cave`,
        Macro.if_("!monstername sausage goblin", Macro.abort())
          .trySkill(Skill.get("Lecture on Relativity"))
          .trySkill("Feel Pride")
          .kill()
      );
    }

    ensureOutfit("CS Leveling");

    while (
      globalOptions.levelAggressively &&
      get("lastCopyableMonster") === $monster`sausage goblin` &&
      get("_backUpUses") < 11
    ) {
      useDefaultFamiliar();
      if (get("backupCameraMode") !== "ml") cliExecute("backupcamera ml");
      equip($item`backup camera`);
      adventureMacroAuto(
        $location`Noob Cave`,
        Macro.skill($skill`Back-Up to your Last Enemy`).kill()
      );
    }

    // 17 free NEP fights
    while (
      get("_neverendingPartyFreeTurns") < 10 ||
      get("_chestXRayUsed") < 3 ||
      get("_shatteringPunchUsed") < 3 ||
      !get("_gingerbreadMobHitUsed")
    ) {
      equip($item`LOV Epaulettes`);

      useDefaultFamiliar();

      this.ensureInnerElf();

      if (get("_questPartyFair") === "unstarted") {
        visitUrl(toUrl($location`The Neverending Party`));
        if (["food", "booze"].includes(get("_questPartyFairQuest"))) {
          print("Gerald/ine quest!", "blue");
          runChoice(1); // Accept quest
        } else {
          runChoice(2); // Decline quest
        }
      }

      // NEP noncombat. Fight.
      this.context.propertyManager.setChoices({ [1324]: 5 });

      adventureMacroAuto(
        $location`The Neverending Party`,
        Macro.externalIf(
          get("_neverendingPartyFreeTurns") === 10,
          Macro.trySkill("Chest X-Ray", "Shattering Punch", "Gingerbread Mob Hit").abort()
        ).kill()
      );
    }

    if (availableAmount($item`very pointy crown`) === 0 && get("_witchessFights") < 5) {
      setAutoAttack(0);
      equip($item`Fourth of May Cosplay Saber`);
      withMacro(
        Macro.item([$item`jam band bootleg`, $item`gas can`])
          .attack()
          .repeat(),
        () => Witchess.fightPiece($monster`Witchess Queen`)
      );
    }

    while (get("_machineTunnelsAdv") < 5) {
      // DMT noncombat. Run.
      this.context.propertyManager.setChoices({ [1119]: 5 });

      useFamiliar($familiar`Machine Elf`);

      adventureMacroAuto($location`The Deep Machine Tunnels`, Macro.kill());
    }

    if (myPrimestat() === $stat`Muscle`) {
      useSkill($skill`Prevent Scurvy and Sobriety`);
      useSkill($skill`Advanced Saucecrafting`);
      ensurePotionEffect($effect`Stabilizing Oiliness`, $item`oil of stability`);
    }

    // Reset location so maximizer doesn't get confused.
    setLocation($location`none`);

    equalizeStat($stat`Muscle`);

    ensureEffect($effect`Song of Starch`);
    // ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    // ensureEffect($effect`Disdain of the War Snapper`);
    // ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ Balm`);

    useFamiliar($familiar`Left-Hand Man`);

    // FIXME: Outfit
    maximize("hp", false);
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
    equalizeStat($stat`Muscle`);

    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureSong($effect`Power Ballad of the Arrowsmith`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    if (myClass() !== $class`Turtle Tamer`) ensureEffect($effect`Disdain of the War Snapper`);
    ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ Balm`);

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
    ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);

    useFamiliar($familiar`Left-Hand Man`);
    maximize("mysticality", false);

    for (const increaser of [
      () => ensureEffect($effect`We're All Made of Starfish`), // will stay on all the way to weapon damage.
      () => ensureEffect($effect`Baconstoned`),
    ]) {
      if (this.predictedTurns() > 1) increaser();
    }
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
    equalizeStat($stat`Moxie`);

    // Beach Comb
    ensureEffect($effect`Pomp & Circumsands`);

    use(1, $item`Bird-a-Day calendar`);
    ensureEffect($effect`Blessing of the Bird`);

    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureEffect($effect`Quiet Desperation`);
    ensureEffect($effect`Disco Fever`);
    ensureEffect($effect`Blubbered Up`);
    ensureNpcEffect($effect`Butt-Rock Hair`, 5, $item`hair spray`);
    useSkill($skill`Acquire Rhinestones`);
    use(availableAmount($item`rhinestone`), $item`rhinestone`);
    if (!have($effect`Unrunnable Face`)) {
      tryUse(1, $item`runproof mascara`);
    }

    tryUse(1, $item`eyedrops of newt`);

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

    ensureEffect($effect`Fat Leon's Phat Loot Lyric`);
    ensureEffect($effect`Singer's Faithful Ocelot`);
    ensureEffect($effect`The Spirit of Taking`);
    ensureEffect($effect`items.enh`);

    this.context.synthesisPlanner.synthesize($effect`Synthesis: Collection`);

    if (have($item`bag of grain`)) ensureEffect($effect`Nearly All-Natural`);
    ensureEffect($effect`Steely-Eyed Squint`);

    ensureEffect($effect`There's No N in Love`);

    if (getWorkshed() === $item`Asdon Martin keyfob` && !have($effect`Driving Observantly`)) {
      const breadNeeded = Math.max(0, Math.ceil((37 - getFuel()) / 5));
      const doughNeeded = Math.max(0, breadNeeded - itemAmount($item`loaf of soda bread`));
      ensureDough(doughNeeded);
      create(doughNeeded, $item`loaf of soda bread`);
      cliExecute(`asdonmartin fuel ${breadNeeded} loaf of soda bread`);
      cliExecute("asdonmartin drive observantly");
    }

    if (!have($item`oversized sparkler`) && !get("_fireworksShopEquipmentBought")) {
      visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
      buy($item`oversized sparkler`);
    }

    // FIXME: Outfit
    maximize(
      "item, 2 booze drop, -equip broken champagne bottle, -equip surprisingly capacious handbag",
      false
    );

    if (this.predictedTurns() > 1) {
      // Fortune of the Wheel
      this.context.resources.deck("wheel");
    }

    if (this.predictedTurns() > 1) {
      this.context.resources.wish($effect`Infernal Thirst`);
    }

    if (this.predictedTurns() > 1) {
      throw "Not enough item drop to cap.";
    }
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

    if (!have($effect`Fireproof Foam Suit`)) {
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
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    cliExecute(`smash ${availableAmount($item`ratty knitted cap`)} ratty knitted cap`);

    if (
      availableAmount($item`sleaze powder`) > 0 ||
      availableAmount($item`lotion of sleaziness`) > 0
    ) {
      ensurePotionEffect($effect`Sleazy Hands`, $item`lotion of sleaziness`);
    }

    ensureEffect($effect`Feeling Peaceful`);
    // Reward
    if (have($item`pocket maze`)) ensureEffect($effect`Amazing`);

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
    const uncappedCombatRate = 5 * (numericModifier("Combat Rate") + 25) - 25;
    return Math.max(1, 60 + 3 * Math.floor(uncappedCombatRate / 5));
  }

  prepare(): void {
    if (get("_godLobsterFights") < 3) {
      if (myHp() < 0.8 * myMaxhp()) useSkill(1, $skill`Cannelloni Cocoon`);
      useFamiliar($familiar`God Lobster`);
      // Get -combat buff.
      this.context.propertyManager.setChoices({ [1310]: 2 });
      equip($item`God Lobster's Ring`);
      visitUrl("main.php?fightgodlobster=1");
      withMacro(Macro.kill(), () => runCombat());
      if (handlingChoice()) runChoice(2);
    }

    if (getProperty("_horsery") !== "dark horse") cliExecute("horsery dark");

    if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
    ensureEffect($effect`Blood Bond`);
    ensureEffect($effect`Leash of Linguini`);

    equip($slot`acc2`, $item`Powerful Glove`);

    ensureEffect($effect`The Sonata of Sneakiness`);
    ensureEffect($effect`Smooth Movements`);
    ensureEffect($effect`Invisible Avatar`);
    ensureEffect($effect`Silent Running`);
    if (have($item`Daily Affirmation: Be Superficially interested`)) {
      ensureEffect($effect`Become Superficially interested`);
    }
    ensureEffect($effect`Feeling Lonely`);

    useFamiliar($familiar`Disgeist`);

    // Pastamancer d1 is -combat.
    ensureEffect($effect`Blessing of the Bird`);
    ensureEffect($effect`Blessing of your favorite Bird`);

    if (getClanName() === "Bonus Adventures from Hell" && !get("_floundryItemCreated")) {
      retrieveItem($item`codpiece`);
    }

    maximize("-combat, 0.01familiar weight, equip Kremlin's Greatest Briefcase", false);

    // Rewards
    ensureEffect($effect`Throwing Some Shade`);

    if (Math.round(numericModifier("combat rate")) > -40) {
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

    // this.context.resources.pull($item`Great Wolf's beastly trousers`, 0);

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

    if (
      $classes`Seal Clubber, Pastamancer`.includes(myClass()) &&
      haveEffect($effect`Saucefingers`) + haveEffect($effect`Elbow Sauce`) === 0
    ) {
      useFamiliar($familiar`Mini-Adventurer`);
      equip($item`latte lovers member's mug`);
      setChoice(768, 4); // Make mini-adv a Sauceror.
      if (get("miniAdvClass") !== 4) {
        if (get("_latteBanishUsed")) throw "Latte banish used!";
        adventureMacro($location`The Dire Warren`, Macro.skill($skill`Throw Latte on Opponent`));
      }
      if (get("_latteBanishUsed")) throw "Latte banish used!";
      adventureMacro($location`The Dire Warren`, Macro.skill($skill`Throw Latte on Opponent`));
    }

    ensureEffect($effect`Carol of the Bulls`);
    ensureEffect($effect`Song of the North`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Frenzied, Bloody`);
    ensureEffect($effect`Scowl of the Auk`);
    if (myClass() !== $class`Turtle Tamer`) ensureEffect($effect`Disdain of the War Snapper`);
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

    this.ensureInnerElf();

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

    // Corrupted marrow
    ensureEffect($effect`Cowrruption`);

    SongBoom.setSong("These Fists Were Made for Punchin'");

    ensureEffect($effect`Bow-Legged Swagger`);

    if (myBasestat($stat`Muscle`) > 150) {
      this.context.resources.pull($item`Stick-Knife of Loathing`, 0);
    }

    // FIXME: Outfit
    maximize("weapon damage", false);

    if (this.predictedTurns() >= 4) {
      this.context.resources.ensurePullPotion($item`wasabi marble soda`, 15000);
    }

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
    if (get("_poolGames") < 3) ensureEffect($effect`Mental A-cue-ity`);

    // Beach Comb
    ensureEffect($effect`We're All Made of Starfish`);

    // Tea party
    if (!get("_madTeaParty")) {
      visitUrl("clan_viplounge.php?action=lookingglass&whichfloor=2");
      retrieveItem($item`mariachi hat`);
      ensureEffect($effect`Full Bottle in front of Me`);
    }

    useSkill(1, $skill`Spirit of Cayenne`);

    if (availableAmount($item`flask of baconstone juice`) > 0) {
      ensureEffect($effect`Baconstoned`);
    }

    this.context.resources.pull($item`Staff of Simmering Hatred`, 0);

    this.context.resources.ensurePullPotion($item`tobiko marble soda`, 15000, true);

    this.context.resources.tome($skill`Summon Sugar Sheets`);
    if (availableAmount($item`sugar chapeau`) === 0 && availableAmount($item`sugar sheet`) > 0) {
      create(1, $item`sugar chapeau`);
    }

    this.ensureInnerElf();

    if (haveEffect($effect`Meteor Showered`) === 0 && get("_meteorShowerUses") < 5) {
      if (myFamiliar() === $familiar`Left-Hand Man`) useFamiliar($familiar`none`);
      equip($item`Fourth of May Cosplay Saber`);
      adventureMacroAuto(
        $location`The Dire Warren`,
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
      );
      if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty("_meteorShowerUses");
    }

    // Sigils of Yeg = 200% SD
    if (!get("_cargoPocketEmptied") && !have($effect`Sigils of Yeg`)) {
      if (!have($item`Yeg's Motel hand soap`)) cliExecute("cargo 177");
      ensureEffect($effect`Sigils of Yeg`);
    }

    if (availableAmount($item`LOV Elixir #6`) > 0) ensureEffect($effect`The Magic of LOV`);

    // Get flimsy hardwood scraps.
    visitUrl("shop.php?whichshop=lathe");
    if (availableAmount($item`flimsy hardwood scraps`) > 0) {
      retrieveItem(1, $item`weeping willow wand`);
    }

    useFamiliar($familiar`Left-Hand Man`);

    maximize("spell damage", false);

    if (Math.round(numericModifier("Spell Damage Percent")) % 50 >= 40) {
      ensurePotionEffect($effect`Concentration`, $item`cordial of concentration`);
    }
  }
}
