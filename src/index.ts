import { canAdv } from 'canadv.ash';
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
  retrieveItem,
  useSkill,
  numericModifier,
  myBasestat,
  myBuffedstat,
  containsText,
  setProperty,
  getProperty,
  myLevel,
  mySpleenUse,
  runChoice,
  myTurncount,
  myHp,
  myMaxhp,
  myGardenType,
  totalFreeRests,
  myClass,
  adv1,
  runCombat,
  handlingChoice,
  haveSkill,
  setLocation,
  maximize,
  myInebriety,
  drink,
  getCampground,
  myMp,
  myAdventures,
  create,
  floor,
  myMeat,
  npcPrice,
  itemAmount,
} from 'kolmafia';
import { $familiar, $item, $effect, $effects, $skill, $slot, $location, $stat, $monster, $class } from 'libram/src';
import {
  adventureKill,
  MODE_NULL,
  findMonsterSaberYr,
  adventureRunUnlessFree,
  adventureMacro,
  saberYr,
  Macro,
  setMode as setCombatMode,
  MODE_MACRO,
  adventureIfFree,
  setMode,
} from './combat';
import {
  ensureEffect,
  ensureItem,
  ensureMpTonic,
  getPropertyInt,
  sausageFightGuaranteed,
  setChoice,
  setClan,
  ensureCreateItem,
  getPropertyBoolean,
  ensureNpcEffect,
  ensureSewerItem,
  ensurePotionEffect,
  ensureMpSausage,
  myFamiliarWeight,
  ensureAsdonEffect,
  incrementProperty,
  mapMonster,
  fuelAsdon,
  ensurePullEffect,
  pullIfPossible,
  tryEquip,
  tryUse,
  wishEffect,
  ensureOde,
  ensureSong,
} from './lib';
import { SynthesisPlanner } from './synthesis';

enum Test {
  HP = 1,
  MUS = 2,
  MYS = 3,
  MOX = 4,
  FAMILIAR = 5,
  WEAPON = 6,
  SPELL = 7,
  NONCOMBAT = 8,
  ITEM = 9,
  HOT_RES = 10,
  COIL_WIRE = 11,
  DONATE = 30,
}

const defaultFamiliar = $familiar`Melodramedary`;
const defaultFamiliarEquipment = $item`dromedary drinking helmet`;

function useDefaultFamiliar() {
  useFamiliar(defaultFamiliar);
  if (defaultFamiliarEquipment !== $item`none` && availableAmount(defaultFamiliarEquipment) > 0) {
    equip(defaultFamiliarEquipment);
  }
}

function summonBrickoOyster(maxSummons: number) {
  if (getPropertyInt('_brickoFights') >= 3) return false;
  if (availableAmount($item`BRICKO oyster`) > 0) return true;
  while (
    getPropertyInt('libramSummons') < maxSummons &&
    (availableAmount($item`BRICKO eye brick`) < 1 || availableAmount($item`BRICKO brick`) < 8)
  ) {
    useSkill(1, $skill`Summon BRICKOs`);
  }
  return use(8, $item`BRICKO brick`);
}

