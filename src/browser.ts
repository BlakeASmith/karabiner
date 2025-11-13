import { ifApp } from "karabiner.ts";
import { createDuoLayer, map } from "./lib.ts";

const isFirefox = ifApp("^.*firefox.*$");

const FIREFOX_COMMAND_MODE = "firefox-commands";
const FIREFOX_COMMAND_MODE_HINT =
  "t: new tab | d/x: close tab | u: reopen tab | o: address bar | /: search | f: find | ;/,: find next/prev | n/p/g: next/prev tab | r: reload | R: hard reload | h/l: back/forward | 1-9: switch tab | b: bookmarks | D: downloads | H: history | W: new window | s: save | y: downloads | G: raycast history | Q: raycast quicklinks | T: raycast tabs";

const firefoxCommandBindings = [
  // Tab management
  map("t").to({ key_code: "t", modifiers: ["left_command"] }), // New tab
  map("d").to({ key_code: "w", modifiers: ["left_command"] }), // Close tab
  map("x").to({ key_code: "w", modifiers: ["left_command"] }), // Close tab (alternative)
  map("u").to({ key_code: "t", modifiers: ["left_command", "left_shift"] }), // Reopen closed tab

  // Navigation
  map("h").to({ key_code: "left_arrow", modifiers: ["left_command"] }), // Back
  map("l").to({ key_code: "right_arrow", modifiers: ["left_command"] }), // Forward

  // Address bar and search
  map("o").to({ key_code: "l", modifiers: ["left_command"] }), // Address bar
  map("/").to({ key_code: "k", modifiers: ["left_command"] }), // Search

  // Find in page (vim-style)
  map("f").to({ key_code: "f", modifiers: ["left_command"] }), // Find in page
  map(";").to({ key_code: "g", modifiers: ["left_command"] }), // Find next
  map(",").to({ key_code: "g", modifiers: ["left_command", "left_shift"] }), // Find previous

  // Reload
  map("r").to({ key_code: "r", modifiers: ["left_command"] }), // Reload
  map({ key_code: "r", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "r",
    modifiers: ["left_command", "left_shift"],
  }), // Hard reload

  // Tab switching
  map("n").to({
    key_code: "close_bracket",
    modifiers: ["left_command", "left_shift"],
  }), // Next tab
  map("p").to({
    key_code: "open_bracket",
    modifiers: ["left_command", "left_shift"],
  }), // Previous tab
  map("g").to({
    key_code: "close_bracket",
    modifiers: ["left_command", "left_shift"],
  }), // Next tab (alternative, vim-style gt)

  // Switch to specific tab (1-9)
  map(1).to({ key_code: "1", modifiers: ["left_command"] }),
  map(2).to({ key_code: "2", modifiers: ["left_command"] }),
  map(3).to({ key_code: "3", modifiers: ["left_command"] }),
  map(4).to({ key_code: "4", modifiers: ["left_command"] }),
  map(5).to({ key_code: "5", modifiers: ["left_command"] }),
  map(6).to({ key_code: "6", modifiers: ["left_command"] }),
  map(7).to({ key_code: "7", modifiers: ["left_command"] }),
  map(8).to({ key_code: "8", modifiers: ["left_command"] }),
  map(9).to({ key_code: "9", modifiers: ["left_command"] }),

  // Bookmarks
  map("b").to({ key_code: "b", modifiers: ["left_command", "left_shift"] }), // Bookmarks sidebar

  // History & Downloads
  map({ key_code: "h", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "h",
    modifiers: ["left_command", "left_shift"],
  }), // History sidebar
  map({ key_code: "d", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "j",
    modifiers: ["left_command", "left_shift"],
  }), // Downloads (D)
  map("y").to({ key_code: "y", modifiers: ["left_command"] }), // Downloads (alternative)

  // Window management
  map({ key_code: "w", modifiers: { mandatory: ["left_shift"] } }).to({
    key_code: "n",
    modifiers: ["left_command"],
  }), // New window (W)

  // Save page
  map("s").to({ key_code: "s", modifiers: ["left_command"] }), // Save page
];

const firefoxPrimaryLayer = createDuoLayer(
  "d",
  "k",
  FIREFOX_COMMAND_MODE,
)
  .leaderMode()
  .notification(FIREFOX_COMMAND_MODE_HINT)
  .condition(isFirefox)
  .manipulators(firefoxCommandBindings);

const firefoxSecondaryLayer = createDuoLayer(
  "'",
  "return_or_enter",
  FIREFOX_COMMAND_MODE,
)
  .leaderMode({ escape: [] })
  .notification(false)
  .condition(isFirefox);

export const firefoxCommandLayers = [
  firefoxPrimaryLayer,
  firefoxSecondaryLayer,
];
