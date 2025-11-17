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
  mode,
  ModeProps,
  BindingMap,
  Binding,
  map,
  withModeEnter,
  withExitAllModes,
} from "./lib.ts";
import { firefoxCommandMode } from "./browser.ts";
import { windowLayer } from "./window-management.ts";
import { join } from "path";
import { escape } from "querystring";
import { dynamicNavigation, navigationOnTab, stickyNavigationOnIO } from "./apps.ts";

const CONFETTI = "open -g raycast://extensions/raycast/raycast/confetti";
const isTerminal = ifApp("^.*.iterm2.*$");
const isNotTerminal = isTerminal.unless();

const ITERM_COMMAND_MODE = "iterm-commands";
const ITERM_COMMAND_MODE_HINT =
  "s: horizontal split | v: vertical split | t: new tab | w: new window | 1-5: tab colors";
const itermCommandMode = mode({
  name: ITERM_COMMAND_MODE,
  description: "Iterm2 control commands",
  hint: ITERM_COMMAND_MODE_HINT,
  triggers: [mapSimultaneous(["d", "k"]), mapSimultaneous(["k", "l"])],
  triggerConditions: [isTerminal],
  mappingConditions: [isTerminal],
  manipulators: [],
  oneShotKeys: [
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

// IDEA: use script to store state of what was the last app opened so I can have keybinds to go back and forth

const launcherMode = mode({
  name: "launcher-mode",
  description: "quickly launch programs",
  hint: [
    "t/1 -> I[t]erm",
    "f/b -> [f]irefox",
    "s/3 -> [s]lack",
    "g -> [g]oogle Chrome",
    "o -> [o]bsidian",
    "m -> E[m]ail",
  ].join(" | "),
  triggers: [
    mapSimultaneous(["a", "l"]),
    mapSimultaneous(["a", ";"]),
    mapSimultaneous(["s", "l"]),
    mapSimultaneous(["s", ";"]),
    mapSimultaneous(["]", "\\"]),
  ],
  manipulators: [],
  oneShotKeys: [
    map(4).to$(CONFETTI),
    ...["t", 1].flatMap((k) => map(k).toApp("Iterm")),
    map("g").toApp("Google Chrome"),
    map("q").toApp("Google Gemini"),
    ...["f", "b"].map((k) => map(k).toApp("Firefox")),
    ...["s", 3].map((k) => map(k).toApp("Slack")),
    map("k").toApp("KibanaAWSElectron"),
    map("y").toApp("t.corp"),
    map("c").toApp("CodeBrowser"),
    map("n").toApp("Neovide"),
    map("p").toApp("Taskei"),
    map("r").toApp("Postman"),
    map("i").toApp("Cisco Secure Client"),
    map("o").toApp("Obsidian"),
    map("m").toApp("Email"),
    map("d").toApp("Bazecor"),
    map("0").toApp("Karabiner-EventViewer"),
    map("\\").toApp("Karabiner-Elements"),
    map({ key_code: "k", modifiers: { mandatory: ["left_shift"] } }).toApp(
      "Kiro",
    ),
  ],
});

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

const bracketLayer = duoLayer("a", "s")
  .notification(true)
  .manipulators([
    map("j").to({ key_code: "open_bracket", modifiers: ["left_shift"] }),
    map("k").to({ key_code: "close_bracket", modifiers: ["left_shift"] }),
    map("l").to({ key_code: "open_bracket" }),
    map(";").to({ key_code: "close_bracket" }),
    map("u").to({ key_code: "9", modifiers: ["left_shift"] }),
    map("i").to({ key_code: "0", modifiers: ["left_shift"] }),
    map("g").to({ key_code: "comma", modifiers: ["left_shift"] }),
    map("h").to({ key_code: "period", modifiers: ["left_shift"] }),
  ]);

writeToProfile(
  "Default",
  [
    ...dynamicNavigation,
    ..._homeRow,
    capsLock,
    raycastLayer,
    bracketLayer,
    t_sublayer,
    windowLayer,
    ...launcherMode.build(),
    ...itermCommandMode.build(),
    ...firefoxCommandMode.build(),
    // ...windowManagementMode.build(),
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
