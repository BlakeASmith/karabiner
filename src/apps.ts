import { duoLayer, rule, ToEvent, withMapper, toHyper, FromEvent, FromKeyCode, layer, toSetVar, ifVar } from "karabiner.ts";
import { map } from "./lib";


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

// Stateful app switching
export const statefulAppLayer = duoLayer("w", "e", "apps-mode")
    .leaderMode(true)
    .notification(true)
    .manipulators([
        withMapper({
            t: "Iterm",
            g: "Google Chrome",
            f: "Firefox",
            b: "Firefox",
            q: "Google Gemini",
            v: "Neovide",
            o: "Obsidian",
            d: "Bazecor",
            m: "Email",
        })((k, v) => map(k).to$(`/bin/zsh -c "~/.local/bin/keybindstate switch '${v}'"`)),
        withMapper({
            n: "next",
            p: "prev",
            l: "last",
            0: "first",
            1: "index 1",
            2: "index 2",
            3: "index 3",
            4: "index 4",
            5: "index 5",
        })((k, v) => map(k).to$(`/bin/zsh -c "~/.local/bin/keybindstate ${v}"`)),
        // TODO: Need a way to change the order
        // One way would be to just edit the config file
        // Should also be able to add the currently open app even if it wasn't 
        // opened with a keybinding 
        // CMD + ` to cycle windows of the current app
        map("j").toIfAlone({
            "key_code": "grave_accent_and_tilde",
            "modifiers": ["left_command"]
        }),
        // CMD + ~ to cycle the other way
        map("k").toIfAlone({
            "key_code": "grave_accent_and_tilde",
            "modifiers": ["left_shift", "left_command"]
        })
    ])


    const navigationModeKeys = [
            map("j").toIfAlone(CMD_GRAVE),
            map("k").toIfAlone(CMD_TILDI),
            map("l").toIfAlone(toNextApp()),
            map("h").toIfAlone(toPrevApp()),
            map("a").toIfAlone(toAddApp()),
            map("r").toIfAlone(toAddApp()),
    ]


    export const navigationOnTab = layer("tab")
        .manipulators([
            ...navigationModeKeys
        ])

    export const stickyNavigationOnIO = duoLayer("i", "o")
        .notification(true)
        .leaderMode({
            sticky: true,
            escape: ["escape", "caps_lock", "return_or_enter", "tab"]
        })
        .manipulators([
            ...navigationModeKeys
        ])
