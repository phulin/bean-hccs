import { containsText, Path, use, visitUrl } from "kolmafia";
import { $class, $item, ascend, AsdonMartin, Lifestyle } from "libram";

export function main(): void {
  if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) {
    if (!AsdonMartin.installed()) use($item`Asdon Martin keyfob`);
    visitUrl("ascend.php?action=ascend&confirm=on&confirm2=on");
  }
  if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) throw "Failed to ascend.";

  // abort('perm skills');

  ascend(
    Path.get("Community Service"),
    $class`Seal Clubber`,
    Lifestyle.softcore,
    "platypus",
    $item`astral six-pack`,
    $item`none`
  );
}
