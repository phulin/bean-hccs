import { canAdv } from 'canadv.ash';
import {
  adv1,
  autosell,
  availableAmount,
  buy,
  cliExecute,
  containsText,
  create,
  drink,
  eat,
  equip,
  getCampground,
  getInventory,
  getProperty,
  handlingChoice,
  haveEffect,
  haveSkill,
  itemAmount,
  maximize,
  mpCost,
  myAdventures,
  myBasestat,
  myBuffedstat,
  myClass,
  myGardenType,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  myMp,
  mySpleenUse,
  myTurncount,
  numericModifier,
  print,
  retrieveItem,
  runChoice,
  runCombat,
  setLocation,
  setProperty,
  totalFreeRests,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from 'kolmafia';
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
  adventureMacroAuto,
  get,
  have,
  Mood,
  PropertiesManager,
  TunnelOfLove,
  Witchess,
} from 'libram';
import { withMacro, saberYr, Macro, adventureMacro } from './combat';
import {
  setClan,
  tryUse,
  ensureItem,
  ensureMpTonic,
  ensureCreateItem,
  ensureEffect,
  setChoice,
  entries,
  pullIfPossible,
  ensureSong,
  ensureNpcEffect,
  ensurePullEffect,
  ensureSewerItem,
  mapMonster,
  getPropertyBoolean,
  ensurePotionEffect,
  sausageFightGuaranteed,
  tryEquip,
  ensureMpSausage,
  fuelAsdon,
  myFamiliarWeight,
  ensureOde,
  ensureAsdonEffect,
  wishEffect,
  incrementProperty,
} from './lib';
import { SynthesisPlanner } from './synthesis';

function useDefaultFamiliar() {
  useFamiliar($familiar`Hovering Sombrero`);
}

export const testLog: { [index: string]: { turns: number; seconds: number } } = {};

export type TestContext = {
  propertyManager: PropertiesManager;
  synthesisPlanner: SynthesisPlanner;
};

export abstract class Test {
  context: TestContext;

  constructor(context: TestContext) {
    this.context = context;
  }

  isDone(): boolean {
    return get('csServicesPerformed').includes(this.name);
  }

  run(): void {
    if (!this.isDone()) {
      print();
      print('=======================================');
      print(`Beginning test ${this.constructor.name}.`, 'blue');
      const startTime = Date.now();
      const startTurns = myTurncount();
      this.prepare();
      cliExecute(`outfit save CS ${this.constructor.name}`);
      visitUrl(`choice.php?whichchoice=1089&option=${this.id}`);
      if (!this.isDone()) {
        throw 'Failed to do test " + testNum + ". Maybe we are out of turns.';
      }
      const log = {
        turns: myTurncount() - startTurns,
        seconds: Date.now() - startTime,
      };
      print(
        `Finished test ${this.constructor.name}. ` +
          `Took ${log.seconds} seconds and ${log.turns} turns.`,
        'blue'
      );
      testLog[this.constructor.name] = log;
    }
  }

  abstract get id(): number;
  abstract get name(): string;
  abstract prepare(): void;
}

export class CoilWireTest extends Test {
  get id() {
    return 11;
  }

  get name() {
    return 'Coil Wire';
  }

  prepare() {
    // FIXME: Outfit
    equip($item`Iunion Crown`);
    equip($slot`shirt`, $item`none`);
    equip($item`Fourth of May Cosplay Saber`);
    equip($item`Kramco Sausage-o-Matic™`);
    equip($item`Cargo Cultist Shorts`);
    equip($slot`acc1`, $item`Retrospecs`);
    equip($slot`acc2`, $item`Powerful Glove`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);
  }
}

export class HpTest extends Test {
  get id() {
    return 1;
  }

  get name() {
    return 'Donate Blood';
  }

