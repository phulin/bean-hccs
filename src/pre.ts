import { buy, cliExecute, visitUrl, print, use, pvpAttacksLeft } from 'kolmafia';
import { $item } from 'libram';

buy(1, $item`foreign language tapes`);
buy(1, $item`continental juice bar`);
buy(1, $item`ceiling fan`);

use(1, $item`peppermint pip packet`);

visitUrl('peevpee.php?action=smashstone&confirm=on');
print('Stone smashed.');
use(3, $item`meteorite-ade`);
use(1, $item`School of Hard Knocks Diploma`);
if (pvpAttacksLeft() > 0) {
  cliExecute('uberpvpoptimizer');
  cliExecute('pvp fame battle');
}
