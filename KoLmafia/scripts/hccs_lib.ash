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
