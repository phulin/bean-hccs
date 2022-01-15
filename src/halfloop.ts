import {
  canInteract,
  cliExecute,
  inebrietyLimit,
  myAdventures,
  myDaycount,
  myFamiliar,
  myInebriety,
  myTurncount,
  pvpAttacksLeft,
  retrieveItem,
  use,
  useFamiliar,
} from "kolmafia";
import { $familiar, $item, AsdonMartin, Clan, get, Mood, withProperty } from "libram";
import { main as hccs } from ".";
import { main as ascend } from "./ascend";
import { main as pre } from "./pre";

export function main(): void {
  if (myFamiliar() === $familiar`Stooper`) useFamiliar($familiar`none`);

  if (myDaycount() === 2) {
    withProperty("libramSkillsSoftcore", "none", () => cliExecute("breakfast"));

    if (myInebriety() <= inebrietyLimit() && myAdventures() > 0) {
      if (!get("_floundryItemCreated")) {
        Clan.join("Bonus Adventures from Hell");
        retrieveItem($item`carpe`);
      }
      cliExecute("garbo ascend");
    }

    if (myInebriety() === inebrietyLimit() && myAdventures() === 0) {
      cliExecute("nightcap ascend");

      if (myInebriety() >= inebrietyLimit()) {
        cliExecute("garbo ascend");
        if (myAdventures() === 0) {
          pre();
          if (pvpAttacksLeft() === 0) {
            ascend();
          }
        }
      }
    }
  }

  if (myDaycount() === 1) {
    if (!canInteract()) {
      hccs();
    }

    if (canInteract()) {
      if (AsdonMartin.installed() && !get("_workshedItemUsed")) {
        // Get 1110 turns of Driving Observantly (1230 - 120 expected CS turns).
        new Mood().drive(AsdonMartin.Driving.Observantly).execute(1230 - myTurncount());
        use($item`cold medicine cabinet`);
        // retrieveItem($item`Mayo Minder™`);
        // cliExecute("mayominder adv");
      }

      if (myInebriety() <= inebrietyLimit() && myAdventures() > 0) {
        if (!get("_floundryItemCreated")) {
          Clan.join("Bonus Adventures from Hell");
          retrieveItem($item`carpe`);
        }
        cliExecute("garbo");
      }

      if (myInebriety() === inebrietyLimit() && myAdventures() === 0) {
        cliExecute("nightcap");
      }
    }
  }
}
