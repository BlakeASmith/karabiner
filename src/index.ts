import {
  BasicManipulatorBuilder,
  duoLayer,
  FromEvent,
  hyperLayer,
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
  simlayer,
  ToEvent,
  toHyper,
  toRemoveNotificationMessage,
  toSetVar,
  toUnsetVar,
  withCondition,
  withMapper,
  writeToProfile,
} from "karabiner.ts";

import {
  createDuoLayer,
  map,
  withExitAllModes,
} from "./lib.ts";
import { firefoxCommandLayers } from "./browser.ts";
import { join } from "path";
import { escape } from "querystring";

const CONFETTI = "open -g raycast://extensions/raycast/raycast/confetti";
const isTerminal = ifApp("^.*.iterm2.*$");
const isNotTerminal = isTerminal.unless();

const ITERM_COMMAND_MODE = "iterm-commands";
const ITERM_COMMAND_MODE_HINT =
  "s: horizontal split | v: vertical split | t: new tab | w: new window | 1-5: tab colors";
const itermCommandBindings = [
  map("s").to$(`/bin/zsh -c "~/.local/bin/itermctl hsplit"`),
  map("v").to$(`/bin/zsh -c "~/.local/bin/itermctl vsplit"`),
  map("t").to$(`/bin/zsh -c "~/.local/bin/itermctl newtab"`),
  map("w").to$(`/bin/zsh -c "~/.local/bin/itermctl newwindow"`),
  map(1).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 1"`),
  map(2).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 2"`),
  map(3).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 3"`),
  map(4).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 4"`),
  map(5).to$(`/bin/zsh -c "~/.local/bin/itermctl setcolor 5"`),
];

const itermCommandLayers = [
  createDuoLayer("d", "k", ITERM_COMMAND_MODE)
    .leaderMode()
    .notification(ITERM_COMMAND_MODE_HINT)
    .condition(isTerminal)
    .manipulators(itermCommandBindings),
  createDuoLayer("k", "l", ITERM_COMMAND_MODE)
    .leaderMode({ escape: [] })
    .notification(false)
    .condition(isTerminal),
];

const LAUNCHER_MODE = "launcher-mode";
const LAUNCHER_MODE_HINT = [
  "t/1 -> I[t]erm",
  "f/b -> [f]irefox",
  "s/3 -> [s]lack",
  "g -> [g]oogle Chrome",
  "o -> [o]bsidian",
  "m -> E[m]ail",
].join(" | ");

const launcherBindings = [
  map(4).to$(CONFETTI),
  ...["t", 1].flatMap((k) => map(k).toApp("Iterm")),
  map("g").toApp("Google Chrome"),
  map("q").toApp("Google Gemini"),
  ...["f", "b"].map((k) => map(k).toApp("Firefox")),
  ...["s", 3].map((k) => map(k).toApp("Slack")),
  map("k").toApp("KibanaAWSElectron"),
  map("c").toApp("CodeBrowser"),
  map("n").toApp("Neovide"),
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
];

const launcherLayers = [
  createDuoLayer("a", "l", LAUNCHER_MODE)
    .leaderMode()
    .notification(LAUNCHER_MODE_HINT)
    .manipulators(launcherBindings),
  createDuoLayer("a", ";", LAUNCHER_MODE)
    .leaderMode({ escape: [] })
    .notification(false),
  createDuoLayer("]", "\\", LAUNCHER_MODE)
    .leaderMode({ escape: [] })
    .notification(false),
];

type HomeRowKeyOptions = {
  toIfHeldDown: ToEvent[];
  toIfAlone: ToEvent[];
};

type HomeRowCombos = {
  fd_jk?: HomeRowKeyOptions;
  ds_kl?: HomeRowKeyOptions;
  // sa_lsemicolon?: HomeRowKeyOptions;
  // af_jsemicolon?: HomeRowKeyOptions;
  // fs_jl?: HomeRowKeyOptions;
};

