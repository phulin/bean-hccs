import {
  canInteract,
  cliExecute,
  eat,
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
    cliExecute(ascending ? "garboween ascend" : "garboween");
    cliExecute("chrono");
    eat(23 - get("_sausagesEaten"), $item`magical sausage`);
    if (myAdventures() > 0) {
      cliExecute("chrono");
    }
  }

  if (myInebriety() === inebrietyLimit() && myAdventures() === 0) {
    cliExecute(ascending ? "nightcap ascend" : "nightcap");
  }

  if (ascending && myInebriety() > inebrietyLimit()) {
    cliExecute("chrono");
    if (myAdventures() === 0) {
      pre();
    }
  }
}

export function main(argString = ""): void {
  const args = argString.split(" ");
  const fullLoop = !args.includes("half");

  print(`Starting ${fullLoop ? "full" : "half"} loop.`, "blue");

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

      ascend(
        Path.get("Community Service"),
        $class`Seal Clubber`,
        Lifestyle.softcore,
        "platypus",
        $item`astral six-pack`,
        $item`astral statuette`
      );
    }
  }

  // CS portion
  if (myDaycount() === 1 && inCsLeg()) {
    if (!canInteract()) {
      hccs();
    }

    if (canInteract()) {
      checkNepQuest();
      printNepQuestItem();

      withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

      if (AsdonMartin.installed() && !get("_workshedItemUsed")) {
        // Get 540 turns of Driving Observantly (660 - 120 expected CS turns).
        new Mood().drive(AsdonMartin.Driving.Observantly).execute(660 - myTurncount());
        use($item`cold medicine cabinet`);
      }

      burnTurns(fullLoop);

      if (
        fullLoop &&
        myInebriety() > inebrietyLimit() &&
        myAdventures() === 0 &&
        pvpAttacksLeft() === 0
      ) {
        if (!AsdonMartin.installed() && !get("_workshedItemUsed")) {
          use($item`Asdon Martin keyfob`);
        }

        ascend(
          Path.none,
          $class`Seal Clubber`,
          Lifestyle.casual,
          "platypus",
          $item`astral six-pack`,
          $item`astral pet sweater`
        );
      }
    }
  }

  // Casual portion
  if (fullLoop && myDaycount() === 1 && canInteract() && !inCsLeg()) {
    if (!get("kingLiberated")) {
      maximize("", false);
      checkNepQuest();
      printNepQuestItem();

      cliExecute("loopcasual");
    }

    if (get("kingLiberated")) {
      withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

      if (AsdonMartin.installed() && !get("_workshedItemUsed")) {
        // Get 1110 turns of Driving Observantly (1230 - 450 expected casual turns).
        new Mood().drive(AsdonMartin.Driving.Observantly).execute(1230 - myTurncount());
        use($item`cold medicine cabinet`);
      }

      burnTurns(false);
    }
  }

  printNepQuestItem();
}
