import { containsText, use, visitUrl } from "kolmafia";
import { $class, $item, ascend, AsdonMartin, Lifestyle, Paths } from "libram";

if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) {
  if (!AsdonMartin.installed()) use($item`Asdon Martin keyfob`);
  visitUrl("ascend.php?action=ascend&confirm=on&confirm2=on");
}
if (!containsText(visitUrl("charpane.php"), "Astral Spirit")) throw "Failed to ascend.";

// abort('perm skills');

ascend(
  Paths.CommunityService,
  $class`Seal Clubber`,
  Lifestyle.softcore,
  "blender",
  $item`astral six-pack`,
  $item`astral statuette`
);
