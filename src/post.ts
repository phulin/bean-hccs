import {
  itemAmount,
  closetAmount,
  takeCloset,
  shopAmount,
  takeShop,
  retrieveItem,
  mallPrice,
  buy,
  canInteract,
  cliExecute,
  setProperty,
  useSkill,
  runChoice,
  getProperty,
  myAdventures,
  eat,
  availableAmount,
  equip,
  myClass,
  useFamiliar,
  use,
  haveEffect,
  maximize,
  myBuffedstat,
  adv1,
  fullnessLimit,
  myFullness,
  inebrietyLimit,
  myInebriety,
  drink,
  create,
} from 'kolmafia';
import { $skill, $item, $slot, $class, $familiar, $effect, $stat, $location } from 'libram/src';
import { getPropertyBoolean, ensureMpSausage, ensureEffect, itemPriority } from './lib';

function get(qty: number, item: Item, maxPrice: number) {
  if (qty > 15) throw 'Bad get!';

  let remaining = qty - itemAmount(item);
  if (remaining <= 0) return;

  const getCloset = Math.min(remaining, closetAmount(item));
  if (!takeCloset(getCloset, item)) throw 'Failed to remove item from closet.';
  remaining -= getCloset;
  if (remaining <= 0) return;

  const getMall = Math.min(remaining, shopAmount(item));
  if (!takeShop(getMall, item)) throw 'Failed to remove item from shop.';
  remaining -= getMall;
  if (remaining <= 0) return;

  if (!retrieveItem(remaining, item)) {
    if (mallPrice(item) > maxPrice) throw 'Mall price too high.';
    if (!buy(remaining, item)) throw 'Failed to buy item.';
  }
}

if (!canInteract()) throw 'Break prism first.';

cliExecute('pull all');

setProperty('autoSatisfyWithNPCs', 'true');
setProperty('autoSatisfyWithCoinmasters', 'true');
setProperty('hpAutoRecovery', '0.8');

if (!getPropertyBoolean('lockPicked')) {
  useSkill(1, $skill`Lock Picking`);
  runChoice(1);
}

cliExecute('mood default');
cliExecute('ccs default');
if (getProperty('boomBoxSong') !== 'Food Vibrations') {
  cliExecute('boombox food');
}
cliExecute('terminal educate extract.edu');
cliExecute('terminal educate digitize.edu');
cliExecute('terminal enquiry familiar.enq');

if (myAdventures() === 0) {
  eat(1, $item`magical sausage`);
}

cliExecute('/whitelist ferengi');
if (availableAmount($item`Boris's key`) > 0) {
  create(1, $item`Boris's key lime pie`);
}
cliExecute('breakfast');

ensureMpSausage(500);
useSkill(1, $skill`Cannelloni Cocoon`);
cliExecute('mood execute');

equip($item`Iunion Crown`);
equip($slot`shirt`, $item`none`);
equip($item`Fourth of May Cosplay Saber`);
equip($item`Kramco Sausage-o-Matic&trade;`);
equip($item`Great Wolf's beastly trousers`);
equip($slot`acc1`, $item`Eight Days a Week Pill Keeper`);
equip($slot`acc2`, $item`Powerful Glove`);
equip($slot`acc3`, $item`Lil' Doctor&trade; Bag`);

if (myClass() === $class`Pastamancer`) useSkill(1, $skill`Bind Undead Elbow Macaroni`);

if (!getPropertyBoolean('_thesisDelivered')) {
  useFamiliar($familiar`Pocket Professor`);
  const neededXp = 400 - $familiar`Pocket Professor`.experience;
  if (neededXp >= 20) use(neededXp / 20, $item`ghost dog chow`);
  if (haveEffect($effect`Blue Swayed`) < 50) {
    use(5, $item`pulled blue taffy`);
  }
  while ($familiar`Pocket Professor`.experience < 400) {
    ensureMpSausage(100);
    use(1, $item`lynyrd snare`);
  }
  if ($familiar`Pocket Professor`.experience < 400) {
    throw 'Could not thesis for some reason.';
  }

  // Boost muscle.
  if (myClass() === $class`Sauceror`) ensureEffect($effect`Expert Oiliness`);
  maximize('muscle, equip Kramco', false);
  ensureEffect($effect`Quiet Determination`);
  ensureEffect($effect`Merry Smithsness`);
  ensureEffect($effect`Go Get 'Em, Tiger!`);
  if (myBuffedstat($stat`muscle`) < 1739) {
    cliExecute('ballpit');
  }
  if (myBuffedstat($stat`muscle`) < 1739) {
    equip($slot`acc1`, $item`Powerful Glove`);
    ensureEffect($effect`Triple-Sized`);
    maximize('muscle, equip Kramco', false);
  }
  if (myBuffedstat($stat`muscle`) < 1739) {
    ensureEffect($effect`Phorcefullness`);
  }
  if (myBuffedstat($stat`muscle`) < 1739) {
    ensureEffect($effect`Incredibly Hulking`);
  }
  if (myBuffedstat($stat`muscle`) < 1739) {
    throw 'Failed to get mus high enough.';
  }

  cliExecute('ccs thesis');
  adv1($location`The Neverending Party`, -1, '');
}

if (haveEffect($effect`Jingle Jangle Jingle`) < 1500) cliExecute('send to buffy || 1800 jingle');

cliExecute('hobodiet');

if (fullnessLimit() - myFullness() === 1 && getPropertyBoolean('spiceMelangeUsed')) {
  cliExecute('pull * glass of raw eggs');
  eat(1, $item`fudge spork`);
  eat(1, itemPriority($item`glass of raw eggs`, $item`meteoreo`));
}

if (inebrietyLimit() - myInebriety() === 3) {
  get(1, $item`Frosty's frosty mug`, 50000);
  drink(1, $item`Frosty's frosty mug`);
  drink(1, $item`perfect negroni`);
}

cliExecute('ccs abort');
