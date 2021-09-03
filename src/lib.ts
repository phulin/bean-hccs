import {
  availableAmount,
  buy,
  buyUsingStorage,
  cliExecute,
  create,
  eat,
  equip,
  familiarWeight,
  getClanName,
  getFuel,
  getProperty,
  haveEffect,
  haveSkill,
  myFamiliar,
  myMaxmp,
  myMp,
  print,
  pullsRemaining,
  retrieveItem,
  setProperty,
  shopAmount,
  storageAmount,
  takeShop,
  toEffect,
  toString as toStringAsh,
  totalTurnsPlayed,
  toUrl,
  use,
  useSkill,
  visitUrl,
  weightAdjustment,
} from "kolmafia";
import { $effect, $effects, $item, $skill, get, set } from "libram";

export function entries<V>(obj: { [index: string]: V }): [string, V][] {
  const ownProps = Object.keys(obj);
  let i = ownProps.length;
  const resArray = new Array(i); // preallocate the Array
  while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

  return resArray;
}

export function incrementProperty(name: string): void {
  set(name, get<number>(name) + 1);
}

export function setChoice(adv: number, choice: number): void {
  set(`choiceAdventure${adv}`, `${choice}`);
}

export function myFamiliarWeight(): number {
  return familiarWeight(myFamiliar()) + weightAdjustment();
}

export function ensureItem(quantity: number, it: Item): void {
  if (availableAmount(it) < quantity) {
    buy(quantity - availableAmount(it), it);
  }
  if (availableAmount(it) < quantity) {
    throw `Could not buy ${quantity} of item ${it.name}: only ${availableAmount(it)}.`;
  }
}

export function ensureCreateItem(quantity: number, it: Item): void {
  if (availableAmount(it) < quantity) {
    create(quantity - availableAmount(it), it);
  }
  if (availableAmount(it) < quantity) {
    throw "Could not create item.";
  }
}

export function ensureSewerItem(quantity: number, it: Item): void {
  while (availableAmount(it) < quantity) {
    ensureItem(1, $item`chewing gum on a string`);
    use(1, $item`chewing gum on a string`);
  }
}

export function ensureHermitItem(quantity: number, it: Item): void {
  if (availableAmount(it) >= quantity) {
    return;
  }
  const count = quantity - availableAmount(it);
  while (
    availableAmount($item`worthless trinket`) +
      availableAmount($item`worthless gewgaw`) +
      availableAmount($item`worthless knick-knack`) <
    count
  ) {
    ensureItem(1, $item`chewing gum on a string`);
    use(1, $item`chewing gum on a string`);
  }
  ensureItem(1, $item`hermit permit`);
  retrieveItem(count, it);
}

export function ensureNpcEffect(ef: Effect, quantity: number, potion: Item): void {
  if (haveEffect(ef) === 0) {
    ensureItem(quantity, potion);
    if (!cliExecute(ef.default) || haveEffect(ef) === 0) {
      throw `Failed to get effect ${ef.name}`;
    }
  } else {
    print(`Already have effect ${ef.name}.`);
  }
}

export function ensurePotionEffect(ef: Effect, potion: Item): void {
  if (haveEffect(ef) === 0) {
    if (availableAmount(potion) === 0) {
      create(1, potion);
    }
    if (!cliExecute(ef.default) || haveEffect(ef) === 0) {
      throw `Failed to get effect ${ef.name}.`;
    }
  } else {
    print(`Already have effect ${ef.name}.`);
  }
}

export function ensureEffect(ef: Effect, turns = 1): void {
  if (haveEffect(ef) < turns) {
    if (!cliExecute(ef.default) || haveEffect(ef) === 0) {
      throw `Failed to get effect ${ef.name}.`;
    }
  } else {
    print(`Already have effect ${ef.name}.`);
  }
}

export function ensureMpTonic(mp: number): void {
  const count = Math.max(mp - myMp(), 0) / 8;
  use(count, $item`Doc Galaktik's Invigorating Tonic`);
}

export function ensureMpSausage(mp: number): void {
  while (myMp() < Math.min(mp, myMaxmp())) {
    ensureCreateItem(1, $item`magical sausage`);
    eat(1, $item`magical sausage`);
  }
}

export function sausageFightGuaranteed(): boolean {
  const goblinsFought = get("_sausageFights");
  const nextGuaranteed =
    get("_lastSausageMonsterTurn") + 4 + goblinsFought * 3 + Math.max(0, goblinsFought - 5) ** 3;
  return goblinsFought === 0 || totalTurnsPlayed() >= nextGuaranteed;
}

export function itemPriority(...items: Item[]): Item {
  return items.find((item: Item) => availableAmount(item) > 0) ?? items[items.length - 1];
}

export function setClan(target: string): boolean {
  if (getClanName() !== target) {
    const clanCache = JSON.parse(getProperty("hccs_clanCache") || "{}");
    if (clanCache.target === undefined) {
      const recruiter = visitUrl("clan_signup.php");
      const clanRe = /<option value=([0-9]+)>([^<]+)<\/option>/g;
      let match;
      while ((match = clanRe.exec(recruiter)) !== null) {
        clanCache[match[2]] = match[1];
      }
    }
    setProperty("hccs_clanCache", JSON.stringify(clanCache));

    visitUrl(`showclan.php?whichclan=${clanCache[target]}&action=joinclan&confirm=on&pwd`);
    if (getClanName() !== target) {
      throw `failed to switch clans to ${target}. Did you spell it correctly? Are you whitelisted?`;
    }
  }
  return true;
}

