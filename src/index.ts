import {
    ifApp,
  ifVar,
  layer,
  map,
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


const tab = layer("tab", "tab-mode")
    .manipulators([
        map("a").toVar("launcher-mode")
            // .toAfterKeyUp(toSetVar("launcher-mode", 0))
            .toNotificationMessage('launcher-mode-notification', 'launcher-mode')
    ])

    rule("tab for lots of things")
    .manipulators([
        map("tab").toIfAlone("tab")
    ])


const launcherMode = rule('Keybindings in launcher mode', ifVar('launcher-mode'))
    .manipulators([
        map('t')
          .toAfterKeyUp(toSetVar("launcher-mode", 0))
          .toRemoveNotificationMessage("launcher-mode-notification")
          .toApp("ITerm")
    ])


writeToProfile('Default', [
    capsLock,
    shiftEsc,
    tab,
    launcherMode
], {
    // This seems to be the magic number for me for most things
    "basic.to_if_held_down_threshold_milliseconds": 110
})
