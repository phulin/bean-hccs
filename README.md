This is a Kingdom of Loathing script by myself, worthawholebean / ikzann to do 1-day Hardcore Community Service runs.
The script assumes that you have Sweet Synthesis and a bunch of IotMs, but none of them are strictly necessary; if you are missing more than one or two of the leveling ones in particular, the script will fail to level enough to cap the stat tests. That will very likely mean missing daycount.
Recent IotMs include Glove, Pill Keeper, Pizza Cube, Professor, Saber, Kramco, NEP, Garbage Tote, SongBoom, and Genie.
It assumes that you have painted Ungulith in Chateau Mantegna; if you don't have it, you can reallocate a wish or the fax to fight that guy.
It also assumes that you have access to Peppermint Garden for candy sorce.
It should plan around other candy sources if you add code to harvest them.
The current route uses Smith's Tome to get to 60 advs to coil wire on turn 0; any other resource that uses 6 fullness or fewer would work.

The script is fine to run twice; if it breaks somewhere, fix it manually and then the script should start where it left off.

To install:
`svn checkout https://github.com/phulin/bean-hccs/branches/master`

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