  prepare() {
    if (!have($effect`That's Just Cloud-Talk, Man`)) {
      visitUrl('place.php?whichplace=campaway&action=campaway_sky');
    }

    // Boxing Daycare
    ensureEffect($effect`Uncucumbered`);

    ensureEffect($effect`Inscrutable Gaze`);
    ensureEffect($effect`Thaumodynamic`);
    ensureEffect($effect`You Learned Something Maybe!`);

    cliExecute('fold makeshift garbage shirt');

    // FIXME: Outfit
    equip($item`Iunion Crown`);
    equip($slot`shirt`, $item`makeshift garbage shirt`);
    equip($item`Fourth of May Cosplay Saber`);
    equip($item`Kramco Sausage-o-Matic™`);
    equip($item`Cargo Cultist Shorts`);
    equip($slot`acc1`, $item`Retrospecs`);
    equip($slot`acc2`, $item`Powerful Glove`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

    // Prep Sweet Synthesis.
    if (myGardenType() === 'peppermint') {
      cliExecute('garden pick');
    } else {
      print(
        'WARNING: This script is built for peppermint garden. Switch gardens or find other candy.',
        'red'
      );
    }

    if (!have($effect`Holiday Yoked`)) {
      useFamiliar($familiar`Ghost of Crimbo Carols`);
      adventureMacro($location`Noob Cave`, Macro.skill($skill`Reflex Hammer`));
    }

    if (availableAmount($item`li'l ninja costume`) === 0 && !get('_bagOfCandy')) {
      withMacro(Macro.skill('Chest X-Ray'), () => {
        ensureMpTonic(50);
        useFamiliar($familiar`Stocking Mimic`);
        mapMonster($location`The Haiku Dungeon`, $monster`amateur ninja`);
        runCombat();
      });
    }

    if (get('_candySummons') === 0) {
      useSkill(1, $skill`Summon Crimbo Candy`);
    }

    useSkill(1, $skill`Chubby and Plump`);

    this.context.synthesisPlanner.synthesize($effect`Synthesis: Learning`);
    this.context.synthesisPlanner.synthesize($effect`Synthesis: Smart`);

    // Use ten-percent bonus
    tryUse(1, $item`a ten-percent bonus`);

    ensureEffect($effect`Favored by Lyle`);
    ensureEffect($effect`Starry-Eyed`);
    ensureEffect($effect`Triple-Sized`);
    ensureEffect($effect`We're All Made of Starfish`); // Beach Comb - should bridge all the way to spell dmg.
    ensureSong($effect`The Magical Mojomuscular Melody`);
    ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);

    if (!have($effect`On The Shoulders of Giants`)) {
      buy($item`Dramatic™ range`);
      use($item`Dramatic™ range`);
      useSkill($skill`Advanced Saucecrafting`);
      cliExecute('cargo pocket tangerine');
      create($item`Hawking's Elixir of Brilliance`);
      use($item`Hawking's Elixir of Brilliance`);
    }

    if (!have($effect`Purity of Spirit`)) {
      create($item`cold-filtered water`);
      use($item`cold-filtered water`);
    }

    // Plan is for these buffs to fall all the way through to item -> hot res -> fam weight.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    // Chateau rest
    while (get('timesRested') < totalFreeRests()) {
      visitUrl('place.php?whichplace=chateau&action=chateau_restbox');
    }

    ensureEffect($effect`Song of Bravado`);

    // Should be 50% myst for now.
    ensureEffect($effect`Blessing of your favorite Bird`);

    if (availableAmount($item`flask of baconstone juice`) > 0) {
      ensureEffect($effect`Baconstoned`);
    }

    if (getProperty('boomBoxSong') !== 'Total Eclipse of Your Meat') {
      cliExecute('boombox meat');
    }

    // Get buff things
    ensureSewerItem(1, $item`turtle totem`);
    ensureSewerItem(1, $item`saucepan`);

    // Breakfast:

    // Visiting Looking Glass in clan VIP lounge
    visitUrl('clan_viplounge.php?action=lookingglass&whichfloor=2');

    // Don't use Kramco here.
    equip($slot`off-hand`, $item`none`);

    const mood = new Mood();
    mood.skill($skill`Astral Shell`);
    mood.skill($skill`Get Big`);
    mood.skill($skill`Blood Bond`);
    mood.skill($skill`Blood Bubble`);
    mood.skill($skill`Carol of the Hells`);
    mood.skill($skill`Elemental Saucesphere`);
    mood.skill($skill`Empathy`);
    mood.skill($skill`Inscrutable Gaze`);
    mood.skill($skill`Leash of Linguini`);
    mood.skill($skill`Pride of the Puffin`);
    mood.skill($skill`Singer's Faithful Ocelot`);
    mood.skill($skill`Stevedave's Shanty of Superiority`);
    mood.execute();

    // LOV Tunnel
    if (!TunnelOfLove.isUsed()) {
      while (myMp() - mpCost($skill`Summon Candy Heart`) > 200) {
        useSkill(1, $skill`Summon Candy Heart`);
      }
      useDefaultFamiliar();
      Macro.if_('monstername LOV Enforcer', Macro.attack().repeat())
        .if_('monstername LOV Engineer', Macro.skill($skill`Saucegeyser`).repeat())
        .if_('monstername LOV Equivocator', Macro.pickpocket().kill())
        .setAutoAttack();

      TunnelOfLove.fightAll(
        'LOV Epaulettes',
        'Open Heart Surgery',
        'LOV Extraterrestrial Chocolate'
      );

      if (handlingChoice()) throw 'Did not get all the way through LOV.';

      if (itemAmount($item`LOV Extraterrestrial Chocolate`) > 0) {
        use($item`LOV Extraterrestrial Chocolate`);
      }

      equip($item`LOV Epaulettes`);
    }

    // Professor 9x free sausage fight @ NEP
    if (sausageFightGuaranteed()) {
      useFamiliar($familiar`Pocket Professor`);
      tryEquip($item`Pocket Professor memory chip`);

      // FIXME: Outfit
      equip($item`Kramco Sausage-o-Matic™`);
      equip($slot`acc1`, $item`hewn moon-rune spoon`);
      equip($slot`acc2`, $item`Brutal brogues`);
      equip($slot`acc3`, $item`Beach Comb`);

      adventureMacroAuto(
        $location`Noob Cave`,
        Macro.trySkill(Skill.get('Lecture on Relativity')).kill()
      );
    }

    if (get('_godLobsterFights') < 2) {
      useFamiliar($familiar`God Lobster`);
      this.context.propertyManager.setChoices({ [1310]: 1 });
      while (get('_godLobsterFights') < 2) {
        tryEquip($item`God Lobster's Scepter`);
        visitUrl('main.php?fightgodlobster=1');
        runCombat();
        visitUrl('choice.php');
        if (handlingChoice()) runChoice(1);
      }
    }

    // 17 free NEP fights
    while (
      get('_neverendingPartyFreeTurns') < 10 ||
      get('_chestXRayUsed') < 3 ||
      get('_shatteringPunchUsed') < 3 ||
      !getPropertyBoolean('_gingerbreadMobHitUsed')
    ) {
      useDefaultFamiliar();

      // NEP noncombat. Fight.
      setChoice(1324, 5);

      adventureMacroAuto(
        $location`The Neverending Party`,
        Macro.externalIf(
          get('_neverendingPartyFreeTurns') < 10,
          Macro.trySkill('Chest X-Ray', 'Shattering Punch', 'Gingerbread Mob Hit')
        ).kill()
      );
    }

    // Reset location so maximizer doesn't get confused.
    setLocation($location`none`);

    if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
    else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

    ensureEffect($effect`Song of Starch`);
    ensureEffect($effect`Big`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    ensureEffect($effect`Disdain of the War Snapper`);
    ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ balm`);

    useFamiliar($familiar`Left-Hand Man`);

    // FIXME: Outfit
    maximize('hp', false);
  }
}

export class MuscleTest extends Test {
  get id() {
    return 3;
  }

  get name() {
    return 'Feed The Children';
  }

  prepare() {
    if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
    else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

    ensureEffect($effect`Song of Bravado`);
    ensureEffect($effect`Big`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureSong($effect`Power Ballad of the Arrowsmith`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Quiet Determination`);
    ensureEffect($effect`Disdain of the War Snapper`);
    ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ balm`);

    useFamiliar($familiar`Left-Hand Man`);
    maximize('muscle', false);

    for (const increaser of [
      () => ensureEffect($effect`Lack of Body-Building`), // will stay on all the way to weapon damage.
      () => ensureEffect($effect`Ham-Fisted`),
    ]) {
      if (myBuffedstat($stat`muscle`) - myBasestat($stat`mysticality`) < 1770) increaser();
    }
    if (myBuffedstat($stat`muscle`) - myBasestat($stat`mysticality`) < 1770) {
      throw 'Not enough muscle to cap.';
    }
  }
}

export class MysticalityTest extends Test {
  get id() {
    return 3;
  }

  get name() {
    return 'Build Playground Mazes';
  }

  prepare() {
    ensureEffect($effect`Big`);
    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureSong($effect`The Magical Mojomuscular Melody`);
    ensureEffect($effect`Quiet Judgement`);
    ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);
    cliExecute('retrocape mysticality');

    useFamiliar($familiar`Left-Hand Man`);
    maximize('mysticality', false);
    if (myBuffedstat($stat`mysticality`) - myBasestat($stat`mysticality`) < 1770) {
      throw 'Not enough mysticality to cap.';
    }
  }
}

export class MoxieTest extends Test {
  get id() {
    return 4;
  }

  get name() {
    return 'Feed Conspirators';
  }

  prepare() {
    if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Penne Dreadful`);
    else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

