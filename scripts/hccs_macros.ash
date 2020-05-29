string submit_macro(buffer macro) {
    return update_state(visit_url("fight.php?action=macro&macrotext=" + url_encode(macro), true, true));
}

adventure_result submit_macro_result(buffer macro) {
    string page = macro.submit_macro();
    update_state(page);
    return _current_state;
}

buffer new_macro() {
    buffer buf;
    return buf;
}

buffer m_step(buffer macro, string next) {
    macro += ";";
    macro += next;
    return macro;
}

string m_monster(monster m) {
    return `monstername "{m.name}"`;
}

buffer m_skill(buffer macro, skill sk) {
    if (have_skill(sk)) {
        return macro.step(`skill {sk.name}`);
    } else {
        return macro;
    }
}

buffer m_item(buffer macro, item it) {
    return macro.step(`item {it.name}`);
}

buffer m_repeat(buffer macro) {
    return macro.step("repeat");
}

buffer m_if(buffer macro, string condition, string next) {
    return macro.step(`if {condition}`).step(next).step("endif");
}

buffer m_if(buffer macro, string condition, string next1, string next2) {
    return macro.m_if(condition, `{next1};{next2}`);
}

buffer m_if(buffer macro, string condition, string next1, string next2, string next3) {
    return macro.m_if(condition, `{next1};{next2};{next3}`);
}

record adventure_result {
    boolean finished;
    int round;
    monster current_monster;
    int current_choice;
}

adventure_result _current_state;

string update_state(string page_text) {
    _current_state.finished = false;
    _current_state.round = -1;
    _current_state.current_choice = -1;
    _current_state.current_monster = $monster[none];
    if (page_text.contains_text("choice.php")) {
        matcher m_choice = create_matcher("whichchoice value=(\\d+)", page_text);
        m_choice.find();
        _current_state.current_choice = m_choice.group(1).to_int();
        return page_text;
    } else if (page_text.contains_text("Combat: Round")) {
        if (!page_text.contains_text("WINWINWIN")
                && !page_text.contains_text("FREEFREEFREE")
                && !page_text.contains_text("You lose.")
                && !page_text.contains_text("You run away")
                && !page_text.contains_text("adventure.php")) {
            return run_combat("save_adventure_result");
        } else if (page_text.contains_text("href=fight.php") || page_text.contains_text("href=\"fight.php")) {
            // In chained combat. See what's going on.
            return update_state(visit_url("fight.php"));
        } else {
            _current_state.finished = true;
            return page_text;
        }
    } else if (page_text.contains_text("Adventure Results:") {
        // Non-choice noncombat.
        _current_state.finished = true;
    } else {
        abort("Unrecognized adventure result.")
    }
}

void save_adventure_result(int round, monster opp, string text) {
    _current_state.round = round;
    _current_state.current_monster = opp;
}

adventure_result adventure_manual(location loc) {
    if (my_hp() < .6 * my_maxhp()) {
        restore_hp(my_maxhp());
    }
    string page = visit_url(loc.to_url());
    update_state(page);
    return _current_state;
}

adventure_result adventure_state() {
    update_state(visit_url('fight.php'));
    return _current_state;
}
