import { hyperLayer, ToEvent } from "karabiner.ts";
import { map } from "./lib.ts";

const shift = (key_code: string): ToEvent => ({
  key_code,
  modifiers: ["left_shift"],
});

const symbolMappings: Record<string, ToEvent> = {
  q: { key_code: "quote" }, // '
  w: shift("7"), // &
  e: { key_code: "grave_accent_and_tilde" }, // `
  r: shift("grave_accent_and_tilde"), // ~
  t: { key_code: "backslash" }, // \
  y: shift("backslash"), // |
  u: shift("open_bracket"), // {
  i: shift("close_bracket"), // }
  o: { key_code: "open_bracket" }, // [
  p: { key_code: "close_bracket" }, // ]
  a: { key_code: "hyphen" }, // -
  s: shift("hyphen"), // _
  d: { key_code: "equal_sign" }, // =
  f: shift("equal_sign"), // +
  g: { key_code: "semicolon" }, // ;
  ";": shift("semicolon"), // :
  "'": shift("quote"), // "
  z: shift("comma"), // <
  x: shift("period"), // >
  c: { key_code: "comma" }, // ,
  v: { key_code: "period" }, // .
  b: { key_code: "slash" }, // /
  n: shift("slash"), // ?
  m: shift("8"), // *
  ",": shift("9"), // (
  ".": shift("0"), // )
};

const arrowMappings: Record<string, ToEvent> = {
  h: { key_code: "left_arrow" },
  j: { key_code: "down_arrow" },
  k: { key_code: "up_arrow" },
  l: { key_code: "right_arrow" },
};

const buildMappings = (mapping: Record<string, ToEvent>) =>
  Object.entries(mapping).map(([from, toEvent]) => map(from).to(toEvent));

export const hjklLayer = hyperLayer("h", "hjkl-layer")
  .leaderMode({
    sticky: true,
    escape: ["escape", "caps_lock", "return_or_enter", "spacebar"],
  })
  .notification(
    "Symbols/arrows → q:' w:& e:` r:~ t:\\ y:| u/i/o/p:{ } [ ] ,/.:( ) h/j/k/l: arrows",
  )
  .manipulators([...buildMappings(symbolMappings), ...buildMappings(arrowMappings)]);
