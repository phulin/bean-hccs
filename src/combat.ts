import {
  adv1,
  availableChoiceOptions,
  choiceFollowsFight,
  getAutoAttack,
  handlingChoice,
  inMultiFight,
  lastChoice,
  Location,
  myFamiliar,
  print,
  runChoice,
  runCombat,
  setAutoAttack,
  visitUrl,
  xpath,
} from "kolmafia";
import { $effect, $familiar, $skill, get, have, Macro as LibramMacro } from "libram";

// multiFight() stolen from Aenimus: https://github.com/Aenimus/aen_cocoabo_farm/blob/master/scripts/aen_combat.ash.
// Thanks! Licensed under MIT license.
export function multiFight(): void {
  while (inMultiFight()) runCombat();
  if (choiceFollowsFight()) visitUrl("choice.php");
}

const MACRO_NAME = "Bean Scripts Macro";
export function getMacroId(): number {
  const macroMatches = xpath(
    visitUrl("account_combatmacros.php"),
    `//select[@name="macroid"]/option[text()="${MACRO_NAME}"]/@value`
  );
  if (macroMatches.length === 0) {
    visitUrl("account_combatmacros.php?action=new");
    const newMacroText = visitUrl(
      `account_combatmacros.php?macroid=0&name=${MACRO_NAME}&macrotext=abort&action=save`
    );
    return parseInt(xpath(newMacroText, "//input[@name=macroid]/@value")[0], 10);
  } else {
    return parseInt(macroMatches[0], 10);
  }
}

export class Macro extends LibramMacro {
  pickpocket(): Macro {
    return this.step("pickpocket");
  }

  static pickpocket(): Macro {
    return new Macro().pickpocket();
  }

  kill(): Macro {
    return this.skill($skill`Stuffed Mortar Shell`)
      .skill($skill`Micrometeorite`)
      .skill($skill`Saucegeyser`)
      .repeat();
  }

  static kill(): Macro {
    return new Macro().kill();
  }

  freeKill(): Macro {
    return Macro.skill($skill`Sing Along`)
      .trySkill($skill`Shattering Punch`)
      .trySkill($skill`Gingerbread Mob Hit`)
      .trySkill($skill`Chest X-Ray`)
      .skill($skill`Asdon Martin: Missile Launcher`);
  }

  static freeKill(): Macro {
    return new Macro().freeKill();
  }

  static freeRun(): Macro {
    return new Macro()
      .externalIf(
        (myFamiliar() === $familiar`Frumious Bandersnatch` && have($effect`Ode to Booze`)) ||
          myFamiliar() === $familiar`Pair of Stomping Boots`,
        "runaway"
      )
      .trySkill(
        "Spring-Loaded Front Bumper, Reflex Hammer, KGB tranquilizer dart, Throw Latte on Opponent, Snokebomb"
      )
      .tryItem("Louder Than Bomb, tattered scrap of paper, GOTO, green smoke bomb")
      .abort();
  }
}

export function main(): void {
  print(`Submitting macro: ${Macro.load()}`);
  Macro.load().submit();
  multiFight();
}

/**
 * Adventure in a location and handle all combats with a given macro.
 * To use this function you will need to create a consult script that runs Macro.load().submit() and a CCS that calls that consult script.
 * See examples/consult.ts for an example.
 *
 * @category Combat
 * @param loc Location to adventure in.
 * @param macro Macro to execute.
 */
export function adventureMacro(loc: Location, macro: Macro): void {
  if (getAutoAttack() !== 0) setAutoAttack(0);
  macro.save();
  try {
    adv1(loc, 0, "");
    while (inMultiFight()) runCombat();
    if (choiceFollowsFight()) visitUrl("choice.php");
  } catch (e) {
    throw `Combat exception! Last macro error: ${get("lastMacroError")}`;
  } finally {
    Macro.clearSaved();
  }
}

/**
 * Adventure in a location and handle all combats with a given autoattack and manual macro.
 * To use the nextMacro parameter you will need to create a consult script that runs Macro.load().submit() and a CCS that calls that consult script.
 * See examples/consult.ts for an example.
 *
 * @category Combat
 * @param loc Location to adventure in.
 * @param autoMacro Macro to execute via KoL autoattack.
 * @param nextMacro Macro to execute manually after autoattack completes.
 */
export function adventureMacroAuto(
  loc: Location,
  autoMacro: Macro,
  nextMacro = Macro.abort()
): void {
  autoMacro.setAutoAttack();
  nextMacro.save();
  try {
    adv1(loc, 0, "");
    while (inMultiFight()) runCombat();
    if (choiceFollowsFight()) visitUrl("choice.php");
  } catch (e) {
    throw `Combat exception! Last macro error: ${get("lastMacroError")}`;
  } finally {
    Macro.clearSaved();
  }
}

export function withMacro<T>(macro: Macro, action: () => T): T {
  if (getAutoAttack() !== 0) setAutoAttack(0);
  macro.save();
  try {
    return action();
  } finally {
    Macro.clearSaved();
  }
}

export function saberYr(): void {
  if (!handlingChoice()) throw "No saber choice?";
  if (lastChoice() === 1387 && Object.keys(availableChoiceOptions()).length > 0) {
    runChoice(3);
  }
}
