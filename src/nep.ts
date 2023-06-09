import {
  adv1,
  cliExecute,
  currentRound,
  equip,
  handlingChoice,
  inMultiFight,
  Item,
  itemAmount,
  itemType,
  print,
  putShop,
  refreshShop,
  repriceShop,
  runChoice,
  setAutoAttack,
  shopAmount,
  shopLimit,
  shopPrice,
  takeShop,
  toUrl,
  use,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $effect,
  $item,
  $items,
  $location,
  $skill,
  $slot,
  get,
  questStep,
  set,
  uneffect,
} from "libram";
import { withStash } from "./clan";
import { adventureMacro, Macro } from "./combat";
import { setChoice } from "./lib";

const MALL_MAX = 999999999;
const SHOP_COUNT = 510;

const checkItems = [
  $item`tin cup of mulligan stew`,
  $item`jar of fermented pickle juice`,
  $item`extra-greasy slider`,
  $item`frozen banquet`,
  // $item`Hodgman's blanket`,
  // $item`Gets-You-Drunk`,
  $item`ghost pepper`,
  $item`bottle of Bloodweiser`,
  // $item`stinkwater`,
  $item`blood sausage`,
  $item`Dreadsylvanian hot pocket`,
  $item`Dreadsylvanian cold pocket`,
  $item`Dreadsylvanian spooky pocket`,
  $item`Dreadsylvanian stink pocket`,
  $item`Dreadsylvanian sleaze pocket`,
  $item`Dreadsylvanian grimlet`,
  $item`Dreadsylvanian slithery nipple`,
  $item`bottle of Greedy Dog`,
  $item`karma shawarma`,
  $item`emergency margarita`,
  $item`vintage smart drink`,
  $item`Mr. Burnsger`,
  $item`Doc Clock's thyme cocktail`,
  $item`The Plumber's mushroom stew`,
  // $item`Shot of Kardashian Gin`,
  // $item`eldritch elixir`,
  $item`mentholated wine`,
  $item`Feliz Navidad`,
  // $item`Newark`,
  $item`drive-by shooting`,
  $item`Affirmation Cookie`,
  $item`splendid martini`,
];

function escape() {
  if (currentRound() > 0 || inMultiFight()) {
    print("In fight, trying to get away to reprice items...", "red");
    Macro.tryItem(...$items`Louder Than Bomb, divine champagne popper`)
      .step("runaway")
      .submit();
  }

  if (handlingChoice()) {
    print("Handling choice, running random choices until we're not...", "red");
    for (let i = 0; i < 3 && handlingChoice(); i++) {
      runChoice(1);
    }
  }
}

function reprice(newPrices: { item: Item; price: number; limit: number }[]) {
  // batchOpen();
  for (const { item, price, limit } of newPrices) {
    repriceShop(price, limit, item);
  }
  // batchClose();
}

function adjustAmount(item: Item, targetAmount: number) {
  const difference = shopAmount(item) - targetAmount;
  if (difference === 0) {
    return;
  } else if (difference > 0) {
    if (!takeShop(difference, item)) {
      print(`WARNING: Failed to take out ${difference} ${item.plural}.`, "red");
    }
  } else if (-difference <= itemAmount(item)) {
    if (!putShop(shopPrice(item), shopLimit(item), -difference, item)) {
      print(`WARNING: Failed to reach target quantity by adding ${-difference} ${item.plural}.`);
    }
  } else {
    print(
      `Approximating target quantity ${targetAmount} by adding ${itemAmount(item)} ${item.plural}.`
    );
    if (!putShop(shopPrice(item), shopLimit(item), itemAmount(item), item)) {
      print(
        `WARNING: Failed to approximate target quantity by adding ${itemAmount(item)} ${
          item.plural
        }.`
      );
    }
  }
}

export function withShop<T>(
  newShopState: { item: Item; amount: number; price: number; limit: number }[],
  action: () => T
): T {
  refreshShop();
  const stateToUse = newShopState.filter(
    ({ item }) => itemAmount(item) + shopAmount(item) >= SHOP_COUNT
  );
  print(`Using items ${stateToUse.map(({ item }) => item.name).join(", ")}.`, "blue");

  const before = stateToUse
    .map(({ item }) => ({
      item,
      amount: shopAmount(item),
      price: shopPrice(item),
      limit: shopLimit(item),
    }))
    .reverse();

  try {
    for (const { item, amount } of stateToUse) {
      adjustAmount(item, amount);
    }
    reprice(stateToUse);
    return action();
  } finally {
    escape();

    reprice(stateToUse.map(({ item }) => ({ item, price: MALL_MAX, limit: 0 })));
    for (const { item, amount } of before) {
      adjustAmount(item, amount);
    }
    reprice(before.filter(({ amount }) => amount > 0));

    refreshShop();
  }
}

function neededItems(items: Item[]) {
  refreshShop();
  const needed: [Item, number][] = [];
  for (const item of items) {
    if (shopAmount(item) + itemAmount(item) < SHOP_COUNT) {
      const itemNeeded = SHOP_COUNT - shopAmount(item) - itemAmount(item);
      print(`Need ${itemNeeded} ${item.plural} from stash.`, "blue");
      needed.push([item, itemNeeded]);
    }
  }
  return needed;
}

export function checkNepQuest(): void {
  uneffect($effect`Teleportitis`);
  uneffect($effect`Feeling Lost`);

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
      const needed = neededItems(checkItemsForQuest);

      if (quest === "food") {
        setChoice(1324, 2); // Check out the kitchen
        setChoice(1326, 3); // Talk to the woman
      } else if (quest === "booze") {
        setChoice(1324, 3); // Go to the back yard
        setChoice(1327, 3); // Find Gerald
      }

      setAutoAttack(0);
      set("battleAction", "custom combat script");
      cliExecute("ccs bean-hccs");
      cliExecute("mood apathetic");

      // Unequip June cleaver.
      equip($slot`weapon`, $item`none`);
      equip($slot`off-hand`, $item`none`);

      // Clear any pending time pranks.
      adventureMacro(
        $location`The Haunted Kitchen`,
        Macro.trySkill($skill`Feel Hatred`)
          .tryItem($item`Louder Than Bomb`)
          .runaway()
      );

      use($item`Clara's bell`);
      withStash(get("duffo_nepClan", "none"), needed, () => {
        withShop(
          checkItemsForQuest.map((item) => ({ item, amount: SHOP_COUNT, price: 420, limit: 0 })),
          () => {
            for (const item of checkItemsForQuest) {
              print(
                `${item.name} is ${shopPrice(item)} limit ${shopLimit(item)} in store.`,
                "blue"
              );
            }
            wait(1);
            adv1($location`The Neverending Party`, -1);
          }
        );
      });
    }
  }

  const lowPrice: Item[] = [];
  for (const item of checkItems) {
    if (shopPrice(item) <= 2000) {
      takeShop(item);
      lowPrice.push(item);
    }
  }
  if (lowPrice.length > 0) {
    throw `Uh oh. Items ${lowPrice
      .map((item) => item.name)
      .join(", ")} are too cheap. Removed from store. Please fix manually.`;
  }

  const nepItem = nepQuestItem();
  // if (nepItem) userNotify(`NEP QUEST: ${nepItem}`);
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
  print("Pulling all items...", "blue");
  for (const item of checkItems) {
    takeShop(item);
  }
}
