import { buy, cliExecute, print, pvpAttacksLeft, use, visitUrl } from "kolmafia";
import { $item, have } from "libram";
import { setClan } from "./lib";

export function main(): void {
  buy(1, $item`electric muscle stimulator`);
  buy(1, $item`continental juice bar`);
  buy(1, $item`ceiling fan`);

  if (have($item`Peppermint Pip Packet`)) use(1, $item`Peppermint Pip Packet`);

  visitUrl("peevpee.php?action=smashstone&confirm=on");
  print("Stone smashed.");
  use(3, $item`Meteorite-Ade`);
  use(1, $item`School of Hard Knocks Diploma`);
  if (pvpAttacksLeft() > 0) {
    cliExecute("uberpvpoptimizer");
    cliExecute("swagger");
  }

  setClan("Bonus Adventures from Hell");

  cliExecute("breakfast");
}
