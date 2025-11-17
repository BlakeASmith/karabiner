import { mapSimultaneous } from "karabiner.ts";
import { mode, map } from "./lib.ts";

const SYMBOLS_MODE = "symbols-mode";
const SYMBOLS_MODE_HINT =
  "hjkl: arrows | h/j/k/l+shift: {/}/</> | u/i/o/p: [ ] ( ) | y/n/n+shift: - = + | f/g: _ | d/s: . , | a/;: ; : | q/w/e/r: ! @ # $ | t: * | z/x/c/v: | & % \\";

export const symbolsMode = mode({
  name: SYMBOLS_MODE,
  description: "Symbols and arrows layer",
  hint: SYMBOLS_MODE_HINT,
  triggers: [
    mapSimultaneous(["h", "j"]),
    mapSimultaneous(["j", "k"]),
    mapSimultaneous(["k", "l"]),
  ],
  manipulators: [],
  oneShotKeys: [
    // Arrow keys on hjkl
    map("h").to({ key_code: "left_arrow" }),
    map("j").to({ key_code: "down_arrow" }),
    map("k").to({ key_code: "up_arrow" }),
    map("l").to({ key_code: "right_arrow" }),

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
    map("u").to({ key_code: "open_bracket" }), // [
    map("i").to({ key_code: "close_bracket" }), // ]
    map("o").to({ key_code: "open_bracket", modifiers: ["left_shift"] }), // (
    map("p").to({ key_code: "close_bracket", modifiers: ["left_shift"] }), // )

    // Math operators
    map("y").to({ key_code: "hyphen" }), // -
    map("n").to({ key_code: "equal_sign" }), // =
    map({ key_code: "n", modifiers: { mandatory: ["left_shift"] } }).to({
      key_code: "equal_sign",
      modifiers: ["left_shift"],
    }), // +

    // Underscore and other symbols
    map("f").to({ key_code: "hyphen", modifiers: ["left_shift"] }), // _
    map("g").to({ key_code: "hyphen", modifiers: ["left_shift"] }), // _ (alternative)

    // Punctuation
    map("d").to({ key_code: "period" }), // .
    map("s").to({ key_code: "comma" }), // ,
    map("a").to({ key_code: "semicolon" }), // ;
    map(";").to({ key_code: "semicolon", modifiers: ["left_shift"] }), // :

    // Special characters
    map("q").to({ key_code: "1", modifiers: ["left_shift"] }), // !
    map("w").to({ key_code: "2", modifiers: ["left_shift"] }), // @
    map("e").to({ key_code: "3", modifiers: ["left_shift"] }), // #
    map("r").to({ key_code: "4", modifiers: ["left_shift"] }), // $
    map("t").to({ key_code: "8", modifiers: ["left_shift"] }), // *
    map("z").to({ key_code: "backslash", modifiers: ["left_shift"] }), // |
    map("x").to({ key_code: "7", modifiers: ["left_shift"] }), // &
    map("c").to({ key_code: "5", modifiers: ["left_shift"] }), // %
    map("v").to({ key_code: "backslash" }), // \
  ],
});
