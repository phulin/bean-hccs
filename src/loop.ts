import {
  canInteract,
  Class,
  cliExecute,
  getWorkshed,
  inebrietyLimit,
  maximize,
  myAdventures,
  myDaycount,
  myFamiliar,
  myInebriety,
  myPath,
  myTurncount,
  Path,
  print,
  pvpAttacksLeft,
  retrieveItem,
  use,
  useFamiliar,
} from "kolmafia";
import {
  $class,
  $familiar,
  $item,
  $stat,
  ascend,
  AsdonMartin,
  Clan,
  get,
  have,
  Lifestyle,
  Mood,
  withProperty,
} from "libram";
import { main as hccs } from ".";
import { checkNepQuest, printNepQuestItem } from "./nep";
import { main as pre } from "./pre";

function carpe(): void {
  if (!get("_floundryItemCreated")) {
    Clan.join("Bonus Adventures from Hell");
    retrieveItem($item`carpe`);
  }
}

function inCsLeg(): boolean {
  return myPath().name === "Community Service" || get("csServicesPerformed") !== "";
}

function burnTurns(ascending: boolean): void {
  if (have($item`can of Rain-Doh`)) use($item`can of Rain-Doh`);

  if (
    (myInebriety() === inebrietyLimit() && myAdventures() > 0) ||
    myInebriety() < inebrietyLimit()
  ) {
    carpe();
    cliExecute(ascending ? "garbo ascend" : "garbo");
  }

  if (myInebriety() === inebrietyLimit() && myAdventures() === 0) {
    cliExecute(ascending ? "nightcap ascend" : "nightcap");
  }

  if (ascending && myInebriety() > inebrietyLimit()) {
    cliExecute("garbo ascend");
    if (myAdventures() === 0) {
      pre();
    }
  }
}

export function main(argString = ""): void {
  const args = argString.split(" ");
  let casual = false;
  let loopClass = $class`Seal Clubber`;
  for (const arg of args) {
    if (arg === "casual") {
      casual = true;
    } else if (
      Class.all()
        .map((loopClass) => loopClass.toString().toLowerCase())
        .includes(arg.toLowerCase())
    ) {
      loopClass = Class.get(arg as unknown as number);
      print(`Ascending as class ${loopClass}.`, "blue");
    }
  }

  print(`Starting ${casual ? "casual" : "CS"} loop.`, "blue");

  if (myFamiliar() === $familiar`Stooper`) useFamiliar($familiar`none`);

  // End current day.
  if (myDaycount() >= 2) {
    checkNepQuest();
    printNepQuestItem();

    withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

    burnTurns(true);

    if (myInebriety() > inebrietyLimit() && myAdventures() === 0 && pvpAttacksLeft() === 0) {
      if (!AsdonMartin.installed() && !get("_workshedItemUsed")) {
        use($item`Asdon Martin keyfob`);
      }
    }
  }
  if (myInebriety() > inebrietyLimit() && myAdventures() === 0 && pvpAttacksLeft() === 0) {
    if (casual) {
      ascend(
        Path.none,
        loopClass,
        Lifestyle.casual,
        loopClass.primestat === $stat`Mysticality` ? "blender" : "platypus",
        $item`astral six-pack`,
        $item`astral pet sweater`
      );
    } else {
      ascend(
        Path.get("Community Service"),
        loopClass,
        Lifestyle.softcore,
        loopClass.primestat === $stat`Mysticality` ? "blender" : "platypus",
        $item`astral six-pack`,
        $item`astral statuette`
      );
    }
  }

  // CS portion
  if (myDaycount() === 1 && !casual && inCsLeg()) {
    if (!canInteract()) {
      hccs();
    }

    if (canInteract()) {
      checkNepQuest();
      printNepQuestItem();

      withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

      if (AsdonMartin.installed() && !get("_workshedItemUsed")) {
        // Get 540 turns of Driving Observantly (660 - 120 expected CS turns).
        new Mood().drive(AsdonMartin.Driving.Observantly).execute(1230 - myTurncount());
        use($item`cold medicine cabinet`);
      }

      burnTurns(false);
    }
  }

  // Casual portion
  if (casual && myDaycount() === 1 && canInteract() && !inCsLeg()) {
    if (!get("kingLiberated")) {
      maximize("", false);
      checkNepQuest();
      printNepQuestItem();

      if (getWorkshed() === $item`none`) {
        use($item`Asdon Martin keyfob`);
      }

      cliExecute("loopcasual");
    }

    if (get("kingLiberated")) {
      if (AsdonMartin.installed() && !get("_workshedItemUsed")) {
        new Mood().drive(AsdonMartin.Driving.Observantly).execute(1230 - myTurncount());
        use($item`cold medicine cabinet`);
      }

      withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

      burnTurns(false);
    }
  }

  printNepQuestItem();
}
