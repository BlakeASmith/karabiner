import {
  BasicManipulatorBuilder,
  FromEvent,
  ifApp,
  ifVar,
  layer,
  Manipulator,
  ManipulatorBuilder,
  mapDoubleTap,
  mapSimultaneous,
  NumberKeyValue,
  rule,
  RuleBuilder,
  toRemoveNotificationMessage,
  toSetVar,
  withCondition,
  withMapper,
  writeToProfile,
} from "karabiner.ts";

import {
  mode,
  ModeProps,
  BindingMap,
  Binding,
  map,
  withModeEnter,
  withExitAllModes,
} from "./lib.ts";
import { join } from "path";

const CONFETTI = "open -g raycast://extensions/raycast/raycast/confetti";
const RAYCAST_BROWSER_HISTORY = "open -g raycast://extensions/raycast/browser-history/search-history";
const RAYCAST_BROWSER_BOOKMARKS = "open -g raycast://extensions/raycast/browser-bookmarks/search-bookmarks";
const RAYCAST_BROWSER_TABS = "open -g raycast://extensions/raycast/browser-tabs/search-tabs";
const RAYCAST_QUICKLINKS = "open -g raycast://extensions/raycast/quicklinks/search-quicklinks";
const isTerminal = ifApp("^.*.iterm2.*$");
const isNotTerminal = isTerminal.unless();
const isFirefox = ifApp("^.*firefox.*$");

const ITERM_COMMAND_MODE = "iterm-commands";
const ITERM_COMMAND_MODE_HINT = "s: horizontal split | v: vertical split | t: new tab | w: new window | 1-5: tab colors";
const itermCommandMode = mode({
  name: ITERM_COMMAND_MODE,
  description: "Iterm2 control commands",
  hint: ITERM_COMMAND_MODE_HINT,
  isOneShotMode: true,
  triggers: [mapSimultaneous(["d", "k"])],
  triggerConditions: [isTerminal],
  mappingConditions: [isTerminal],
  manipulators: [
    map("s").to$(`/bin/zsh -c "~/.local/bin/itermctl hsplit"`),
    map("v").to$(`/bin/zsh -c "~/.local/bin/itermctl vsplit"`),
    map("t").to$(`/bin/zsh -c "~/.local/bin/itermctl newtab"`),
    map("w").to$(`/bin/zsh -c "~/.local/bin/itermctl newwindow"`),
    map(1).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 1"`),
    map(2).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 2"`),
    map(3).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 3"`),
    map(4).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 4"`),
    map(5).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 5"`),
  ],
});

