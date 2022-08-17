import {
  availableAmount,
  cliExecute,
  equip,
  equippedAmount,
  haveOutfit,
  Item,
  itemAmount,
  outfit,
  outfitPieces,
  retrieveItem,
  Slot,
  SlotType,
} from "kolmafia";
import { arrayToCountedMap, getFoldGroup, have } from "libram";
import { arrayEqual } from "./lib";

type OutfitSlot =
  | "hat"
  | "back"
  | "shirt"
  | "weapon"
  | "off-hand"
  | "pants"
  | "acc1"
  | "acc2"
  | "acc3";

export function donOutfit(name: string, equipment?: { [K in OutfitSlot]: Item }): boolean {
  if (!equipment) return outfit(name);

  const nativeOutfitEquipment = Object.values(equipment).sort();

  for (const [item, count] of arrayToCountedMap(Object.values(equipment))) {
    if (!have(item) && getFoldGroup(item).some((folder) => have(folder))) {
      cliExecute(`fold ${item}`);
    }
    if (availableAmount(item) >= count && itemAmount(item) + equippedAmount(item) < count) {
      retrieveItem(count - equippedAmount(item), item);
    }
  }

  if (haveOutfit(name)) {
    const pieces = outfitPieces(name).sort();
    if (arrayEqual(nativeOutfitEquipment, pieces)) {
      return outfit(name);
    }
  }

  let success = true;
  for (const [slot, item] of Object.entries(equipment)) {
    success &&= equip(Slot.get(slot as SlotType), item);
  }

  cliExecute(`outfit save ${name}`);

  return success;
}
