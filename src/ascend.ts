import { containsText, Path, use, visitUrl } from "kolmafia";
import { $class, $item, ascend, AsdonMartin, Lifestyle } from "libram";

export function main(): void {
  if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) {
    if (!AsdonMartin.installed()) use($item`Asdon Martin keyfob (on ring)`);
    visitUrl("ascend.php?action=ascend&confirm=on&confirm2=on");
  }
  if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) throw "Failed to ascend.";

  // abort('perm skills');

  ascend({
    path: Path.get("Community Service"),
    playerClass: $class`Seal Clubber`,
    lifestyle: Lifestyle.softcore,
    moon: "platypus",
    consumable: $item`astral six-pack`,
    pet: $item`astral statuette`,
  });
}
