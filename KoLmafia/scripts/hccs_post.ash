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

set_property('autoSatisfyWithNPCs', 'true');
set_property('autoSatisfyWithCoinmasters', 'true');
set_property('hpAutoRecovery', '0.8');

cli_execute('mood default');
cli_execute('ccs default');
if (get_property('boomBoxSong') != 'Food Vibrations') {
    cli_execute('boombox food');
}

cli_execute('pull all');
cli_execute('/whitelist ferengi');
cli_execute('breakfast');

if (get_campground()[$item[clockwork maid]] == 0) {
    use(1, $item[clockwork maid]);
}

ensure_mp_sausage(500);
cli_execute('mood execute');

equip($item[Iunion Crown]);
equip($slot[shirt], $item[none]);
equip($item[Fourth of May Cosplay Saber]);
equip($item[Kramco Sausage-o-Matic&trade;]);
equip($item[terra cotta trousers]);
equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
equip($slot[acc2], $item[Powerful Glove]);
equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

if (!get_property_boolean('_distentionPillUsed') && my_fullness() <= fullness_limit()) {
    if (!use(1, $item[distention pill])) {
        print('WARNING: Out of distention pills.');
    }
}

if (!get_property_boolean('_syntheticDogHairPillUsed') && 1 <= my_inebriety() && my_inebriety() <= inebriety_limit()) {
    if (!use(1, $item[synthetic dog hair pill])) {
        print('WARNING: Out of synthetic dog hair pills.');
    }
}

if (my_fullness() + 1 == fullness_limit()) {
    use(1, $item[milk of magnesium]);
    eat(1, $item[fudge spork]);
    eat(1, $item[meteoreo]);
}

if (!get_property_boolean('_mimeArmyShotglassUsed') && item_amount($item[mime army shotglass]) > 0) {
    ensure_mp_sausage(100);
    ensure_effect($effect[Ode to Booze]);
    drink(1, $item[meadeorite]);
}

if (my_inebriety() + 1 == inebriety_limit()) {
    ensure_mp_sausage(100);
    ensure_effect($effect[Ode to Booze]);
    drink(1, $item[meadeorite]);
}

item[class] choco;
choco[$class[Seal Clubber]] = $item[chocolate seal-clubbing club];
choco[$class[Turtle Tamer]] = $item[chocolate turtle totem];
choco[$class[Pastamancer]] = $item[chocolate pasta spoon];
choco[$class[Sauceror]] = $item[chocolate saucepan];
choco[$class[Accordion Thief]] = $item[chocolate stolen accordion];
choco[$class[Disco Bandit]] = $item[chocolate disco ball];
if (choco contains my_class() && get_property_int('_chocolatesUsed') < 3) {
    int used = get_property_int('_chocolatesUsed');
    while (used < 3) {
        item it = choco[my_class()];
        get(1, it, 6000);
        use(1, it);
        used++;
    }
}

if (!get_property_boolean('_thesisDelivered') && get_property_int('_lastSausageMonsterTurn') + 50 < total_turns_played()) {
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
    ensure_effect($effect[Expert Oiliness]);
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
