import { hyperLayer, mapSimultaneous, withMapper } from "karabiner.ts";
import { mode, map } from "./lib.ts";

export const windowLayer = hyperLayer("w", "window-mode")
  .leaderMode()
  .notification("c: center | h: left half | l: right half | k/t: top half | j/b: bottom half | m: maximize | n: almost-maximize | r: restore | f: toggle fullscreen | ;: next display | ': previous display")
  .manipulators([
      withMapper({
          n: "almost-maximize",
          m: "maximize",
          l: "right-half",
          h: "left-half",
          t: "top-half",
          k: "top-half",
          j: "bottom-half",
          b: "bottom-half",
          c: "center",
          f: "toggle-fullscreen",
          r: "restore",
          ";": "next-display",
          "'": "previous-display",
      })((key, value) => map(key)
      .to$(`open -g raycast://extensions/raycast/window-management/${value}`)),
  ]);