    // Beach Comb
    ensureEffect($effect`Pomp & Circumsands`);

    use(1, $item`Bird-a-Day Calendar`);
    ensureEffect($effect`Blessing of the Bird`);

    ensureEffect($effect`Big`);
    ensureEffect($effect`Song of Bravado`);
    ensureSong($effect`Stevedave's Shanty of Superiority`);
    ensureSong($effect`The Moxious Madrigal`);
    ensureEffect($effect`Quiet Desperation`);
    ensureEffect($effect`Disco Fever`);
    ensureEffect($effect`Blubbered Up`);
    ensureEffect($effect`Mariachi Mood`);
    ensureNpcEffect($effect`Butt-Rock Hair`, 5, $item`hair spray`);
    use(availableAmount($item`rhinestone`), $item`rhinestone`);
    if (!have($effect`Unrunnable Face`)) {
      tryUse(1, $item`runproof mascara`);
    }
    cliExecute('retrocape moxie');

    useFamiliar($familiar`Left-Hand Man`);
    maximize('moxie', false);
    if (myBuffedstat($stat`moxie`) - myBasestat($stat`mysticality`) < 1770) {
      throw 'Not enough moxie to cap.';
    }
  }
}

export class ItemTest extends Test {
  get id() {
    return 9;
  }

