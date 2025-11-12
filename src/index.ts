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
const isTerminal = ifApp("^.*.iterm2.*$");
const isNotTerminal = isTerminal.unless();

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
