import <hccs_lib.ash>

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