  get name() {
    return 'Make Margaritas';
  }

  prepare() {
    ensureMpSausage(500);

    useFamiliar($familiar`Trick-or-Treating Tot`);

    if (haveEffect($effect`Bat-Adjacent Form`) === 0) {
      if (get('_reflexHammerUsed') >= 3) throw 'Out of reflex hammers!';
      equip($item`vampyric cloake`);
      equip($slot`acc3`, $item`Lil' Doctor™ Bag`);
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
    ensureEffect($effect`Fortune of the Wheel`);
    ensureEffect($effect`Steely-Eyed Squint`);

    // FIXME: Outfit
    maximize(
      'item, 2 booze drop, -equip broken champagne bottle, -equip surprisingly capacious handbag',
      false
    );

    const itemTurns = () =>
      60 -
      Math.floor(numericModifier('item drop') / 30) -
      Math.floor(numericModifier('booze drop') / 15);

    if (itemTurns() > 1 && !getPropertyBoolean('_clanFortuneBuffUsed')) {
      print('Not enough item drop, using fortune buff.');
      ensureEffect($effect`There's No N In Love`);
    }

    if (itemTurns() > 1) throw 'Not enough item drop! Figure out why.';
    if (itemTurns() > 1) {
      print('Not enough item drop, using Infernal Thirst.');
      wishEffect($effect`Infernal Thirst`);
    }
  }
}

export class HotTest extends Test {
  get id() {
    return 10;
  }

