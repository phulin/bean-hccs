import {
  availableAmount,
  buy,
  changeMcd,
  chatPrivate,
  cliExecute,
  containsText,
  create,
  eat,
  equip,
  getClanName,
  getProperty,
  handlingChoice,
  haveEffect,
  itemAmount,
  maximize,
  mpCost,
  myBasestat,
  myBuffedstat,
  myClass,
  myGardenType,
  myHp,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMp,
  myPrimestat,
  myThrall,
  myTurncount,
  numericModifier,
  print,
  restoreHp,
  retrieveItem,
  runChoice,
  runCombat,
  setAutoAttack,
  setLocation,
  Stat,
  toInt,
  toUrl,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $class,
  $classes,
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
  $thralls,
  adventureMacroAuto,
  Bandersnatch,
  clamp,
  Clan,
  get,
  getModifier,
  have,
  Mood,
  PropertiesManager,
  SongBoom,
  SourceTerminal,
  TunnelOfLove,
  Witchess,
} from "libram";
import { adventureMacro, Macro, withMacro } from "./combat";
import {
  ensureEffect,
  ensureMpSausage,
  ensureMpTonic,
  ensureNpcEffect,
  ensurePotionEffect,
  ensureSong,
  incrementProperty,
  mapMonster,
  myFamiliarWeight,
  sausageFightGuaranteed,
  setChoice,
  tryEnsureAsdonEffect,
  tryEquip,
  tryUse,
} from "./lib";
import { globalOptions } from "./options";
import { donOutfit } from "./outfit";
import { ResourceTracker } from "./resources";
import { SynthesisPlanner } from "./synthesis";

