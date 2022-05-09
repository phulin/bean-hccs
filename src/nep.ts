import {
  adv1,
  itemAmount,
  itemType,
  print,
  putShop,
  refreshShop,
  repriceShop,
  runChoice,
  shopAmount,
  shopLimit,
  shopPrice,
  takeShop,
  toUrl,
  use,
  visitUrl,
} from "kolmafia";
import { $item, $items, $location, get, questStep } from "libram";
import { setChoice } from "./lib";

const checkItems = [
  $item`tin cup of mulligan stew`,
  $item`Hodgman's blanket`,
  $item`jar of fermented pickle juice`,
  $item`extra-greasy slider`,
  $item`Dreadsylvanian grimlet`,
  $item`Dreadsylvanian spooky pocket`,
  $item`jumping horseradish`,
];

function reprice(newPrices: { item: Item; price: number; limit: number }[]) {
  // const itemParams = newPrices
  //   .map(
  //     ({ item, price, limit }) =>
  //       `price%5B${toInt(item)}%5D=${price}&limit%5B${toInt(item)}%5D=${limit}`
  //   )
  //   .join("&");
  // const url = `backoffice.php?pwd=${myHash()}&action=updateinv&ajax=1&${itemParams}`;
  // print(`URL: ${url}`);
  // const response = visitUrl(url, false, true);
  // print(`Response: ${response.length} bytes`);
  // print(`<pre>${response}</pre>`);
  // const desired = newPrices.map(
  //   ({ item }) => [item, `${entityEncode(item.name)} updated`] as [Item, string]
  // );
  // const desiredNotUpdated = desired.filter(([, message]) => !response.includes(message));
  // if (desiredNotUpdated.length > 0) {
  //   throw `Failed to update ${desiredNotUpdated.map(([item]) => item.name).join(", ")}.`;
  // } else {
  //   print(`Updated ${desired.map(([item]) => item.name).join(", ")}.`);
  // }
  for (const { item, price, limit } of newPrices) {
    repriceShop(price, limit, item);
  }
}

function withPrices<T>(newPrices: { item: Item; price: number; limit: number }[], action: () => T) {
  refreshShop();
  const pricesToUse = newPrices.filter(({ item }) => shopAmount(item) === 520);
  print(`Using items ${pricesToUse.map(({ item }) => item.name).join(", ")}.`, "blue");

  const before = pricesToUse
    .map(({ item }) => ({
      item,
      price: shopPrice(item),
      limit: shopLimit(item),
    }))
    .reverse();

  try {
    reprice(pricesToUse);
    return action();
  } finally {
    reprice(before);

    refreshShop();
    for (const { item } of pricesToUse) {
      if (shopPrice(item) <= 2000) {
        takeShop(item);
        // eslint-disable-next-line no-unsafe-finally
        throw `Uh oh. Item ${item} is too cheap. Removed from store. Please fix manually.`;
      }
    }
  }
}

function manageItemQuantities(items: Item[]) {
  refreshShop();
  for (const item of items) {
    if (shopAmount(item) < 520 && shopAmount(item) + itemAmount(item) >= 520) {
      const currentPrice = shopPrice(item);
      const currentLimit = shopLimit(item);
      if (!putShop(currentPrice, currentLimit, Math.max(0, 520 - shopAmount(item)), item)) {
        throw `Failed to put ${item} in shop.`;
      }
    } else if (shopAmount(item) > 520) {
      takeShop(Math.max(0, shopAmount(item) - 520), item);
    }

    if (shopAmount(item) < 520) {
      print(`SKIPPING ${item} as not enough in store.`, "red");
    }
  }
}

export function checkNepQuest(): void {
  if (get("_questPartyFair") === "unstarted") {
    visitUrl(toUrl($location`The Neverending Party`));
    if (["food", "booze"].includes(get("_questPartyFairQuest"))) {
      print("Gerald/ine quest!", "blue");
      runChoice(1); // Accept quest
    } else {
      runChoice(2); // Decline quest
    }
  }

  const quest = get("_questPartyFairQuest");
  if (["food", "booze"].includes(quest)) {
    const checkItemsForQuest = checkItems.filter((item) => itemType(item) === quest);
    if (questStep("_questPartyFair") < 1 && !get("_claraBellUsed")) {
      manageItemQuantities(checkItemsForQuest);

      if (quest === "food") {
        setChoice(1324, 2); // Check out the kitchen
        setChoice(1326, 3); // Talk to the woman
      } else if (quest === "booze") {
        setChoice(1324, 3); // Go to the back yard
        setChoice(1327, 3); // Find Gerald
      }

      withPrices(
        checkItemsForQuest.map((item) => ({ item, price: 1999, limit: 0 })),
        () => {
          for (const item of checkItemsForQuest) {
            print(`${item.name} is ${shopPrice(item)} limit ${shopLimit(item)} in store.`, "blue");
          }
          use($item`Clara's bell`);
          adv1($location`The Neverending Party`, -1);
        }
      );
    }
  }

  const nepItem = nepQuestItem();
  if (nepItem && checkItems.includes(nepItem)) {
    print();
    print("==== NEP QUEST ====", "blue");
    print(`Gerald/ine wants ${nepItem}.`, "blue");
    throw "Aborting early.";
  }
}

export function nepQuestItem(): Item | null {
  if (
    ["food", "booze"].includes(get("_questPartyFairQuest")) &&
    get("_questPartyFairProgress") !== ""
  ) {
    const [, itemIdString] = get("_questPartyFairProgress").split(" ");
    return Item.get(parseInt(itemIdString));
  } else return null;
}

export function printNepQuestItem(): void {
  const nepItem = nepQuestItem();
  if (nepItem) {
    print();
    print("==== NEP QUEST ====", "blue");
    print(`Gerald/ine wants ${nepItem}.`, "blue");
  }
}

export function main(): void {
  const items = $items`bottle of limeade, elven squeeze`;
  manageItemQuantities(items);

  withPrices(
    items.map((item) => ({ item, price: 1999, limit: 0 })),
    () => {
      print("Doing nothing...");
    }
  );
}