function fightSausageIfGuaranteed() {
  if (sausageFightGuaranteed()) {
    equip($item`Iunion Crown`);
    equip($slot`shirt`, $item`none`);
    equip($item`Fourth of May Cosplay Saber`);
    equip($item`Kramco Sausage-o-Matic™`);
    equip($item`pantogram pants`);
    equip($slot`acc1`, $item`Eight Days a Week Pill Keeper`);
    equip($slot`acc2`, $item`Powerful Glove`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

    useDefaultFamiliar();

    adventureKill($location`Noob Cave`);
  }
}

function testDone(testNum: number) {
  print(`Checking test ${testNum}...`);
  const text = visitUrl('council.php');
  return !containsText(text, `<input type=hidden name=option value=${testNum}>`);
}

function doTest(testNum: number) {
  if (!testDone(testNum)) {
    visitUrl(`choice.php?whichchoice=1089&option=${testNum}`);
    if (!testDone(testNum)) {
      throw 'Failed to do test " + testNum + ". Maybe we are out of turns.';
    }
  } else {
    print(`Test ${testNum} already completed.`);
  }
}

// Sweet Synthesis plan.
// This is the sequence of synthesis effects; we will, if possible, come up with a plan for allocating candy to each of these.
const synthesisPlanner = new SynthesisPlanner(
  $effects`Synthesis: Learning, Synthesis: Smart, Synthesis: Strong, Synthesis: Cool, Synthesis: Collection, Synthesis: Hot`
);

// Don't buy stuff from NPC stores.
setProperty('_saved_autoSatisfyWithNPCs', getProperty('autoSatisfyWithNPCs'));
setProperty('autoSatisfyWithNPCs', 'false');

// Do buy stuff from coinmasters (hermit).
setProperty('_saved_autoSatisfyWithCoinmasters', getProperty('autoSatisfyWithCoinmasters'));
setProperty('autoSatisfyWithCoinmasters', 'true');

// Initialize council.
visitUrl('council.php');

// All combat handled by our consult script (hccs_combat.ash).
cliExecute('ccs bean-hccs');

// Turn off Lil' Doctor quests.
setChoice(1340, 3);

// Default equipment.
equip($item`Iunion Crown`);
equip($slot`shirt`, $item`none`);
equip($item`vampyric cloake`);
equip($item`Fourth of May Cosplay Saber`);
equip($item`Kramco Sausage-o-Matic™`);
equip($item`old sweatpants`);
equip($slot`acc1`, $item`Eight Days a Week Pill Keeper`);
equip($slot`acc2`, $item`Powerful Glove`);
equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

if (!testDone(Test.COIL_WIRE)) {
  setClan('Bonus Adventures from Hell');

  if (getPropertyInt('_clanFortuneConsultUses') < 3) {
    while (getPropertyInt('_clanFortuneConsultUses') < 3) {
      cliExecute('fortune cheesefax');
      cliExecute('wait 5');
    }
  }

  if (myLevel() === 1 && mySpleenUse() === 0) {
    while (getPropertyInt('_universeCalculated') < getPropertyInt('skillLevel144')) {
      cliExecute('numberology 69');
    }
  }

  // Chateau juice bar
  visitUrl('place.php?whichplace=chateau&action=chateau_desk2');
  autosell(1, $item`gremlin juice`);

  // Sell pork gems + tent
  visitUrl('tutorial.php?action=toot');
  tryUse(1, $item`letter from King Ralph XI`);
  tryUse(1, $item`pork elf goodies sack`);
  autosell(5, $item`baconstone`);
  autosell(5, $item`porquoise`);
  autosell(5, $item`hamethyst`);

  // Buy toy accordion
  ensureItem(1, $item`toy accordion`);

  /* ensureSong($effect`The Magical Mojomuscular Melody`);
  ensureMpTonic(2 * Math.max(0, 1 - getPropertyInt('tomeSummons')));
  useSkill(Math.max(0, 1 - getPropertyInt('tomeSummons')), $skill`Summon Smithsness`);

  // In case the script screws up.
  if (availableAmount($item`Louder Than Bomb`) === 0 && availableAmount($item`handful of smithereens`) > 0) {
    ensureItem(1, $item`Ben-Gal™ balm`);
    ensureCreateItem(1, $item`Louder Than Bomb`);
  } */

  // Upgrade saber for fam wt
  visitUrl('main.php?action=may4');
  runChoice(4);

  // Vote.
  visitUrl('place.php?whichplace=town_right&action=townright_vote');
  visitUrl('choice.php?option=1&whichchoice=1331&g=2&local%5B%5D=2&local%5B%5D=3');
  // Make sure initiative-tracking works.
  visitUrl('place.php?whichplace=town_right&action=townright_vote');

  // Pantogram.
  // Hilarity is better for later farming than NC
  if (availableAmount($item`pantogram pants`) === 0) {
    cliExecute('pantogram mysticality|hot|drops of blood|hilarity|your dreams|silent');
  }

  // Put on some regen gear
  equip($item`Iunion Crown`);
  equip($slot`shirt`, $item`none`);
  equip($item`Fourth of May Cosplay Saber`);
  equip($item`Kramco Sausage-o-Matic™`);
  equip($item`Cargo Cultist Shorts`);
  equip($slot`acc1`, $item`Eight Days a Week Pill Keeper`);
  equip($slot`acc2`, $item`Powerful Glove`);
  equip($slot`acc3`, $item`Retrospecs`);

  if (defaultFamiliar === $familiar`Melodramedary` && getPropertyInt('_sausageFights') === 0) {
    useDefaultFamiliar();
    retrieveItem(1, $item`box of Familiar Jacks`);
    use(1, $item`box of Familiar Jacks`);
    equip($item`dromedary drinking helmet`);
    ensureMpTonic(30);
    adventureMacro($location`Noob Cave`, Macro.kill());
  }

  ensureCreateItem(1, $item`borrowed time`);
  use(1, $item`borrowed time`);

  // QUEST - Coil Wire
  doTest(Test.COIL_WIRE);
}

if (myTurncount() < 60) throw 'Something went wrong coiling wire.';

if (!testDone(Test.HP)) {
  if (haveEffect($effect`That's Just Cloud-Talk, Man`) === 0) {
    visitUrl('place.php?whichplace=campaway&action=campaway_sky');
  }

  const lovePotion = $item`Love Potion #0`;
  const loveEffect = $effect`Tainted Love Potion`;
  if (haveEffect(loveEffect) === 0) {
    if (availableAmount(lovePotion) === 0) {
      useSkill(1, $skill`Love Mixology`);
    }
    visitUrl(`desc_effect.php?whicheffect=${loveEffect.descid}`);
    if (
      numericModifier(loveEffect, 'mysticality') > 10 &&
      numericModifier(loveEffect, 'muscle') > -30 &&
      numericModifier(loveEffect, 'moxie') > -30 &&
      numericModifier(loveEffect, 'maximum hp percent') > -0.001
    ) {
      use(1, lovePotion);
    }
  }

  if (availableAmount($item`Flaskfull of Hollow`) > 0) {
    ensureEffect($effect`Merry Smithsness`);
  }

  // Boxing Daycare
  ensureEffect($effect`Uncucumbered`);

  // Cast inscrutable gaze
  ensureEffect($effect`Inscrutable Gaze`);

  // Shower lukewarm
  ensureEffect($effect`Thaumodynamic`);

  // Beach Comb
  ensureEffect($effect`You Learned Something Maybe!`);

  // Configure briefcase
  cliExecute('briefcase enchantment weapon hot -combat');
  while (getPropertyInt('_kgbClicksUsed') < 20) {
    cliExecute('briefcase buff random');
  }

  // Depends on Ez's Bastille script.
  cliExecute('bastille myst brutalist');

  if (getProperty('_horsery') !== 'crazy horse') cliExecute('horsery crazy');

  equip($item`Iunion Crown`);
  equip($slot`shirt`, $item`none`);
  equip($item`Fourth of May Cosplay Saber`);
  equip($item`Kramco Sausage-o-Matic™`);
  equip($item`pantogram pants`);
  equip($slot`acc1`, $item`Retrospecs`);
  equip($slot`acc2`, $item`Powerful Glove`);
  equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

  cliExecute('terminal educate portscan');

  if (getPropertyInt('_brickoFights') === 0 && summonBrickoOyster(7) && availableAmount($item`BRICKO oyster`) > 0) {
    if (availableAmount($item`bag of many confections`) > 0) throw 'We should not have a bag yet.';
    useFamiliar($familiar`Stocking Mimic`);
    equip($slot`familiar`, $item`none`);
    if (myHp() < 0.8 * myMaxhp()) {
      visitUrl('clan_viplounge.php?where=hottub');
    }
    ensureMpTonic(32);
    setCombatMode(
      MODE_MACRO,
      Macro.skill($skill`Otoscope`)
        .skill($skill`Portscan`) // NEXT FIGHT PREPPED
        .kill()
        .toString()
    );
    use(1, $item`BRICKO oyster`);
    autosell(1, $item`BRICKO pearl`);
    setCombatMode(MODE_NULL);
    equip($slot`familiar`, $item`none`);
  }

  if (availableAmount($item`government cheese`) + availableAmount($item`government`) === 0) {
    equip($slot`Off-Hand`, $item`none`);
    setChoice(1387, 3); // Force drop items.
    adventureMacro($location`Noob Cave`, Macro.skill($skill`Use the Force`));
    equip($slot`Off-Hand`, $item`Kramco Sausage-o-Matic™`);
  }

  // Prep Sweet Synthesis.
  if (myGardenType() === 'peppermint') {
    cliExecute('garden pick');
  } else {
    print('WARNING: This script is built for peppermint garden. Switch gardens or find other candy.');
  }

  if (getPropertyInt('_candySummons') === 0) {
    useSkill(1, $skill`Summon Crimbo Candy`);
  }

  useSkill(1, $skill`Chubby and Plump`);

  synthesisPlanner.synthesize($effect`Synthesis: Learning`);
  synthesisPlanner.synthesize($effect`Synthesis: Smart`);

  if (Math.round(numericModifier('mysticality experience percent')) < 100) {
    throw 'Insufficient +stat%.';
  }

  // Use ten-percent bonus
  tryUse(1, $item`a ten-percent bonus`);

  ensureEffect($effect`Favored by Lyle`);
  ensureEffect($effect`Starry-Eyed`);
  ensureEffect($effect`Triple-Sized`);
  ensureEffect($effect`We're All Made of Starfish`); // Beach Comb - should bridge all the way to spell dmg.
  ensureSong($effect`The Magical Mojomuscular Melody`);
  ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);

  // Plan is for these buffs to fall all the way through to item -> hot res -> fam weight.
  ensureEffect($effect`Fidoxene`);
  ensureEffect($effect`Do I Know You From Somewhere?`);
  ensureEffect($effect`Billiards Belligerence`);

  // Chateau rest
  while (getPropertyInt('timesRested') < 3) {
    visitUrl('place.php?whichplace=chateau&action=chateau_restbox');
  }

  while (summonBrickoOyster(12) && availableAmount($item`BRICKO oyster`) > 0) {
    useDefaultFamiliar();
    if (myHp() < 0.8 * myMaxhp()) {
      visitUrl('clan_viplounge.php?where=hottub');
    }
    ensureMpTonic(32);
    setCombatMode(
      MODE_MACRO,
      Macro.skill($skill`Otoscope`)
        .kill()
        .toString()
    );
    use(1, $item`BRICKO oyster`);
    autosell(1, $item`BRICKO pearl`);
    setCombatMode(MODE_NULL);
  }

  // Chateau rest
  while (getPropertyInt('timesRested') < totalFreeRests()) {
    visitUrl('place.php?whichplace=chateau&action=chateau_restbox');
  }

  ensureEffect($effect`Song of Bravado`);

  // Should be 50% myst for now.
  ensureEffect($effect`Blessing of your favorite Bird`);
  ensurePullEffect($effect`On The Shoulders Of Giants`, $item`Hawking's Elixir of Brilliance`);
  // ensurePullEffect($effect`Perspicacious Pressure`, $item`pressurized potion of perspicacity`);

  /* if (availableAmount($item`flask of baconstone juice`) > 0) {
    ensureEffect($effect`Baconstoned`);
  } */

  if (getProperty('boomBoxSong') !== 'Total Eclipse of Your Meat') {
    cliExecute('boombox meat');
  }

  // Get buff things
  ensureSewerItem(1, $item`turtle totem`);
  ensureSewerItem(1, $item`saucepan`);

  // Breakfast:

  // Visiting Looking Glass in clan VIP lounge
  visitUrl('clan_viplounge.php?action=lookingglass&whichfloor=2');
  cliExecute('swim item');
  while (getPropertyInt('_genieWishesUsed') < 3) {
    cliExecute('genie wish for more wishes');
  }

  useSkill(1, $skill`Advanced Cocktailcrafting`);
  useSkill(1, $skill`Advanced Saucecrafting`);
  useSkill(1, $skill`Pastamastery`);
  useSkill(1, $skill`Spaghetti Breakfast`);
  useSkill(1, $skill`Grab a Cold One`);
  useSkill(1, $skill`Acquire Rhinestones`);
  useSkill(1, $skill`Prevent Scurvy and Sobriety`);
  useSkill(1, $skill`Perfect Freeze`);
  autosell(3, $item`magical ice cubes`);
  autosell(3, $item`little paper umbrella`);

  // Don't use Kramco here.
  equip($slot`off-hand`, $item`none`);

  // Tomato in pantry (Saber YR)
  if (
    availableAmount($item`tomato juice of powerful power`) === 0 &&
    availableAmount($item`tomato`) === 0 &&
    haveEffect($effect`Tomato Power`) === 0 &&
    getPropertyInt('_monstersMapped') < 3 &&
    getPropertyInt('_snokebombUsed') < 3
  ) {
    cliExecute('mood apathetic');
    ensureEffect($effect`Springy Fusilli`);
    ensureEffect($effect`Resting Beach Face`);
    equip($slot`off-hand`, $item`tiny black hole`);
    useFamiliar($familiar`XO Skeleton`);

    ensureEffect($effect`Singer's Faithful Ocelot`);
    ensureSong($effect`Fat Leon's Phat Loot Lyric`);

    try {
      setMode(
        MODE_MACRO,
        Macro.pickpocket()
          .skill($skill`Hugs and Kisses!`)
          .skill($skill`Snokebomb`)
          .toString()
      );
      while (
        availableAmount($item`tomato`) === 0 &&
        getPropertyInt('_monstersMapped') < 3 &&
        getPropertyInt('_snokebombUsed') < 3
      ) {
        ensureMpTonic(50); // For Snokebomb.
        mapMonster($location`The Haunted Pantry`, $monster`possessed can of tomatoes`);
        runCombat();
      }
    } finally {
      setMode(MODE_NULL);
    }
  }

  // Fruits in skeleton store (Saber YR)
  const missingOintment =
    availableAmount($item`ointment of the occult`) === 0 &&
    availableAmount($item`grapefruit`) === 0 &&
    haveEffect($effect`Mystically Oiled`) === 0;
  const missingOil =
    availableAmount($item`oil of expertise`) === 0 &&
    availableAmount($item`cherry`) === 0 &&
    haveEffect($effect`Expert Oiliness`) === 0;
  if (myClass() !== $class`Pastamancer` && (missingOil || missingOintment)) {
    cliExecute('mood apathetic');

    if (getProperty('questM23Meatsmith') === 'unstarted') {
      visitUrl('shop.php?whichshop=meatsmith&action=talk');
      runChoice(1);
    }
    if (!canAdv($location`The Skeleton Store`, false)) throw 'Cannot open skeleton store!';
    adv1($location`The Skeleton Store`, -1, '');
    if (!containsText($location`The Skeleton Store`.noncombatQueue, 'Skeletons In Store')) {
      throw 'Something went wrong at skeleton store.';
    }
    findMonsterSaberYr($location`The Skeleton Store`, $monster`novelty tropical skeleton`);
  }

  if (!getPropertyBoolean('hasRange')) {
    ensureItem(1, $item`Dramatic™ range`);
    use(1, $item`Dramatic™ range`);
  }

  if (availableAmount($item`tomato`) + availableAmount($item`tomato juice of powerful power`) > 0) {
    ensurePotionEffect($effect`Tomato Power`, $item`tomato juice of powerful power`);
  }
  ensurePotionEffect($effect`Mystically Oiled`, $item`ointment of the occult`);

  if (haveEffect($effect`Holiday Yoked`) === 0) {
    if (getPropertyInt('_reflexHammerUsed') >= 3) throw 'Out of reflex hammers!';
    useFamiliar($familiar`Ghost of Crimbo Carols`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);
    adventureMacro($location`Noob Cave`, Macro.skill($skill`Reflex Hammer`));
  }

  // Equip makeshift garbage shirt
  cliExecute('fold makeshift garbage shirt');
  equip($item`makeshift garbage shirt`);

  cliExecute('mood hccs');

  // LOV Tunnel
  if (!getPropertyBoolean('_loveTunnelUsed')) {
    useDefaultFamiliar();
    const macro = Macro.mIf(Macro.monster($monster`LOV Enforcer`), Macro.attack())
      .mIf(Macro.monster($monster`LOV Engineer`), Macro.skillRepeat($skill`Saucegeyser`))
      .mIf(Macro.monster($monster`LOV Equivocator`), Macro.pickpocket().kill());
    setChoice(1222, 1); // Entrance
    setChoice(1223, 1); // Fight LOV Enforcer
    setChoice(1224, 2); // LOV Epaulettes
    setChoice(1225, 1); // Fight LOV Engineer
    setChoice(1226, 2); // Open Heart Surgery
    setChoice(1227, 1); // Fight LOV Equivocator
    setChoice(1228, 3); // Take chocolate

    adventureMacro($location`The Tunnel of L.O.V.E.`, macro);
    if (handlingChoice()) throw 'Did not get all the way through LOV.';
    visitUrl('choice.php');
    if (handlingChoice()) throw 'Did not get all the way through LOV.';
  }

  if (itemAmount($item`LOV Extraterrestrial Chocolate`) > 0) {
    use($item`LOV Extraterrestrial Chocolate`);
  }

  equip($item`LOV Epaulettes`);

  // Professor 9x free sausage fight @ NEP
  if (sausageFightGuaranteed()) {
    useFamiliar($familiar`Pocket Professor`);
    tryEquip($item`Pocket Professor memory chip`);

    equip($item`Kramco Sausage-o-Matic™`);
    equip($slot`acc1`, $item`hewn moon-rune spoon`);
    equip($slot`acc2`, $item`Brutal brogues`);
    equip($slot`acc3`, $item`Beach Comb`);

    while (sausageFightGuaranteed()) {
      if (myHp() < 0.8 * myMaxhp()) {
        visitUrl('clan_viplounge.php?where=hottub');
      }

      // Just here to party.
      setChoice(1322, 2);
      adventureMacro(
        $location`The Neverending Party`,
        Macro.mIf('!monstername "sausage goblin"', new Macro().step('abort'))
          .skill(Skill.get('Lecture on Relativity'))
          .kill()
      );
    }
  }

  if (myMeat() > npcPrice($item`all-purpose flower`) + 7 * npcPrice($item`soda water`)) {
    ensureAsdonEffect($effect`Driving Recklessly`);
  }

  equip($item`makeshift garbage shirt`);
  equip($item`LOV Epaulettes`);
  equip($item`Fourth of May Cosplay Saber`);
  equip($item`Kramco Sausage-o-Matic™`);
  equip($item`pantogram pants`);
  equip($slot`acc1`, $item`Beach Comb`);
  equip($slot`acc2`, $item`Brutal brogues`);
  equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

  if (haveEffect($effect`Carlweather's Cantata of Confrontation`) > 0) {
    cliExecute("shrug Carlweather's Cantata of Confrontation");
  }

  cliExecute('mood hccs');

  if (getPropertyInt('_godLobsterFights') < 2) {
    useFamiliar($familiar`God Lobster`);
    setProperty('choiceAdventure1310', '1');
    while (getPropertyInt('_godLobsterFights') < 2) {
      tryEquip($item`God Lobster's Scepter`);
      visitUrl('main.php?fightgodlobster=1');
      setCombatMode(MODE_MACRO, Macro.kill().toString());
      runCombat();
      visitUrl('choice.php');
      if (handlingChoice()) runChoice(1);
      setCombatMode(MODE_NULL);
    }
  }

  useDefaultFamiliar();

  // 17 free NEP fights
  while (
    getPropertyInt('_neverendingPartyFreeTurns') < 10 ||
    (haveSkill($skill`Chest X-Ray`) && getPropertyInt('_chestXRayUsed') < 3) ||
    (haveSkill($skill`Shattering Punch`) && getPropertyInt('_shatteringPunchUsed') < 3) ||
    (haveSkill($skill`Gingerbread Mob Hit`) && !getPropertyBoolean('_gingerbreadMobHitUsed')) ||
    (getCampground()['Asdon Martin keyfob'] !== undefined && !getPropertyBoolean('_missileLauncherUsed'))
  ) {
    ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);
    ensureSong($effect`The Magical Mojomuscular Melody`);
    ensureSong($effect`Polka of Plenty`);

    cliExecute('mood execute');

    // NEP noncombat. Fight.
    setChoice(1324, 5);

    ensureMpSausage(100);
    if (getPropertyInt('_neverendingPartyFreeTurns') < 10) {
      adventureKill($location`The Neverending Party`);
    } else {
      if (!getPropertyBoolean('_missileLauncherUsed')) {
        fuelAsdon(100);
      }
      adventureIfFree($location`The Neverending Party`, Macro.kill(), Macro.freeKill());
    }
  }

  // Spend our free runs finding gobbos. We do this in the Haiku Dungeon since there is a single skippable NC.
  useFamiliar($familiar`Frumious Bandersnatch`);
  tryEquip($item`amulet coin`);
  tryEquip($item`astral pet sweater`);

  equip($item`Fourth of May Cosplay Saber`);
  equip($item`latte lovers member's mug`);
  equip($slot`acc1`, $item`Eight Days a Week Pill Keeper`);
  equip($slot`acc2`, $item`Brutal brogues`);
  equip($slot`acc3`, $item`Beach Comb`);

  while (getPropertyInt('_banderRunaways') < myFamiliarWeight() / 5 && !getProperty('latteUnlocks').includes('chili')) {
    ensureOde(1);
    adventureRunUnlessFree($location`The Haunted Kitchen`);
  }

  while (
    getPropertyInt('_banderRunaways') < myFamiliarWeight() / 5 &&
    !getProperty('latteUnlocks').includes('carrot')
  ) {
    ensureOde(1);
    adventureRunUnlessFree($location`The Dire Warren`);
  }

  if (
    getProperty('latteUnlocks').includes('chili') &&
    getProperty('latteUnlocks').includes('carrot') &&
    getPropertyInt('_latteRefillsUsed') === 0
  ) {
    cliExecute('latte refill pumpkin chili carrot');
  }

  /* // Fish for extra kramco goblins.
  equip($item`Kramco Sausage-o-Matic™`);
  equip($slot`acc1`, $item`Lil' Doctor™ Bag`);

  while (
    getPropertyInt('_banderRunaways') < (familiarWeight($familiar`Frumious Bandersnatch`) + weightAdjustment()) / 5 ||
    (haveSkill($skill`Snokebomb`) && getPropertyInt('_snokebombUsed') < 3)
  ) {
    ensureSong($effect`The Sonata of Sneakiness`);
    ensureEffect($effect`Smooth Movements`);
    if (getPropertyInt('_powerfulGloveBatteryPowerUsed') <= 90) {
      ensureEffect($effect`Invisible Avatar`);
    }
    if (getPropertyInt('garbageShirtCharge') <= 8) {
      equip($slot`shirt`, $item`none`);
    }
    if (getPropertyInt('_banderRunaways') < myFamiliarWeight() / 5) {
      ensureOde(1);
    } else {
      useDefaultFamiliar();
    }

    // Skip fairy gravy NC
    setChoice(297, 3);
    ensureMpSausage(100);
    adventureRunUnlessFree($location`The Haiku Dungeon`);
  } */

  // Reset location so maximizer doesn't get confused.
  setLocation($location`none`);

  if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
  else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

  // ensure_effect($effect[Gr8ness]);
  // ensureEffect($effect`Tomato Power`);
  ensureEffect($effect`Song of Starch`);
  ensureEffect($effect`Big`);
  ensureSong($effect`Power Ballad of the Arrowsmith`);
  ensureEffect($effect`Rage of the Reindeer`);
  ensureEffect($effect`Quiet Determination`);
  ensureEffect($effect`Disdain of the War Snapper`);
  ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ balm`);

  useFamiliar($familiar`Left-Hand Man`);

  maximize('hp', false);

  // QUEST - Donate Blood (HP)
  if (myMaxhp() - myBuffedstat($stat`muscle`) - 3 < 1770) {
    synthesisPlanner.synthesize($effect`Synthesis: Strong`);

    if (myMaxhp() - myBuffedstat($stat`muscle`) - 3 < 1770) {
      throw 'Not enough HP to cap.';
    }
  }

  doTest(Test.HP);
}

if (!testDone(Test.MUS)) {
  if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);
  else ensurePotionEffect($effect`Expert Oiliness`, $item`oil of expertise`);

  ensureEffect($effect`Big`);
  ensureEffect($effect`Song of Bravado`);
  ensureSong($effect`Stevedave's Shanty of Superiority`);
  ensureSong($effect`Power Ballad of the Arrowsmith`);
  ensureEffect($effect`Rage of the Reindeer`);
  ensureEffect($effect`Quiet Determination`);
  ensureEffect($effect`Disdain of the War Snapper`);
  ensureEffect($effect`Tomato Power`);
  ensureNpcEffect($effect`Go Get 'Em, Tiger!`, 5, $item`Ben-Gal™ balm`);
  cliExecute('retrocape muscle');
  maximize('muscle', false);
  if (myBuffedstat($stat`muscle`) - myBasestat($stat`mysticality`) < 1770) {
    ensureEffect($effect`Lack of Body-Building`); // will stay on all the way to weapon damage.
    if (myBuffedstat($stat`muscle`) - myBasestat($stat`mysticality`) < 1770) {
      ensureEffect($effect`Ham-Fisted`);
      if (myBuffedstat($stat`muscle`) - myBasestat($stat`mysticality`) < 1770) {
        throw 'Not enough muscle to cap.';
      }
    }
  }
  doTest(Test.MUS);
}

