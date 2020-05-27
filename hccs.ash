// Script by worthawholebean. Public domain; feel free to modify or distribute.
// This is a script to do 1-day Hardcore Community Service runs.
// The script is fine to run twice; if it breaks somewhere, fix it manually and then the script should start where it left off.
// THe script assumes that you have Sweet Synthesis and a bunch of IotMs, but none of them are strictly necessary.
// Recent IotMs include Glove, Pill Keeper, Pizza Cube, Professor, Saber, Kramco, NEP, garbage tote, SongBoom, and Genie.
// It assumes that you have painted Ungulith in Chateau Mantegna; if you don't have it, you can reallocate a wish to fight that guy.
// It also assumes that you have access to Peppermint Garden for candy sorce.
// It should plan around other candy sources if you add code to harvest them.
// The current route uses Smith's Tome to get to 60 advs to coil wire on turn 0; any other route would work.

// You'll need to set up CCS and mood named "hccs" for this to work.
/* hccs CCS:
[ default ]
while (snarfblat 113 && !monstername "possessed can of tomatoes") || (snarfblat 439 && !monstername "novelty tropical skeleton")
    skill cheat code: replace enemy
endwhile
if monstername "novelty tropical skeleton" || monstername "possessed can of tomatoes" || monstername "factory worker" || monstername "ungulith"
    skill use the force
endif
skill sing along # only if you have SongBoom
if monstername "BRICKO oyster" || monstername "sausage goblin" || snarfblat 528 # NEP
    if monstername "BRICKO oyster"
        skill otoscope
    endif
    skill curse of weaksauce
    skill saucegeyser
endif
abort
*/

// You also need a ccs "copygoblin" for copying sausage goblins.
/* copygoblin CCS:
[default]
abort

[sausage goblin]
skill curse of weaksauce
skill detect weakness
skill lecture on relativity
if hpbelow 50
abort
endif
skill sing along # only if you have SongBoom
skill saucegeyser
*/

import <canadv.ash>

int TEST_HP = 1;
int TEST_MUS = 2;
int TEST_MYS = 3;
int TEST_MOX = 4;
int TEST_FAMILIAR = 5;
int TEST_WEAPON = 6;
int TEST_SPELL = 7;
int TEST_NONCOMBAT = 8;
int TEST_ITEM = 9;
int TEST_HOT_RES = 10;
int TEST_COIL_WIRE = 11;

void error(string message) {
    // Clean up saved properties.
    set_property('autoSatisfyWithNPCs', get_property('_saved_autoSatisfyWithNPCs'));
    abort(message);
}

int get_property_int(string name) {
    string str = get_property(name);
    if (str == '') {
        error('Unknown property ' + name + '.');
    }
    return to_int(str);
}

void set_property_int(string name, int value) {
    set_property(name, '' + value);
}

boolean get_property_boolean(string name) {
    string str = get_property(name);
    if (str == '') {
        error('Unknown property ' + name + '.');
    }
    return str == 'true';
}

int count_matches(matcher m) {
    int result = 0;
    while (m.find()) {
        result += 1;
    }
    return result;
}

boolean try_use(int quantity, item it) {
    if (item_amount(it) > 0) {
        return use(quantity, it);
    } else {
        return false;
    }
}

boolean use_all(item it) {
    return use(item_amount(it), it);
}

boolean try_equip(item it) {
    if (item_amount(it) > 0) {
        return equip(it);
    } else {
        return false;
    }
}

void assert_meat(int meat) {
    if (my_meat() < meat) error('Not enough meat.');
}

void ensure_item(int quantity, item it) {
    if (item_amount(it) < quantity) {
        buy(quantity - item_amount(it), it);
    }
    if (item_amount(it) < quantity) {
        error('Could not buy item' + it.name + '.');
    }
}

void ensure_create_item(int quantity, item it) {
    if (item_amount(it) < quantity) {
        create(quantity - item_amount(it), it);
    }
    if (item_amount(it) < quantity) {
        error('Could not create item.');
    }
}

void ensure_hermit_item(int quantity, item it) {
    if (item_amount(it) >= quantity) {
        return;
    }
    int count = quantity - item_amount(it);
    while (item_amount($item[worthless trinket]) + item_amount($item[worthless gewgaw]) + item_amount($item[worthless knick-knack]) <= count) {
        ensure_item(1, $item[chewing gum on a string]);
        use(1, $item[chewing gum on a string]);
    }
    ensure_item(1, $item[hermit permit]);
    retrieve_item(count, it);
}