  get name() {
    return 'Clean Steam Tunnels';
  }

  prepare() {
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
          .skill($skill`Fire Extinguisher: Foam 'Em Up`)
          .skill($skill`Use the Force`)
      );
    }

    // These should have fallen through all the way from leveling.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    // Pool buff. This will fall through to fam weight.
    ensureEffect($effect`Billiards Belligerence`);

    if (
      availableAmount($item`sleaze powder`) > 0 ||
      availableAmount($item`lotion of sleaziness`) > 0
    ) {
      ensurePotionEffect($effect`Sleazy Hands`, $item`lotion of sleaziness`);
    }

    ensureEffect($effect`Elemental Saucesphere`);
    ensureEffect($effect`Astral Shell`);
    if (haveEffect($effect`Feeling Peaceful`) === 0) useSkill($skill`Feel Peaceful`);

    // Build up 50 turns of Deep Dark Visions for spell damage later.
    while (
      haveSkill($skill`Deep Dark Visions`) &&
      haveEffect($effect`Visions of the Deep Dark Deeps`) < 50
    ) {
      if (myMp() < 20) {
        ensureCreateItem(1, $item`magical sausage`);
        eat(1, $item`magical sausage`);
      }
      while (myHp() < myMaxhp()) {
        useSkill(1, $skill`Cannelloni Cocoon`);
      }
      if (myMp() < 100) {
        ensureCreateItem(1, $item`magical sausage`);
        eat(1, $item`magical sausage`);
      }
      if (Math.round(numericModifier('spooky resistance')) < 10) {
        ensureEffect($effect`Does It Have a Skull In There??`);
        if (Math.round(numericModifier('spooky resistance')) < 10) {
          throw 'Not enough spooky res for Deep Dark Visions.';
        }
      }
      useSkill(1, $skill`Deep Dark Visions`);
    }

    // Beach comb buff.
    ensureEffect($effect`Hot-Headed`);

    useFamiliar($familiar`Exotic Parrot`);
    if (availableAmount($item`cracker`) === 0) {
      retrieveItem(1, $item`box of Familiar jacks`);
      use(1, $item`box of Familiar Jacks`);
    }
    equip($item`cracker`);

    cliExecute('retrocape vampire hold');

    // Mafia sometimes can't figure out that multiple +weight things would get us to next tier.
    // FIXME: Outfit
    maximize('hot res, 0.01 familiar weight', false);

    // OK to waste a couple turns here
    if (Math.round(numericModifier('hot resistance')) < 59) {
      ensurePullEffect($effect`Fireproof Lips`, $item`SPF 451 lip balm`);
    }

    if (Math.round(numericModifier('hot resistance')) < 59) {
      throw 'Something went wrong building hot res.';
    }
  }
}

export class NoncombatTest extends Test {
  get id() {
    return 8;
  }

  get name() {
    return 'Be a Living Statue';
  }

