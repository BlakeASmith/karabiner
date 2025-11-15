import { duoLayer, withMapper } from "karabiner.ts";
import { map } from "./lib";


// Stateful app switching
export const statefulAppLayer = duoLayer("q", "w", "apps-mode")
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
            ";": "win-next",
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

    ])