if (!testDone(Test.MYS)) {
  ensureEffect($effect`Big`);
  ensureEffect($effect`Song of Bravado`);
  ensureSong($effect`Stevedave's Shanty of Superiority`);
  ensureSong($effect`The Magical Mojomuscular Melody`);
  ensureEffect($effect`Quiet Judgement`);
  // ensureEffect($effect`Tomato Power`);
  ensureEffect($effect`Mystically Oiled`);
  ensureNpcEffect($effect`Glittering Eyelashes`, 5, $item`glittery mascara`);
  cliExecute('retrocape mysticality');
  maximize('mysticality', false);
  if (myBuffedstat($stat`mysticality`) - myBasestat($stat`mysticality`) < 1770) {
    throw 'Not enough mysticality to cap.';
  }
  doTest(Test.MYS);
}

if (!testDone(Test.MOX)) {
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
  // ensureEffect($effect`Tomato Power`);
  ensureNpcEffect($effect`Butt-Rock Hair`, 5, $item`hair spray`);
  use(availableAmount($item`rhinestone`), $item`rhinestone`);
  if (haveEffect($effect`Unrunnable Face`) === 0) {
    tryUse(1, $item`runproof mascara`);
  }
  cliExecute('retrocape moxie');
  maximize('moxie', false);
  if (myBuffedstat($stat`moxie`) - myBasestat($stat`mysticality`) < 1770) {
    synthesisPlanner.synthesize($effect`Synthesis: Cool`);

    if (myBuffedstat($stat`moxie`) - myBasestat($stat`mysticality`) < 1770) {
      throw 'Not enough moxie to cap.';
    }
  }
  doTest(Test.MOX);
}

