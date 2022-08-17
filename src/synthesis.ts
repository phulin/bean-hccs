import {
  availableAmount,
  Effect,
  getInventory,
  haveEffect,
  Item,
  mySign,
  print,
  retrieveItem,
  sweetSynthesis,
  sweetSynthesisResult,
} from "kolmafia";
import { $effects, $item, $items } from "libram";
import { ensureItem } from "./lib";

const npcCandies = $items`jabañero-flavored chewing gum, lime-and-chile-flavored chewing gum, pickle-flavored chewing gum, tamarind-flavored chewing gum`;

function addNumericMapTo<T>(base: Map<T, number>, addition: Map<T, number>) {
  for (const [key, count] of addition) {
    base.set(key, (base.get(key) ?? 0) + count);
  }
}

function subtractNumericMapFrom<T>(base: Map<T, number>, subtraction: Map<T, number>) {
  for (const [key, count] of subtraction) {
    base.set(key, (base.get(key) ?? 0) - count);
  }
}

export class SynthesisPlanner {
  plan: Effect[];
  simple: Map<Item, number> = new Map<Item, number>();
  complex: Map<Item, number> = new Map<Item, number>();
  used: Map<Item, number> = new Map<Item, number>();
  depth = 0;

  constructor(plan: Effect[]) {
    this.plan = plan;
  }

  synthesize(effect: Effect, index: number | null = null): void {
    if (haveEffect(effect) > 0) {
      print(`Already have effect ${effect.name}.`);
      return;
    }

    this.simple.clear();
    this.complex.clear();
    this.used.clear();
    this.depth = 0;

    const inventory = getInventory();
    for (const itemName of Object.keys(inventory)) {
      const item = Item.get(itemName);
      const count = inventory[itemName];
      if (item.candyType === "simple" || item === $item`Chubby and Plump bar`)
        this.simple.set(item, count);
      if (item.candyType === "complex") this.complex.set(item, count);
    }

    if (
      ["Wombat", "Blender", "Packrat"].includes(mySign()) &&
      availableAmount($item`bitchin' meatcar`) + availableAmount($item`Desert Bus pass`) > 0
    ) {
      for (const candy of npcCandies) {
        this.simple.set(candy, Infinity);
      }
    }

    const startIndex = index !== null ? index : this.plan.indexOf(effect);
    if (startIndex === -1) throw "No such effect in plan!";
    const remainingPlan = this.plan.slice(startIndex);
    print(`${effect} remaining plan: ${remainingPlan}`);

    const firstStep = this.synthesizeInternal(remainingPlan, new Map<Item, number>());
    if (firstStep !== null) {
      const [formA, formB] = firstStep;
      for (const candy of firstStep) {
        if (npcCandies.includes(candy)) {
          ensureItem(formA === formB ? 2 : 1, candy);
        } else {
          retrieveItem(formA === formB ? 2 : 1, candy);
        }
      }
      sweetSynthesis(formA, formB);
    } else {
      throw `Failed to synthesisze effect ${effect.name}. Please plan it out and re-run me.`;
    }
  }

  getCandyOptions(effect: Effect): [Map<Item, number>, Map<Item, number>] {
    if (
      $effects`Synthesis: Hot, Synthesis: Cold, Synthesis: Pungent, Synthesis: Scary, Synthesis: Greasy`.includes(
        effect
      )
    ) {
      return [this.simple, this.simple];
    } else if (
      $effects`Synthesis: Strong, Synthesis: Smart, Synthesis: Cool, Synthesis: Hardy, Synthesis: Energy`.includes(
        effect
      )
    ) {
      return [this.simple, this.complex];
    } else {
      return [this.complex, this.complex];
    }
  }

  synthesizeInternal(
    remainingPlan: Effect[],
    usedLastStep: Map<Item, number>
  ): [Item, Item] | null {
    addNumericMapTo(this.used, usedLastStep);
    this.depth += 1;
    const effect = remainingPlan[0];
    const [optionsA, optionsB] = this.getCandyOptions(effect);
    for (const [itemA, rawCountA] of optionsA) {
      const countA = rawCountA - (this.used.get(itemA) ?? 0);
      if (countA <= 0) continue;
      for (const formA of candyForms(itemA)) {
        for (const [itemB, rawCountB] of optionsB) {
          const countB = rawCountB - (this.used.get(itemB) ?? 0) - (itemA === itemB ? 1 : 0);
          if (countB <= 0) continue;
          for (const formB of candyForms(itemB)) {
            if (sweetSynthesisResult(formA, formB) !== effect) continue;

            const prefix = new Array(this.depth).fill(">").join("");
            print(`${prefix} Testing pair < ${formA.name} / ${formB.name} > for ${effect}.`);
            const usedThisStep = new Map<Item, number>([[itemA, 1]]);
            usedThisStep.set(itemB, itemA === itemB ? 2 : 1);
            if (
              remainingPlan.length === 1 ||
              this.synthesizeInternal(remainingPlan.slice(1), usedThisStep) !== null
            ) {
              subtractNumericMapFrom(this.used, usedLastStep);
              return [formA, formB];
            }
          }
        }
      }
    }
    this.depth -= 1;
    subtractNumericMapFrom(this.used, usedLastStep);
    return null;
  }
}

const CANDY_FORMS = new Map<Item, Item[]>([
  [$item`peppermint sprout`, $items`peppermint sprout, peppermint twist`],
]);
function candyForms(candy: Item) {
  return CANDY_FORMS.get(candy) ?? [candy];
}
