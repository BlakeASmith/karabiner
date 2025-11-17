import { duoLayer, withMapper } from "karabiner.ts";
import { map } from "./lib.ts";

const SYMBOLS_MODE_HINT =
  "hjkl: arrows | h/j/k/l+shift: {/}/</> | u/i/o/p: [ ] ( ) | y/n/n+shift: - = + | f/g: _ | d/s: . , | a/;: ; : | q/w/e/r: ! @ # $ | t: * | z/x/c/v: | & % \\";

const symbolsManipulators = [
  // Arrow keys on hjkl
  withMapper({
    h: "left_arrow",
    j: "down_arrow",
    k: "up_arrow",
    l: "right_arrow",
  })((key, arrowKey) => map(key).to({ key_code: arrowKey })),

  // Common brackets and parentheses with shift+hjkl
  map({ key_code: "h", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "open_bracket",
    modifiers: ["left_shift"],
  }), // {
  map({ key_code: "j", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "close_bracket",
    modifiers: ["left_shift"],
  }), // }
  map({ key_code: "k", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "comma",
    modifiers: ["left_shift"],
  }), // <
  map({ key_code: "l", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "period",
    modifiers: ["left_shift"],
  }), // >

  // Square brackets and parentheses
  withMapper({
    u: { key_code: "open_bracket" },
    i: { key_code: "close_bracket" },
    o: { key_code: "open_bracket", modifiers: ["left_shift"] },
    p: { key_code: "close_bracket", modifiers: ["left_shift"] },
  })((key, toEvent) => map(key).to(toEvent)),

  // Math operators
  map("y").to({ key_code: "hyphen" }), // -
  map("n").to({ key_code: "equal_sign" }), // =
  map({ key_code: "n", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "equal_sign",
    modifiers: ["left_shift"],
  }), // +

  // Underscore
  withMapper({
    f: { key_code: "hyphen", modifiers: ["left_shift"] },
    g: { key_code: "hyphen", modifiers: ["left_shift"] },
  })((key, toEvent) => map(key).to(toEvent)),

  // Punctuation
  withMapper({
    d: { key_code: "period" },
    s: { key_code: "comma" },
    a: { key_code: "semicolon" },
    ";": { key_code: "semicolon", modifiers: ["left_shift"] },
  })((key, toEvent) => map(key).to(toEvent)),

  // Special characters
  withMapper({
    q: { key_code: "1", modifiers: ["left_shift"] },
    w: { key_code: "2", modifiers: ["left_shift"] },
    e: { key_code: "3", modifiers: ["left_shift"] },
    r: { key_code: "4", modifiers: ["left_shift"] },
    t: { key_code: "8", modifiers: ["left_shift"] },
    z: { key_code: "backslash", modifiers: ["left_shift"] },
    x: { key_code: "7", modifiers: ["left_shift"] },
    c: { key_code: "5", modifiers: ["left_shift"] },
    v: { key_code: "backslash" },
  })((key, toEvent) => map(key).to(toEvent)),
];

// Create three duoLayers for hj, jk, and kl triggers
export const symbolsLayerHJ = duoLayer("h", "j")
  .notification(SYMBOLS_MODE_HINT)
  .leaderMode()
  .manipulators(symbolsManipulators);

export const symbolsLayerJK = duoLayer("j", "k")
  .notification(SYMBOLS_MODE_HINT)
  .leaderMode()
  .manipulators(symbolsManipulators);

export const symbolsLayerKL = duoLayer("k", "l")
  .notification(SYMBOLS_MODE_HINT)
  .leaderMode()
  .manipulators(symbolsManipulators);

export const symbolsMode = [
  symbolsLayerHJ,
  symbolsLayerJK,
  symbolsLayerKL,
];
