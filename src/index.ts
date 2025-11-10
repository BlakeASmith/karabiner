import {
    BasicManipulatorBuilder,
    FromEvent,
    ifApp,
  ifVar,
  layer,
  ManipulatorBuilder,
  map,
  mapSimultaneous,
  NumberKeyValue,
  rule,
  toSetVar,
  withCondition,
  withMapper,
  writeToProfile,
} from 'karabiner.ts'


const isTerminal = ifApp("^.*.iterm2.*$")
const isNotTerminal = isTerminal.unless()


const capsLock = rule("CapsLock for lots of things")
	.manipulators([
        // Use for tmux leader key if in a terminal application
		withCondition(isTerminal)([
            map("caps_lock").toIfAlone("a", "left_control")
        ]),
        withCondition(isNotTerminal)([
            map("caps_lock").toIfAlone("caps_lock") // For now.....
        ]),
	])

const shiftEsc = rule("Tap shift for Escape")
    .manipulators([
        map("left_shift").toIfAlone("escape")
            .toIfHeldDown("left_shift")
            .parameters({
                // Needs to be very short not to interfere with typing
                "basic.to_if_held_down_threshold_milliseconds": 60
            })
    ])

const launcherModeTriggers = (...manipulators: BasicManipulatorBuilder[]) => manipulators.map(
    (b) => b.toVar("launcher-mode")
        .toNotificationMessage('launcher-mode-notification', `t=ITerm, f/b=Firefox, g=Chrome, s=Slack, k=Kibana, Esc=nothing 0=Karabiner-EventViewer, k=KibanaAWSElectron, K=Kiro`)
)


const tab = layer("tab", "tab-mode")
    .manipulators([
        // Enter "launcher" mode to start programs
        ...launcherModeTriggers(map("a"), map("l"))
    ])

    rule("tab for lots of things")
    .manipulators([
        map("tab").toIfAlone("tab")
    ])


const mapLauncherMode = (key: FromEvent | string | number) => map(key as FromEvent)
          .toAfterKeyUp(toSetVar("launcher-mode", 0))
          .toRemoveNotificationMessage("launcher-mode-notification")

const launcherMode = [rule('Keybindings in launcher mode', ifVar('launcher-mode'))
    .manipulators([
        mapLauncherMode("t").toApp("ITerm"),
        mapLauncherMode("g").toApp("Google Chrome"),
        mapLauncherMode("f").toApp("Firefox"),
        mapLauncherMode("b").toApp("Firefox"),
        mapLauncherMode("s").toApp("Slack"),
        mapLauncherMode("k").toApp("KibanaAWSElectron"),
        mapLauncherMode(0).toApp("Karabiner-EventViewer"),
        mapLauncherMode({key_code: "k", modifiers: { mandatory: ["left_shift"] }}).toApp("Kiro"),
        mapLauncherMode("escape") // Don't do anything, just exit the mode
    ]),
    rule("Trigger launcher mode with a+l").manipulators(launcherModeTriggers(mapSimultaneous(["a", "l"]))),
    rule("Trigger launcher mode with a+; (pinkys)").manipulators(launcherModeTriggers(mapSimultaneous(["a", ";"]))),
]


writeToProfile('Default', [
    capsLock,
//    shiftEsc,
    tab,
    ...launcherMode
], {
    // This seems to be the magic number for me for most things
    "basic.to_if_held_down_threshold_milliseconds": 110
})