if (!testDone(Test.ITEM)) {
  ensureMpSausage(500);

  fightSausageIfGuaranteed();

  if (haveEffect($effect`Bat-Adjacent Form`) === 0) {
    if (getPropertyInt('_reflexHammerUsed') >= 3) throw 'Out of reflex hammers!';
    equip($item`vampyric cloake`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);
    adventureMacro($location`The Dire Warren`, Macro.skill($skill`Become a Bat`).skill($skill`Reflex Hammer`));
  }

  tryUse(1, $item`astral six-pack`);
  if (![0, 5].includes(myInebriety())) {
    throw 'Too drunk. Something went wrong.';
  }

  ensureOde(5 - myInebriety());
  drink(5 - myInebriety(), $item`astral pilsner`);

  // Tune moon sign to Opossum.
  if (!getPropertyBoolean('moonTuned')) {
    if (getPropertyInt('_campAwaySmileBuffs') === 0) {
      visitUrl('place.php?whichplace=campaway&action=campaway_sky');
    }

    // Unequip spoon.
    equip($slot`acc1`, $item`Retrospecs`);
    equip($slot`acc2`, $item`Powerful Glove`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

    // Actually tune the moon. To Opossum.
    visitUrl('inv_use.php?whichitem=10254&doit=96&whichsign=5');
  }

  ensureEffect($effect`Fat Leon's Phat Loot Lyric`);
  ensureEffect($effect`Singer's Faithful Ocelot`);
  ensureEffect($effect`The Spirit of Taking`);
  ensureEffect($effect`items.enh`);

  synthesisPlanner.synthesize($effect`Synthesis: Collection`);

  if (getCampground()['Asdon Martin keyfob']) {
    ensureAsdonEffect($effect`Driving Observantly`);
  } else {
    ensurePullEffect($effect`One Very Clear Eye`, $item`cyclops eyedrops`);
  }

  ensureEffect($effect`Nearly All-Natural`); // bag of grain

  // Visiting the Ruined House
  ensureItem(1, $item`Desert Bus pass`);
  visitUrl('place.php?whichplace=desertbeach&action=db_nukehouse');

  ensureEffect($effect`I See Everything Thrice`); // government

  ensureEffect($effect`Steely-Eyed Squint`);

  if (getPropertyInt('_campAwaySmileBuffs') === 1) {
    visitUrl('place.php?whichplace=campaway&action=campaway_sky');
  }

  useFamiliar($familiar`Left-Hand Man`);

  maximize('item, 2 booze drop, -equip broken champagne bottle, -equip surprisingly capacious handbag', false);

  wishEffect($effect`Infernal Thirst`);

  const itemTurns = () =>
    60 - floor(numericModifier('item drop') / 30 + 0.001) - floor(numericModifier('booze drop') / 15 + 0.001);

  if (itemTurns() > 1 && !getPropertyBoolean('_clanFortuneBuffUsed')) {
    print('Not enough item drop, using fortune buff.');
    ensureEffect($effect`There's No N In Love`);
  }

  print(`Estimated item turns: ${itemTurns()}`);
  if (itemTurns() > 1) throw 'Something went wrong with item drop.';

  doTest(Test.ITEM);
}

if (!testDone(Test.HOT_RES)) {
  ensureMpSausage(500);

  fightSausageIfGuaranteed();

  // Make sure no moon spoon.
  equip($slot`acc1`, $item`Eight Days a Week Pill Keeper`);
  equip($slot`acc2`, $item`Powerful Glove`);
  equip($slot`acc3`, $item`Lil' Doctor™ Bag`);

  /* if (availableAmount($item`heat-resistant gloves`) === 0) {
    if (availableAmount($item`photocopied monster`) === 0) {
      if (getPropertyBoolean('_photocopyUsed')) throw 'Already used fax for the day.';
      chatPrivate('cheesefax', 'factory worker');
      for (let i = 0; i < 2; i++) {
        wait(10);
        cliExecute('fax receive');
        if (getProperty('photocopyMonster') === 'factory worker') break;
        // otherwise got the wrong monster, put it back.
        cliExecute('fax send');
      }
      if (availableAmount($item`photocopied monster`) === 0) throw 'Failed to fax in factory worker.';
    }
    cliExecute('mood apathetic');
    equip($item`Fourth of May Cosplay Saber`);
    setCombatMode(
      MODE_MACRO,
      Macro.skill($skill`Become a Cloud of Mist`)
        .skill($skill`Meteor Shower`)
        .skill($skill`Use the Force`)
        .toString()
    );
    if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty('_meteorShowerUses');
    setProperty('choiceAdventure1387', '3');
    use(1, $item`photocopied monster`);
    setCombatMode(MODE_NULL);
  }
  autosell(1, $item`very hot lunch`); */

  if (haveEffect($effect`Meteor Showered`) === 0) {
    cliExecute('mood apathetic');
    equip($item`Fourth of May Cosplay Saber`);
    setProperty('choiceAdventure1387', '3');
    useFamiliar($familiar`none`);
    adventureMacro(
      $location`The Dire Warren`,
      Macro.skill($skill`Become a Cloud of Mist`)
        .skill($skill`Meteor Shower`)
        .skill($skill`Use the Force`)
    );
    if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty('_meteorShowerUses');
  }

  if (haveEffect($effect`Synthesis: Hot`) === 0) {
    synthesisPlanner.synthesize($effect`Synthesis: Hot`);
  }

  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);

  // Pool buff. This will fall through to fam weight.
  ensureEffect($effect`Billiards Belligerence`);

  ensureItem(1, $item`tenderizing hammer`);
  cliExecute('smash * ratty knitted cap');
  cliExecute('smash * red-hot sausage fork');
  autosell(10, $item`hot nuggets`);
  autosell(10, $item`twinkly powder`);

  if (availableAmount($item`hot powder`) > 0) {
    ensureEffect($effect`Flame-Retardant Trousers`);
  }

  if (availableAmount($item`sleaze powder`) > 0 || availableAmount($item`lotion of sleaziness`) > 0) {
    ensurePotionEffect($effect`Sleazy Hands`, $item`lotion of sleaziness`);
  }

  ensureEffect($effect`Elemental Saucesphere`);
  ensureEffect($effect`Astral Shell`);

  // Build up 100 turns of Deep Dark Visions for spell damage later.
  while (haveSkill($skill`Deep Dark Visions`) && haveEffect($effect`Visions of the Deep Dark Deeps`) < 80) {
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

  // Use pocket maze
  if (availableAmount($item`pocket maze`) > 0) ensureEffect($effect`Amazing`);

  if (getProperty('_horsery') !== 'pale horse') cliExecute('horsery pale');

  if (getCampground()['Asdon Martin keyfob']) {
    ensureAsdonEffect($effect`Driving Safely`);
  }

  useFamiliar($familiar`Exotic Parrot`);
  if (availableAmount($item`cracker`) === 0) {
    retrieveItem(1, $item`box of Familiar jacks`);
    use(1, $item`box of Familiar Jacks`);
  }
  equip($item`cracker`);

  cliExecute('retrocape vampire hold');

  // Mafia sometimes can't figure out that multiple +weight things would get us to next tier.
  maximize('hot res, 0.01 familiar weight', false);

  // OK to waste a couple turns here
  if (Math.round(numericModifier('hot resistance')) + 9 <= 62) {
    ensurePullEffect($effect`Fireproof Lips`, $item`SPF 451 lip balm`);
  }
  if (Math.round(numericModifier('hot resistance')) + 5 <= 60) {
    ensurePullEffect($effect`Good Chance of Surviving Hell`, $item`infernal snowball`);
  }

  if (Math.round(numericModifier('hot resistance')) < 58) {
    throw 'Something went wrong building hot res.';
  }

  doTest(Test.HOT_RES);

  autosell(1, $item`lava-proof pants`);
  autosell(1, $item`heat-resistant gloves`);
}

if (!testDone(Test.NONCOMBAT)) {
  if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);

  if (getPropertyInt('_godLobsterFights') < 3) {
    if (myHp() < 0.8 * myMaxhp()) useSkill(1, $skill`Cannelloni Cocoon`);
    useFamiliar($familiar`God Lobster`);
    // Get -combat buff.
    setProperty('choiceAdventure1310', '2');
    equip($item`God Lobster's Ring`);
    visitUrl('main.php?fightgodlobster=1');
    setCombatMode(MODE_MACRO, Macro.kill().toString());
    runCombat();
    if (handlingChoice()) runChoice(2);
    setCombatMode(MODE_NULL);
  }

  equip($slot`acc3`, $item`Powerful Glove`);

  ensureEffect($effect`The Sonata of Sneakiness`);
  ensureEffect($effect`Smooth Movements`);
  ensureEffect($effect`Invisible Avatar`);
  ensureEffect($effect`Silent Running`);
  ensureEffect($effect`Become Superficially Interested`);

  if (getCampground()['Asdon Martin keyfob']) {
    ensureAsdonEffect($effect`Driving Stealthily`);
  } else {
    wishEffect($effect`Disquiet Riot`);
  }

  useFamiliar($familiar`Disgeist`);

  if (getProperty('_horsery') !== 'dark horse') cliExecute('horsery dark');

  // Pastamancer d1 is -combat.
  ensureEffect($effect`Blessing of the Bird`);
  ensureEffect($effect`Blessing of your favorite Bird`);

  maximize("-combat, 0.01 familiar weight, equip Kremlin's Greatest Briefcase", false);

  // Rewards
  ensureEffect($effect`Throwing Some Shade`);

  if (Math.round(numericModifier('combat rate')) > -40) {
    throw 'Not enough -combat to cap.';
  }

  doTest(Test.NONCOMBAT);
}