export function ensureDough(goal: number): void {
  while (availableAmount($item`wad of dough`) < goal) {
    buy(1, $item`all-purpose flower`);
    use(1, $item`all-purpose flower`);
  }
}

export function fuelAsdon(goal: number): number {
  const startingFuel = getFuel();
  if (startingFuel > goal) return startingFuel;

  print(`Fueling asdon. Currently ${startingFuel} litres.`);
  const estimated = Math.floor((goal - startingFuel) / 5);
  const bread = availableAmount($item`loaf of soda bread`);
  ensureDough(estimated - bread);
  ensureItem(estimated - bread, $item`soda water`);
  ensureCreateItem(estimated, $item`loaf of soda bread`);
  cliExecute(`asdonmartin fuel ${estimated} loaf of soda bread`);
  while (getFuel() < goal) {
    ensureDough(1);
    ensureItem(1, $item`soda water`);
    ensureCreateItem(1, $item`loaf of soda bread`);
    cliExecute("asdonmartin fuel 1 loaf of soda bread");
  }
  const endingFuel = getFuel();
  print(`Done fueling. Now ${endingFuel} litres.`);
  return endingFuel;
}

export function ensureAsdonEffect(ef: Effect): void {
  if (haveEffect(ef) === 0) {
    fuelAsdon(37);
  }
  ensureEffect(ef);
}

export function mapMonster(location: Location, monster: Monster): void {
  if (
    haveSkill($skill`Map the Monsters`) &&
    !get("mappingMonsters") &&
    get("_monstersMapped") < 3
  ) {
    useSkill($skill`Map the Monsters`);
  }

  if (!get("mappingMonsters")) throw "Failed to setup Map the Monsters.";

  const mapPage = visitUrl(toUrl(location), false, true);
  if (!mapPage.includes("Leading Yourself Right to Them")) throw "Something went wrong mapping.";

  const fightPage = visitUrl(
    `choice.php?pwd&whichchoice=1435&option=1&heyscriptswhatsupwinkwink=${monster.id}`
  );
  if (!fightPage.includes(monster.name)) throw "Something went wrong starting the fight.";
}

export function tryUse(quantity: number, it: Item): boolean {
  if (availableAmount(it) > 0) {
    return use(quantity, it);
  } else {
    return false;
  }
}

export function tryEquip(it: Item): boolean {
  if (availableAmount(it) > 0) {
    return equip(it);
  } else {
    return false;
  }
}

export function pullIfPossible(quantity: number, it: Item, maxPrice: number): boolean {
  if (pullsRemaining() > 0) {
    const quantityPull = Math.max(0, quantity - availableAmount(it));
    if (shopAmount(it) > 0) {
      takeShop(Math.min(shopAmount(it), quantityPull), it);
    }
    if (storageAmount(it) < quantityPull) {
      buyUsingStorage(quantityPull - storageAmount(it), it, maxPrice);
    }
    cliExecute(`pull ${quantityPull} ${it.name}`);
    return true;
  } else return false;
}

export function ensurePullEffect(ef: Effect, it: Item): void {
  if (haveEffect(ef) === 0) {
    if (availableAmount(it) > 0 || pullIfPossible(1, it, 50000)) ensureEffect(ef);
  }
}

export function shrug(ef: Effect): void {
  if (haveEffect(ef) > 0) {
    cliExecute(`shrug ${ef.name}`);
  }
}

// We have Stevedave's, Ur-Kel's on at all times during leveling (managed via mood); third and fourth slots are variable.
const songSlots = [
  $effects`Stevedave's Shanty of Superiority`,
  $effects`Ur-Kel's Aria of Annoyance`,
  $effects`Power Ballad of the Arrowsmith, The Magical Mojomuscular Melody, The Moxious Madrigal, Ode to Booze, Jackasses' Symphony of Destruction`,
  $effects`Carlweather's Cantata of Confrontation, The Sonata of Sneakiness, Fat Leon's Phat Loot Lyric, Polka of Plenty`,
];
const allKnownSongs = ([] as Effect[]).concat(...songSlots);
const allSongs = Skill.all()
  .filter(
    (skill) => toStringAsh(skill.class as unknown as string) === "Accordion Thief" && skill.buff
  )
  .map((skill) => toEffect(skill));
export function openSongSlot(song: Effect): void {
  for (const songSlot of songSlots) {
    if (songSlot.includes(song)) {
      for (const shruggable of songSlot) {
        shrug(shruggable);
      }
    }
  }
  for (const badSong of allSongs) {
    if (!allKnownSongs.includes(badSong)) {
      shrug(badSong);
    }
  }
}

export function ensureSong(ef: Effect): void {
  if (haveEffect(ef) === 0) {
    openSongSlot(ef);
    if (!cliExecute(ef.default) || haveEffect(ef) === 0) {
      throw `Failed to get effect ${ef.name}`;
    }
  } else {
    print(`Already have effect ${ef.name}.`);
  }
}

export function ensureOde(turns: number): void {
  while (haveEffect($effect`Ode to Booze`) < turns) {
    ensureMpTonic(50);
    openSongSlot($effect`Ode to Booze`);
    useSkill(1, $skill`The Ode to Booze`);
  }
}
