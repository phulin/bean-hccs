import {
  canInteract,
  Class,
  cliExecute,
  getWorkshed,
  inebrietyLimit,
  Item,
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
  withProperties,
  withProperty,
} from "libram";
import { main as hccs } from ".";
import { checkNepQuest, printNepQuestItem } from "./nep";
import { main as pre } from "./pre";

function floundry(item: Item): void {
  if (!get("_floundryItemCreated") && !have(item)) {
    Clan.join("Bonus Adventures from Hell");
    retrieveItem(item);
  }
}

function inCsLeg(): boolean {
  return myPath().name === "Community Service" || get("csServicesPerformed") !== "";
}

const runProperties = {
  _snokebombUsed: 3,
  _reflexHammerUsed: 3,
  _feelHatredUsed: 3,
  _kgbTranquilizerDartUses: 3,
  _middleFingerRingUsed: true,
  _navelRunaways: 10,
};

function burnTurns(ascending: boolean, mode: "garbo" | "cognac", extraArgs: string[]): void {
  if (have($item`can of Rain-Doh`)) use($item`can of Rain-Doh`);

  if (ascending) {
    extraArgs = [...extraArgs, "ascend"];
  }

  if (
    (myInebriety() === inebrietyLimit() && myAdventures() > 0) ||
    myInebriety() < inebrietyLimit()
  ) {
    if (mode === "garbo") {
      floundry($item`carpe`);
      cliExecute(`garbo ${extraArgs.join(" ")}`);
    } else {
      floundry($item`codpiece`);
      if (get("_garboCompleted") === "") {
        withProperties(runProperties, () => cliExecute("garboween ascend quick"));
      }
      if (!ascending && AsdonMartin.installed() && !get("_workshedItemUsed")) {
        new Mood().drive(AsdonMartin.Driving.Stealthily).execute(1150 - myTurncount());
        use($item`cold medicine cabinet`);
      }
      cliExecute("cognac");
    }
  }

  if (myInebriety() === inebrietyLimit() && myAdventures() === 0) {
    cliExecute(ascending ? "nightcap ascend" : "nightcap");
  }

  if (ascending && myInebriety() > inebrietyLimit()) {
    if (mode === "garbo") {
      cliExecute(`garbo ${extraArgs.join(" ")}`);
    } else {
      withProperties(runProperties, () => cliExecute("garboween ascend quick"));
      cliExecute("cognac");
    }
    if (myAdventures() === 0) {
      pre();
    }
  }
}

export function main(argString = ""): void {
  const args = argString.split(" ");
  let casual = false;
  let prep = false;
  let loopClass = $class`Seal Clubber`;
  let mode: "cognac" | "garbo" = "garbo";
  const extraArgs = [];
  for (const arg of args) {
    if (arg === "casual") {
      casual = true;
    } else if (arg === "prep") {
      prep = true;
    } else if (arg === "cognac") {
      mode = "cognac";
    } else if (
      Class.all()
        .map((loopClass) => loopClass.toString().toLowerCase())
        .includes(arg.toLowerCase())
    ) {
      loopClass = Class.get(arg as unknown as number);
      print(`Ascending as class ${loopClass}.`, "blue");
    } else {
      extraArgs.push(arg);
    }
  }

  print(
    `Starting ${casual ? "casual" : "CS"} loop${prep ? " prep only" : ""}, ${mode} mode.`,
    "blue"
  );

  if (myFamiliar() === $familiar`Stooper`) useFamiliar($familiar`none`);

  // End current day.
  if (myDaycount() >= 2) {
    checkNepQuest();
    printNepQuestItem();

    withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

    burnTurns(true, mode, extraArgs);
  }

  if (!prep && myInebriety() > inebrietyLimit() && myAdventures() === 0 && pvpAttacksLeft() === 0) {
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
        new Mood()
          .drive(AsdonMartin.Driving.Observantly)
          .execute(mode === "garbo" ? 1150 - myTurncount() : 120);
        if (mode === "garbo") use($item`cold medicine cabinet`);
      }

      burnTurns(false, mode, extraArgs);
    }
  }

  // Casual portion
  if (casual && myDaycount() === 1 && canInteract() && !inCsLeg()) {
    if (!get("kingLiberated")) {
      maximize("", false);
      checkNepQuest();
      printNepQuestItem();

      if (getWorkshed() === $item`none`) {
        use($item`Asdon Martin keyfob (on ring)`);
      }

      cliExecute("loopcasual");
    }

    if (get("kingLiberated")) {
      if (AsdonMartin.installed() && !get("_workshedItemUsed")) {
        new Mood().drive(AsdonMartin.Driving.Observantly).execute(1230 - myTurncount());
        use($item`cold medicine cabinet`);
      }

      withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

      burnTurns(false, mode, extraArgs);
    }
  }

  printNepQuestItem();
}
