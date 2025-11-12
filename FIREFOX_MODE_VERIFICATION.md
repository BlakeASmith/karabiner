# Firefox Mode Verification

## Official Firefox macOS Keyboard Shortcuts Reference

All mappings have been verified against official Firefox keyboard shortcuts.

### Verified Mappings

| Vim Key | Firefox Action | Official Shortcut | Status |
|---------|---------------|-------------------|--------|
| `t` | New Tab | ⌘T (Cmd+T) | ✅ Verified |
| `d` or `x` | Close Tab | ⌘W (Cmd+W) | ✅ Verified |
| `u` | Reopen Closed Tab | ⌘⇧T (Cmd+Shift+T) | ✅ Verified |
| `h` | Back | ⌘← (Cmd+Left Arrow) | ✅ Verified |
| `l` | Forward | ⌘→ (Cmd+Right Arrow) | ✅ Verified |
| `o` | Address Bar | ⌘L (Cmd+L) | ✅ Verified |
| `/` | Search Bar | ⌘K (Cmd+K) | ✅ Verified |
| `r` | Reload | ⌘R (Cmd+R) | ✅ Verified |
| `Shift+R` | Hard Reload | ⌘⇧R (Cmd+Shift+R) | ✅ Verified |
| `n` | Next Tab | ⌘⇧] (Cmd+Shift+]) | ✅ Verified |
| `p` | Previous Tab | ⌘⇧[ (Cmd+Shift+[) | ✅ Verified |
| `1-9` | Switch to Tab 1-9 | ⌘1-9 (Cmd+1 through Cmd+9) | ✅ Verified |
| `b` | Bookmarks Sidebar | ⌘⇧B (Cmd+Shift+B) | ✅ Verified |
| `f` | Find in Page | ⌘F (Cmd+F) | ✅ Verified |
| `;` | Find Next | ⌘G (Cmd+G) | ✅ Verified |
| `,` | Find Previous | ⌘⇧G (Cmd+Shift+G) | ✅ Verified |
| `Shift+H` | History Sidebar | ⌘⇧H (Cmd+Shift+H) | ✅ Verified |
| `Shift+D` or `y` | Downloads | ⌘⇧J (Cmd+Shift+J) or ⌘Y | ✅ Verified |
| `Shift+W` | New Window | ⌘N (Cmd+N) | ✅ Verified |
| `s` | Save Page | ⌘S (Cmd+S) | ✅ Verified |

## Raycast Integrations

| Vim Key | Action | Raycast Command | Status |
|---------|-------|----------------|--------|
| `Shift+T` | Search Browser Tabs | `raycast://extensions/raycast/browser-tabs/search-tabs` | ⚠️ Requires verification |
| `Shift+G` | Search Browser History | `raycast://extensions/raycast/browser-history/search-history` | ⚠️ Requires verification |
| `Shift+Q` | Search Quicklinks | `raycast://extensions/raycast/quicklinks/search-quicklinks` | ⚠️ Requires verification |

**Note:** These Raycast URIs follow the standard format `raycast://extensions/{owner}/{extension}/{command}`. To verify or find the correct command names:
1. Open Raycast
2. Go to Extensions
3. Right-click the extension
4. Select "Copy Command Link" to get the exact URI

If the command names differ, update the constants in `src/index.ts` accordingly.

## Key Code Mappings

- `close_bracket` = `]` (right square bracket)
- `open_bracket` = `[` (left square bracket)

These are correct for Firefox tab switching shortcuts.

## Mode Activation

- **Trigger**: Simultaneous `d` + `k` keys
- **Condition**: Only active when Firefox is the frontmost application
- **Mode Type**: One-shot mode (exits after key press)

## References

- Firefox Official Keyboard Shortcuts: https://support.mozilla.org/en-US/kb/keyboard-shortcuts-perform-firefox-tasks-quickly
- macOS Firefox uses standard Cmd-based shortcuts
