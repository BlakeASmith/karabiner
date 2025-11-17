import {
  mapSimultaneous,
  rule,
  ifVar,
  toUnsetVar,
  toRemoveNotificationMessage,
} from "karabiner.ts";
import { map } from "./lib.ts";

const SYMBOLS_MODE_VAR = "symbols-mode";
const SYMBOLS_MODE_HINT =
  "hjkl: arrows | h/j/k/l+shift: {/}/</> | u/i/o/p: [ ] ( ) | y/n/n+shift: - = + | f/g: _ | d/s: . , | a/;: ; : | q/w/e/r: ! @ # $ | t: * | z/x/c/v: | & % \\";

const symbolsModeEscape = [
  toUnsetVar(SYMBOLS_MODE_VAR),
  toRemoveNotificationMessage(`${SYMBOLS_MODE_VAR}-notification`),
];

// Trigger rules - activate symbols mode on simultaneous hj, jk, or kl
const symbolsModeTriggers = rule("Symbols mode triggers").manipulators([
  mapSimultaneous(["h", "j"])
    .toVar(SYMBOLS_MODE_VAR, 1)
    .toNotificationMessage(
      `${SYMBOLS_MODE_VAR}-notification`,
      SYMBOLS_MODE_HINT,
    ),
  mapSimultaneous(["j", "k"])
    .toVar(SYMBOLS_MODE_VAR, 1)
    .toNotificationMessage(
      `${SYMBOLS_MODE_VAR}-notification`,
      SYMBOLS_MODE_HINT,
    ),
  mapSimultaneous(["k", "l"])
    .toVar(SYMBOLS_MODE_VAR, 1)
    .toNotificationMessage(
      `${SYMBOLS_MODE_VAR}-notification`,
      SYMBOLS_MODE_HINT,
    ),
]);

// Mapping rules - all mappings check for symbols mode variable
const symbolsModeMappings = rule(
  "Symbols mode mappings",
  ifVar(SYMBOLS_MODE_VAR, 1),
).manipulators([
  // Arrow keys on hjkl
  map("h")
    .to({ key_code: "left_arrow" })
    .toAfterKeyUp(symbolsModeEscape),
  map("j")
    .to({ key_code: "down_arrow" })
    .toAfterKeyUp(symbolsModeEscape),
  map("k")
    .to({ key_code: "up_arrow" })
    .toAfterKeyUp(symbolsModeEscape),
  map("l")
    .to({ key_code: "right_arrow" })
    .toAfterKeyUp(symbolsModeEscape),

  // Common brackets and parentheses with shift+hjkl
  map({ key_code: "h", modifiers: { mandatory: ["left_shift"] } })
    .to({
      key_code: "open_bracket",
      modifiers: ["left_shift"],
    })
    .toAfterKeyUp(symbolsModeEscape), // {
  map({ key_code: "j", modifiers: { mandatory: ["left_shift"] } })
    .to({
      key_code: "close_bracket",
      modifiers: ["left_shift"],
    })
    .toAfterKeyUp(symbolsModeEscape), // }
  map({ key_code: "k", modifiers: { mandatory: ["left_shift"] } })
    .to({
      key_code: "comma",
      modifiers: ["left_shift"],
    })
    .toAfterKeyUp(symbolsModeEscape), // <
  map({ key_code: "l", modifiers: { mandatory: ["left_shift"] } })
    .to({
      key_code: "period",
      modifiers: ["left_shift"],
    })
    .toAfterKeyUp(symbolsModeEscape), // >

  // Square brackets and parentheses
  map("u")
    .to({ key_code: "open_bracket" })
    .toAfterKeyUp(symbolsModeEscape), // [
  map("i")
    .to({ key_code: "close_bracket" })
    .toAfterKeyUp(symbolsModeEscape), // ]
  map("o")
    .to({ key_code: "open_bracket", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // (
  map("p")
    .to({ key_code: "close_bracket", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // )

  // Math operators
  map("y")
    .to({ key_code: "hyphen" })
    .toAfterKeyUp(symbolsModeEscape), // -
  map("n")
    .to({ key_code: "equal_sign" })
    .toAfterKeyUp(symbolsModeEscape), // =
  map({ key_code: "n", modifiers: { mandatory: ["left_shift"] } })
    .to({
      key_code: "equal_sign",
      modifiers: ["left_shift"],
    })
    .toAfterKeyUp(symbolsModeEscape), // +

  // Underscore and other symbols
  map("f")
    .to({ key_code: "hyphen", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // _
  map("g")
    .to({ key_code: "hyphen", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // _ (alternative)

  // Punctuation
  map("d")
    .to({ key_code: "period" })
    .toAfterKeyUp(symbolsModeEscape), // .
  map("s")
    .to({ key_code: "comma" })
    .toAfterKeyUp(symbolsModeEscape), // ,
  map("a")
    .to({ key_code: "semicolon" })
    .toAfterKeyUp(symbolsModeEscape), // ;
  map(";")
    .to({ key_code: "semicolon", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // :

  // Special characters
  map("q")
    .to({ key_code: "1", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // !
  map("w")
    .to({ key_code: "2", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // @
  map("e")
    .to({ key_code: "3", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // #
  map("r")
    .to({ key_code: "4", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // $
  map("t")
    .to({ key_code: "8", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // *
  map("z")
    .to({ key_code: "backslash", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // |
  map("x")
    .to({ key_code: "7", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // &
  map("c")
    .to({ key_code: "5", modifiers: ["left_shift"] })
    .toAfterKeyUp(symbolsModeEscape), // %
  map("v")
    .to({ key_code: "backslash" })
    .toAfterKeyUp(symbolsModeEscape), // \

  // Escape key exits the mode
  map("escape")
    .to({ key_code: "escape" })
    .to(symbolsModeEscape),
]);

export const symbolsMode = [symbolsModeTriggers, symbolsModeMappings];
