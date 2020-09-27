import <hccs_lib.ash>

void get(int qty, item it, int max_price) {
    if (qty > 15) abort('Bad get!');

    int remaining = qty - item_amount(it);
    if (remaining <= 0) return;

    int get_closet = min(remaining, closet_amount(it));
    if (!take_closet(get_closet, it)) abort();
    remaining -= get_closet;
    if (remaining <= 0) return;

    int get_mall = min(remaining, shop_amount(it));
    if (!take_shop(get_mall, it)) abort();
    remaining -= get_mall;
    if (remaining <= 0) return;

    if (!retrieve_item(remaining, it)) {
        if (it.mall_price() > max_price) abort('Mall price too high.');
        if (!buy(remaining, it)) abort();
    }
}

if (!can_interact()) abort('Break prism first.');

// cli_execute('pull all');
cli_execute('pull * meat');

set_property('autoSatisfyWithNPCs', 'true');
set_property('autoSatisfyWithCoinmasters', 'true');
set_property('hpAutoRecovery', '0.8');

if (!get_property_boolean('lockPicked')) {
    use_skill(1, $skill[Lock Picking]);
    run_choice(1);
}

cli_execute('mood default');
cli_execute('ccs default');
if (get_property('boomBoxSong') != 'Food Vibrations') {
    cli_execute('boombox food');
}

if (my_adventures() == 0) {
    eat(1, $item[magical sausage]);
}

cli_execute('/whitelist ferengi');
if (available_amount($item[Boris's key]) > 0) {
    create(1, $item[Boris's key lime pie]);
}
cli_execute('breakfast');

ensure_mp_sausage(500);
use_skill(1, $skill[Cannelloni Cocoon]);
cli_execute('mood execute');

equip($item[Iunion Crown]);
equip($slot[shirt], $item[none]);
equip($item[Fourth of May Cosplay Saber]);
equip($item[Kramco Sausage-o-Matic&trade;]);
equip($item[Great Wolf's beastly trousers]);
equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
equip($slot[acc2], $item[Powerful Glove]);
equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

if (my_class() == $class[Pastamancer]) use_skill(1, $skill[Bind Undead Elbow Macaroni]);

if (!get_property_boolean('_thesisDelivered')) {
    // Get thesis.
    use_familiar($familiar[Pocket Professor]);
    int needed_xp = 400 - $familiar[Pocket Professor].experience;
    if (needed_xp >= 20) use(needed_xp / 20, $item[ghost dog chow]);
    if (have_effect($effect[Blue Swayed]) < 50) {
        use(5, $item[pulled blue taffy]);
    }
    while ($familiar[Pocket Professor].experience < 400) {
        ensure_mp_sausage(100);
        use(1, $item[lynyrd snare]);
    }
    if ($familiar[Pocket Professor].experience < 400) {
        abort('Could not thesis for some reason.');
    }

    // Boost muscle.
    if (my_class() == $class[Sauceror]) ensure_effect($effect[Expert Oiliness]);
    maximize('muscle, equip Kramco', false);
    ensure_effect($effect[Quiet Determination]);
    ensure_effect($effect[Merry Smithsness]);
    ensure_effect($effect[Go Get 'Em, Tiger!]);
    if (my_buffedstat($stat[muscle]) < 1739) {
        cli_execute('ballpit');
    }
    if (my_buffedstat($stat[muscle]) < 1739) {
        equip($slot[acc1], $item[Powerful Glove]);
        ensure_effect($effect[Triple-Sized]);
        maximize('muscle, equip Kramco', false);
    }
    if (my_buffedstat($stat[muscle]) < 1739) {
        ensure_effect($effect[Phorcefullness]);
    }
    if (my_buffedstat($stat[muscle]) < 1739) {
        ensure_effect($effect[Incredibly Hulking]);
    }
    if (my_buffedstat($stat[muscle]) < 1739) {
        abort('Failed to get mus high enough.');
    }

    cli_execute('ccs thesis');
    adv1($location[The Neverending Party], -1, '');
}

if (have_effect($effect[Jingle Jangle Jingle]) < 1500) cli_execute('send to buffy || 1800 jingle');

cli_execute('hobodiet');

if (fullness_limit() - my_fullness() == 1 && get_property_boolean('spiceMelangeUsed')) {
    cli_execute('pull * glass of raw eggs');
    eat(1, $item[fudge spork]);
    eat(1, item_priority($item[glass of raw eggs], $item[meteoreo]));
}

if (inebriety_limit() - my_inebriety() == 3) {
    get(1, $item[Frosty's frosty mug], 50000);
    drink(1, $item[Frosty's frosty mug]);
    drink(1, $item[perfect negroni]);
}

retrieve_item(1, $item[skeletal skiff]);
print('Time to do EL VIBRATO!', 'red');