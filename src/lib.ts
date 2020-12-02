import {
  getProperty,
  toInt,
  setProperty,
  familiarWeight,
  myFamiliar,
  weightAdjustment,
  availableAmount,
  buy,
  use,
  retrieveItem,
  haveEffect,
  cliExecute,
  print,
  myMp,
  myMaxmp,
  eat,
  totalTurnsPlayed,
  getClanName,
  visitUrl,
  getFuel,
  create,
} from 'kolmafia';
import { $item } from 'libram/src';

export function getPropertyInt(name: string) {
  const str = getProperty(name);
  if (str === '') {
    throw 'Unknown property " + name + ".';
  }
  return toInt(str);
}

export function setPropertyInt(name: string, value: number) {
  setProperty(name, `${value}`);
}

export function getPropertyBoolean(name: string) {
  const str = getProperty(name);
  if (str === '') {
    throw 'Unknown property " + name + ".';
  }
  return str === 'true';
}

export function setChoice(adv: number, choice: number) {
  setProperty(`choiceAdventure${adv}`, `${choice}`);
}

export function myFamiliarWeight() {
  return familiarWeight(myFamiliar()) + weightAdjustment();
}

export function ensureItem(quantity: number, it: Item) {
  if (availableAmount(it) < quantity) {
    buy(quantity - availableAmount(it), it);
  }
  if (availableAmount(it) < quantity) {
    throw `Could not buy ${quantity} of item ${it.name}: only ${availableAmount(it)}.`;
  }
}

export function ensureCreateItem(quantity: number, it: Item) {
  if (availableAmount(it) < quantity) {
    create(quantity - availableAmount(it), it);
  }
  if (availableAmount(it) < quantity) {
    throw 'Could not create item.';
  }
}

export function ensureSewerItem(quantity: number, it: Item) {
  while (availableAmount(it) < quantity) {
    ensureItem(1, $item`chewing gum on a string`);
    use(1, $item`chewing gum on a string`);
  }
}

export function ensureHermitItem(quantity: number, it: Item) {
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

export function ensureNpcEffect(ef: Effect, quantity: number, potion: Item) {
  if (haveEffect(ef) === 0) {
    ensureItem(quantity, potion);
    if (!cliExecute(ef.default) || haveEffect(ef) === 0) {
      throw 'Failed to get effect " + ef.name + ".';
    }
  } else {
    print(`Already have effect ${ef.name}.`);
  }
}

export function ensurePotionEffect(ef: Effect, potion: Item) {
  if (haveEffect(ef) === 0) {
    if (availableAmount(potion) === 0) {
      create(1, potion);
    }
    if (!cliExecute(ef.default) || haveEffect(ef) === 0) {
      throw 'Failed to get effect " + ef.name + ".';
    }
  } else {
    print(`Already have effect ${ef.name}.`);
  }
}

export function ensureEffect(ef: Effect, turns = 1) {
  if (haveEffect(ef) < turns) {
    if (!cliExecute(ef.default) || haveEffect(ef) === 0) {
      throw 'Failed to get effect " + ef.name + ".';
    }
  } else {
    print(`Already have effect ${ef.name}.`);
  }
}

export function ensureMpTonic(mp: number) {
  while (myMp() < mp) {
    ensureItem(1, $item`Doc Galaktik's Invigorating Tonic`);
    use(1, $item`Doc Galaktik's Invigorating Tonic`);
  }
}

export function ensureMpSausage(mp: number) {
  while (myMp() < Math.min(mp, myMaxmp())) {
    ensureCreateItem(1, $item`magical sausage`);
    eat(1, $item`magical sausage`);
  }
}

export function sausageFightGuaranteed() {
  const goblinsFought = getPropertyInt('_sausageFights');
  const nextGuaranteed =
    getPropertyInt('_lastSausageMonsterTurn') + 4 + goblinsFought * 3 + Math.max(0, goblinsFought - 5) ** 3;
  return totalTurnsPlayed() >= nextGuaranteed;
}

export function itemPriority(...items: Item[]) {
  return items.find((item: Item) => availableAmount(item) > 0) ?? items[items.length - 1];
}

export function setClan(target: string) {
  if (getClanName() !== target) {
    const clanCache = JSON.parse(getProperty('hccs_clanCache') || '{}');
    if (clanCache.target === undefined) {
      const recruiter = visitUrl('clan_signup.php');
      const clanRe = /<option value=([0-9]+)>([^<]+)<\/option>/g;
      let match;
      while ((match = clanRe.exec(recruiter)) !== null) {
        clanCache[match[2]] = match[1];
      }
    }
    setProperty('hccs_clanCache', JSON.stringify(clanCache));

    visitUrl(`showclan.php?whichclan=${clanCache[target]}&action=joinclan&confirm=on&pwd`);
    if (getClanName() !== target) {
      throw `failed to switch clans to ${target}. Did you spell it correctly? Are you whitelisted?`;
    }
  }
  return true;
}

export function ensureDough(goal: number) {
  while (availableAmount($item`wad of dough`) < goal) {
    buy(1, $item`all-purpose flower`);
    use(1, $item`all-purpose flower`);
  }
}

export function fuelAsdon(goal: number) {
  const startingFuel = getFuel();
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
    cliExecute('asdonmartin fuel 1 loaf of soda bread');
  }
  const endingFuel = getFuel();
  print(`Done fueling. Now ${endingFuel} litres.`);
  return endingFuel;
}

export function ensureAsdonEffect(ef: Effect) {
  if (haveEffect(ef) === 0) {
    fuelAsdon(37);
  }
  ensureEffect(ef);
}
