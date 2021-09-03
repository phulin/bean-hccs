import {
  cliExecute,
  drink,
  eat,
  itemAmount,
  itemType,
  myFullness,
  myInebriety,
  print,
  retrieveItem,
  useSkill,
} from "kolmafia";
import { $item, get, have } from "libram";
import { ensureOde } from "./lib";

export class ResourceTracker {
  deckCards: string[] = [];
  genieWishes: Effect[] = [];
  tomeSummons: (Skill | Item)[] = [];
  consumedFood = new Map<Item, number>();
  consumedBooze = new Map<Item, number>();

  deck(card: string, attempt = false): void {
    if (get("_deckCardsSeen").toLowerCase().includes(card)) return;
    if (get("_deckCardsDrawn") <= 10) {
      cliExecute(`play ${card}`);
      this.deckCards.push(card);
    } else if (!attempt) {
      print(`WARNING: Tried to pull ${card} from deck, but we're out of draws.`, "orange");
    }
  }

  wish(effect: Effect, attempt = false): void {
    if (have(effect)) return;
    if (3 - get("_genieWishesUsed") + itemAmount($item`pocket wish`) > 0) {
      cliExecute(`genie effect ${effect}`);
      this.genieWishes.push(effect);
    } else if (!attempt) {
      print(`WARNING: Tried to wish for ${effect}, but we're out of wishes.`, "orange");
    }
  }

  clipArt(item: Item, attempt = false): void {
    if (get("tomeSummons") < 3) {
      retrieveItem(item);
      this.tomeSummons.push(item);
    } else if (!attempt) {
      print(`WARNING: Tried to summon clip art, but we're out of tome summons.`, "orange");
    }
  }

  tome(skill: Skill, attempt = false): void {
    if (get("tomeSummons") < 3) {
      useSkill(skill);
      this.tomeSummons.push(skill);
    } else if (!attempt) {
      print(`WARNING: Tried to use tome summon ${skill}, but we're out.`, "orange");
    }
  }

  consumeTo(threshold: number, item: Item): void {
    const typ = itemType(item);
    if (typ === "booze") {
      const count = Math.floor((threshold - myInebriety()) / item.inebriety);
      if (count > 0) {
        ensureOde(count * item.inebriety);
        drink(count, item);
        this.consumedBooze.set(item, (this.consumedBooze.get(item) ?? 0) + count);
      }
    } else if (typ === "food") {
      const count = Math.floor((threshold - myFullness()) / item.inebriety);
      if (count > 0) {
        eat(count, item);
        this.consumedFood.set(item, (this.consumedFood.get(item) ?? 0) + count);
      }
    }
  }

  summarize(): void {
    print("====== RESOURCE SUMMARY ======");
    print(`Deck: ${this.deckCards.join(", ")}`);
    print(`Wishes: ${this.genieWishes.map((effect) => effect.name).join(", ")}`);
    print(`Tomes: ${this.tomeSummons.map((skillOrItem) => skillOrItem.name).join(", ")}`);
    print("FOOD");
    for (const [food, count] of this.consumedFood) {
      print(`${count} ${food.plural}`);
    }
    print("BOOZE");
    for (const [booze, count] of this.consumedBooze) {
      print(`${count} ${booze.plural}`);
    }
  }

  serialize(): string {
    return JSON.stringify({
      deckCards: this.deckCards,
      genieWishes: this.genieWishes,
      tomeSummons: this.tomeSummons,
      consumedFood: [...this.consumedFood.entries()],
      consumedBooze: [...this.consumedBooze.entries()],
    });
  }

  static deserialize(data: string): ResourceTracker {
    const { deckCards, genieWishes, tomeSummons, consumedFood, consumedBooze } = JSON.parse(data);
    const result = new ResourceTracker();
    result.deckCards = deckCards ?? [];
    result.genieWishes = genieWishes ?? [];
    result.tomeSummons = tomeSummons ?? [];
    result.consumedFood = new Map(consumedFood ?? []);
    result.consumedBooze = new Map(consumedBooze ?? []);
    return result;
  }
}
