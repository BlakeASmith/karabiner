import { duoLayer, ToEvent } from "karabiner.ts";
import { map } from "./lib.ts";

const shifted = (key_code: string): ToEvent => ({
  key_code,
  modifiers: ["left_shift"],
});

export const rightHandSymbolLayer = duoLayer("a", "s")
  .notification(true)
  .leaderMode()
  .manipulators([
    map("j").to(shifted("open_bracket")), // {
    map("k").to(shifted("close_bracket")), // }
    map("l").to({ key_code: "open_bracket" }), // [
    map(";").to({ key_code: "close_bracket" }), // ]
    map("g").to(shifted("comma")), // <
    map("h").to(shifted("period")), // >
    map("u").to(shifted("9")), // (
    map("i").to(shifted("0")), // )
  ]);
