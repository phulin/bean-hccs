if (!visit_url("charpane.php").contains_text("Astral Spirit")) visit_url("ascend.php?action=ascend&confirm=on&confirm2=on");
if (!visit_url("charpane.php").contains_text("Astral Spirit")) abort("Failed to ascend.");
visit_url("afterlife.php?action=pearlygates");
visit_url("afterlife.php?action=buydeli&whichitem=5046");
visit_url("afterlife.php?action=ascend&confirmascend=1&whichsign=2&gender=1&whichclass=3&whichpath=25&asctype=2&nopetok=1&noskillsok=1&pwd", true);