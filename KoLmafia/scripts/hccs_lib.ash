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