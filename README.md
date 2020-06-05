This is a Kingdom of Loathing script by myself, `worthawholebean (#1972588)` (`ikzann` on Discord) to do 1-day Hardcore Community Service runs as a Sauceror in the Wallaby moon sign.

To install:
`svn checkout https://github.com/phulin/bean-hccs/branches/master/KoLmafia`

Notes:
- The script assumes that you have Sweet Synthesis and a bunch of IotMs, but none of them are strictly necessary; if you are missing more than one or two of the leveling ones in particular (Prof/Kramco, NEP, Garbage Tote), the script will fail to level enough to cap the stat tests. That will very likely mean missing daycount. If you are missing Synth, you can compensate by wishing for Experimental Effect G-9 or New and Improved to replace the +Myst buff (depending on the day), and Different Way of Seeing Things to replace the XP buff. You can still make 1-day using that plan but it will be tight.
- Besides leveling, the Genie Bottle and Pizza Cube each save a ridiculous number of turns with wishes.
- Recent IotMs include Bastille, Glove, Pill Keeper, Pizza Cube, Professor, Saber, Kramco, NEP, Garbage Tote, SongBoom, Moon Spoon, and Genie. It also assumes VIP lounge access, which is crucial.
- It assumes that you have painted Ungulith in Chateau Mantegna; if you don't have it, you can reallocate a wish or the fax to fight that guy. He saves 12 turns if you can get the weapon damage test to less than 28 turns. The fax is allocated to a factory worker, which saves 9 turns.
- For candy, the script assumes that you have access to Peppermint Garden and the Crimbo Candy Cookbook (it also gets the Stocking Mimic's bag of many confections, but this is only one piece). It will plan around other candy sources if you add code to harvest them.
- Finally, it assumes that you have access to essentially every CS-relevant perm. The big ones are the +HP% perms, as they allow you to avoid using a wish on the HP test. You will need Song of Starch (50%), Spirit of Ravioli (25%), and Abs of Tin (10%) at the very least, and you probably also need one or two of the 5% perms. If you don't have these perms yet, you will need to use a wish/pizza for Preemptive Medicine on the HP test. Bow-Legged Swagger and Steely-Eyed Squint are also crucial, as you would expect. And there are quite a few miscellaneous +item and +weapon damage perms; they all save turns, many of them several. Some unexpected skills help too: if you have Chateau, all the free rest skills save leveling turns.

I expect most folks will need to make some changes, unless your set of IotMs is a strict superset of mine. This is supposed to be an outline that can get you to daycount with some work. IotMs that will save you substantial turns on top of what I have include:
- Distant Woods is a great XP buff that should also help reduce leveling turns.
- Beach Comb beachhead buffs would save turns in a variety of places.
- Any alternative way to get to 60 adventures to coil wire on turn 0 would help; you could use Borrowed Time from the Tome of Clip Art, for example. That would free up 4 stomach from the current route and enable you to fit in two more pizzas. The current route uses Bastille and the Pizza Cube to make an adventure/spleen pizza to hit level 5. It then drinks a perfect drink.

The script is fine to run twice; if it breaks somewhere, fix the problem manually and then the script should start where it left off. I have tested it, but not extensively, so please understand that this code is not at the same quality level as autoscend. It may very well mess up spectacularly, and it has done so at times in my runs. You have been warned.

You'll need to set up CCS and moods named "hccs" (for most leveling combats) and "hccs-early" (for early leveling, before you have much MP).
hccs CCS:
```
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
    if monstername “sausage goblin”
        skill lecture on relativity
    endif
    skill curse of weaksauce
    skill saucegeyser
endif
abort
```

The script follows this rough plan (list skips some steps):
- Ascend Sauceror/Wallaby. No pet needed if you have Pizza Cube, as the script will pizza for fam equipment. You can take the statuette if you want to save a turn.
- Cast inscrutable gaze and use Bastille.
- Make a medicinal pizza with any spleen item and, e.g., 3 cog and sprocket assemblies. This should get you to level 5.
- Cast Prevent Scurvy and Perfect Freeze; drink a perfect dark and stormy.
- TEST: Coil Wire (60 turns).
- Get available XP buffs: Synthesis, Inscrutable Gaze. Make meatcar and tune moon to Blender for simple candy at Gno-Mart.
- Pizza for DIFferent Way of Seeing Things (+50% Mys XP). Get a Prof chip.
- Fight 3 BRICKO oysters. (This step is not critical but the early meat is nice.)
- Buff mainstat to high heavens: Bee's Knees, Synthesis, Pill Keeper, Triple Size (2 drunk).
- Use Pill Keeper for familiar weight.
- Fight 10 copied sausage goblins at NEP, which burns the delay on the NEP noncombat.
- Get tomato and fruits from skeleton store using Saber YRs to avoid spending turns; make and use potions.
- Take Hovering Sombrero.
- Get +20% Mys XP buff at NEP.
- 9 free fights at NEP, plus 7 free kills (Chest X-Ray, Shattering Punch, Gingerbread Mob Hit).
- Boost -combat and use all available free runs to find more sausage goblins at the Haiku Dungeon.
- Set BoomBox to weapon damage.
- Adventure using turns at NEP until our stats are high enough to cap (usually 3 turns or so).
- Drink perfect drink (3 drunk).
- Use oil of expertise, boost muscle and HP.
- TEST: Donate Blood (HP, 1 turn).
- TEST: Feed The Children (But Not Too Much) (Muscle, 1 turn).
- TEST: Build Playground Mazes (Mysticality, 1 turn).
- TEST: Feed Conspirators (Moxie, 1 turn).
- Use Pill Keeper semirare to get cyclops eyedrops. Optimal dog would also work.
- Drink astral pilsners (6 drunk).
- Get +item fortune boff and use synth. Use bag of grain.
- Pizza for CERtainty and INFErnal Thirst. Get an amulet coin.
- Cast Steely-Eyed Squint.
- TEST: Make Margaritas (Item/Booze, 4 turns).
- Drink Ish Kabibble (2 drunk).
- Fax and saber YR a factory worker (female) (Cheesefax always gives female if you ask for "factory worker").
- Pill Keeper elemental res.
- Smash any ratty knitted caps and red-hot sausage forks for hot powder and sleaze nuggets (for lotion of sleaziness).
- Use pocket maze.
- Take exotic parrot.
- TEST: Clean Steam Tunnels (Hot Resistance, 5-8 turns).
- Pill Keeper familiar weight buff should still be active.
- TEST: Breed More Collies (Familiar Weight, 46 turns).
- Use squeaky toy rose, shady shades.
- Get pool buff.
- Wish for Disquiet Riet.
- TEST: Be a Living Statue (Noncombat, 1 turn).
- Fight painted ungulith, use saber YR.
- Drink Sockdollager (2 drunk).
- Smash stuff for twinkly nuggets.
- Buy goofily-plumed helmet and get Weapon of Mass Destruction from the Hatter.
- Use a punching potion if you got one while leveling.
- Pizza for OUter Wolf (e.g. ointment of the occult/unremarkable duffel/whatever).
- Wish for Pyramid Power.
- Cast bow-legged swagger.
- TEST: Reduce Gazelle Population (Weapon Damage, 21 turns).
- Cast Simmer (1 turn).
- Buy obsidian nutcracker.
- Cowrruption should still be active.
- If you need more turns, fill your stomach and eat magical sausages.
- If that's not enough, use emergency margarita as your nightcap.
- TEST: Make Sausage (Spell Damage, 45 turns).

The script is intended to be in the public domain. Please feel free to modify and distribute how you wish.
