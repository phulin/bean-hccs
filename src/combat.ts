import {
  inMultiFight,
  choiceFollowsFight,
  print,
  visitUrl,
  setProperty,
  getProperty,
  getLocationMonsters,
  myLocation,
  toMonster,
  myMp,
  haveSkill,
  useSkill,
  myFamiliar,
  haveEffect,
  runaway,
  itemAmount,
  handlingChoice,
  lastChoice,
  runChoice,
  adv1,
  availableChoiceOptions,
  runCombat,
  xpath,
  haveFamiliar,
  dump,
} from 'kolmafia';
import { $effect, $familiar, $items, $skill, Macro as LibramMacro } from 'libram';
import { getPropertyInt, myFamiliarWeight, setPropertyInt } from './lib';

// multiFight() stolen from Aenimus: https://github.com/Aenimus/aen_cocoabo_farm/blob/master/scripts/aen_combat.ash.
// Thanks! Licensed under MIT license.
export function multiFight() {
  while (inMultiFight()) runCombat();
  if (choiceFollowsFight()) visitUrl('choice.php');
}

const MACRO_NAME = 'Bean Scripts Macro';
export function getMacroId() {
  const macroMatches = xpath(
    visitUrl('account_combatmacros.php'),
    `//select[@name="macroid"]/option[text()="${MACRO_NAME}"]/@value`
  );
  if (macroMatches.length === 0) {
    visitUrl('account_combatmacros.php?action=new');
    const newMacroText = visitUrl(`account_combatmacros.php?macroid=0&name=${MACRO_NAME}&macrotext=abort&action=save`);
    return parseInt(xpath(newMacroText, '//input[@name=macroid]/@value')[0], 10);
  } else {
    return parseInt(macroMatches[0], 10);
  }
}

export class Macro extends LibramMacro {
  pickpocket() {
    return this.step('pickpocket');
  }

  static pickpocket() {
    return new Macro().pickpocket();
  }

  kill() {
    return this.skill($skill`Curse of Weaksauce`)
      .skill($skill`Micrometeorite`)
      .trySkill($skill`Sing Along`)
      .trySkill($skill`Detect Weakness`)
      .while_('!match "some of it is even intact" && !mpbelow 50 && !hpbelow 100', Macro.skill($skill`Candyblast`))
      .skill($skill`Stuffed Mortar Shell`)
      .skill($skill`Saucestorm`)
      .skill($skill`Saucegeyser`)
      .repeat();
  }

  static kill() {
    return new Macro().kill();
  }

  freeKill() {
    return Macro.skill($skill`Sing Along`)
      .trySkill($skill`Shattering Punch`)
      .trySkill($skill`Gingerbread Mob Hit`)
      .trySkill($skill`Chest X-Ray`)
      .skill($skill`Asdon Martin: Missile Launcher`);
  }

  static freeKill() {
    return new Macro().freeKill();
  }

  static freeRun() {
    return new Macro()
      .externalIf(
        (haveFamiliar($familiar`Frumious Bandersnatch`) && haveEffect($effect`The Ode to Booze`) > 0) ||
          haveFamiliar($familiar`Pair of Stomping Boots`),
        'runaway'
      )
      .trySkill('Spring-Loaded Front Bumper, Reflex Hammer, KGB tranquilizer dart, Throw Latte on Opponent, Snokebomb')
      .tryItem('Louder Than Bomb, tattered scrap of paper, GOTO, green smoke bomb')
      .abort();
  }
}

export const MODE_NULL = '';
export const MODE_MACRO = 'macro';
export const MODE_FIND_MONSTER_THEN = 'findthen';
export const MODE_RUN_UNLESS_FREE = 'rununlessfree';
export const MODE_IF_FREE = 'iffree';

export function setMode(mode: string, arg1: string | null = null, arg2: string | null = null) {
  setProperty('hccs_combatMode', mode);
  if (arg1 !== null) setProperty('hccs_combatArg1', arg1);
  if (arg2 !== null) setProperty('hccs_combatArg2', arg2);
}

export function getMode() {
  return getProperty('hccs_combatMode');
}

export function getArg1() {
  return getProperty('hccs_combatArg1');
}

export function getArg2() {
  return getProperty('hccs_combatArg2');
}

function banishedMonsters() {
  const banishedstring = getProperty('banishedMonsters');
  const banishedComponents = banishedstring.split(':');
  const result: { [index: string]: Monster } = {};
  if (banishedComponents.length < 3) return result;
  for (let idx = 0; idx < banishedComponents.length / 3 - 1; idx++) {
    const foe = Monster.get(banishedComponents[idx * 3]);
    const banisher = banishedComponents[idx * 3 + 1];
    print(`Banished ${foe.name} using ${banisher}`);
    result[banisher] = foe;
  }
  return result;
}

function usedBanisherInZone(banished: { [index: string]: Monster }, banisher: string, loc: Location) {
  print(`Checking to see if we've used ${banisher} in ${loc}.`);
  if (banished[banisher] === undefined) return false;
  print(`Used it to banish ${banished[banisher].name}`);
  return getLocationMonsters(loc)[banished[banisher].name] === undefined;
}

