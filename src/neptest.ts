import { print, putShop, shopAmount, takeShop } from "kolmafia";
import { $item } from "libram";
import { withPrices } from "./nep";

export function main(): void {
  takeShop(shopAmount($item`bottle of gin`), $item`bottle of gin`);
  takeShop(shopAmount($item`bottle of whiskey`), $item`bottle of whiskey`);
  putShop(999999999, 0, 520, $item`bottle of gin`);
  putShop(999999999, 0, 520, $item`bottle of whiskey`);
  withPrices(
    [
      { item: $item`bottle of gin`, price: 520, limit: 0 },
      { item: $item`bottle of whiskey`, price: 520, limit: 0 },
    ],
    () => {
      print("Doing nothing.");
    }
  );
}