void ensure_npc_effect(effect ef, int quantity, item potion) {
    if (have_effect(ef) == 0) {
        ensure_item(quantity, potion);
        if (!cli_execute(ef.default) || have_effect(ef) == 0) {
            error('Failed to get effect ' + ef.name + '.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void ensure_potion_effect(effect ef, item potion) {
    if (have_effect(ef) == 0) {
        if (item_amount(potion) == 0) {
            create(1, potion);
        }
        if (!cli_execute(ef.default) || have_effect(ef) == 0) {
            error('Failed to get effect ' + ef.name + '.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void ensure_effect(effect ef) {
    if (have_effect(ef) == 0) {
        if (!cli_execute(ef.default) || have_effect(ef) == 0) {
            error('Failed to get effect ' + ef.name + '.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void wish_effect(effect ef) {
    if (have_effect(ef) == 0) {
        cli_execute('genie effect ' + ef.name);
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

item item_priority(item it1, item it2) {
    if (item_amount(it1) > 0) return it1;
    else return it2;
}

item item_priority(item it1, item it2, item it3) {
    if (item_amount(it1) > 0) return it1;
    else if (item_amount(it2) > 0) return it2;
    else return it3;
}

item item_priority(item it1, item it2, item it3, item it4) {
    if (item_amount(it1) > 0) return it1;
    else if (item_amount(it2) > 0) return it2;
    else if (item_amount(it3) > 0) return it3;
    else return it4;
}

void pizza_effect(effect ef, item it1, item it2, item it3, item it4) {
    if (have_effect(ef) == 0) {
        if (item_amount($item[diabolic pizza]) > 0) {
            error('Already have a pizza.');
        }
        if (item_amount(it1) == 0 || item_amount(it2) == 0 || item_amount(it3) == 0 || item_amount(it4) == 0) {
            error('Missing items for pizza.');
        }
        visit_url('campground.php?action=makepizza&pizza=' + it1.to_int() + ',' + it2.to_int() + ',' + it3.to_int() + ',' + it4.to_int());
        eat(1, $item[diabolic pizza]);
        if (have_effect(ef) == 0) {
            error('Failed to get effect ' + ef.name + '.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void synthesis_effect(effect ef, item it1, item it2) {
    if (have_effect(ef) == 0) {
        sweet_synthesis(it1, it2);
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

effect[int] tail(effect[int] arr) {
    effect[int] result;
    foreach idx in arr {
        if (idx > 0) {
            result[idx - 1] = arr[idx];
        }
    }
    return result;
}

int[item] with(int[item] map, item it1) {
    int[item] result;
    foreach it in map {
        result[it] = map[it];
    }
    result[it1]++;
    return result;
}

int[item] with(int[item] map, item it1, item it2) {
    int[item] result;
    foreach it in map {
        result[it] = map[it];
    }
    result[it1]++;
    result[it2]++;
    return result;
}

record candy_pair {
    boolean success;
    int[item] used;
    item it1;
    item it2;
};

boolean[item] npc_candies = $items[jaba&ntilde;ero-flavored chewing gum, lime-and-chile-flavored chewing gum, pickle-flavored chewing gum, tamarind-flavored chewing gum];

boolean[item] candy_forms(item candy) {
    boolean[item] result = { candy: true };
    if (candy == $item[peppermint sprout]) {
        result[$item[peppermint twist]] = true;
    }
    return result;
}

// This is a simple backtracking algorithm to find a way to use our candy to synthesize the things we want.
candy_pair synthesis_plan(effect ef, int[item] candies, effect[int] subsequent, int[item] used) {
    if (ef == $effect[none]) {
        candy_pair result;
        result.success = true;
        return result;
    }

    print('Looking for solutions for effect ' + ef.name + '.');
    foreach it1 in candies {
        int count1 = candies[it1] - used[it1];
        if (count1 == 0) continue;

        foreach form1 in candy_forms(it1) {
            if ($effects[Synthesis: Strong, Synthesis: Smart, Synthesis: Cool, Synthesis: Hardy, Synthesis: Energy] contains ef) {
                // Complex + Simple
                foreach it2 in npc_candies {
                    if (sweet_synthesis_result(form1, it2) != ef) continue;
                    int[item] new_used = with(used, it1);
                    candy_pair next_pair = synthesis_plan(subsequent[0], candies, tail(subsequent), new_used);
                    if (next_pair.success) {
                        print('>> PLAN: For effect ' + ef.name + ', ' + form1.name + ' and ' + it2.name + '.');
                        candy_pair result;
                        result.success = true;
                        result.used = new_used;
                        result.it1 = form1;
                        result.it2 = it2;
                        return result;
                    }
                }
            } else {
                // Complex + Complex
                foreach it2 in candies {
                    if (it2 == it1 && count1 == 1) continue;
                    int count2 = candies[it2] - used[it2];
                    if (count2 == 0) continue;

                    foreach form2 in candy_forms(it2) {
                        if (sweet_synthesis_result(form1, form2) != ef) continue;

                        print('> Testing pair ' + form1.name + ' ' + form2.name + '.');
                        int[item] new_used = with(used, it1, it2);
                        candy_pair next_pair = synthesis_plan(subsequent[0], candies, tail(subsequent), new_used);
                        if (next_pair.success) {
                            print('>> PLAN: For effect ' + ef.name + ', ' + form1.name + ' and ' + form2.name + '.');
                            candy_pair result;
                            result.success = true;
                            result.used = new_used;
                            result.it1 = form1;
                            result.it2 = form2;
                            return result;
                        }
                    }
                }
            }
        }
    }

    // Didn't find a working configuration.
    candy_pair result;
    result.success = false;
    return result;
}

// Only necessary for double-complex-candy synthesis.
void synthesis_plan(effect ef, effect[int] subsequent) {
    if (have_effect(ef) == 0) {
        print('');
        print('Finding candies for ' + ef.name + '.');

        int[item] candies;
        int[item] inventory = get_inventory();
        foreach it in inventory {
            if (it.candy_type == 'complex') {
                candies[it] = inventory[it];
            }
        }

        int[item] empty;
        candy_pair pair = synthesis_plan(ef, candies, subsequent, empty);
        if (pair.success) {
            // This should turn any peppermint sprouts into peppermint twists.
            retrieve_item(1, pair.it1);
            if (npc_candies contains pair.it2) {
                // Buy NPC candy if necessary.
                ensure_item(1, pair.it2);
            } else {
                // This should turn any peppermint sprouts into peppermint twists.
                retrieve_item(1, pair.it2);
            }
            sweet_synthesis(pair.it1, pair.it2);
        } else {
            abort('Failed to synthesisze effect ' + ef.name + '. Please plan it out and re-run me.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void shrug(effect ef) {
    if (have_effect(ef) > 0) {
        cli_execute('shrug ' + ef.name);
    }
}

// We have Polka, Phat Loot, Ur-Kel's on at all times; fourth slot is variable.
void open_song_slot() {
    shrug($effect[Power Ballad of the Arrowsmith]);
    shrug($effect[The Magical Mojomuscular Melody]);
    shrug($effect[The Moxious Madrigal]);
}

void ensure_ode(int turns) {
    while (have_effect($effect[Ode to Booze]) < turns) {
        while (my_mp() < 50) {
            ensure_item(1, $item[Doc Galaktik's Invigorating Tonic]);
            use(1, $item[Doc Galaktik's Invigorating Tonic]);
        }
        open_song_slot();
        use_skill(1, $skill[The Ode to Booze]);
    }
}

int free_rests() {
    int result = 5;
    if (have_skill($skill[Adventurer of Leisure])) result += 2;
    if (have_skill($skill[Disco Nap])) result += 1;
    if (have_skill($skill[Executive Narcolepsy])) result += 1;
    return result;
}

boolean summon_bricko_oyster() {
    if (get_property_int('_brickoFights') >= 3) return false;
    if (item_amount($item[BRICKO oyster]) > 0) return true;
    while (get_property_int('libramSummons') < 10 && (item_amount($item[BRICKO eye brick]) < 1 || item_amount($item[BRICKO brick]) < 8)) {
        use_skill(1, $skill[Summon BRICKOs]);
    }
    return use(8, $item[BRICKO brick]);
}

void saber_yr() {
    if (!handling_choice()) error('No choice?');
    if (last_choice() == 1387 && count(available_choice_options()) > 0) {
        run_choice(3);
    }
}

int my_familiar_weight() {
    return familiar_weight(my_familiar()) + weight_adjustment();
}

int[location] snarfblats;
snarfblats[$location[The Haiku Dungeon]] = 138;
snarfblats[$location[The Haunted Pantry]] = 113;
snarfblats[$location[The Neverending Party]] = 528;
snarfblats[$location[The Skeleton Store]] = 439;

// Returns true if we are in a choice (i.e. noncombat).
boolean adventure_manual(location loc) {
    if (my_hp() < .6 * my_maxhp()) {
        restore_hp(my_maxhp());
    }
    if (!(snarfblats contains loc)) error('Bad location.');
    visit_url('adventure.php?snarfblat=' + snarfblats[loc]);
    return handling_choice();
}

boolean stat_ready() {
    // Ben-Gal balm, Rage of the Reindeer, Quiet Determination, wad of used tape, fish hatchet
    int buffed_muscle = 60 + (1 + numeric_modifier('muscle percent') / 100 + 4.7) * my_basestat($stat[Mysticality]);
    boolean muscle_met = buffed_muscle - my_basestat($stat[Muscle]) >= 1770;
    print('Buffed muscle: ' + floor(buffed_muscle) + ' (' + muscle_met + ')');
    // Hair spray, runproof mascara, Quiet Desperation
    int buffed_moxie = 60 + (1 + numeric_modifier('moxie percent') / 100 + 3.9) * my_basestat($stat[Mysticality]);
    boolean moxie_met = buffed_moxie - my_basestat($stat[Moxie]) >= 1770;
    print('Buffed moxie: ' + floor(buffed_moxie) + ' (' + moxie_met + ')');
    return muscle_met && moxie_met;
}

boolean test_done(int test_num) {
    print('Checking test ' + test_num + '...');
    string text = visit_url('council.php');
    return !text.contains_text('<input type=hidden name=option value=' + test_num + '>');
}

void do_test(int test_num) {
    if (!test_done(test_num)) {
        visit_url('choice.php?whichchoice=1089&option=' + test_num);
        if (!test_done(test_num)) {
            error('Failed to do test ' + test_num + '. Maybe we are out of turns.');
        }
    } else {
        print('Test ' + test_num + ' already completed.');
    }
}

// Don't buy stuff from NPC stores.
set_property('_saved_autoSatisfyWithNPCs', get_property('autoSatisfyWithNPCs'));
set_property('autoSatisfyWithNPCs', 'false');

// Initialize council.
visit_url('council.php');

// Default equipment.
equip($item[hollandaise helmet]);
equip($slot[shirt], $item[none]);
equip($item[Fourth of May Cosplay Saber]);
equip($item[Kramco Sausage-o-Matic&trade;]);
equip($item[old sweatpants]);
equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
equip($slot[acc2], $item[Powerful Glove]);

if (!test_done(TEST_COIL_WIRE)) {
    // Ice house remaindered skeleton
    // Ceiling fan, juice bar, foreign language tapes, paint sk8 gnome
    // Sauceror, Opossum, Astral 6-pack, pet sweater
    // Clanmate fortunes (BAFH/CheeseFax)
    if (get_property_int('_clanFortuneConsultUses') < 3) {
        cli_execute('/whitelist bonus adv');
        while (get_property_int('_clanFortuneConsultUses') < 3) {
            cli_execute('fortune cheesefax');
            cli_execute('wait 5');
        }
    }

    cli_execute('/whitelist ferengi');
    retrieve_item(1, $item[fish hatchet]);

    // Chateau juice bar
    visit_url('place.php?whichplace=chateau&action=chateau_desk2');
    autosell(1, $item[gremlin juice]);
    // autosell(1, $item[ectoplasm <i>au jus</i>]);
    // autosell(1, $item[clove-flavored lip balm]);

    // Sell pork gems + tent
    visit_url('tutorial.php?action=toot');
    try_use(1, $item[letter from King Ralph XI]);
    try_use(1, $item[pork elf goodies sack]);
    autosell(5, $item[baconstone]);
    autosell(5, $item[porquoise]);
    autosell(5, $item[hamethyst]);

    // Buy toy accordion
    ensure_item(1, $item[toy accordion]);

    ensure_effect($effect[The Magical Mojomuscular Melody]);
    if (get_property_int('tomeSummons') < 2 && my_mp() < 6) {
        ensure_item(1, $item[Doc Galaktik's Invigorating Tonic]);
        use(1, $item[Doc Galaktik's Invigorating Tonic]);
    }
    use_skill(3 - get_property_int('tomeSummons'), $skill[Summon Smithsness]);

    // Eat 2 This Charming Flan
    if (my_fullness() < 3) {
        if (item_amount($item[This Charming Flan]) == 0) {
            ensure_item(2, $item[pickled egg]);
            create(2, $item[This Charming Flan]);
        }
        eat(2, $item[This Charming Flan]);
    }

    ensure_effect($effect[Merry Smithsness]);

    // Upgrade saber for fam wt
    visit_url('main.php?action=may4');
    run_choice(4);

    // Put on some regen gear
    equip($item[hollandaise helmet]);
    equip($slot[shirt], $item[none]);
    equip($item[Fourth of May Cosplay Saber]);
    equip($item[Kramco Sausage-o-Matic&trade;]);
    equip($item[old sweatpants]);
    equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
    equip($slot[acc2], $item[Powerful Glove]);
    equip($slot[acc3], $item[Retrospecs]);

    // NOTE: No turn 0 sausage fight!

    // QUEST - Coil Wire
    do_test(TEST_COIL_WIRE);
}

if (my_turncount() < 60) error('Something went wrong coiling wire.');

if (!test_done(TEST_HP)) {
    if (have_effect($effect[Different Way of Seeing Things]) == 0) {
        if (item_amount($item[dripping meat crossbow]) == 0) {
            // ensure_item(1, $item[tenderizing hammer]);
            ensure_item(1, $item[crossbow string]);
            if (item_amount($item[meat stack]) == 0) {
                create(1, $item[meat stack]);
            }
            ensure_hermit_item(1, $item[catsup]);
            create(1, $item[dripping meat crossbow]);
        }
        if (item_amount($item[Irish Coffee, English Heart]) == 0) {
            if (item_amount($item[handful of Smithereens]) == 0) {
                ensure_item(1, $item[third-hand lantern]);
                // ensure_item(1, $item[tenderizing hammer]);
                create(1, $item[A Light that Never Goes Out]);
                cli_execute('smash 1 A Light That Never Goes Out');
            }
            ensure_item(1, $item[cup of lukewarm tea]);
            create(1, $item[Irish Coffee, English Heart]);
        }
        if (item_amount($item[blood-faced volleyball]) == 0) {
            ensure_hermit_item(1, $item[volleyball]);
            ensure_hermit_item(1, $item[seal tooth]);
            use(1, $item[seal tooth]);
            use(1, $item[volleyball]);
        }
        // Get a pocket professor chip.
        use_familiar($familiar[Pocket Professor]);
        pizza_effect(
            $effect[Different Way of Seeing Things],
            $item[dripping meat crossbow],
            $item[Irish Coffee, English Heart],
            $item[Flaskfull of Hollow],
            $item[blood-faced volleyball]
        );
    }

    /*
    // Check G-9, then genie effect Experimental Effect G-9/New and Improved
    effect g9 = $effect[Experimental Effect G-9];
    if (g9.numeric_modifier('mysticality percent') < 0.001) {
        // Not cached. This should trick Mafia into caching the G-9 value for the day.
        visit_url('desc_effect.php?whicheffect=' + g9.descid);
        if (g9.numeric_modifier('mysticality percent') < 0.001) {
            error('Check G9');
        }
    }
    if (g9.numeric_modifier('mysticality percent') > 200) {
        wish_effect(g9);
    } else {
        wish_effect($effect[New and Improved]);
    }
    */

    item love_potion = $item[Love Potion #0];
    effect love_effect = $effect[Tainted Love Potion];
    if (have_effect(love_effect) == 0) {
        if (item_amount(love_potion) == 0) {
            use_skill(1, $skill[Love Mixology]);
        }
        visit_url('desc_effect.php?whicheffect=' + love_effect.descid);
        if (love_effect.numeric_modifier('mysticality') > 10
                && love_effect.numeric_modifier('muscle') > -30
                && love_effect.numeric_modifier('moxie') > -30
                && love_effect.numeric_modifier('maximum hp percent') > -0.001) {
            use(1, love_potion);
        }
    }

    // Cast inscrutable gaze
    ensure_effect($effect[Inscrutable Gaze]);

    // Shower lukewarm
    ensure_effect($effect[Thaumodynamic]);

    if (numeric_modifier('mysticality experience percent') < 74.999) {
        error('Insufficient +stat%.');
    }

    // Use ten-percent bonus
    try_use(1, $item[a ten-percent bonus]);

    // Chateau rest
    while (get_property_int('timesRested') < free_rests()) {
        visit_url('place.php?whichplace=chateau&action=chateau_restbox');
    }

    // Cast polka, phat, singer's, stats, hulkein, triple size
    cli_execute('mood hccs-early');
    if (have_effect($effect[Hulkien]) == 0) {
        cli_execute('pillkeeper stats');
    }
    /*if (have_effect($effect[Fidoxene]) == 0) {
        cli_execute('pillkeeper familiar');
    }*/

    if (!get_property_boolean('_lyleFavored')) {
        ensure_effect($effect[Favored by Lyle]);
    }
    ensure_effect($effect[Triple-Sized]);
    ensure_effect($effect[Song of Bravado]);
    open_song_slot();
    ensure_effect($effect[The Magical Mojomuscular Melody]);
    ensure_npc_effect($effect[Glittering Eyelashes], 5, $item[glittery mascara]);

    equip($item[hollandaise helmet]);
    equip($slot[shirt], $item[none]);
    equip($item[Fourth of May Cosplay Saber]);
    equip($item[Kramco Sausage-o-Matic&trade;]);
    equip($item[old sweatpants]);
    equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
    equip($slot[acc2], $item[Powerful Glove]);
    equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

    if (get_property('boomBoxSong') != 'Total Eclipse of Your Meat') {
        cli_execute('boombox meat');
    }
    cli_execute('ccs hccs');

    // Plan is for this to fall all the way through to item -> hot res -> fam weight.
    if (have_effect($effect[Fidoxene]) == 0) {
        cli_execute('pillkeeper familiar');
    }

    while (summon_bricko_oyster()) {
        if (item_amount($item[bag of many confections]) == 0) {
            // Use one of these fights to get a bag of many confections.
            use_familiar($familiar[Stocking Mimic]);
            equip($slot[familiar], $item[none]);
        } else {
            use_familiar($familiar[Pocket Professor]);
            try_equip($item[Pocket Professor memory chip]);
        }
        if (my_hp() < .8 * my_maxhp()) {
            visit_url('clan_viplounge.php?where=hottub');
        }
        restore_mp(32);
        use(1, $item[BRICKO oyster]);
        autosell(1, $item[BRICKO pearl]);
    }

    // Get beach access.
    if (item_amount($item[bitchin' meatcar]) == 0) {
        ensure_item(1, $item[cog]);
        ensure_item(1, $item[sprocket]);
        ensure_item(1, $item[spring]);
        ensure_item(1, $item[empty meat tank]);
        ensure_item(1, $item[sweet rims]);
        ensure_item(1, $item[tires]);
        create(1, $item[bitchin' meatcar]);
    }

    // Tune moon sign to Blender. Have to do this now to get chewing gum.
    if (!get_property_boolean('moonTuned')) {
        // Unequip spoon.
        equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
        equip($slot[acc2], $item[Powerful Glove]);
        equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);
        // Switch MCD first, as we won't have access and it will only go to 10.
        visit_url('inv_use.php?whichitem=10254&doit=96&whichsign=8');
    }

    // Prep Sweet Synthesis.
    if (my_garden_type() == 'peppermint') {
        cli_execute('garden pick');
    } else {
        print('WARNING: This script is built for peppermint garden. Switch gardens or find other candy.');
    }

    if (get_property_int('_candySummons') == 0) {
        use_skill(1, $skill[Summon Crimbo Candy]);
    }

    effect[int] subsequent = { $effect[Synthesis: Smart], $effect[Synthesis: Strong], $effect[Synthesis: Cool], $effect[Synthesis: Collection] };
    synthesis_plan($effect[Synthesis: Learning], subsequent);
    synthesis_plan($effect[Synthesis: Smart], tail(subsequent));

    // Get buff things
    ensure_hermit_item(1, $item[turtle totem]);
    ensure_hermit_item(1, $item[saucepan]);

    // Cast Ode and drink bee's knees
    if (have_effect($effect[On the Trolley]) == 0) {
        assert_meat(500);
        ensure_ode(2);
        cli_execute('drink 1 Bee\'s Knees');
    }

    // Don't use Kramco here.
    equip($slot[off-hand], $item[none]);

    // Tomato in pantry (Saber YR)
    if (item_amount($item[tomato juice of powerful power]) == 0 && item_amount($item[tomato]) == 0 && have_effect($effect[Tomato Power]) == 0) {
        ensure_effect($effect[Musk of the Moose]);
        ensure_effect($effect[Carlweather's Cantata of Confrontation]);

        adv1($location[The Haunted Pantry], -1, '');
        saber_yr();
    }

    // Fruits in skeleton store (Saber YR)
    if ((item_amount($item[ointment of the occult]) == 0 && item_amount($item[grapefruit]) == 0 && have_effect($effect[Mystically Oiled]) == 0)
            || (item_amount($item[oil of expertise]) == 0 && item_amount($item[cherry]) == 0 && have_effect($effect[Expert Oiliness]) == 0)) {
        if (get_property('questM23Meatsmith') == 'unstarted') {
            // Have to start meatsmith quest.
            visit_url('shop.php?whichshop=meatsmith&action=talk');
            run_choice(1);
        }
        if (!can_adv($location[The Skeleton Store], false)) error('Cannot open skeleton store!');
        adv1($location[The Skeleton Store], -1, '');
        if (!$location[The Skeleton Store].noncombat_queue.contains_text('Skeletons In Store')) {
            error('Something went wrong at skeleton store.');
        }
        adv1($location[The Skeleton Store], -1, '');
        saber_yr();
    }

    // Equip makeshift garbage shirt
    cli_execute('fold makeshift garbage shirt');
    equip($item[makeshift garbage shirt]);

    equip($item[Kramco Sausage-o-Matic&trade;]);
    equip($slot[acc3], $item[hewn moon-rune spoon]);

    // Professor 9x free sausage fight @ NEP
    if (get_property_int('_sausageFights') == 0) {
        use_familiar($familiar[Pocket Professor]);
        try_equip($item[Pocket Professor memory chip]);

        equip($item[Kramco Sausage-o-Matic&trade;]);
        cli_execute('ccs copygoblin');
        // Just here to party.
        set_property('choiceAdventure1322', '2');
        adv1($location[The Neverending Party], -1, '');

        if (my_hp() < .8 * my_maxhp()) {
            visit_url('clan_viplounge.php?where=hottub');
        }

        // Actually find the goblin.
        adv1($location[The Neverending Party], -1, '');
    }

    // Breakfast

    // Visiting Looking Glass in clan VIP lounge
    visit_url('clan_viplounge.php?action=lookingglass&whichfloor=2');
    cli_execute('swim item');
    while (get_property_int('_genieWishesUsed') < 3) {
        cli_execute('genie wish for more wishes');
    }

    // Visiting the Ruined House
    visit_url('place.php?whichplace=desertbeach&action=db_nukehouse');

    use_skill(1, $skill[Advanced Cocktailcrafting]);
    use_skill(1, $skill[Advanced Saucecrafting]);
    use_skill(1, $skill[Pastamastery]);
    use_skill(1, $skill[Spaghetti Breakfast]);
    use_skill(1, $skill[Grab a Cold One]);
    use_skill(1, $skill[Perfect Freeze]);
    use_skill(1, $skill[Acquire Rhinestones]);
    use_skill(1, $skill[Prevent Scurvy and Sobriety]);
    autosell(3, $item[coconut shell]);
    autosell(3, $item[magical ice cubes]);
    autosell(3, $item[little paper umbrella]);

    /*string guild_text = visit_url('guild.php');
    matcher guild_matcher = create_matcher('guild.php\\?place=', guild_text);
    int guild_options = guild_matcher.count_matches();
    if (guild_options == 1) {
        // Talk to guild leader
        visit_url('guild.php?place=challenge');

        // Open guild
        cli_execute('ccs runaway');
        use_familiar($familiar[Frumious Bandersnatch]);
        try_equip($item[amulet coin]);

        open_song_slot();
        ensure_ode();
        ensure_effect($effect[Musk of the Moose]);

        while (last_choice() != 544) {
            if (get_property_int('_banderRunaways') > my_familiar_weight() / 5) {
                error('Ran out of bander runaways. Oops.');
            }
            adv1($location[The Haunted Pantry], -1, '');
        }
        visit_url('guild.php?place=challenge');
    } else if (guild_options == 0) {
        error('Cannot tell whether guild is open.');
    }*/

    // Autosell stuff
    //autosell(1, $item[strawberry]);
    autosell(1, $item[orange]);
    autosell(1, $item[razor-sharp can lid]);
    // autosell(5, $item[red pixel]);
    autosell(5, $item[green pixel]);
    autosell(5, $item[blue pixel]);
    autosell(5, $item[white pixel]);

    if (!get_property_boolean('hasRange')) {
        ensure_item(1, $item[Dramatic&trade; range]);
        use(1, $item[Dramatic&trade; range]);
    }

    // Make oil of expertise, philter of phorce, tomato juice
    ensure_potion_effect($effect[Tomato Power], $item[tomato juice of powerful power]);
    ensure_potion_effect($effect[Mystically Oiled], $item[ointment of the occult]);

    // Take hovering sombrero
    use_familiar($familiar[Hovering Sombrero]);
    try_equip($item[amulet coin]);
    try_equip($item[astral pet sweater]);

    // Maximize familiar weight
    equip($item[makeshift garbage shirt]);
    equip($item[Fourth of May Cosplay Saber]);
    equip($item[Kramco Sausage-o-Matic&trade;]);
    equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
    equip($slot[acc2], $item[Powerful Glove]);
    equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

    if (have_effect($effect[Carlweather's Cantata of Confrontation]) > 0) {
        cli_execute('shrug Carlweather\'s Cantata of Confrontation');
    }

    cli_execute('mood hccs');
    cli_execute('ccs hccs');

    // 17 free NEP fights
    while (get_property_int('_neverendingPartyFreeTurns') < 10
            || (have_skill($skill[Chest X-Ray]) && get_property_int('_chestXRayUsed') < 3)
            || (have_skill($skill[Shattering Punch]) && get_property_int('_shatteringPunchUsed') < 3)
            || (have_skill($skill[Gingerbread Mob Hit]) && !get_property_boolean('_gingerbreadMobHitUsed'))) {
        ensure_npc_effect($effect[Glittering Eyelashes], 5, $item[glittery mascara]);
        ensure_effect($effect[Polka of Plenty]);
        boolean hit_nc = false;
        if (adventure_manual($location[The Neverending Party])) {
            // In NEP noncombat. Get stat buff if we don't have it. This WILL spend an adventure if we're out.
            if (have_effect($effect[Tomes of Opportunity]) == 0) {
                run_choice(1);
                run_choice(2);
                continue;
            } else {
                // Combat.
                run_choice(5);
                hit_nc = true;
            }
        }
        if (get_property_int('_neverendingPartyFreeTurns') < 10 || (!hit_nc && last_monster() == $monster[sausage goblin])) {
            run_combat();
        } else if (have_skill($skill[Chest X-Ray]) && get_property_int('_chestXRayUsed') < 3) {
            use_skill(1, $skill[Chest X-Ray]);
        } else if (have_skill($skill[Shattering Punch]) && get_property_int('_shatteringPunchUsed') < 3) {
            use_skill(1, $skill[Shattering Punch]);
        } else if (have_skill($skill[Gingerbread Mob Hit]) && !get_property_boolean('_gingerbreadMobHitUsed')) {
            use_skill(1, $skill[Gingerbread Mob Hit]);
        } else {
            error('Something went wrong. We should not be in a party fight.');
        }
        if (handling_choice()) {
            if (last_choice() == 1340) {
                // Lil' Doctor quest. Turn off phone.
                run_choice(3);
            } else {
                error('We are in a choice adventure for some reason.');
            }
        }
    }

    // Spend our free runs finding gobbos.
    use_familiar($familiar[Frumious Bandersnatch]);
    try_equip($item[amulet coin]);
    try_equip($item[astral pet sweater]);

    open_song_slot();
    if (have_effect($effect[Polka of Plenty]) > 0) cli_execute('uneffect Polka of Plenty');

    equip($item[fish hatchet]);
    equip($item[Kramco Sausage-o-Matic&trade;]);

    while ((get_property_int('_banderRunaways') < my_familiar_weight() / 5
             || (have_skill($skill[Snokebomb]) && get_property_int('_snokebombUsed') < 3)
             || (have_skill($skill[Reflex Hammer]) && get_property_int('_reflexHammerUsed') < 3))) {
        ensure_effect($effect[The Sonata of Sneakiness]);
        ensure_effect($effect[Smooth Movements]);
        if (get_property_int('_powerfulGloveBatteryPowerUsed') < 95) {
            ensure_effect($effect[Invisible Avatar]);
        }

        if (get_property_int('garbageShirtCharge') <= 8) {
            equip($slot[shirt], $item[none]);
        }
        if (get_property_int('_banderRunaways') < my_familiar_weight() / 5) {
            ensure_ode(1);
        }
        if (adventure_manual($location[The Haiku Dungeon])) {
            // Skip fairy gravy NC
            run_choice(3);
        } else if (last_monster() == $monster[sausage goblin]) {
            run_combat();
        } else if (get_property_int('_banderRunaways') < my_familiar_weight() / 5) {
            runaway();
            set_property_int('_banderRunaways', get_property_int('_banderRunaways') + 1);
        } else if (have_skill($skill[Snokebomb]) && get_property_int('_snokebombUsed') < 3) {
            use_skill(1, $skill[Snokebomb]);
        } else if (have_skill($skill[Reflex Hammer]) && get_property_int('_reflexHammerUsed') < 3) {
            use_skill(1, $skill[Reflex Hammer]);
        } else {
            error('Something went wrong. We should not be in a party fight.');
        }
    }

    if (have_effect($effect[The Sonata of Sneakiness]) > 0) cli_execute('uneffect Sonata of Sneakiness');

    if (my_level() < 11) error('Have to be level 11 before eating.');

    if (my_fullness() == 0) {
        eat(1, $item[spaghetti breakfast]);
    }

    if (my_inebriety() < 5) {
        if (item_amount($item[perfect dark and stormy]) == 0) {
            create(1, $item[perfect dark and stormy]);
        }
        ensure_ode(3);
        drink(1, $item[perfect dark and stormy]);
    }

    equip($item[Fourth of May Cosplay Saber]);
    equip($item[makeshift garbage shirt]);
    use_familiar($familiar[Hovering Sombrero]);
    try_equip($item[amulet coin]);
    try_equip($item[astral pet sweater]);

    // Get Punching Potion
    if (get_property('boomBoxSong') != 'These Fists Were Made for Punchin\'') {
        cli_execute('boombox damage');
    }

    // Use turns to level to 14.
    int turns_spent = 0;
    // Fight
    set_property('choiceAdventure1324', '5');
    if (!stat_ready()) {
        print('At level ' + my_level() + '. Going to level 14...');
        while (!stat_ready() && my_basestat($stat[Mysticality]) < 178 && get_property_int('garbageShirtCharge') > 0) {
            ensure_npc_effect($effect[Glittering Eyelashes], 5, $item[glittery mascara]);
            adv1($location[The Neverending Party], -1, '');
            turns_spent += 1;
            print('Spent ' + turns_spent + ' turns trying to level.');
            cli_execute('mood execute');
        }
    }

    synthesis_plan($effect[Synthesis: Strong], tail(tail(subsequent)));

    open_song_slot();
    ensure_potion_effect($effect[Expert Oiliness], $item[oil of expertise]);
    // ensure_effect($effect[Gr8ness]);
    ensure_effect($effect[Tomato Power]);
    ensure_effect($effect[Song of Starch]);
    ensure_effect($effect[Big]);
    ensure_effect($effect[Power Ballad of the Arrowsmith]);
    ensure_effect($effect[Rage of the Reindeer]);
    ensure_effect($effect[Quiet Determination]);
    ensure_npc_effect($effect[Go Get 'Em, Tiger!], 5, $item[Ben-Gal&trade; balm]);
    maximize('hp', false);

    // QUEST - Donate Blood (HP)
    if (my_maxhp() - my_buffedstat($stat[muscle]) - 3 < 1770) {
        error('Not enough HP to cap.');
    }

    do_test(TEST_HP);
}

if (!test_done(TEST_MUS)) {
    open_song_slot();
    ensure_effect($effect[Big]);
    ensure_effect($effect[Song of Bravado]);
    ensure_effect($effect[Power Ballad of the Arrowsmith]);
    ensure_effect($effect[Rage of the Reindeer]);
    ensure_effect($effect[Quiet Determination]);
    ensure_effect($effect[Tomato Power]);
    ensure_npc_effect($effect[Go Get 'Em, Tiger!], 5, $item[Ben-Gal&trade; balm]);
    maximize('muscle', false);
    if (my_buffedstat($stat[muscle]) - my_basestat($stat[muscle]) < 1770) {
        error('Not enough muscle to cap.');
    }
    do_test(TEST_MUS);
}

if (!test_done(TEST_MYS)) {
    open_song_slot();
    ensure_effect($effect[Big]);
    ensure_effect($effect[Song of Bravado]);
    ensure_effect($effect[The Magical Mojomuscular Melody]);
    ensure_effect($effect[Tomato Power]);
    ensure_effect($effect[Mystically Oiled]);
    ensure_npc_effect($effect[Glittering Eyelashes], 5, $item[glittery mascara]);
    maximize('mysticality', false);
    if (my_buffedstat($stat[mysticality]) - my_basestat($stat[mysticality]) < 1770) {
        error('Not enough mysticality to cap.');
    }
    do_test(TEST_MYS);
}

if (!test_done(TEST_MOX)) {
    effect[int] subsequent = { $effect[Synthesis: Collection] };
    synthesis_plan($effect[Synthesis: Cool], subsequent);

    open_song_slot();
    ensure_effect($effect[Big]);
    ensure_effect($effect[Song of Bravado]);
    ensure_effect($effect[The Moxious Madrigal]);
    ensure_effect($effect[Quiet Desperation]);
    ensure_effect($effect[Tomato Power]);
    ensure_npc_effect($effect[Butt-Rock Hair], 5, $item[hair spray]);
    use(item_amount($item[rhinestone]), $item[rhinestone]);
    if (have_effect($effect[Unrunnable Face]) == 0) {
        try_use(1, $item[runproof mascara]);
    }
    maximize('moxie', false);
    if (my_buffedstat($stat[moxie]) - my_basestat($stat[moxie]) < 1770) {
        error('Not enough moxie to cap.');
    }
    do_test(TEST_MOX);
}

if (!test_done(TEST_ITEM)) {
    if (my_mp() < 500) cli_execute('eat magical sausage');

    if (item_amount($item[cyclops eyedrops]) == 0 && have_effect($effect[One Very Clear Eye]) == 0) {
        cli_execute('pillkeeper semirare');
        if (get_property_int('semirareCounter') != 0) {
            error('Semirare should be now. Something went wrong.');
        }
        cli_execute('counters nowarn Fortune Cookie');
        adv1($location[The Limerick Dungeon], -1, '');
    }

    try_use(1, $item[astral six-pack]);
    while (item_amount($item[astral pilsner]) > 0) {
        ensure_ode(1);
        drink(1, $item[astral pilsner]);
    }

    if (my_inebriety() != 11) {
        error('Too drunk. Something went wrong.');
    }

    // Make A Light that Never Goes Out
    if (item_amount($item[A Light That Never Goes Out]) == 0) {
        ensure_item(1, $item[third-hand lantern]);
        ensure_item(1, $item[tenderizing hammer]);
        create(1, $item[A Light That Never Goes Out]);
    }

    if (!get_property_boolean('_clanFortuneBuffUsed')) {
        ensure_effect($effect[There's No N In Love]);
    }

    ensure_effect($effect[Fat Leon's Phat Loot Lyric]);
    ensure_effect($effect[Singer's Faithful Ocelot]);
    ensure_effect($effect[The Spirit of Taking]);

    effect[int] subsequent;
    synthesis_plan($effect[Synthesis: Collection], subsequent);

    // Use cyclops eyedrops.
    ensure_effect($effect[One Very Clear Eye]);
    // Use bag of grain.
    ensure_effect($effect[Nearly All-Natural]);
    ensure_effect($effect[Steely-Eyed Squint]);

    if (have_effect($effect[Certainty]) == 0) {
        use_familiar($familiar[Rock Lobster]);
        if (item_amount($item[blood-faced volleyball]) == 0) {
            ensure_hermit_item(1, $item[volleyball]);
            ensure_hermit_item(1, $item[seal tooth]);
            use(1, $item[seal tooth]);
            use(1, $item[volleyball]);
        }
        pizza_effect(
            $effect[Certainty],
            $item[clove-flavored lip balm],
            $item[ectoplasm <i>au jus</i>],
            item_priority($item[ravioli hat], $item[red pixel], $item[ratty knitted cap]),
            $item[blood-faced volleyball] // get extra-strength rubber bands
        );
    }

    if (have_effect($effect[Infernal Thirst]) == 0) {
        use_familiar($familiar[Cornbeefadon]);
        if (item_amount($item[Irish Coffee, English Heart]) == 0) {
            if (item_amount($item[handful of Smithereens]) == 0) {
                ensure_item(1, $item[third-hand lantern]);
                ensure_item(1, $item[tenderizing hammer]);
                create(1, $item[A Light that Never Goes Out]);
                cli_execute('smash 1 A Light That Never Goes Out');
            }
            ensure_item(1, $item[cup of lukewarm tea]);
            create(1, $item[Irish Coffee, English Heart]);
        }
        pizza_effect(
            $effect[Infernal Thirst],
            $item[Irish Coffee, English Heart],
            item_priority($item[neverending wallet chain], $item[Newbiesport&trade; tent]),
            $item[Flaskfull of Hollow],
            $item[extra-strength rubber bands] // get amulet coin
        );
    }

    maximize('item, 2 booze drop, -equip broken champagne bottle', false);

    do_test(TEST_ITEM);
}

if (!test_done(TEST_HOT_RES)) {
    if (have_effect($effect[Feeling No Pain]) == 0) {
        if (my_meat() < 500) {
            error('Not enough meat. Please autosell stuff.');
        }
        if (my_inebriety() > 13) {
            error('Too drunk. Something is wrong.');
        }
        ensure_ode(2);
        cli_execute('drink 1 Ish Kabibble');
    }

    // Make sure no moon spoon.
    equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
    equip($slot[acc2], $item[Powerful Glove]);
    equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

    if (item_amount($item[heat-resistant gloves]) == 0) {
        if (item_amount($item[photocopied monster]) == 0) {
            cli_execute('faxbot factory worker');
        }
        cli_execute('ccs hccs');
        equip($item[Fourth of May Cosplay Saber]);
        use(1, $item[photocopied monster]);
        saber_yr();
    }
    autosell(1, $item[very hot lunch]);

    if (have_effect($effect[Synthesis: Hot]) == 0) {
        ensure_item(2, $item[jaba&ntilde;ero-flavored chewing gum]);
        sweet_synthesis($item[jaba&ntilde;ero-flavored chewing gum], $item[jaba&ntilde;ero-flavored chewing gum]);
    }

    use_familiar($familiar[Exotic Parrot]);
    try_equip($item[amulet coin]);

    if (have_effect($effect[Rainbowolin]) == 0) {
        cli_execute('pillkeeper elemental');
    }

    cli_execute('smash * ratty knitted cap');
    cli_execute('smash * red-hot sausage fork');
    autosell(10, $item[hot nuggets]);
    autosell(10, $item[twinkly powder]);

    if (item_amount($item[hot powder]) > 0) {
        ensure_effect($effect[Flame-Retardant Trousers]);
    }

    if (item_amount($item[sleaze powder]) > 0) {
        ensure_potion_effect($effect[Sleazy Hands], $item[lotion of sleaziness]);
    }

    if (get_property_int('_genieWishesUsed') < 3 || item_amount($item[pocket wish]) > 0) {
        wish_effect($effect[Fireproof Lips]);
    }

    ensure_effect($effect[Elemental Saucesphere]);
    ensure_effect($effect[Astral Shell]);

    // Use pocket maze
    ensure_effect($effect[Amazing]);

    // Mafia sometimes can't figure out that multiple +weight things would get us to next tier.
    maximize('hot res, 0.01 familiar weight', false);

    if (numeric_modifier('hot resistance') < 40) {
        error('Something went wrong building hot res.');
    }

    do_test(TEST_HOT_RES);

    autosell(1, $item[lava-proof pants]);
    autosell(1, $item[heat-resistant gloves]);
}

if (!test_done(TEST_FAMILIAR)) {
    // This one should fall through from the previous test.
    if (have_effect($effect[Fidoxene]) == 0) {
        cli_execute('pillkeeper familiar');
    }

    // Pool buff
    ensure_effect($effect[Billiards Belligerence]);

    if (my_hp() < 30) use_skill(1, $skill[Cannelloni Cocoon]);
    ensure_effect($effect[Blood Bond]);
    ensure_effect($effect[Leash of Linguini]);
    ensure_effect($effect[Empathy]);

    maximize('familiar weight', false);

    do_test(TEST_FAMILIAR);
}

if (!test_done(TEST_NONCOMBAT)) {
    use_familiar($familiar[Disgeist]);

    if (my_hp() < 30) use_skill(1, $skill[Cannelloni Cocoon]);
    ensure_effect($effect[Blood Bond]);
    ensure_effect($effect[Leash of Linguini]);
    ensure_effect($effect[Empathy]);

    equip($slot[acc3], $item[Powerful Glove]);

    ensure_effect($effect[The Sonata of Sneakiness]);
    ensure_effect($effect[Smooth Movements]);
    ensure_effect($effect[Invisible Avatar]);

    ensure_effect($effect[Silent Running]);

    // Rewards
    ensure_effect($effect[Throwing Some Shade]);
    ensure_effect($effect[A Rose by Any Other Material]);

    /*if (have_effect($effect[Disquiet Riot]) == 0) {
        if (item_amount($item[dripping meat crossbow]) == 0) {
            ensure_item(1, $item[crossbow string]);
            if (item_amount($item[meat stack]) == 0) {
                create(1, $item[meat stack]);
            }
            ensure_hermit_item(1, $item[catsup]);
            create(1, $item[dripping meat crossbow]);
        }
        if (item_amount($item[Irish Coffee, English Heart]) == 0) {
            if (item_amount($item[handful of Smithereens]) == 0) {
                if (get_property_int('tomeSummons') < 3) {
                    use_skill(3 - get_property_int('tomeSummons'), $skill[Summon Smithsness]);
                }
                if (item_amount($item[A Light That Never Goes Out]) == 0 && item_amount($item[lump of Brituminous coal]) > 0) {
                    ensure_item(1, $item[third-hand lantern]);
                    ensure_item(1, $item[tenderizing hammer]);
                    create(1, $item[A Light that Never Goes Out]);
                }
                cli_execute('smash 1 A Light That Never Goes Out');
            }
            ensure_item(1, $item[cup of lukewarm tea]);
            create(1, $item[Irish Coffee, English Heart]);
        }
        if (item_amount($item[shot of grapefruit schnapps]) == 0) {
            ensure_item(1, $item[fermenting powder]);
            create(1, $item[shot of grapefruit schnapps]);
        }
        // sometimes the qaudroculars end up equipped...
        retrieve_item(1, $item[quadroculars]);
        pizza_effect(
            $effect[Disquiet Riot],
            $item[dripping meat crossbow],
            $item[Irish Coffee, English Heart],
            $item[shot of grapefruit schnapps],
            $item[quadroculars]
        );
    }*/

    wish_effect($effect[Disquiet Riot]);

    maximize('-combat, 0.01 familiar weight', false);

    do_test(TEST_NONCOMBAT);
}

if (!test_done(TEST_WEAPON)) {
    // Paint ungulith (Saber YR)
    if (!get_property_boolean('_chateauMonsterFought')) {
        string chateau_text = visit_url('place.php?whichplace=chateau', false);
        matcher m = create_matcher('alt="Painting of an? ([^(]*) .1."', chateau_text);
        if (m.find() && m.group(1) == 'ungulith') {
            visit_url('place.php?whichplace=chateau&action=chateau_painting', false);
            run_combat();
            saber_yr();
        } else {
            abort('Wrong painting.');
        }
    }

    if (have_effect($effect[In a Lather]) == 0) {
        if (my_inebriety() > inebriety_limit() - 2) {
            error('Something went wrong. We are too drunk.');
        }
        assert_meat(500);
        ensure_ode(2);
        cli_execute('drink Sockdollager');
    }

    if (item_amount($item[twinkly nuggets]) > 0) {
        ensure_effect($effect[Twinkly Weapon]);
    }

    ensure_effect($effect[Carol of the Bulls]);
    ensure_effect($effect[Song of the North]);
    ensure_effect($effect[Rage of the Reindeer]);
    ensure_effect($effect[Frenzied, Bloody]);

    // Hatter buff
    ensure_item(1, $item[goofily-plumed helmet]);
    ensure_effect($effect[Weapon of Mass Destruction]);

    if (get_property('boomBoxSong') != 'These Fists Were Made for Punchin\'') {
        cli_execute('boombox damage');
    }

    // Boombox potion - did we get one?
    if (item_amount($item[Punching Potion]) > 0) {
        ensure_effect($effect[Feeling Punchy]);
    }

    // Pool buff
    ensure_effect($effect[Billiards Belligerence]);

    // Corrupted marrow
    ensure_effect($effect[Cowrruption]);

    // ensure_npc_effect($effect[Engorged Weapon], 1, $item[Meleegra&trade; pills]);

    wish_effect($effect[Outer Wolf&trade;]);

    ensure_effect($effect[Bow-Legged Swagger]);

    // If this is day 2 we need to get a fish hatchet.
    retrieve_item(1, $item[fish hatchet]);

    maximize('weapon damage', false);

    if (60 - floor(numeric_modifier('weapon damage') / 25 + 0.001) - floor(numeric_modifier('weapon damage percent') / 25 + 0.001) > 28) {
        abort('Something went wrong with weapon damage.');
    }

    do_test(TEST_WEAPON);
}

if (!test_done(TEST_SPELL)) {
    // This will use an adventure.
    ensure_effect($effect[Simmering]);

    ensure_effect($effect[Song of Sauce]);
    ensure_effect($effect[Carol of the Hells]);

    // Pool buff
    ensure_effect($effect[Mental A-cue-ity]);

    ensure_item(1, $item[obsidian nutcracker]);

    maximize('spell damage', false);

    int turns = 60 - floor(numeric_modifier('spell damage') / 50 + 0.001) - floor(numeric_modifier('spell damage percent') / 50 + 0.001);
    if (turns > my_adventures()) {
        while (my_meat() > 111 * (get_property_int('_sausagesMade') + 1)) {
            create(1, $item[magical sausage]);
            eat(1, $item[magical sausage]);
        }
    }

    if (turns > my_adventures() && my_fullness() + 2 <= fullness_limit()) {
        if (item_amount($item[This Charming Flan]) == 0) {
            if (item_amount($item[handful of smithereens]) == 0) {
                cli_execute('smash A Light That Never Goes Out');
            }
            ensure_item(1, $item[pickled egg]);
            create(1, $item[This Charming Flan]);
        }
        eat(1, $item[This Charming Flan]);
    }

    if (turns > my_adventures()) {
        error('Not enough turns for last test. Autosell stuff for sausages, stooper, etc., or PVP and overdrink.');
    }

    do_test(TEST_SPELL);
}

set_property('autoSatisfyWithNPCs', get_property('_saved_autoSatisfyWithNPCs'));

cli_execute('mood default');
cli_execute('ccs default');
