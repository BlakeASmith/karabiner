import { duoLayer, rule, ToEvent, withMapper, toHyper, FromEvent, FromKeyCode, layer, toSetVar, ifVar, withCondition, toRemoveNotificationMessage, toNotificationMessage } from "karabiner.ts";
import { map } from "./lib";
import { execShellCommand } from "./util";


export const hyper = (key: FromKeyCode): FromEvent => ({key_code: key, modifiers: { mandatory: ["left_control", "left_option", "left_shift", "left_command"] }})

const GRAVE: ToEvent = {
    key_code: "grave_accent_and_tilde"
}

const CMD_GRAVE: ToEvent = {
    ...GRAVE,
    modifiers: ["left_command"]
}

const CMD_TILDI: ToEvent = {
    ...GRAVE,
    modifiers: ["left_command", "left_shift"]
}

const toKeybindStateCmd = (subcommand: string): ToEvent => ({
    shell_command: `/bin/zsh -c "~/.local/bin/keybindstate ${subcommand}"`,
})

export const toSwitchApp = (app: string): ToEvent =>({
        shell_command: `/bin/zsh -c "~/.local/bin/keybindstate switch '${app}'"`
})

export const toNextApp = (): ToEvent =>({
        shell_command: `/bin/zsh -c "~/.local/bin/keybindstate next"`
})

export const toPrevApp = (): ToEvent =>({
        shell_command: `/bin/zsh -c "~/.local/bin/keybindstate prev"`
})

export const toAddApp = (): ToEvent => toKeybindStateCmd(`add-current`)
export const toRemoveApp = (): ToEvent => toKeybindStateCmd(`remove-current`)
export const toAppIndex = (k: number): ToEvent => toKeybindStateCmd(`index ${k}`)
export const toSetIndex = (k: number): ToEvent => toKeybindStateCmd(`move ${k}`)

export const toSetMapping = (key: string): ToEvent => ({
    shell_command: `/bin/zsh -c "~/.local/bin/keybindstate set-mapping '${key}'"`
})

export const toOpenMapping = (key: string): ToEvent => ({
    shell_command: `/bin/zsh -c "~/.local/bin/keybindstate open-mapping '${key}'"`
})

export const toGetMapping = (key: string): ToEvent => ({
    shell_command: `/bin/zsh -c "~/.local/bin/keybindstate get-mapping '${key}'"`
})

const ASSIGNABLE_KEYS = [..."qwetyuiopfg;'zxcvbnm,./-[]".split(""), "\\"]
const NUMBERS = [1,2,3,4,5,6,7,8,9,0]

// Initialize default bindings
function init() {
    Object.entries({
        t: "iTerm2",
        g: "Google Chrome",
        f: "Firefox",
        b: "Firefox",
        q: "Google Gemini",
        v: "Neovide",
        o: "Obsidian",
        d: "Bazecor",
        m: "Email",
    }).forEach(([k, v]) => execShellCommand(`/bin/zsh -c "~/.local/bin/keybindstate set-mapping ${k} '${v}'"`))
}

// init()


const NAVIGATION_HINT = [
        "h/l -> switch apps",
        "j/k -> cycle windows",
        "a -> add current",
        "r -> remove current",
        "= -> assign mode",
        "# -> jump/set index",
        "s -> Raycast switcher",
].join(" | ")

const navigationModeKeys = [
        map("j").toIfAlone(CMD_GRAVE),
        map("k").toIfAlone(CMD_TILDI),
        map("l").toIfAlone(toNextApp()),
        map("h").toIfAlone(toPrevApp()),
        map("a").toIfAlone(toAddApp()),
        map("r").toIfAlone(toRemoveApp()),
        // Dynamically assign keys to apps
        map("=").toVar("assign-mode", 1).toNotificationMessage("assign-mode", "Press key to assign"),
        // Assign the next key pressed
        withCondition(ifVar("assign-mode", 1))([
            withMapper(ASSIGNABLE_KEYS)((k, _) => map(k).toIfAlone([toSetMapping(k), toRemoveNotificationMessage("assign-mode"), toSetVar("assign-mode", 0)])),
        ]),
        // If not in assign mode, then the key opens the app it is currently assigned to
        withCondition(ifVar("assign-mode", 0))([
            withMapper(ASSIGNABLE_KEYS)((k, _) => map(k).toIfAlone(toOpenMapping(k))),
        ]),
        // Number keys go to positions in the stack
        withCondition(ifVar("assign-mode", 0))([
            withMapper(NUMBERS)(k => map(k).toIfAlone(toAppIndex(k))),
        ]),
        // Assigning number keys changes ordering
        withCondition(ifVar("assign-mode", 1))([
            withMapper(NUMBERS)(k => map(k).toIfAlone([toSetIndex(k), toRemoveNotificationMessage("assign-mode"), toSetVar("assign-mode", 0)]))
        ]),
        map("s").to$(`open -g raycast://extensions/raycast/navigation/switch-windows`),
]


export const navigationOnTab = layer("tab")
    .notification(NAVIGATION_HINT)
    .manipulators([
        ...navigationModeKeys
    ])

export const stickyNavigationOnIO = duoLayer("i", "o")
    .notification(NAVIGATION_HINT)
    .leaderMode({
        sticky: true,
        escape: ["escape", "caps_lock", "return_or_enter", "tab"]
    })
    .manipulators([
        ...navigationModeKeys
    ])

export const leaderNavigationOnWe = duoLayer("w", "e")
    .notification(NAVIGATION_HINT)
    .leaderMode()
    .manipulators([
        ...navigationModeKeys
    ])


export const dynamicNavigation = [
    navigationOnTab,
    // sticking to just tab for now
    // stickyNavigationOnIO,
    // leaderNavigationOnWe
]