const ALPHA_ROW1 = "qwertyuiop".split("");
const ROW1 = [..."qwertyuiop[]".split(""), "\\"];
const ALPHA_ROW2 = "asdfghjkl".split("");
const ROW2 = "asdfghjkl;'".split("");
const ALPHA_ROW3 = "zxcvbnm".split("");
const ROW3 = "zxcvbnm,./".split("");

const ALPHA_ALL = [...ALPHA_ROW1, ...ALPHA_ROW2, ...ALPHA_ROW3];

function homeRow(combos: HomeRowCombos) {
  let rules: RuleBuilder[] = [];
  if (combos.fd_jk !== undefined) {
    rules.push(
      rule("Sticky Conrol on fd or jk").manipulators(
        [
          ["f", "d"],
          ["j", "k"],
        ].map(([f, d]) =>
          mapSimultaneous([f, d])
            .toIfHeldDown(combos.fd_jk.toIfHeldDown)
            .toIfAlone(combos.fd_jk.toIfAlone),
        ),
      ),
    );
  }
  if (combos.ds_kl !== undefined) {
    rules.push(
      rule("Sticky Conrol on ds or kl").manipulators(
        [
          ["d", "s"],
          ["k", "l"],
        ].map(([f, d]) =>
          mapSimultaneous([f, d])
            .toIfHeldDown(combos.ds_kl.toIfHeldDown)
            .toIfAlone(combos.ds_kl.toIfAlone),
        ),
      ),
    );
  }
  return rules;
}

let _homeRow = homeRow({
  fd_jk: {
    toIfAlone: [
      {
        sticky_modifier: {
          left_control: "toggle",
        },
      },
    ],
    toIfHeldDown: [
      {
        key_code: "left_control",
      },
    ],
  },
  ds_kl: {
    toIfAlone: [
      {
        sticky_modifier: {
          left_option: "toggle",
        },
      },
    ],
    toIfHeldDown: [
      {
        key_code: "left_option",
      },
    ],
  },
});

const capsLock = rule("CapsLock for lots of things").manipulators([
  // Use for tmux leader key if in a terminal application
  withCondition(isTerminal)([
    map("caps_lock").toIfAlone("a", "left_control").toIfHeldDown(toHyper()),
  ]),
  withCondition(isNotTerminal)([
    map("caps_lock").toIfAlone("caps_lock").toIfHeldDown(toHyper()), // For now.....
  ]),
]);

let sublayerEscape = [
  toUnsetVar("sublayer"),
  toRemoveNotificationMessage("sublayer"),
];

let t_sublayer = rule("Sublayers", ifVar("sublayer", "t")).manipulators([
  map("g")
    .to$("open -g raycast://extensions/raycast/raycast/confetti")
    .toAfterKeyUp(sublayerEscape),
]);

const raycastLayer = hyperLayer("r", "raycast-mode")
  .leaderMode()
  .notification(true)
  .manipulators([
    map("t")
      .toVar("sublayer", "t")
      .toNotificationMessage("sublayer", "Sublayer active t"),
    map("k").to$("open -g raycast://extensions/rolandleth/kill-process/index"),
    map("f").to$("open -g raycast://script-commands/open-iterm-here"),
    map("m").to$(
      "open -g raycast://extensions/raycast/window-management/almost-maximize",
    ),
  ]);

const windowLayer = hyperLayer("w", "window-mode")
  .leaderMode()
  .notification(true)
  .manipulators([
    map("n").to$(
      "open -g raycast://extensions/raycast/window-management/almost-maximize",
    ),
    map("m").to$(
      "open -g raycast://extensions/raycast/window-management/maximize",
    ),
    map("l").to$(
      "open -g raycast://extensions/raycast/window-management/right-half",
    ),
    map("h").to$(
      "open -g raycast://extensions/raycast/window-management/left-half",
    ),
  ]);

writeToProfile(
  "Default",
  [
    ..._homeRow,
    capsLock,
    raycastLayer,
    t_sublayer,
    windowLayer,
    ...launcherLayers,
    ...itermCommandLayers,
    ...firefoxCommandLayers,
    // ...windowManagementLayers,
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