  prepare() {
    if (getProperty('_horsery') !== 'dark horse') cliExecute('horsery dark');

    if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
    ensureEffect($effect`Blood Bond`);
    ensureEffect($effect`Leash of Linguini`);
    ensureEffect($effect`Empathy`);

    // These should have fallen through all the way from leveling.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    equip($slot`acc3`, $item`Powerful Glove`);

    ensureEffect($effect`The Sonata of Sneakiness`);
    ensureEffect($effect`Smooth Movements`);
    ensureEffect($effect`Invisible Avatar`);
    ensureEffect($effect`Silent Running`);
    ensureEffect($effect`Become Superficially Interested`);
    ensureEffect($effect`Feeling Lonely`);

    useFamiliar($familiar`Disgeist`);

    // Pastamancer d1 is -combat.
    ensureEffect($effect`Blessing of the Bird`);
    ensureEffect($effect`Blessing of your favorite Bird`);

    maximize("-combat, 0.0familiar weight, equip Kremlin's Greatest Briefcase", false);

    // Rewards
    ensureEffect($effect`Throwing Some Shade`);

    if (Math.round(numericModifier('combat rate')) > -40) {
      throw 'Not enough -combat to cap.';
    }
  }
}

export class FamiliarTest extends Test {
  get id() {
    return 5;
  }

  get name() {
    return 'Breed More Collies';
  }

  prepare() {
    if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
    ensureEffect($effect`Blood Bond`);
    ensureEffect($effect`Leash of Linguini`);
    ensureEffect($effect`Empathy`);

    // These should have fallen through all the way from leveling.
    ensureEffect($effect`Fidoxene`);
    ensureEffect($effect`Do I Know You From Somewhere?`);
    ensureEffect($effect`Puzzle Champ`);
    ensureEffect($effect`Billiards Belligerence`);

    if (availableAmount($item`rope`) === 0) cliExecute('play rope');

    if (haveEffect($effect`Meteor Showered`) === 0) {
      equip($item`Fourth of May Cosplay Saber`);
      useFamiliar($familiar`none`);
      adventureMacro(
        $location`The Dire Warren`,
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
      );
      if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty('_meteorShowerUses');
    }

    // NC reward
    ensureEffect($effect`Robot Friends`);

    useFamiliar($familiar`Exotic Parrot`);
    maximize('familiar weight', false);
  }
}

export class WeaponTest extends Test {
  get id() {
    return 6;
  }

  get name() {
    return 'Reduce Gazelle Population';
  }

  prepare() {
    if (haveEffect($effect`Do You Crush What I Crush?`) === 0) {
      if (get('_reflexHammerUsed') >= 3) throw 'Out of reflex hammers!';
      useFamiliar($familiar`Ghost of Crimbo Carols`);
      equip($slot`acc3`, $item`Lil' Doctor™ Bag`);
      adventureMacro($location`The Dire Warren`, Macro.skill($skill`Reflex Hammer`));
    }

    ensureEffect($effect`Carol of the Bulls`);
    ensureEffect($effect`Song of the North`);
    ensureEffect($effect`Rage of the Reindeer`);
    ensureEffect($effect`Frenzied, Bloody`);
    ensureEffect($effect`Scowl of the Auk`);
    ensureEffect($effect`Disdain of the War Snapper`);
    ensureEffect($effect`Tenacity of the Snapper`);
    ensureSong($effect`Jackasses' Symphony of Destruction`);

    if (availableAmount($item`vial of hamethyst juice`) > 0) {
      ensureEffect($effect`Ham-Fisted`);
    }

    // Beach Comb
    if (!containsText(getProperty('_beachHeadsUsed'), '6')) {
      ensureEffect($effect`Lack of Body-Building`);
    }

    if (availableAmount($item`LOV Elixir #3`) > 0) ensureEffect($effect`The Power of LOV`);

    // Pastamancer d1 is weapon damage.
    ensureEffect($effect`Blessing of the Bird`);

    // Get flimsy hardwood scraps.
    visitUrl('shop.php?whichshop=lathe');
    if (availableAmount($item`flimsy hardwood scraps`) > 0) {
      retrieveItem(1, $item`weeping willow wand`);
    }

    // Paint ungulith (Saber YR)
    if (!getPropertyBoolean('_chateauMonsterFought')) {
      equip($item`Fourth of May Cosplay Saber`);
      this.context.propertyManager.setChoices({ [1387]: 3 });
      Macro.skill($skill`Meteor Shower`)
        .skill($skill`Use the Force`)
        .setAutoAttack();
      visitUrl('place.php?whichplace=chateau&action=chateau_painting', false);
      runCombat();
      saberYr();
    }

    // Corrupted marrow
    ensureEffect($effect`Cowrruption`);

    ensureEffect($effect`Bow-Legged Swagger`);

    // FIXME: Outfit
    maximize('weapon damage', false);

    const weaponTurns = () =>
      60 -
      Math.floor(numericModifier('weapon damage') / 25 + 0.001) -
      Math.floor(numericModifier('weapon damage percent') / 25 + 0.001);

    if (weaponTurns() >= 7) {
      wishEffect($effect`Outer Wolf`);
    }

    if (weaponTurns() > 2) {
      throw 'Something went wrong with weapon damage.';
    }
  }
}