if (!testDone(Test.FAMILIAR)) {
  fightSausageIfGuaranteed();

  // These should have fallen through all the way from leveling.
  ensureEffect($effect`Fidoxene`);
  ensureEffect($effect`Do I Know You From Somewhere?`);

  // Pool buff.
  ensureEffect($effect`Billiards Belligerence`);

  if (myHp() < 30) useSkill(1, $skill`Cannelloni Cocoon`);
  ensureEffect($effect`Blood Bond`);
  ensureEffect($effect`Leash of Linguini`);
  ensureEffect($effect`Empathy`);

  if (availableAmount($item`cracker`) > 0) {
    useFamiliar($familiar`Exotic Parrot`);
    equip($item`cracker`);
  }

  if (haveEffect($effect`Meteor Showered`) === 0) {
    equip($item`Fourth of May Cosplay Saber`);
    useFamiliar($familiar`none`);
    adventureMacro($location`The Dire Warren`, Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`));
    if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty('_meteorShowerUses');
  }

  // NC reward
  ensureEffect($effect`Robot Friends`);

  if (!getPropertyBoolean('_clanFortuneBuffUsed')) cliExecute('fortune buff familiar');

  pullIfPossible(1, $item`Great Wolf's beastly trousers`, 0);

  maximize('familiar weight', false);

  doTest(Test.FAMILIAR);
}

if (!testDone(Test.WEAPON)) {
  fightSausageIfGuaranteed();

  if (haveEffect($effect`Do You Crush What I Crush?`) === 0) {
    if (getPropertyInt('_reflexHammerUsed') >= 3) throw 'Out of reflex hammers!';
    useFamiliar($familiar`Ghost of Crimbo Carols`);
    equip($slot`acc3`, $item`Lil' Doctor™ Bag`);
    adventureMacro($location`The Dire Warren`, Macro.skill($skill`Reflex Hammer`));
  }

  if (haveEffect($effect`Saucefingers`) + haveEffect($effect`Elbow Sauce`) === 0) {
    useFamiliar($familiar`Mini-Adventurer`);
    equip($slot`acc3`, $item`Kremlin's Greatest Briefcase`);
    setChoice(768, 4); // Make mini-adv a Sauceror.
    if (getPropertyInt('miniAdvClass') !== 4) {
      if (getPropertyInt('_kgbTranquilizerDartUses') >= 3) throw 'Out of tranquilizer darts!';
      adventureMacro($location`The Dire Warren`, Macro.skill($skill`Tranquilizer Dart`));
    }
    if (getPropertyInt('_kgbTranquilizerDartUses') >= 3) throw 'Out of tranquilizer darts!';
    adventureMacro($location`The Dire Warren`, Macro.skill($skill`Tranquilizer Dart`));
  }

  if (availableAmount($item`twinkly nuggets`) > 0) {
    ensureEffect($effect`Twinkly Weapon`);
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

  // Hatter buff
  if (!getPropertyBoolean('_madTeaParty')) {
    ensureItem(1, $item`goofily-plumed helmet`);
    ensureEffect($effect`Weapon of Mass Destruction`);
  }

  // Beach Comb
  if (!containsText(getProperty('_beachHeadsUsed'), '6')) {
    ensureEffect($effect`Lack of Body-Building`);
  }

  // Pool buff. Should have fallen through.
  ensureEffect($effect`Billiards Belligerence`);

  if (availableAmount($item`LOV Elixir #3`) > 0) ensureEffect($effect`The Power of LOV`);

  // Pastamancer d1 is weapon damage.
  ensureEffect($effect`Blessing of the Bird`);

  // ensureNpcEffect($effect`Engorged Weapon`, 1, $item`Meleegra™ pills`);

  // Get flimsy hardwood scraps.
  /* visitUrl('shop.php?whichshop=lathe');
  if (availableAmount($item`flimsy hardwood scraps`) > 0) {
    retrieveItem(1, $item`ebony epee`);
  } */

  // Paint ungulith (Saber YR)
  if (!getPropertyBoolean('_chateauMonsterFought')) {
    const chateauText = visitUrl('place.php?whichplace=chateau', false);
    const match = chateauText.match(/alt="Painting of an? ([^(]*) .1."/);
    if (getPropertyInt('camelSpit') === 100) useFamiliar($familiar`Melodramedary`);
    if (match && match[1] === 'ungulith') {
      cliExecute('mood apathetic');
      equip($item`Fourth of May Cosplay Saber`);
      setCombatMode(
        MODE_MACRO,
        Macro.skill($skill`%fn, spit on me!`)
          .skill($skill`Meteor Shower`)
          .skill($skill`Use the Force`)
          .toString()
      );
      setProperty('choiceAdventure1387', '3');
      visitUrl('place.php?whichplace=chateau&action=chateau_painting', false);
      runCombat();
      saberYr();
    } else {
      throw 'Wrong painting.';
    }
  }

  // Corrupted marrow
  ensureEffect($effect`Cowrruption`);

  ensureEffect($effect`Bow-Legged Swagger`);

  maximize('weapon damage', false);

  const weaponTurns = () =>
    60 -
    Math.floor(numericModifier('weapon damage') / 25 + 0.001) -
    Math.floor(numericModifier('weapon damage percent') / 25 + 0.001);

  if (weaponTurns() >= 5) {
    ensurePullEffect($effect`Wasabi With You`, $item`wasabi marble soda`);
  }
  if (weaponTurns() >= 5) {
    ensurePullEffect($effect`Seeing Red`, $item`red eye`);
  }
  if (weaponTurns() >= 7) {
    wishEffect($effect`Outer Wolf`);
  }

  if (weaponTurns() > 2) {
    throw 'Something went wrong with weapon damage.';
  }

  doTest(Test.WEAPON);
}

if (!testDone(Test.SPELL)) {
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

  if (haveEffect($effect`Meteor Showered`) === 0 && getPropertyInt('_meteorShowerUses') < 5) {
    equip($item`Fourth of May Cosplay Saber`);
    adventureMacro($location`The Dire Warren`, Macro.skill($skill`Meteor Shower`).skill($skill`Use the Force`));
    if (haveEffect($effect`Meteor Showered`) > 0) incrementProperty('_meteorShowerUses');
  }

  // Sigils of Yeg = 200% SD
  if (!getPropertyBoolean('_cargoPocketEmptied') && haveEffect($effect`Sigils of Yeg`) === 0) {
    if (availableAmount($item`Yeg's Motel hand soap`) === 0) cliExecute('cargo 177');
    ensureEffect($effect`Sigils of Yeg`);
  }

  if (availableAmount($item`LOV Elixir #6`) > 0) ensureEffect($effect`The Magic of LOV`);

  // Get flimsy hardwood scraps.
  visitUrl('shop.php?whichshop=lathe');
  if (availableAmount($item`flimsy hardwood scraps`) > 0) {
    retrieveItem(1, $item`weeping willow wand`);
  }

  cliExecute('briefcase enchantment spell');

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

  doTest(Test.SPELL);
}

if (!testDone(Test.DONATE)) {
  doTest(Test.DONATE);
}

setProperty('autoSatisfyWithNPCs', getProperty('_saved_autoSatisfyWithNPCs'));
setProperty('autoSatisfyWithCoinmasters', getProperty('_saved_autoSatisfyWithCoinmasters'));
setProperty('hpAutoRecovery', '0.8');

cliExecute('mood default');
cliExecute('ccs default');
cliExecute('boombox food');
