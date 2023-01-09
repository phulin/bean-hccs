import {
  availableAmount,
  getClanId,
  getClanName,
  handlingChoice,
  Item,
  itemAmount,
  print,
  putStash,
  refreshStash,
  retrieveItem,
  runChoice,
  stashAmount,
  takeStash,
  userConfirm,
  visitUrl,
} from "kolmafia";
import { $item, $items, Clan, get, have, set } from "libram";
import { Macro } from "./combat";

export function withStash<T>(
  clanIdOrName: string | number,
  itemsToTake: Item[] | [Item, number][],
  action: () => T
): T {
  const manager = new StashManager(clanIdOrName);
  try {
    if (Array.isArray(itemsToTake[0])) {
      manager.take(itemsToTake as [Item, number][]);
    } else {
      manager.take(itemsToTake as Item[]);
    }
    return action();
  } finally {
    manager.putBackAll();
  }
}

export function withStashClan<T>(itemsToTake: Item[] | [Item, number][], action: () => T): T {
  return withStash(get("duffo_stashClan", "none"), itemsToTake, action);
}

export function withVIPClan<T>(action: () => T): T {
  const clanIdOrNameString = get("duffo_vipClan");
  let clanIdOrName = clanIdOrNameString.match(/^\d+$/)
    ? parseInt(clanIdOrNameString)
    : clanIdOrNameString;
  if (clanIdOrName === "" && have($item`Clan VIP Lounge key`)) {
    if (
      userConfirm(
        "The preference 'duffo_vipClan' is not set. Use the current clan as a VIP clan? (Defaults to yes in 15 seconds)",
        15000,
        true
      )
    ) {
      clanIdOrName = getClanId();
      set("duffo_vipClan", clanIdOrName);
    }
  }
  return withClan(clanIdOrName || getClanId(), action);
}

function withClan<T>(clanIdOrName: string | number, action: () => T): T {
  const startingClanId = getClanId();
  Clan.join(clanIdOrName);
  try {
    return action();
  } finally {
    Clan.join(startingClanId);
  }
}

export class StashManager {
  clanIdOrName: string | number;
  enabled: boolean;
  taken = new Map<Item, number>();

  constructor(clanIdOrName: string | number) {
    this.clanIdOrName =
      typeof clanIdOrName === "string" && clanIdOrName.match(/^\d+$/)
        ? parseInt(clanIdOrName)
        : clanIdOrName;
    this.enabled = ![0, "", "none"].includes(this.clanIdOrName);
  }

  take(items: Item[]): void;
  take(items: [Item, number][]): void;
  take(rawItems: Item[] | [Item, number][]): void {
    if (rawItems.length === 0) {
      return;
    }
    const items = Array.isArray(rawItems[0])
      ? (rawItems as [Item, number][])
      : rawItems.map((item) => [item, 1] as [Item, number]);

    if (!this.enabled) {
      print(
        `Stash access is disabled. Ignoring request to borrow "${items
          .map(([item]) => item.name)
          .join(", ")}" from clan stash.`,
        "blue"
      );
      return;
    }

    let needStash = false;
    for (const [item, count] of items) {
      const remaining = count - availableAmount(item);

      if (remaining <= 0) {
        retrieveItem(count, item);
      } else {
        needStash = true;
      }
    }

    if (!needStash) return;

    withClan(this.clanIdOrName, () => {
      refreshStash();
      for (const [item, count] of items) {
        const remaining = count - availableAmount(item);

        if (remaining <= 0) {
          continue;
        }

        try {
          if (stashAmount(item) >= remaining) {
            if (takeStash(remaining, item)) {
              this.taken.set(item, (this.taken.get(item) ?? 0) + remaining);
            }
          } else {
            print(`Not enough of ${item.name} in the stash.`, "red");
          }
        } catch {
          print(
            `Failed to take ${
              item.name
            } from the stash. Do you have stash access in ${getClanName()}?`,
            "red"
          );
        }
        if (itemAmount(item) < count) {
          print(`Couldn't get enough of ${item.name} from clan stash for ${getClanName()}.`, "red");
        }
      }
    });
  }

  /**
   * Ensure at least one of each of {items} in inventory.
   * @param items Items to take from the stash.
   */
  ensure(items: Item[]): void {
    this.take(items.filter((item) => availableAmount(item) === 0));
  }

  putBack(...items: Item[]): void {
    if (items.length === 0) return;
    if (visitUrl("fight.php").includes("You're fighting")) {
      print("In fight, trying to get away to return items to stash...", "blue");
      Macro.tryItem(...$items`Louder Than Bomb, divine champagne popper`)
        .step("runaway")
        .submit();
    } else if (handlingChoice()) {
      print("Handling choice, running random choices until we're not...", "red");
      for (let i = 0; i < 3 && handlingChoice(); i++) {
        runChoice(1);
      }

      print(
        `I'm stuck in a choice, unfortunately, but were I not, I'd like to return the following items to your clan stash:`,
        "red"
      );
      items.forEach((item) => print(`${item.name},`, "red"));
    }
    withClan(this.clanIdOrName, () => {
      for (const item of items) {
        const count = this.taken.get(item);
        if (count !== undefined) {
          retrieveItem(count, item);
          if (putStash(count, item)) {
            print(`Returned ${item.name} to stash in ${getClanName()}.`, "blue");
            this.taken.delete(item);
          } else {
            throw `Failed to return ${item.name} to stash.`;
          }
        }
      }
    });
  }

  /**
   * Put all items back in the stash.
   */
  putBackAll(): void {
    this.putBack(...this.taken.keys());
  }
}
