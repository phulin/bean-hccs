void error(string message) {
    // Clean up saved properties.
    set_property('autoSatisfyWithNPCs', get_property('_saved_autoSatisfyWithNPCs'));
    set_property('autoSatisfyWithCoinmasters', get_property('_saved_autoSatisfyWithCoinmasters'));
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

void set_choice(int adv, int choice) {
    set_property(`choiceAdventure{adv}`, `{choice}`);
}

int count_matches(matcher m) {
    int result = 0;
    while (m.find()) {
        result += 1;
    }
    return result;
}

int my_familiar_weight() {
    return familiar_weight(my_familiar()) + weight_adjustment();
}

void ensure_item(int quantity, item it) {
    if (available_amount(it) < quantity) {
        buy(quantity - available_amount(it), it);
    }
    if (available_amount(it) < quantity) {
        error('Could not buy item' + it.name + '.');
    }
}

void ensure_create_item(int quantity, item it) {
    if (available_amount(it) < quantity) {
        create(quantity - available_amount(it), it);
    }
    if (available_amount(it) < quantity) {
        error('Could not create item.');
    }
}

void ensure_sewer_item(int quantity, item it) {
    int count = quantity - available_amount(it);
    while (available_amount(it) < quantity) {
        ensure_item(1, $item[chewing gum on a string]);
        use(1, $item[chewing gum on a string]);
    }
}

void ensure_hermit_item(int quantity, item it) {
    if (available_amount(it) >= quantity) {
        return;
    }
    int count = quantity - available_amount(it);
    while (available_amount($item[worthless trinket]) + available_amount($item[worthless gewgaw]) + available_amount($item[worthless knick-knack]) < count) {
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
        if (available_amount(potion) == 0) {
            create(1, potion);
        }
        if (!cli_execute(ef.default) || have_effect(ef) == 0) {
            error('Failed to get effect ' + ef.name + '.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void ensure_effect(effect ef, int turns) {
    if (have_effect(ef) < turns) {
        if (!cli_execute(ef.default) || have_effect(ef) == 0) {
            error('Failed to get effect ' + ef.name + '.');
        }
    } else {
        print('Already have effect ' + ef.name + '.');
    }
}

void ensure_effect(effect ef) {
    ensure_effect(ef, 1);
}

void ensure_mp_tonic(int mp) {
    while (my_mp() < mp) {
        ensure_item(1, $item[Doc Galaktik's Invigorating Tonic]);
        use(1, $item[Doc Galaktik's Invigorating Tonic]);
    }
}

void ensure_mp_sausage(int mp) {
    while (my_mp() < min(mp, my_maxmp())) {
        ensure_create_item(1, $item[magical sausage]);
        eat(1, $item[magical sausage]);
    }
}

boolean sausage_fight_guaranteed() {
    int goblins_fought = get_property_int("_sausageFights");    
    int next_guaranteed = get_property_int("_lastSausageMonsterTurn") + 4 + goblins_fought * 3 + max(0, goblins_fought - 5) ** 3;
    return total_turns_played() >= next_guaranteed;
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

int[string] clan_cache;
boolean set_clan(string target)
{
	if ( get_clan_name() != target ) {
		if (!(clan_cache contains target)) {
			string recruiter = visit_url("clan_signup.php");
			matcher m = create_matcher(`<option value=([0-9]+)>([^<]+)</option>`, recruiter);
			while (m.find()) {
				clan_cache[m.group(2)] = m.group(1).to_int();
			}
		}

		visit_url(`showclan.php?whichclan={clan_cache[target]}&action=joinclan&confirm=on&pwd={my_hash()}`);
		if ( get_clan_name() != target ) {
			abort ("failed to switch clans to " + target + ". Did you spell it correctly? Are you whitelisted?");
		}
	}
	return true;
}