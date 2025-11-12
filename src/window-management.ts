import { mapSimultaneous } from "karabiner.ts";
import { mode, map } from "./lib.ts";

// Raycast window management extension commands
// Format: raycast://extensions/{owner}/{extension}/{command}
// Based on Raycast's built-in window management extension
// NOTE: Command names may need to be verified. To find the correct command URIs:
// 1. Open Raycast → Extensions → Window Management
// 2. Right-click on a command → Copy Command Link
// 3. Update the URIs below with the actual command names
const RAYCAST_CENTER_WINDOW = "open -g raycast://extensions/raycast/window-management/center-window";
const RAYCAST_LEFT_HALF = "open -g raycast://extensions/raycast/window-management/left-half";
const RAYCAST_RIGHT_HALF = "open -g raycast://extensions/raycast/window-management/right-half";
const RAYCAST_TOP_HALF = "open -g raycast://extensions/raycast/window-management/top-half";
const RAYCAST_BOTTOM_HALF = "open -g raycast://extensions/raycast/window-management/bottom-half";
const RAYCAST_MAXIMIZE_WINDOW = "open -g raycast://extensions/raycast/window-management/maximize-window";
const RAYCAST_MINIMIZE_WINDOW = "open -g raycast://extensions/raycast/window-management/minimize-window";
const RAYCAST_FULLSCREEN_WINDOW = "open -g raycast://extensions/raycast/window-management/fullscreen-window";
const RAYCAST_NEXT_DISPLAY = "open -g raycast://extensions/raycast/window-management/next-display";
const RAYCAST_PREVIOUS_DISPLAY = "open -g raycast://extensions/raycast/window-management/previous-display";

const WINDOW_MANAGEMENT_MODE = "window-management";
const WINDOW_MANAGEMENT_MODE_HINT = "c: center | h: left half | l: right half | k: top half | j: bottom half | m: maximize | i: minimize | f: fullscreen | n: next display | p: previous display";

export const windowManagementMode = mode({
  name: WINDOW_MANAGEMENT_MODE,
  description: "Raycast window management commands",
  hint: WINDOW_MANAGEMENT_MODE_HINT,
  isOneShotMode: true,
  triggers: [mapSimultaneous(["w", "m"])],
  manipulators: [
    // Center window
    map("c").to$(RAYCAST_CENTER_WINDOW),
    
    // Half windows (vim-style directions)
    map("h").to$(RAYCAST_LEFT_HALF),      // left
    map("l").to$(RAYCAST_RIGHT_HALF),     // right
    map("k").to$(RAYCAST_TOP_HALF),       // up
    map("j").to$(RAYCAST_BOTTOM_HALF),    // down
    
    // Window states
    map("m").to$(RAYCAST_MAXIMIZE_WINDOW),
    map("i").to$(RAYCAST_MINIMIZE_WINDOW),
    map("f").to$(RAYCAST_FULLSCREEN_WINDOW),
    
    // Display management
    map("n").to$(RAYCAST_NEXT_DISPLAY),
    map("p").to$(RAYCAST_PREVIOUS_DISPLAY),
  ],
});