const freeRunItems = $items`Louder Than Bomb, tattered scrap of paper, GOTO, green smoke bomb`;
export function main(initround: number, foe: Monster) {
  const mode = getMode();
  const loc = myLocation();
  if (mode === MODE_MACRO) {
    Macro.step(getArg1()).submit();
  } else if (mode === MODE_FIND_MONSTER_THEN) {
    const monsterId = parseInt(getArg1(), 10);
    const desired = toMonster(monsterId);
    const banished = banishedMonsters();
    print(`current: ${foe}, desired: ${desired}`);
    if (foe === desired) {
      setProperty('hccs_combatFound', 'true');
      Macro.step(getArg2()).submit();
    } else if (
      myMp() >= 50 &&
      haveSkill(Skill.get('Snokebomb')) &&
      getPropertyInt('_snokebombUsed') < 3 &&
      !usedBanisherInZone(banished, 'snokebomb', loc)
    ) {
      useSkill(1, Skill.get('Snokebomb'));
      /* } else if (haveSkill(Skill.get('Reflex Hammer')) && getPropertyInt("ReflexHammerUsed") < 3 && !usedBanisherInZone(banished, "Reflex Hammer", loc)) {
          useSkill(1, Skill.get('Reflex Hammer')); */
    } else if (haveSkill(Skill.get('Macrometeorite')) && getPropertyInt('_macrometeoriteUses') < 10) {
      useSkill(1, Skill.get('Macrometeorite'));
    } else if (
      haveSkill(Skill.get('CHEAT CODE: Replace Enemy')) &&
      getPropertyInt('_powerfulGloveBatteryPowerUsed') <= 80
    ) {
      const originalBattery = getPropertyInt('_powerfulGloveBatteryPowerUsed');
      useSkill(1, Skill.get('CHEAT CODE: Replace Enemy'));
      const newBattery = getPropertyInt('_powerfulGloveBatteryPowerUsed');
      if (newBattery === originalBattery) {
        print('WARNING: Mafia is not updating PG battery charge.');
        setProperty('_powerfulGloveBatteryPowerUsed', `${newBattery + 10}`);
      }
      // Hopefully at this point it comes back to the consult script.
    }
  } else if (mode === MODE_RUN_UNLESS_FREE) {
    if (foe.attributes.includes('FREE')) {
      Macro.kill().submit();
    } else if (
      myFamiliar() === Familiar.get('Frumious Bandersnatch') &&
      haveEffect(Effect.get('Ode to Booze')) > 0 &&
      getPropertyInt('_banderRunaways') < myFamiliarWeight() / 5
    ) {
      const banderRunaways = getPropertyInt('_banderRunaways');
      runaway();
      if (getPropertyInt('_banderRunaways') === banderRunaways) {
        print('WARNING: Mafia is not tracking bander runaways correctly.');
        setPropertyInt('_banderRunaways', banderRunaways + 1);
      }
      /* } else if (haveSkill(Skill.get('Reflex Hammer')) && getPropertyInt('_reflexHammerUsed') < 3) {
      useSkill(1, Skill.get('Reflex Hammer')); */
    } else if (myMp() >= 50 && haveSkill(Skill.get('Snokebomb')) && getPropertyInt('_snokebombUsed') < 3) {
      useSkill(1, Skill.get('Snokebomb'));
    } else if (freeRunItems.some(it => itemAmount(it) > 0)) {
      Macro.item(freeRunItems.find(it => itemAmount(it) > 0) as Item).submit();
    } else {
      // non-free, whatever
      throw "Couldn't find a way to run away for free!";
    }
  } else if (mode === MODE_IF_FREE) {
    if (foe.attributes.includes('FREE')) {
      new Macro().step(getArg1()).submit();
    } else {
      new Macro().step(getArg2()).submit();
    }
  } else {
    throw 'Unrecognized mode.';
  }

  multiFight();
}

export function saberYr() {
  if (!handlingChoice()) throw 'No saber choice?';
  if (lastChoice() === 1387 && Object.keys(availableChoiceOptions()).length > 0) {
    runChoice(3);
  }
}

export function adventureMode(loc: Location, mode: string, arg1: string | null = null, arg2: string | null = null) {
  setMode(mode, arg1, arg2);
  try {
    adv1(loc, -1, '');
  } finally {
    setMode(MODE_NULL, '', '');
  }
}

export function adventureMacro(loc: Location, macro: Macro) {
  adventureMode(loc, MODE_MACRO, macro.toString());
}

export function adventureKill(loc: Location) {
  adventureMacro(loc, Macro.kill());
}

export function findMonsterThen(loc: Location, foe: Monster, macro: Macro) {
  setMode(MODE_FIND_MONSTER_THEN, foe.id.toString(), macro.toString());
  setProperty('hccs_combatFound', 'false');
  try {
    while (getProperty('hccs_combatFound') !== 'true') {
      adv1(loc, -1, '');
    }
  } finally {
    setMode(MODE_NULL, '');
  }
}

export function findMonsterSaberYr(loc: Location, foe: Monster) {
  setProperty('choiceAdventure1387', '3');
  findMonsterThen(loc, foe, Macro.skill(Skill.get('Use the Force')));
}

export function adventureRunUnlessFree(loc: Location) {
  adventureMode(loc, MODE_RUN_UNLESS_FREE);
}

export function adventureIfFree(loc: Location, macroIfFree: Macro, macroIfNotFree: Macro) {
  adventureMode(loc, MODE_IF_FREE, macroIfFree.toString(), macroIfNotFree.toString());
}
