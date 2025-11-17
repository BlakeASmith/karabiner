import { hyperLayer, ToEvent, withMapper } from "karabiner.ts";
import { map } from "./lib.ts";

const shift = (key_code: string): ToEvent => ({
  key_code,
  modifiers: ["left_shift"],
});

const key = (key_code: string): ToEvent => ({ key_code });

const SYMBOL_LAYER_HINT =
  "Hyper+S | h/j/k/l arrows | y/u () | i/o [] | p/[ {} | ] -> backslash | backslash -> pipe | ;/' quotes | n/m <> | ,/. -/= | / _ | z + | x/c /? | q/w `~ | a/s ;:";

const symbolMappings: Record<string, ToEvent> = {
  h: key("left_arrow"),
  j: key("down_arrow"),
  k: key("up_arrow"),
  l: key("right_arrow"),
  y: shift("9"),
  u: shift("0"),
  i: key("open_bracket"),
  o: key("close_bracket"),
  p: shift("open_bracket"),
  "[": shift("close_bracket"),
  "]": key("backslash"),
  "\\": shift("backslash"),
  ";": key("quote"),
  "'": shift("quote"),
  n: shift("comma"),
  m: shift("period"),
  ",": key("hyphen"),
  ".": key("equal_sign"),
  "/": shift("hyphen"),
  z: shift("equal_sign"),
  x: key("slash"),
  c: shift("slash"),
  q: key("grave_accent_and_tilde"),
  w: shift("grave_accent_and_tilde"),
  a: key("semicolon"),
  s: shift("semicolon"),
};

const symbolManipulators = withMapper(symbolMappings)((from, toEvent) =>
  map(from).to(toEvent),
);

export const symbolsLayer = hyperLayer("s", "symbols-layer")
  .leaderMode()
  .notification(SYMBOL_LAYER_HINT)
  .manipulators([symbolManipulators]);