function useDefaultFamiliar() {
  useFamiliar($familiar`Melodramedary`);
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
    if (haveEffect($effect`Inner Elf`) === 0 && myLevel() >= 13) {
      Clan.join("Hobopolis Vacation Home");
      try {
        useFamiliar($familiar`Machine Elf`);
        equip($slot`weapon`, $item`none`);
        equip($slot`acc3`, $item`Kremlin's Greatest Briefcase`);
        this.context.propertyManager.setChoices({ [326]: 1 });
        ensureEffect($effect`Blood Bubble`);
        adventureMacro($location`The Slime Tube`, Macro.skill($skill`KGB tranquilizer dart`));
      } finally {
        Clan.join("Bonus Adventures from Hell");
      }
    }
  }

  equalizeStat(targetStat: Stat): void {
    if (targetStat === myPrimestat()) return;
    if (statTurns(targetStat) <= 1) return;
    if (myClass() === $class`Pastamancer`) {
      if (targetStat === $stat`Muscle`) {
        useSkill($skill`Bind Undead Elbow Macaroni`);
      } else if (targetStat === $stat`Moxie`) {
        useSkill($skill`Bind Penne Dreadful`);
      }
    } else {
      const potion =
        myPrimestat() === $stat`Muscle`
          ? $item`oil of stability`
          : myPrimestat() === $stat`Mysticality`
          ? $item`oil of expertise`
          : $item`oil of slipperiness`;
      const effect = getModifier("Effect", potion);
      if (have(effect)) return;

      if (potion === $item`oil of stability`) {
        useSkill($skill`Prevent Scurvy and Sobriety`);
      } else {
        this.context.resources.ensurePullPotion(potion, 20000);
      }
      if (!retrieveItem(potion)) {
        throw `Couldn't make potion ${potion.name}.`;
      }
      use(potion);
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
    // Burn our 20-turn Crimbo Carol
    // if (!have($effect`Holiday Yoked`) && get("_feelHatredUsed") < 3) {
    //   useFamiliar($familiar`Ghost of Crimbo Carols`);
    //   adventureMacro($location`Noob Cave`, Macro.skill($skill`Feel Hatred`));
    // }

    cliExecute("fold makeshift garbage shirt");
    donOutfit("CS Leveling", {
      hat: $item`Iunion Crown`,
      back: $item`unwrapped knock-off retro superhero cape`,
      shirt: $item`makeshift garbage shirt`,
      weapon: $item`Fourth of May Cosplay Saber`,
      "off-hand": $item`familiar scrapbook`,
      pants: $item`designer sweatpants`,
      acc1: $item`Powerful Glove`,
      acc2: $item`Retrospecs`,
      acc3: $item`Lil' Doctor™ bag`,
    });
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

    if (myPrimestat() === $stat`Muscle`) {
      ensureEffect($effect`Muddled`);
      ensureEffect($effect`Muscle Unbound`);
      ensureEffect($effect`Lack of Body-Building`);
      if (globalOptions.levelAggressively) {
        this.context.resources.ensurePullPotion($item`pressurized potion of puissance`, 30000);
        this.context.resources.wish($effect`HGH-charged`);
        this.context.resources.ensurePullPotion($item`abstraction: purpose`, 30000);
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
      if (globalOptions.levelAggressively) {
        this.context.resources.ensurePullPotion($item`pressurized potion of perspicacity`, 30000);
        this.context.resources.wish($effect`Different Way of Seeing Things`);
        this.context.resources.ensurePullPotion($item`abstraction: category`, 30000);
        this.context.resources.deck("magician");
        this.context.resources.ensurePullPotion($item`Hawking's Elixir of Brilliance`, 30000);
        this.context.resources.ensurePullPotion($item`Mer-kin smartjuice`, 30000);
        this.context.resources.wish($effect`New and Improved`);
      }

      useSkill($skill`Prevent Scurvy and Sobriety`);
      useSkill($skill`Advanced Saucecrafting`);
      ensurePotionEffect($effect`Mystically Oiled`, $item`ointment of the occult`);
    }

    if (!have($item`green mana`) && !have($effect`Giant Growth`)) {
      this.context.resources.pull($item`green mana`, 30000);
    }

    ensureEffect($effect`You Learned Something Maybe!`);

    // Prep Sweet Synthesis.
    if (myGardenType() === "peppermint") {
      cliExecute("garden pick");
    } else {
      print(
        "WARNING: This script is built for peppermint garden. Switch gardens or find other candy.",
        "red"
      );
    }

    equip($item`Powerful Glove`);

    ensureEffect($effect`Starry-Eyed`);
    ensureEffect($effect`Favored by Lyle`);
    ensureEffect($effect`Total Protonic Reversal`);
    ensureEffect($effect`Triple-Sized`);
    ensureEffect($effect`Feeling Excited`);
    if (myPrimestat() === $stat`Muscle`) {
      ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`glittery mascara`);
    } else {
      ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);
    }

    if (availableAmount($item`li'l ninja costume`) === 0 && !get("_bagOfCandy")) {
      donOutfit("CS MP", {
        hat: $item`Iunion Crown`,
        back: $item`unwrapped knock-off retro superhero cape`,
        shirt: $item`Jurassic Parka`,
        weapon: $item`industrial fire extinguisher`,
        "off-hand": $item`Abracandalabra`,
        pants: $item`Cargo Cultist Shorts`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Retrospecs`,
        acc3: $item`Lil' Doctor™ bag`,
      });

      SourceTerminal.educate($skill`Turbo`);
      changeMcd(11);
      ensureEffect($effect`Pride of the Puffin`);
      ensureEffect($effect`Ur-Kel's Aria of Annoyance`);
      withMacro(
        Macro.skill($skill`Turbo`)
          .externalIf(have($item`green mana`), Macro.skill($skill`Giant Growth`))
          .skill($skill`Chest X-Ray`),
        () => {
          useFamiliar($familiar`Stocking Mimic`);
          mapMonster($location`The Haiku Dungeon`, $monster`amateur ninja`);
          runCombat();
        }
      );
      retrieveItem($item`bag of many confections`);
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

    donOutfit("CS Leveling");

    // Depends on Ez's Bastille script.
    cliExecute(`bastille ${myPrimestat() === $stat`Muscle` ? "muscle" : "myst"} brutalist gesture`);

    // Use ten-percent bonus
    tryUse(1, $item`a ten-percent bonus`);

    // Plan is for these buffs to fall all the way through to item -> hot res -> fam weight.
    // ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Lack of Body-Building`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    // Chateau rest
    // while (get("timesRested") < totalFreeRests()) {
    //   visitUrl("place.php?whichplace=chateau&action=chateau_restlabelfree");
    // }

    // Get Holiday Yoked
    // if (!have($effect`Holiday Yoked`) || !have($item`Sacramento wine`)) {
    //   useFamiliar($familiar`Ghost of Crimbo Carols`);
    //   withMacro(
    //     Macro.skill($skill`Micrometeorite`)
    //       .attack()
    //       .repeat(),
    //     () => Witchess.fightPiece($monster`Witchess Bishop`)
    //   );
    // }

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
      useFamiliar($familiar`Hovering Sombrero`);
      for (const effect of $effects`Frostbeard, Intimidating Mien, Pyromania, Rotten Memories, Takin' It Greasy, Your Fifteen Minutes`) {
        ensureEffect(effect);
      }
      donOutfit("CS Leveling");
      equip($item`June cleaver`);
      equip($item`Abracandalabra`);

      Macro.if_("monstername LOV Enforcer", Macro.attack().repeat())
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

    if (get("_snojoFreeFights") < 10 || get("_speakeasyFreeFights") < 3) {
      useDefaultFamiliar();
      donOutfit("CS Leveling 2");
      equip($slot`shirt`, $item`none`);
      while (get("_snojoFreeFights") < 10) {
        if (get("snojoSetting") === null) {
          print("setting mode");
          visitUrl("place.php?whichplace=snojo&action=snojo_controller");
          runChoice(2); // Myst mode;
        }
        adventureMacroAuto($location`The X-32-F Combat Training Snowman`, Macro.attack().repeat());
      }
      while (get("_speakeasyFreeFights") < 3) {
        adventureMacroAuto($location`An Unusually Quiet Barroom Brawl`, Macro.attack().repeat());
      }
      equip($item`makeshift garbage shirt`);
      setAutoAttack(0);
    }

    if (get("_godLobsterFights") < 2) {
      useFamiliar($familiar`God Lobster`);
      donOutfit("CS Leveling 2");
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
      withMacro(
        Macro.skill($skill`Micrometeorite`)
          .attack()
          .repeat(),
        () => Witchess.fightPiece($monster`Witchess King`)
      );
    }

    // Professor 9x free sausage fight @ NEP
    if (sausageFightGuaranteed()) {
      useFamiliar($familiar`Pocket Professor`);
      tryEquip($item`Pocket Professor memory chip`);

      donOutfit("CS Professor", {
        hat: $item`Daylight Shavings Helmet`,
        back: $item`LOV Epaulettes`,
        shirt: $item`makeshift garbage shirt`,
        weapon: $item`Fourth of May Cosplay Saber`,
        "off-hand": $item`Kramco Sausage-o-Matic™`,
        pants: $item`designer sweatpants`,
        acc1: $item`hewn moon-rune spoon`,
        acc2: $item`Brutal brogues`,
        acc3: $item`Beach Comb`,
      });

      adventureMacroAuto(
        $location`Noob Cave`,
        Macro.if_("!monstername sausage goblin", Macro.abort())
          .trySkill($skill`lecture on relativity`)
          .kill()
      );
    }

    while (
      globalOptions.levelAggressively &&
      get("lastCopyableMonster") === $monster`sausage goblin` &&
      get("_backUpUses") < 11
    ) {
      useDefaultFamiliar();
      donOutfit("CS Leveling");
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
      this.ensureInnerElf();

      useDefaultFamiliar();

      donOutfit("CS Leveling 2", {
        hat: $item`Iunion Crown`,
        back: $item`LOV Epaulettes`,
        shirt: $item`makeshift garbage shirt`,
        weapon: $item`Fourth of May Cosplay Saber`,
        "off-hand": $item`familiar scrapbook`,
        pants: $item`Cargo Cultist Shorts`,
        acc1: $item`Cincho de Mayo`,
        acc2: $item`Retrospecs`,
        acc3: $item`Lil' Doctor™ bag`,
      });

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
        Macro.if_(
          "!hasskill Bowl Sideways && hasskill Feel Pride",
          Macro.skill("Feel Pride").trySkill($skill`Cincho: Confetti Extravaganza`)
        )
          .trySkill("Bowl Sideways")
          .externalIf(
            get("_neverendingPartyFreeTurns") === 10,
            Macro.trySkill("Chest X-Ray", "Shattering Punch", "Gingerbread Mob Hit").abort()
          )
          .kill()
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

    this.equalizeStat($stat`Muscle`);

    ensureEffect($effect`Song of Starch`);
    // ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    // ensureEffect($effect`Disdain of the War Snapper`);
    // ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ Balm`);

    if (this.predictedTurns() > 1) {
      useFamiliar($familiar`Left-Hand Man`);

      // FIXME: Outfit
      maximize("hp", false);
    }
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
    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureSong($effect`Power Ballad of the Arrowsmith`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    if (myClass() !== $class`Turtle Tamer`) ensureEffect($effect`Disdain of the War Snapper`);
    ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ Balm`);

    this.equalizeStat($stat`Muscle`);

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

    if (have($item`bag of grain`)) ensureEffect($effect`Nearly All-Natural`);

    this.equalizeStat($stat`Mysticality`);

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
    this.equalizeStat($stat`Moxie`);

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
    return Math.max(
      1,
      60 -
        Math.floor(numericModifier("Item Drop") / 30 + 0.001) -
        Math.floor(numericModifier("Booze Drop") / 15 + 0.001)
    );
  }

  prepare(): void {
    ensureMpSausage(500);

    if (
      !get("latteUnlocks").includes("carrot") &&
      getModifier("Item Drop", $item`latte lovers member's mug`) < 20
    ) {
      useFamiliar($familiar`Frumious Bandersnatch`);
      donOutfit("CS Bander", {
        hat: $item`Daylight Shavings Helmet`,
        back: $item`none`,
        shirt: $item`none`,
        weapon: $item`Fourth of May Cosplay Saber`,
        "off-hand": $item`latte lovers member's mug`,
        pants: $item`designer sweatpants`,
        acc1: $item`Brutal brogues`,
        acc2: $item`Beach Comb`,
        acc3: $item`hewn moon-rune spoon`,
      });
      while (
        !get("latteUnlocks").includes("carrot") &&
        getModifier("Item Drop", $item`latte lovers member's mug`) < 20 &&
        Bandersnatch.couldRunaway()
      ) {
        ensureSong($effect`Ode to Booze`);
        adventureMacro($location`The Dire Warren`, Macro.runaway());
        if (get("latteUnlocks").includes("carrot")) {
          cliExecute("latte refill cinnamon pumpkin carrot");
        }
      }
    }

    useFamiliar($familiar`Trick-or-Treating Tot`);

    if (!have($effect`Bat-Adjacent Form`) || !have($effect`Cosmic Ball in the Air`)) {
      if (get("_reflexHammerUsed") >= 3) throw "Out of reflex hammers!";
      equip($item`vampyric cloake`);
      equip($slot`acc3`, $item`Lil' Doctor™ bag`);
      adventureMacro(
        $location`The Dire Warren`,
        Macro.skill($skill`Become a Bat`)
          .trySkill($skill`Bowl Straight Up`)
          .skill($skill`Reflex Hammer`)
      );
    }

    ensureEffect($effect`Fat Leon's Phat Loot Lyric`);
    ensureEffect($effect`Singer's Faithful Ocelot`);
    ensureEffect($effect`The Spirit of Taking`);
    if (myClass() !== $class`Pastamancer`) {
      ensureEffect($effect`Spice Haze`);
    }
    ensureEffect($effect`items.enh`);

    if (have($item`lavender candy heart`)) {
      ensureEffect($effect`Heart of Lavender`);
    }

    this.context.synthesisPlanner.synthesize($effect`Synthesis: Collection`);

    if (have($item`bag of grain`)) ensureEffect($effect`Nearly All-Natural`);
    ensureEffect($effect`Steely-Eyed Squint`);

    tryEnsureAsdonEffect($effect`Driving Observantly`);

    if (!have($item`oversized sparkler`) && !get("_fireworksShopEquipmentBought")) {
      visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
      buy($item`oversized sparkler`);
    }

    if (!have($item`gold detective badge`)) {
      visitUrl("place.php?whichplace=town_wrong&action=townwrong_precinct");
    }

    cliExecute("fold wad of used tape");
    donOutfit("CS ItemTest", {
      hat: $item`wad of used tape`,
      back: $item`vampyric cloake`,
      shirt: $item`none`,
      weapon: have($item`oversized sparkler`) ? $item`oversized sparkler` : $item`none`,
      "off-hand": $item`unbreakable umbrella`,
      pants: $item`none`,
      acc1: $item`combat lover's locket`,
      acc2: $item`Guzzlr tablet`,
      acc3: $item`Cincho de Mayo`,
    });
    cliExecute("umbrella item");
    equip($item`li'l ninja costume`);

    ensureEffect($effect`Feeling Lost`);

    if (this.predictedTurns() > 1) {
      throw "Uh oh!";
      // Fortune of the Wheel
      // this.context.resources.deck("wheel");
    }

    if (this.predictedTurns() > 3) {
      this.context.resources.wish($effect`Infernal Thirst`);
    }

    if (this.predictedTurns() > 3) {
      // opportunity cost here is substantial - 80k or so if garboing.
      ensureEffect($effect`There's No N in Love`);
    }

    if (this.predictedTurns() > 3) {
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
    // ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    ensureEffect($effect`Feeling Peaceful`);

    // Beach comb buff.
    ensureEffect($effect`Hot-Headed`);

    useFamiliar($familiar`Exotic Parrot`);

    maximize("spooky res, 0.01 familiar weight", false);
    let attempts = 0;
    while (haveEffect($effect`Visions of the Deep Dark Deeps`) < 40 && attempts++ < 5) {
      restoreHp(myMaxhp());
      ensureMpSausage(100);
      useSkill($skill`Deep Dark Visions`);
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
    ensureEffect($effect`Empathy`);

    equip($slot`acc2`, $item`Powerful Glove`);

    new Mood().skill($skill`The Sonata of Sneakiness`).execute();
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

    maximize("-combat, 0.01familiar weight, equip Kremlin's Greatest Briefcase", false);

    tryEnsureAsdonEffect($effect`Driving Stealthily`);

    // Rewards
    if (this.predictedTurns() > 1) {
      ensureEffect($effect`Throwing Some Shade`);
    }

    if (
      this.predictedTurns() > 1 &&
      getClanName() === "Bonus Adventures from Hell" &&
      !get("_floundryItemCreated")
    ) {
      retrieveItem($item`codpiece`);

      maximize("-combat, 0.01familiar weight, equip Kremlin's Greatest Briefcase", false);
    }

    if (this.predictedTurns() > 1) {
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
    ensureEffect($effect`Empathy`);

    // These should have fallen through all the way from leveling.
    // ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    while (
      get("_sausagesEaten") < 3 &&
      !have($effect`Heart of Green`) &&
      !have($item`green candy heart`)
    ) {
      const cost = mpCost($skill`Summon Candy Heart`);
      while (
        myMp() < cost &&
        cost < Math.min(myMaxmp(), myMp() + 999 * clamp(3 - get("_sausagesEaten"), 0, 3))
      ) {
        eat($item`magical sausage`);
      }
      useSkill($skill`Summon Candy Heart`);
    }

    if (have($item`green candy heart`)) {
      ensureEffect($effect`Heart of Green`);
    }

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

    this.context.resources.pull($item`repaid diaper`, 0);

    if (get("commaFamiliar") !== $familiar`Homemade Robot`) {
      if (availableAmount($item`homemade robot gear`) === 0) {
        useFamiliar($familiar`Homemade Robot`);
        this.context.resources.clipArt($item`box of Familiar Jacks`);
        use($item`box of Familiar Jacks`);
      } else {
        retrieveItem($item`homemade robot gear`);
      }

      useFamiliar($familiar`Comma Chameleon`);
      visitUrl(`inv_equip.php?which=2&action=equip&whichitem=${toInt($item`homemade robot gear`)}`);
      visitUrl("charpane.php");
    }

    useFamiliar($familiar`Comma Chameleon`);

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
    if (!have($effect`Do You Crush What I Crush?`) && !have($effect`Holiday Yoked`)) {
      useFamiliar($familiar`Ghost of Crimbo Carols`);
      adventureMacro($location`The Dire Warren`, Macro.skill($skill`Feel Hatred`));
    }

    if (
      $classes`Seal Clubber, Pastamancer`.includes(myClass()) &&
      !have($effect`Saucefingers`) &&
      !have($effect`Elbow Sauce`)
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

    if (myClass() === $class`Seal Clubber` && !get("_barrelPrayer")) {
      ensureEffect($effect`Barrel Chested`);
    }

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

    SongBoom.setSong("These Fists Were Made for Punchin'");

    this.context.resources.pull($item`Stick-Knife of Loathing`, 0);

    // Get flimsy hardwood scraps.
    visitUrl("shop.php?whichshop=lathe");
    if (availableAmount($item`flimsy hardwood scraps`) > 0) {
      retrieveItem(1, $item`ebony epee`);
    }

    // Fight witch while we have +weapon damage set up
    if (!have($item`battle broom`) && get("_witchessFights") < 5) {
      useDefaultFamiliar();
      setAutoAttack(0);
      maximize("Weapon Damage Percent, -equip broken champagne bottle", false);
      equip(
        myPrimestat() === $stat`Mysticality`
          ? $item`Fourth of May Cosplay Saber`
          : $item`June cleaver`
      );
      restoreHp(myMaxhp());
      withMacro(
        Macro.skill($skill`Curse of Weaksauce`, $skill`Micrometeorite`)
          .attack()
          .repeat(),
        () => Witchess.fightPiece($monster`Witchess Witch`)
      );
    }

    this.ensureInnerElf();

    // Paint ungulith (Saber YR)
    if (!get("_photocopyUsed")) {
      useFamiliar($familiar`Melodramedary`);
      equip($item`Fourth of May Cosplay Saber`);
      this.context.propertyManager.setChoices({ [1387]: 3 });
      Macro.skill($skill`Meteor Shower`)
        .trySkill($skill`%fn, spit on me!`)
        .setAutoAttack();
      Macro.skill($skill`Use the Force`).save();
      if (!have($item`photocopied monster`)) {
        chatPrivate("OnlyFax", "ungulith");
        wait(5000);
        cliExecute("fax receive");
        if (get("photocopyMonster") !== $monster`ungulith`) {
          cliExecute("fax send");
          wait(5000);
          cliExecute("fax receive");
        }
      }
      use($item`photocopied monster`);
      runCombat();
      setAutoAttack(0);
    }

    // Corrupted marrow
    ensureEffect($effect`Cowrruption`);

    ensureEffect($effect`Bow-Legged Swagger`);

    useFamiliar($familiar`Disembodied Hand`);

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
    // if (!get("_madTeaParty")) {
    //   visitUrl("clan_viplounge.php?action=lookingglass&whichfloor=2");
    //   retrieveItem($item`mariachi hat`);
    //   ensureEffect($effect`Full Bottle in front of Me`);
    // }

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
      useFamiliar($familiar`Melodramedary`);
      equip($item`Fourth of May Cosplay Saber`);
      adventureMacroAuto(
        $location`The Dire Warren`,
        Macro.skill($skill`Meteor Shower`).trySkill($skill`%fn, spit on me!`),
        Macro.skill($skill`Use the Force`)
      );
    }

    if (have($item`LOV Elixir #6`)) ensureEffect($effect`The Magic of LOV`);

    // Cargo Shorts
    if (!have($effect`Sigils of Yeg`)) {
      if (
        !have($item`Yeg's Motel hand soap`) &&
        !get("_cargoPocketEmptied") &&
        !get("cargoPocketsEmptied").includes("177")
      ) {
        cliExecute("cargo pick 177");
      }
      tryUse(1, $item`Yeg's Motel hand soap`);
    }

    // Get flimsy hardwood scraps.
    visitUrl("shop.php?whichshop=lathe");
    if (availableAmount($item`flimsy hardwood scraps`) > 0) {
      retrieveItem(1, $item`weeping willow wand`);
    }

    if (myClass() === $class`Sauceror` && !get("_barrelPrayer")) {
      ensureEffect($effect`Warlock, Warstock, and Warbarrel`);
    }

    useFamiliar($familiar`Disembodied Hand`);

    cliExecute("briefcase enchantment spell");

    maximize("spell damage", false);

    if (Math.round(numericModifier("Spell Damage Percent")) % 50 >= 40) {
      ensurePotionEffect($effect`Concentration`, $item`cordial of concentration`);
    }
  }
}
