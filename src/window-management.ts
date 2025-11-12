import { mapSimultaneous } from "karabiner.ts";
import { mode, map } from "./lib.ts";

// Raycast window management extension commands
// Format: raycast://extensions/{owner}/{extension}/{command}
// Based on Raycast's built-in window management extension
// Command names based on official documentation: https://manual.raycast.com/window-management
// To verify/copy actual command URIs: Open Raycast → Extensions → Window Management → Right-click command → Copy Command Link
const RAYCAST_CENTER = "open -g raycast://extensions/raycast/window-management/center";
const RAYCAST_LEFT_HALF = "open -g raycast://extensions/raycast/window-management/left-half";
const RAYCAST_RIGHT_HALF = "open -g raycast://extensions/raycast/window-management/right-half";
const RAYCAST_TOP_HALF = "open -g raycast://extensions/raycast/window-management/top-half";
const RAYCAST_BOTTOM_HALF = "open -g raycast://extensions/raycast/window-management/bottom-half";
const RAYCAST_MAXIMIZE = "open -g raycast://extensions/raycast/window-management/maximize";
const RAYCAST_RESTORE = "open -g raycast://extensions/raycast/window-management/restore";
const RAYCAST_TOGGLE_FULLSCREEN = "open -g raycast://extensions/raycast/window-management/toggle-fullscreen";
const RAYCAST_NEXT_DISPLAY = "open -g raycast://extensions/raycast/window-management/next-display";
const RAYCAST_PREVIOUS_DISPLAY = "open -g raycast://extensions/raycast/window-management/previous-display";

const WINDOW_MANAGEMENT_MODE = "window-management";
const WINDOW_MANAGEMENT_MODE_HINT = "c: center | h: left half | l: right half | k: top half | j: bottom half | m: maximize | r: restore | f: toggle fullscreen | n: next display | p: previous display";

export const windowManagementMode = mode({
  name: WINDOW_MANAGEMENT_MODE,
  description: "Raycast window management commands",
  hint: WINDOW_MANAGEMENT_MODE_HINT,
  isOneShotMode: true,
  triggers: [mapSimultaneous(["w", "m"])],
  manipulators: [
    // Center window
    map("c").to$(RAYCAST_CENTER),
    
    // Half windows (vim-style directions)
    map("h").to$(RAYCAST_LEFT_HALF),      // left
    map("l").to$(RAYCAST_RIGHT_HALF),     // right
    map("k").to$(RAYCAST_TOP_HALF),       // up
    map("j").to$(RAYCAST_BOTTOM_HALF),    // down
    
    // Window states
    map("m").to$(RAYCAST_MAXIMIZE),
    map("r").to$(RAYCAST_RESTORE),        // restore (undo last action)
    map("f").to$(RAYCAST_TOGGLE_FULLSCREEN),
    
    // Display management
    map("n").to$(RAYCAST_NEXT_DISPLAY),
    map("p").to$(RAYCAST_PREVIOUS_DISPLAY),
  ],
});