const FIREFOX_COMMAND_MODE = "firefox-commands";
const FIREFOX_COMMAND_MODE_HINT = "t: new tab | d/x: close tab | u: reopen tab | o: address bar | /: search | f: find | ;/,: find next/prev | n/p/g: next/prev tab | r: reload | R: hard reload | h/l: back/forward | 1-9: switch tab | b: bookmarks | D: downloads | H: history | W: new window | s: save | y: downloads | G: raycast history | Q: raycast quicklinks | T: raycast tabs";
const firefoxCommandMode = mode({
  name: FIREFOX_COMMAND_MODE,
  description: "Firefox browser controls",
  hint: FIREFOX_COMMAND_MODE_HINT,
  isOneShotMode: true,
  triggers: [mapSimultaneous(["d", "k"])],
  triggerConditions: [isFirefox],
  mappingConditions: [isFirefox],
  manipulators: [
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
    map({ key_code: "r", modifiers: { mandatory: ["left_shift"] } }).to({ key_code: "r", modifiers: ["left_command", "left_shift"] }), // Hard reload
    
    // Tab switching
    map("n").to({ key_code: "close_bracket", modifiers: ["left_command", "left_shift"] }), // Next tab
    map("p").to({ key_code: "open_bracket", modifiers: ["left_command", "left_shift"] }), // Previous tab
    map("g").to({ key_code: "close_bracket", modifiers: ["left_command", "left_shift"] }), // Next tab (alternative, vim-style gt)
    
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
    map({ key_code: "h", modifiers: { mandatory: ["left_shift"] } }).to({ key_code: "h", modifiers: ["left_command", "left_shift"] }), // History sidebar
    map({ key_code: "d", modifiers: { mandatory: ["left_shift"] } }).to({ key_code: "j", modifiers: ["left_command", "left_shift"] }), // Downloads (D)
    map("y").to({ key_code: "y", modifiers: ["left_command"] }), // Downloads (alternative)
    
    // Window management
    map({ key_code: "w", modifiers: { mandatory: ["left_shift"] } }).to({ key_code: "n", modifiers: ["left_command"] }), // New window (W)
    
    // Save page
    map("s").to({ key_code: "s", modifiers: ["left_command"] }), // Save page
    
    // Raycast integrations
    map({ key_code: "t", modifiers: { mandatory: ["left_shift"] } }).to$(RAYCAST_BROWSER_TABS), // Raycast: Search browser tabs (T)
    map({ key_code: "g", modifiers: { mandatory: ["left_shift"] } }).to$(RAYCAST_BROWSER_HISTORY), // Raycast: Search browser history (G)
    map({ key_code: "q", modifiers: { mandatory: ["left_shift"] } }).to$(RAYCAST_QUICKLINKS), // Raycast: Search quicklinks (Q)
  ],
});

const launcherMode = mode({
  name: "launcher-mode",
  description: "quickly launch programs",
  isOneShotMode: true,
  hint: [
    "t/1 -> I[t]erm",
    "f/b -> [f]irefox",
    "s/3 -> [s]lack",
    "g -> [g]oogle Chrome",
    "o -> [o]bsidian",
    "m -> E[m]ail",
  ].join(" | "),
  triggers: [mapSimultaneous(["a", "l"]), mapSimultaneous(["a", ";"])],
  manipulators: [
    map(4).to$(CONFETTI),
    ...["t", 1].flatMap((k) => map(k).toApp("Iterm")),
    map("g").toApp("Google Chrome"),
    map("q").toApp("Google Gemini"),
    ...["f", "b"].map((k) => map(k).toApp("Firefox")),
    ...["s", 3].map((k) => map(k).toApp("Slack")),
    map("k").toApp("KibanaAWSElectron"),
    map("c").toApp("CodeBrowser"),
    map("p").toApp("Taskei"),
    map("r").toApp("Postman"),
    map("i").toApp("Cisco Secure Client"),
    map("o").toApp("Obsidian"),
    map("m").toApp("Email"),
    map("0").toApp("Karabiner-EventViewer"),
    map("\\").toApp("Karabiner-Elements"),
    map({ key_code: "k", modifiers: { mandatory: ["left_shift"] } }).toApp(
      "Kiro",
    ),
  ],
});

const capsLock = rule("CapsLock for lots of things").manipulators([
  // Use for tmux leader key if in a terminal application
  withCondition(isTerminal)([map("caps_lock").toIfAlone("a", "left_control")]),
  withCondition(isNotTerminal)([
    map("caps_lock").toIfAlone("caps_lock"), // For now.....
  ]),
]);

writeToProfile(
  "Default",
  [
    capsLock,
    ...launcherMode.build(),
    ...itermCommandMode.build(),
    ...firefoxCommandMode.build(),
    // !important this needs to happen after all modes are defined
    // Any extra re-mapping of Escape key needs to be done here as well
    rule("escape modes").manipulators([
      withExitAllModes(map("escape"))
        .to({ key_code: "escape" })
        .to([
          // other escape mappings here
          toRemoveNotificationMessage("test"),
        ]),
    ]),
  ],
  {
    // This seems to be the magic number for me for most things
    "basic.to_if_held_down_threshold_milliseconds": 110,
  },
);
