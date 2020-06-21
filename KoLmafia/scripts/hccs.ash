// Script by worthawholebean. Public domain; feel free to modify or distribute.
// This is a script to do 1-day Hardcore Community Service runs. See README.md for details.

import <canadv.ash>
import <hccs_combat.ash>
import <hccs_lib.ash>

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

boolean try_use(int quantity, item it) {
    if (available_amount(it) > 0) {
        return use(quantity, it);
    } else {
        return false;
    }
}

boolean use_all(item it) {
    return use(available_amount(it), it);
}

boolean try_equip(item it) {
    if (available_amount(it) > 0) {
        return equip(it);
    } else {
        return false;
    }
}

void assert_meat(int meat) {
    if (my_meat() < meat) error('Not enough meat.');
}

void autosell_all(item it) {
    autosell(item_amount(it), it);
}

void wish_effect(effect ef) {
    if (have_effect(ef) == 0) {
        cli_execute('genie effect ' + ef.name);
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

item item_priority(item it1, item it2) {
    if (available_amount(it1) > 0) return it1;
    else return it2;
}

item item_priority(item it1, item it2, item it3) {
    if (available_amount(it1) > 0) return it1;
    else if (available_amount(it2) > 0) return it2;
    else return it3;
}

item item_priority(item it1, item it2, item it3, item it4) {
    if (available_amount(it1) > 0) return it1;
    else if (available_amount(it2) > 0) return it2;
    else if (available_amount(it3) > 0) return it3;
    else return it4;
}

void eat_pizza(item it1, item it2, item it3, item it4) {
    if (available_amount($item[diabolic pizza]) > 0) {
        error('Already have a pizza.');
    }
    if (available_amount(it1) == 0 || available_amount(it2) == 0 || available_amount(it3) == 0 || available_amount(it4) == 0) {
        error('Missing items for pizza.');
    }
    visit_url('campground.php?action=makepizza&pizza=' + it1.to_int() + ',' + it2.to_int() + ',' + it3.to_int() + ',' + it4.to_int());
    eat(1, $item[diabolic pizza]);
}

void pizza_effect(effect ef, item it1, item it2, item it3, item it4) {
    if (have_effect(ef) == 0) {
        eat_pizza(it1, it2, it3, it4);
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

// Only necessary for complex-candy synthesis, since we can get simple candy from Gno-Mart.
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

// We have Phat Loot, Ur-Kel's on at all times during leveling (managed via mood); third and fourth slots are variable.
boolean[effect] song_slot_3 = $effects[Power Ballad of the Arrowsmith, The Magical Mojomuscular Melody, The Moxious Madrigal, Ode to Booze, Jackasses' Symphony of Destruction];
boolean[effect] song_slot_4 = $effects[Carlweather's Cantata of Confrontation, The Sonata of Sneakiness, Polka of Plenty];
void open_song_slot(effect song) {
    boolean[effect] song_slot;
    if (song_slot_3 contains song) song_slot = song_slot_3;
    else if (song_slot_4 contains song) song_slot = song_slot_4;
    foreach shruggable in song_slot {
        shrug(shruggable);
    }
}

void ensure_song(effect ef) {
    if (have_effect(ef) == 0) {
        open_song_slot(ef);
        if (!cli_execute(ef.default) || have_effect(ef) == 0) {
            error('Failed to get effect ' + ef.name + '.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void ensure_ode(int turns) {
    while (have_effect($effect[Ode to Booze]) < turns) {
        ensure_mp_tonic(50);
        open_song_slot($effect[Ode to Booze]);
        use_skill(1, $skill[The Ode to Booze]);
    }
}

boolean summon_bricko_oyster() {
    if (get_property_int('_brickoFights') >= 3) return false;
    if (available_amount($item[BRICKO oyster]) > 0) return true;
    while (get_property_int('libramSummons') < 7 && (available_amount($item[BRICKO eye brick]) < 1 || available_amount($item[BRICKO brick]) < 8)) {
        use_skill(1, $skill[Summon BRICKOs]);
    }
    return use(8, $item[BRICKO brick]);
}

boolean stat_ready() {
    // Synth, Ben-Gal balm, Rage of the Reindeer, Quiet Determination, wad of used tape, fish hatchet, Brutal brogues
    float muscle_multiplier = 5.2;
    int buffed_muscle = 60 + (1 + numeric_modifier('muscle percent') / 100 + muscle_multiplier) * my_basestat($stat[Mysticality]);
    boolean muscle_met = buffed_muscle - my_basestat($stat[Muscle]) >= 1770;
    print('Buffed muscle: ' + floor(buffed_muscle) + ' (' + muscle_met + ')');
    // Synth, Hair spray, runproof mascara, Quiet Desperation, wad of used tape, Beach Comb, Beach Comb buff
    float moxie_multiplier = 4.7;
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

// Do buy stuff from coinmasters (hermit).
set_property('_saved_autoSatisfyWithCoinmasters', get_property('autoSatisfyWithCoinmasters'));
set_property('autoSatisfyWithCoinmasters', 'true');

// Initialize council.
visit_url('council.php');

// All combat handled by our consult script (hccs_combat.ash).
cli_execute('ccs bean-hccs');

// Turn off Lil' Doctor quests.
set_choice(1340, 3);

// Default equipment.
equip($item[Iunion Crown]);
equip($slot[shirt], $item[none]);
equip($item[Fourth of May Cosplay Saber]);
equip($item[Kramco Sausage-o-Matic&trade;]);
equip($item[old sweatpants]);
equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
equip($slot[acc2], $item[Powerful Glove]);
equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

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
    ensure_mp_tonic(2 * (2 - get_property_int('tomeSummons')));
    use_skill(2 - get_property_int('tomeSummons'), $skill[Summon Smithsness]);

    if (have_effect($effect[Inscrutable Gaze]) == 0) {
        ensure_mp_tonic(10);
        ensure_effect($effect[Inscrutable Gaze]);
    }

    // Depends on Ez's Bastille script.
    cli_execute('bastille myst brutalist');

    /* // Find a spleen item in the Barrels.
    foreach barrel in $strings[00, 01, 02, 10, 11, 12, 20, 21, 22] {
        if (available_amount($item[magicalness-in-a-can]) + available_amount($item[strongness elixir]) > 0) break;
        print(`Trying barrel in slot {barrel}.`);
        // Smash the barrel.
        visit_url('barrel.php');
        string page_text = visit_url(`choice.php?whichchoice=1099&option=1&slot={barrel}`);
        if (page_text.contains_text('Combat!')) {
            set_hccs_combat_mode(MODE_RUN_UNLESS_FREE);
            run_combat();
            set_hccs_combat_mode(MODE_NULL);
        }
    }

    if (my_fullness() < 3) {
        int count = 3 - available_amount($item[cog and sprocket assembly]);
        ensure_item(count, $item[cog]);
        ensure_item(count, $item[sprocket]);
        ensure_item(count, $item[spring]);
        create(count, $item[cog and sprocket assembly]);
        // Medicinal pizza to get us to level 5 to drink perfect drink.
        eat_pizza(
            $item[cog and sprocket assembly],
            $item[cog and sprocket assembly],
            $item[cog and sprocket assembly],
            item_priority($item[magicalness-in-a-can], $item[strongness elixir], $item[moxie weed])
        );
    }*/

    // Use a couple chateau rests to hit level 5. Should also give us a ton of MP.
    while (get_property_int('timesRested') < 2) {
        visit_url('place.php?whichplace=chateau&action=chateau_restbox');
        if (my_mp() > 50 && available_amount($item[bottle of rum]) == 0) {
            use_skill(1, $skill[Prevent Scurvy and Sobriety]);
        }
    }

    if (my_level() < 5) {
        error('Failed to hit level 5 for perfect drink. Oops.');
    }

    if (my_inebriety() < 3) {
        if (available_amount($item[bottle of rum]) == 0) {
            ensure_mp_tonic(50);
            use_skill(1, $skill[Prevent Scurvy and Sobriety]);
        }
        if (available_amount($item[perfect ice cube]) == 0) {
            ensure_mp_tonic(10);
            use_skill(1, $skill[Perfect Freeze]);
        }
        ensure_create_item(1, $item[perfect dark and stormy]);
        ensure_ode(3);
        drink(1, $item[perfect dark and stormy]);
    }

    // Upgrade saber for fam wt
    visit_url('main.php?action=may4');
    run_choice(4);

    // Put on some regen gear
    equip($item[Iunion Crown]);
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
        if (available_amount($item[dripping meat crossbow]) == 0) {
            ensure_item(1, $item[crossbow string]);
            if (available_amount($item[meat stack]) == 0) {
                create(1, $item[meat stack]);
            }
            ensure_hermit_item(1, $item[catsup]);
            create(1, $item[dripping meat crossbow]);
        }
        if (available_amount($item[Irish Coffee, English Heart]) == 0) {
            ensure_item(1, $item[cup of lukewarm tea]);
            create(1, $item[Irish Coffee, English Heart]);
        }
        if (available_amount($item[blood-faced volleyball]) == 0) {
            ensure_hermit_item(1, $item[volleyball]);
            ensure_hermit_item(1, $item[seal tooth]);
            use(1, $item[seal tooth]);
            use(1, $item[volleyball]);
        }
        // Get a pocket professor chip.
        // use_familiar($familiar[Pocket Professor]);
        // Actually, get a quadroculars for DISQ later.
        use_familiar($familiar[He-Boulder]);
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
        if (available_amount(love_potion) == 0) {
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

    ensure_effect($effect[Merry Smithsness]);

    // Cast inscrutable gaze
    ensure_effect($effect[Inscrutable Gaze]);

    // Shower lukewarm
    ensure_effect($effect[Thaumodynamic]);

    // Beach Comb
    ensure_effect($effect[You Learned Something Maybe!]);

    // Get beach access.
    if (available_amount($item[bitchin' meatcar]) == 0) {
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
        // Get a frilly skirt for later
        ensure_item(1, $item[frilly skirt]);
        create(1, $item[Vicar's Tutu]);
        // Get a full meat tank for later
        ensure_item(1, $item[empty meat tank]);
        ensure_create_item(1, $item[meat stack]);
        create(1, $item[full meat tank]);
        // Get some CSAs for later pizzas
        int count = 3 - available_amount($item[cog and sprocket assembly]);
        ensure_item(count, $item[cog]);
        ensure_item(count, $item[sprocket]);
        ensure_item(count, $item[spring]);
        create(count, $item[cog and sprocket assembly]);
        // Actually tune the moon.
        visit_url('inv_use.php?whichitem=10254&doit=96&whichsign=8');
    }

    equip($item[Iunion Crown]);
    equip($slot[shirt], $item[none]);
    equip($item[Fourth of May Cosplay Saber]);
    equip($item[Kramco Sausage-o-Matic&trade;]);
    equip($item[old sweatpants]);
    equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
    equip($slot[acc2], $item[Powerful Glove]);
    equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

    while (summon_bricko_oyster()) {
        if (available_amount($item[bag of many confections]) == 0) {
            // Use one of these fights to get a bag of many confections.
            use_familiar($familiar[Stocking Mimic]);
            equip($slot[familiar], $item[none]);
        } else {
            use_familiar($familiar[Pocket Professor]);
        }
        if (my_hp() < .8 * my_maxhp()) {
            visit_url('clan_viplounge.php?where=hottub');
        }
        ensure_mp_tonic(32);
        set_hccs_combat_mode(MODE_OTOSCOPE);
        use(1, $item[BRICKO oyster]);
        autosell(1, $item[BRICKO pearl]);
        set_hccs_combat_mode(MODE_NULL);
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

    // This is the sequence of synthesis effects; synthesis_plan will, if possible, come up with a plan for allocating candy to each of these.
    effect[int] subsequent = { $effect[Synthesis: Smart], $effect[Synthesis: Strong], $effect[Synthesis: Cool], $effect[Synthesis: Collection] };
    synthesis_plan($effect[Synthesis: Learning], subsequent);
    synthesis_plan($effect[Synthesis: Smart], tail(subsequent));

    if (numeric_modifier('mysticality experience percent') < 124.999) {
        error('Insufficient +stat%.');
    }

    // Use ten-percent bonus
    try_use(1, $item[a ten-percent bonus]);

    if (!get_property_boolean('_lyleFavored')) {
        ensure_effect($effect[Favored by Lyle]);
    }
    ensure_effect($effect[Triple-Sized]);
    ensure_song($effect[The Magical Mojomuscular Melody]);
    ensure_npc_effect($effect[Glittering Eyelashes], 5, $item[glittery mascara]);

    // Pill Keeper stats.
    ensure_effect($effect[Hulkien]);

    // Plan is for Beach Comb + PK buffs to fall all the way through to item -> hot res -> fam weight.
    ensure_effect($effect[Fidoxene]);
    ensure_effect($effect[Do I Know You From Somewhere?]);

    // Chateau rest
    while (get_property_int('timesRested') < total_free_rests()) {
        visit_url('place.php?whichplace=chateau&action=chateau_restbox');
    }

    ensure_effect($effect[Song of Bravado]);

    if (get_property('boomBoxSong') != 'Total Eclipse of Your Meat') {
        cli_execute('boombox meat');
    }

    // Get buff things
    ensure_sewer_item(1, $item[turtle totem]);
    ensure_sewer_item(1, $item[saucepan]);

    // Cast Ode and drink bee's knees
    if (have_effect($effect[On the Trolley]) == 0) {
        assert_meat(500);
        ensure_ode(2);
        cli_execute('drink 1 Bee\'s Knees');
    }

    // Don't use Kramco here.
    equip($slot[off-hand], $item[none]);

    // Tomato in pantry (Saber YR)
    if (available_amount($item[tomato juice of powerful power]) == 0 && available_amount($item[tomato]) == 0 && have_effect($effect[Tomato Power]) == 0) {
        cli_execute('mood apathetic');

        ensure_effect($effect[Musk of the Moose]);
        ensure_effect($effect[Carlweather's Cantata of Confrontation]);
        ensure_mp_tonic(50); // For Snokebomb.

        find_monster_saber_yr($location[The Haunted Pantry], $monster[possessed can of tomatoes]);
    }

    // Fruits in skeleton store (Saber YR)
    if ((available_amount($item[ointment of the occult]) == 0 && available_amount($item[grapefruit]) == 0 && have_effect($effect[Mystically Oiled]) == 0)
            || (available_amount($item[oil of expertise]) == 0 && available_amount($item[cherry]) == 0 && have_effect($effect[Expert Oiliness]) == 0)) {
        cli_execute('mood apathetic');

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
        find_monster_saber_yr($location[The Skeleton Store], $monster[novelty tropical skeleton]);
    }

    // Equip makeshift garbage shirt
    cli_execute('fold makeshift garbage shirt');
    equip($item[makeshift garbage shirt]);

    cli_execute('mood hccs');

    // Professor 9x free sausage fight @ NEP
    if (get_property_int('_sausageFights') == 0) {
        use_familiar($familiar[Pocket Professor]);
        try_equip($item[Pocket Professor memory chip]);

        equip($item[Kramco Sausage-o-Matic&trade;]);
        equip($slot[acc2], $item[Brutal brogues]);
        equip($slot[acc3], $item[Beach Comb]);

        while (get_property_int('_sausageFights') == 0) {
            if (my_hp() < .8 * my_maxhp()) {
                visit_url('clan_viplounge.php?where=hottub');
            }

            // Just here to party.
            set_choice(1322, 2);
            adventure_copy($location[The Neverending Party], $monster[sausage goblin]);
        }
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
    use_skill(1, $skill[Acquire Rhinestones]);
    use_skill(1, $skill[Prevent Scurvy and Sobriety]);
    use_skill(1, $skill[Perfect Freeze]);
    autosell(3, $item[coconut shell]);
    autosell(3, $item[magical ice cubes]);
    autosell(3, $item[little paper umbrella]);

    // Autosell stuff
    // autosell(1, $item[strawberry]);
    // autosell(1, $item[orange]);
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
    equip($slot[acc2], $item[Brutal brogues]);
    equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

    if (have_effect($effect[Carlweather's Cantata of Confrontation]) > 0) {
        cli_execute('shrug Carlweather\'s Cantata of Confrontation');
    }

    cli_execute('mood hccs');

    // 17 free NEP fights
    while (get_property_int('_neverendingPartyFreeTurns') < 10
            || (have_skill($skill[Chest X-Ray]) && get_property_int('_chestXRayUsed') < 3)
            || (have_skill($skill[Shattering Punch]) && get_property_int('_shatteringPunchUsed') < 3)
            || (have_skill($skill[Gingerbread Mob Hit]) && !get_property_boolean('_gingerbreadMobHitUsed'))) {
        ensure_npc_effect($effect[Glittering Eyelashes], 5, $item[glittery mascara]);
        ensure_song($effect[The Magical Mojomuscular Melody]);
        ensure_song($effect[Polka of Plenty]);

        // Get Punching Potion once we run out of free fights
        if (get_property_int('_neverendingPartyFreeTurns') >= 10 && get_property('boomBoxSong') != 'These Fists Were Made for Punchin\'') {
            cli_execute('boombox damage');
        }

        cli_execute('mood execute');
        if (have_effect($effect[Tomes of Opportunity]) == 0) {
            // NEP noncombat. Get stat buff if we don't have it. This WILL spend an adventure if we're out.
            set_choice(1324, 1);
            set_choice(1325, 2);
        } else {
            // Otherwise fight.
            set_choice(1324, 5);
        }

        ensure_mp_sausage(100);
        if (get_property_int('_neverendingPartyFreeTurns') < 10) {
            adventure_kill($location[The Neverending Party]);
        } else {
            adventure_free_kill($location[The Neverending Party]);
        }
    }   

    // Spend our free runs finding gobbos. We do this in the Haiku Dungeon since there is a single skippable NC.
    use_familiar($familiar[Frumious Bandersnatch]);
    try_equip($item[amulet coin]);
    try_equip($item[astral pet sweater]);

    equip($item[Fourth of May Cosplay Saber]);
    equip($item[latte lovers member's mug]);
    equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
    equip($slot[acc2], $item[Powerful Glove]);
    equip($slot[acc3], $item[Beach Comb]);

    while (get_property_int('_banderRunaways') < my_familiar_weight() / 5 && !get_property('latteUnlocks').contains_text('chili')) {
        // Find latte ingredient.
        ensure_ode(1);
        adventure_run_unless_free($location[The Haunted Kitchen]);
    }

    if (get_property('latteUnlocks').contains_text('chili')) {
        cli_execute('latte refill pumpkin chili vanilla');
    }

    equip($item[fish hatchet]);
    equip($item[Kramco Sausage-o-Matic&trade;]);

    while ((get_property_int('_banderRunaways') < my_familiar_weight() / 5
             || (have_skill($skill[Snokebomb]) && get_property_int('_snokebombUsed') < 3)
             || (have_skill($skill[Reflex Hammer]) && get_property_int('_reflexHammerUsed') < 3))) {
        ensure_song($effect[The Sonata of Sneakiness]);
        ensure_effect($effect[Smooth Movements]);
        if (get_property_int('_powerfulGloveBatteryPowerUsed') <= 90) {
            ensure_effect($effect[Invisible Avatar]);
        }
        if (get_property_int('garbageShirtCharge') <= 8) {
            equip($slot[shirt], $item[none]);
        }
        if (get_property_int('_banderRunaways') < my_familiar_weight() / 5) {
            ensure_ode(1);
        }

        // Skip fairy gravy NC
        set_choice(297, 3);
        ensure_mp_sausage(100);
        adventure_run_unless_free($location[The Haiku Dungeon]);
    }

    if (have_effect($effect[The Sonata of Sneakiness]) > 0) cli_execute('uneffect Sonata of Sneakiness');

    equip($item[Fourth of May Cosplay Saber]);
    equip($item[makeshift garbage shirt]);
    use_familiar($familiar[Hovering Sombrero]);
    try_equip($item[amulet coin]);
    try_equip($item[astral pet sweater]);

    // Use turns to level to 14.
    int turns_spent = 0;
    // Fight
    set_property('choiceAdventure1324', '5');
    if (!stat_ready()) {
        print('At level ' + my_level() + '. Going to level 14...');
        cli_execute('mood execute');
        // Turncount minimum is to make sure we get a punching potion.
        while (my_turncount() < 62 || (!stat_ready() && my_basestat($stat[Mysticality]) < 178 && get_property_int('garbageShirtCharge') > 0)) {
            ensure_npc_effect($effect[Glittering Eyelashes], 5, $item[glittery mascara]);

            ensure_mp_sausage(100);
            adventure_kill($location[The Neverending Party]);

            turns_spent += 1;
            print('Spent ' + turns_spent + ' turns trying to level.');
            if (my_turncount() > 62) error('CHECK leveling.');
        }
    }

    synthesis_plan($effect[Synthesis: Strong], tail(tail(subsequent)));

    ensure_potion_effect($effect[Expert Oiliness], $item[oil of expertise]);
    // ensure_effect($effect[Gr8ness]);
    ensure_effect($effect[Tomato Power]);
    ensure_effect($effect[Song of Starch]);
    ensure_effect($effect[Big]);
    ensure_song($effect[Power Ballad of the Arrowsmith]);
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
    ensure_effect($effect[Big]);
    ensure_effect($effect[Song of Bravado]);
    ensure_song($effect[Power Ballad of the Arrowsmith]);
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
    ensure_effect($effect[Big]);
    ensure_effect($effect[Song of Bravado]);
    ensure_song($effect[The Magical Mojomuscular Melody]);
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

    // Beach Comb
    ensure_effect($effect[Pomp & Circumsands]);

    ensure_effect($effect[Big]);
    ensure_effect($effect[Song of Bravado]);
    ensure_song($effect[The Moxious Madrigal]);
    ensure_effect($effect[Quiet Desperation]);
    ensure_effect($effect[Tomato Power]);
    ensure_npc_effect($effect[Butt-Rock Hair], 5, $item[hair spray]);
    use(available_amount($item[rhinestone]), $item[rhinestone]);
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
    ensure_mp_sausage(500);

    if (available_amount($item[cyclops eyedrops]) == 0 && have_effect($effect[One Very Clear Eye]) == 0) {
        cli_execute('pillkeeper semirare');
        if (get_property_int('semirareCounter') != 0) {
            error('Semirare should be now. Something went wrong.');
        }
        cli_execute('mood apathetic');
        cli_execute('counters nowarn Fortune Cookie');
        adv1($location[The Limerick Dungeon], -1, '');
    }

    try_use(1, $item[astral six-pack]);
    if (available_amount($item[astral pilsner]) > 0 && my_inebriety() != 5) {
        error('Too drunk. Something went wrong.');
    }

    while (available_amount($item[astral pilsner]) > 0) {
        ensure_ode(1);
        drink(1, $item[astral pilsner]);
    }

    // Make A Light that Never Goes Out
    if (available_amount($item[A Light That Never Goes Out]) == 0) {
        ensure_item(1, $item[lump of Brituminous coal]);
        ensure_item(1, $item[third-hand lantern]);
        ensure_item(1, $item[tenderizing hammer]);
        create(1, $item[A Light That Never Goes Out]);
    }

    // Should have a frilly skirt from tuning code above.
    ensure_create_item(1, $item[Vicar's Tutu]);

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
        if (available_amount($item[ectoplasm <i>au jus</i>]) + available_amount($item[eyedrops of the ermine]) == 0) {
            // should have strawberry already.
            create(1, $item[eyedrops of the ermine]);
        }
        if (available_amount($item[blood-faced volleyball]) == 0) {
            ensure_hermit_item(1, $item[volleyball]);
            ensure_hermit_item(1, $item[seal tooth]);
            use(1, $item[seal tooth]);
            use(1, $item[volleyball]);
        }
        pizza_effect(
            $effect[Certainty],
            $item[cog and sprocket assembly],
            item_priority($item[ectoplasm <i>au jus</i>], $item[eyedrops of the ermine]),
            item_priority($item[ravioli hat], $item[red pixel], $item[ratty knitted cap]),
            $item[blood-faced volleyball] // get extra-strength rubber bands
        );
    }

    if (have_effect($effect[Infernal Thirst]) == 0) {
        use_familiar($familiar[Exotic Parrot]);
        if (available_amount($item[Irish Coffee, English Heart]) == 0) {
            ensure_item(1, $item[cup of lukewarm tea]);
            create(1, $item[Irish Coffee, English Heart]);
        }
        pizza_effect(
            $effect[Infernal Thirst],
            $item[Irish Coffee, English Heart],
            item_priority($item[neverending wallet chain], $item[Newbiesport&trade; tent]),
            $item[full meat tank],
            $item[extra-strength rubber bands] // get cracker
        );
    }

    maximize('item, 2 booze drop, equip Vicar\'s Tutu, -equip broken champagne bottle', false);

    do_test(TEST_ITEM);

    if (available_amount($item[Vicar's Tutu]) > 0) {
        if (have_equipped($item[Vicar's Tutu])) equip($item[old sweatpants]);
        cli_execute('smash 1 Vicar\'s Tutu');
    }
}

if (!test_done(TEST_HOT_RES)) {
    ensure_mp_sausage(500);

    if (have_effect($effect[Feeling No Pain]) == 0) {
        if (my_meat() < 500) {
            error('Not enough meat. Please autosell stuff.');
        }
        if (my_inebriety() != 11) {
            error('Too drunk. Something is wrong.');
        }
        ensure_ode(2);
        cli_execute('drink 1 Ish Kabibble');
    }

    // Make sure no moon spoon.
    equip($slot[acc1], $item[Eight Days a Week Pill Keeper]);
    equip($slot[acc2], $item[Powerful Glove]);
    equip($slot[acc3], $item[Lil' Doctor&trade; Bag]);

    if (available_amount($item[heat-resistant gloves]) == 0) {
        if (available_amount($item[photocopied monster]) == 0) {
            cli_execute('faxbot factory worker');
        }
        cli_execute('mood apathetic');
        equip($item[Fourth of May Cosplay Saber]);
        set_hccs_combat_mode(MODE_SABER_YR);
        use(1, $item[photocopied monster]);
        saber_yr();
        set_hccs_combat_mode(MODE_NULL);
    }
    autosell(1, $item[very hot lunch]);

    if (have_effect($effect[Synthesis: Hot]) == 0) {
        ensure_item(2, $item[jaba&ntilde;ero-flavored chewing gum]);
        sweet_synthesis($item[jaba&ntilde;ero-flavored chewing gum], $item[jaba&ntilde;ero-flavored chewing gum]);
    }

    use_familiar($familiar[Exotic Parrot]);
    try_equip($item[cracker]);
    ensure_effect($effect[Blood Bond]);
    ensure_effect($effect[Leash of Linguini]);
    ensure_effect($effect[Empathy]);

    // Pool buff. This will fall through to fam weight.
    ensure_effect($effect[Billiards Belligerence]);

    if (have_effect($effect[Rainbowolin]) == 0) {
        cli_execute('pillkeeper elemental');
    }

    ensure_item(1, $item[tenderizing hammer]);
    cli_execute('smash * ratty knitted cap');
    cli_execute('smash * red-hot sausage fork');
    autosell(10, $item[hot nuggets]);
    autosell(10, $item[twinkly powder]);

    if (available_amount($item[hot powder]) > 0) {
        ensure_effect($effect[Flame-Retardant Trousers]);
    }

    if (available_amount($item[sleaze powder]) > 0 || available_amount($item[lotion of sleaziness]) > 0) {
        ensure_potion_effect($effect[Sleazy Hands], $item[lotion of sleaziness]);
    }

    if (get_property_int('_genieWishesUsed') < 3 || available_amount($item[pocket wish]) > 0) {
        wish_effect($effect[Fireproof Lips]);
    }

    ensure_effect($effect[Elemental Saucesphere]);
    ensure_effect($effect[Astral Shell]);

    // Build up 100 turns of Deep Dark Visions for spell damage later.
    while (have_skill($skill[Deep Dark Visions]) && have_effect($effect[Visions of the Deep Dark Deeps]) < 100) {
        if (my_mp() < 20) {
            ensure_create_item(1, $item[magical sausage]);
            eat(1, $item[magical sausage]);
        }
        while (my_hp() < my_maxhp()) {
            use_skill(1, $skill[Cannelloni Cocoon]);
        }
        if (my_mp() < 100) {
            ensure_create_item(1, $item[magical sausage]);
            eat(1, $item[magical sausage]);
        }
        if (round(numeric_modifier('spooky resistance')) < 10) {
            abort('Not enough spooky res for Deep Dark Visions.');
        }
        use_skill(1, $skill[Deep Dark Visions]);
    }

    // Beach comb buff.
    ensure_effect($effect[Hot-Headed]);

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
    // These should have fallen through all the way from leveling.
    ensure_effect($effect[Fidoxene]);
    ensure_effect($effect[Do I Know You From Somewhere?]);

    // Pool buff.
    ensure_effect($effect[Billiards Belligerence]);

    if (my_hp() < 30) use_skill(1, $skill[Cannelloni Cocoon]);
    ensure_effect($effect[Blood Bond]);
    ensure_effect($effect[Leash of Linguini]);
    ensure_effect($effect[Empathy]);

    maximize('familiar weight', false);

    do_test(TEST_FAMILIAR);
}

if (!test_done(TEST_NONCOMBAT)) {
    if (my_hp() < 30) use_skill(1, $skill[Cannelloni Cocoon]);
    ensure_effect($effect[Blood Bond]);
    ensure_effect($effect[Leash of Linguini]);
    ensure_effect($effect[Empathy]);

    // Pool buff. Should fall through to weapon damage.
    ensure_effect($effect[Billiards Belligerence]);

    equip($slot[acc3], $item[Powerful Glove]);

    ensure_effect($effect[The Sonata of Sneakiness]);
    ensure_effect($effect[Smooth Movements]);
    ensure_effect($effect[Invisible Avatar]);

    ensure_effect($effect[Silent Running]);

    // Rewards
    ensure_effect($effect[Throwing Some Shade]);
    ensure_effect($effect[A Rose by Any Other Material]);

    if (have_effect($effect[Disquiet Riot]) == 0) {
        // For aftercore.
        use_familiar($familiar[Cornbeefadon]);
        if (available_amount($item[dripping meat crossbow]) == 0) {
            ensure_item(1, $item[crossbow string]);
            if (available_amount($item[meat stack]) == 0) {
                create(1, $item[meat stack]);
            }
            ensure_hermit_item(1, $item[catsup]);
            create(1, $item[dripping meat crossbow]);
        }
        if (available_amount($item[Irish Coffee, English Heart]) == 0) {
            if (available_amount($item[handful of Smithereens]) == 0) {
                cli_execute('smash 1 A Light That Never Goes Out');
            }
            ensure_item(1, $item[cup of lukewarm tea]);
            create(1, $item[Irish Coffee, English Heart]);
        }
        // Should have a spare orange from fruit skeleton.
        if (available_amount($item[shot of orange schnapps]) == 0) {
            ensure_item(1, $item[fermenting powder]);
            create(1, $item[shot of orange schnapps]);
        }
        // sometimes the qaudroculars end up equipped...
        retrieve_item(1, $item[quadroculars]);
        pizza_effect(
            $effect[Disquiet Riot],
            $item[dripping meat crossbow],
            $item[Irish Coffee, English Heart],
            $item[shot of orange schnapps],
            $item[quadroculars]
        );
    }

    // wish_effect($effect[Disquiet Riot]);

    use_familiar($familiar[Disgeist]);

    maximize('-combat, 0.01 familiar weight', false);

    if (round(numeric_modifier('combat rate')) > -40) {
        error('Not enough -combat to cap.');
    }

    do_test(TEST_NONCOMBAT);
}

if (!test_done(TEST_WEAPON)) {
    // Paint ungulith (Saber YR)
    if (!get_property_boolean('_chateauMonsterFought')) {
        string chateau_text = visit_url('place.php?whichplace=chateau', false);
        matcher m = create_matcher('alt="Painting of an? ([^(]*) .1."', chateau_text);
        if (m.find() && m.group(1) == 'ungulith') {
            cli_execute('mood apathetic');
            set_hccs_combat_mode(MODE_SABER_YR);
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

    if (available_amount($item[twinkly nuggets]) > 0) {
        ensure_effect($effect[Twinkly Weapon]);
    }

    ensure_effect($effect[Carol of the Bulls]);
    ensure_effect($effect[Song of the North]);
    ensure_effect($effect[Rage of the Reindeer]);
    ensure_effect($effect[Frenzied, Bloody]);
    ensure_effect($effect[Scowl of the Auk]);
    ensure_song($effect[Jackasses' Symphony of Destruction]);

    if (available_amount($item[vial of hamethyst juice]) > 0) {
        ensure_effect($effect[Ham-Fisted]);
    }

    // Hatter buff
    ensure_item(1, $item[goofily-plumed helmet]);
    ensure_effect($effect[Weapon of Mass Destruction]);

    // Beach Comb
    ensure_effect($effect[Lack of Body-Building]);

    if (get_property('boomBoxSong') != 'These Fists Were Made for Punchin\'') {
        cli_execute('boombox damage');
    }

    // Boombox potion - did we get one?
    if (available_amount($item[Punching Potion]) > 0) {
        ensure_effect($effect[Feeling Punchy]);
    }

    // Pool buff. Should have fallen through.
    ensure_effect($effect[Billiards Belligerence]);

    // Corrupted marrow
    ensure_effect($effect[Cowrruption]);

    ensure_npc_effect($effect[Engorged Weapon], 1, $item[Meleegra&trade; pills]);

    if (have_effect($effect[Outer Wolf&trade;]) == 0) {
        use(available_amount($item[van key]), $item[van key]);
        if (available_amount($item[ointment of the occult]) == 0) {
            // Should have a second grapefruit from Scurvy.
            create(1, $item[ointment of the occult]);
        }
        if (available_amount($item[unremarkable duffel bag]) == 0) {
            // get useless powder.
            ensure_item(1, $item[cool whip]);
            cli_execute('smash 1 cool whip');
        }
        pizza_effect(
            $effect[Outer Wolf&trade;],
            $item[ointment of the occult],
            item_priority($item[unremarkable duffel bag], $item[useless powder]),
            item_priority($item[Middle of the Road&trade; brand whiskey], $item[cog and sprocket assembly]),
            item_priority($item[surprisingly capacious handbag], $item[cog and sprocket assembly])
        );
    }

    wish_effect($effect[Pyramid Power]);
    wish_effect($effect[Wasabi With You]);

    ensure_effect($effect[Bow-Legged Swagger]);

    maximize('weapon damage', false);

    if (60 - floor(numeric_modifier('weapon damage') / 25 + 0.001) - floor(numeric_modifier('weapon damage percent') / 25 + 0.001) > 15) {
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

    // Beach Comb
    ensure_effect($effect[We're All Made of Starfish]);

    use_skill(1, $skill[Spirit of Cayenne]);

    if (available_amount($item[flask of baconstone juice]) > 0) {
        ensure_effect($effect[Baconstoned]);
    }

    autosell_all($item[neverending wallet chain]);
    autosell_all($item[pentagram bandana]);
    autosell_all($item[denim jacket]);
    autosell_all($item[jam band bootleg]);
    autosell_all($item[cosmetic football]);
    autosell_all($item[shoe ad t-shirt]);
    autosell_all($item[PB&J with the crusts cut off]);
    autosell_all($item[runproof mascara]);
    autosell_all($item[very small red dress]);
    autosell_all($item[noticeable pumps]);
    autosell_all($item[electronics kit]);
    autosell_all($item[surprisingly capacious handbag]);

    ensure_item(2, $item[obsidian nutcracker]);

    use_skill(1, $skill[Summon Sugar Sheets]);
    if (available_amount($item[sugar chapeau]) == 0 && available_amount($item[sugar sheet]) > 0) {
        create(1, $item[sugar chapeau]);
    }

    maximize('spell damage', false);

    do_test(TEST_SPELL);
}

set_property('autoSatisfyWithNPCs', get_property('_saved_autoSatisfyWithNPCs'));
set_property('autoSatisfyWithCoinmasters', get_property('_saved_autoSatisfyWithCoinmasters'));
set_property('hpAutoRecovery', '0.8');

cli_execute('mood default');
cli_execute('ccs default');
cli_execute('boombox food');