export class SpellTest extends Test {
  get id() {
    return 7;
  }

  get name() {
    return 'Make Sausage';
  }

  prepare() {
    ensureEffect($effect`Simmering`);

    ensureEffect($effect`Song of Sauce`);
    ensureEffect($effect`Carol of the Hells`);
    ensureEffect($effect`Arched Eyebrow of the Archmage`);
    ensureSong($effect`Jackasses' Symphony of Destruction`);

    // Pool buff
    ensureEffect($effect`Mental A-cue-ity`);

    // Beach Comb
    ensureEffect($effect`We're All Made of Starfish`);

    // Tea party
    if (!getPropertyBoolean('_madTeaParty')) {
      ensureSewerItem(1, $item`mariachi hat`);
      ensureEffect($effect`Full Bottle in front of Me`);
    }

    useSkill(1, $skill`Spirit of Cayenne`);

    if (availableAmount($item`flask of baconstone juice`) > 0) {
      ensureEffect($effect`Baconstoned`);
    }

    pullIfPossible(1, $item`Staff of Simmering Hatred`, 0);

    ensurePullEffect($effect`Pisces in the Skyces`, $item`tobiko marble soda`);

    useSkill(1, $skill`Summon Sugar Sheets`);
    if (availableAmount($item`sugar chapeau`) === 0 && availableAmount($item`sugar sheet`) > 0) {
      create(1, $item`sugar chapeau`);
    }

    if (haveEffect($effect`Meteor Showered`) === 0 && get('_meteorShowerUses') < 5) {
      equip($item`Fourth of May Cosplay Saber`);
      adventureMacroAuto(
        $location`The Dire Warren`,
        Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`)
      );
      if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty('_meteorShowerUses');
    }

    if (availableAmount($item`LOV Elixir #6`) > 0) ensureEffect($effect`The Magic of LOV`);

    useFamiliar($familiar`Left-Hand Man`);

    maximize('spell damage', false);

    if (Math.round(numericModifier('spell damage percent')) % 50 >= 40) {
      ensureItem(1, $item`soda water`);
      ensurePotionEffect($effect`Concentration`, $item`cordial of concentration`);
    }

    const spellTurns = () =>
      60 -
      Math.floor(numericModifier('spell damage') / 50 + 0.001) -
      Math.floor(numericModifier('spell damage percent') / 50 + 0.001);

    while (spellTurns() > myAdventures()) {
      eat(1, $item`magical sausage`);
    }

    if (spellTurns() > 22) {
      throw 'Something went wrong with spell damage.';
    }
  }
}
