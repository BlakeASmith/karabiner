#!/usr/bin/env python3
import json
import logging
import os
import sys
from abc import abstractmethod
from argparse import ArgumentParser, Namespace
from collections.abc import Mapping, Sequence
from contextlib import contextmanager, suppress
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Union

# Set up logging
LOG_PATH = Path("~/.local/state/keybindstate.log").expanduser()
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH),
    ],
)
logger = logging.getLogger(__name__)


class AppState(Mapping[str, str], Sequence[str]):
    """
    A class that encapsulates app stack and mapping state, ensuring they stay in sync.
    Implements both Mapping (for key->app mappings) and Sequence (for stack access).
    Handles its own serialization/deserialization to/from JSON.
    """

    DEFAULT_STATE_PATH = Path("~/.local/state/keybindstate.json").expanduser()

    def __init__(
        self,
        stack: Optional[List[str]] = None,
        mapping: Optional[Dict[str, str]] = None,
        current_index: int = 0,
        on_current_changed: Callable[[str], None] = lambda _: None,
    ):
        self._stack = list(stack) if stack is not None else []
        self._mapping = dict(mapping) if mapping is not None else {}
        self._current_index = current_index
        self._on_current_changed = on_current_changed

    # Sequence interface (for stack access)
    def __getitem__(self, key):
        """
        Get item by index (Sequence) or mapping key (Mapping).
        - int: returns app at index in stack
        - str: returns app for mapping key
        """
        if isinstance(key, int):
            return self._stack[key]
        elif isinstance(key, str):
            return self._mapping[key]
        else:
            raise TypeError(f"Key must be int or str, got {type(key).__name__}")

    def __setitem__(self, key: Union[str, int], value: str) -> None:
        """
        Set mapping value (Mapping API).
        For strings, sets mapping key->app.
        """
        if isinstance(key, str):
            self._mapping[key] = value
            logger.debug(f"Set mapping: '{key}' -> '{value}'")
        elif isinstance(key, int):
            self._stack[key] = value
            logger.debug(f"Set stack[{key}] = '{value}'")
        else:
            raise TypeError(f"Mapping keys must be str, got {type(key).__name__}")

    def __delitem__(self, key: Union[str, int]) -> None:
        """
        Delete mapping key (Mapping API).
        """
        if isinstance(key, str):
            del self._mapping[key]
        elif isinstance(key, int):
            del self._stack[key]
        else:
            raise TypeError(f"Mapping keys must be str, got {type(key).__name__}")

    def __len__(self) -> int:
        """Length of stack (for Sequence)."""
        return len(self._stack)

    def __contains__(self, item: str):
        """
        Check if item is in mapping keys (Mapping) or stack (Sequence).
        For strings, checks mapping keys first, then stack.
        """
        return item in self._mapping or item in self._stack

    def __iter__(self):
        """Iterate over stack (Sequence)."""
        return iter(self._stack)

    def get(self, key: Union[str, int], default: Optional[str] = None) -> Optional[str]:
        """Get app for mapping key."""
        if isinstance(key, str):
            return self._mapping.get(key, default)
        elif isinstance(key, int):
            with suppress():
                return self._stack[key]
            return default
        else:
            raise TypeError(f"Mapping keys must be str, got {type(key).__name__}")

    def find_app_in_stack(self, app_name: str) -> Optional[str]:
        """Find app in stack by name, with case-insensitive matching."""
        # First try exact match
        if app_name in self._stack:
            return app_name
        # Try case-insensitive match
        app_name_lower = app_name.lower()
        for app in self._stack:
            if app.lower() == app_name_lower:
                return app
        return None

    def insert(self, key: int, value: str):
        self._stack.insert(key, value)

    def append(self, value: str):
        self._stack.append(value)
        logger.debug(f"Appended app to stack: '{value}'")

    @property
    def current_index(self) -> int:
        """Get current index in stack."""
        return self._current_index

    @current_index.setter
    def current_index(self, value: int) -> None:
        """Set current index, clamping to valid range."""
        if self._stack:
            self._current_index = max(0, min(value, len(self._stack) - 1))
        else:
            self._current_index = 0

        if self.current_app is not None:
            # TODO: current app should never be None
            self._on_current_changed(self.current_app)

    @property
    def current_app(self) -> Optional[str]:
        """Get current app from stack."""
        return self._stack[self._current_index]

    @current_app.setter
    def current_app(self, app: str):
        if app in self._stack:
            self.current_index = self.index(app)
        else:
            self.append(app)
            self.current_index = self.index(app)
        logger.debug(f"Current app set to: {app}")

    def next(self):
        self.current_index = (self.current_index + 1) % len(self._stack)
        return self.current_app

    def prev(self):
        self.current_index = self.current_index - 1
        if self.current_index <= 0:
            self.current_index = len(self._stack) - 1 + self.current_index
        return self.current_app

    def remove_from_stack(self, app: str) -> None:
        """Internal helper: remove app from stack with index adjustment."""
        if app not in self._stack:
            logger.debug(
                f"Attempted to remove app '{app}' from stack, but it's not in stack"
            )
            return
        old_index = self._stack.index(app)
        self._stack.remove(app)
        logger.debug(f"Removed app '{app}' from stack (was at index {old_index})")
        # Adjust current_index if needed
        if old_index < self._current_index:
            self.current_index = self._current_index - 1
        elif old_index == self._current_index:
            # Current app was removed, adjust index
            if self._stack:
                self.current_index = min(self._current_index, len(self._stack) - 1)
            else:
                self.current_index = 0

    def move_app_to_index(self, app: str, new_index: int) -> None:
        """Move an app to a new index in the stack."""
        if app not in self._stack:
            logger.debug(f"Attempted to move app '{app}' to index {new_index}, but it's not in stack")
            return
        
        old_index = self._stack.index(app)
        
        # Clamp new_index to valid range
        new_index = max(0, min(new_index, len(self._stack) - 1))
        
        if old_index == new_index:
            logger.debug(f"App '{app}' is already at index {new_index}")
            return
        
        # Store if current app is being moved
        current_app_moved = (old_index == self._current_index)
        
        # Remove the app from its current position
        app_value = self._stack.pop(old_index)
        
        # Adjust current_index if needed (before inserting)
        if not current_app_moved:
            if old_index < self._current_index:
                # Item removed before current, shift current left
                self._current_index -= 1
        
        # Insert at the desired position
        # After removing the app, insert it at new_index directly
        # list.insert() allows inserting at len(list) to append
        insert_index = min(new_index, len(self._stack))
        
        self._stack.insert(insert_index, app_value)
        
        # Adjust current_index if item was inserted before it
        if not current_app_moved:
            if insert_index <= self._current_index:
                # Item inserted before current, shift current right
                self._current_index += 1
        else:
            # Current app was moved, update to new position
            self._current_index = insert_index
        
        logger.debug(f"Moved app '{app}' from index {old_index} to index {insert_index} (target was {new_index})")

    def move_app_up(self, app: str, count: int = 1) -> None:
        """Move an app up in the stack (towards index 0) by count positions."""
        if app not in self._stack:
            logger.debug(f"Attempted to move app '{app}' up, but it's not in stack")
            return
        
        old_index = self._stack.index(app)
        new_index = max(0, old_index - count)
        self.move_app_to_index(app, new_index)

    def move_app_down(self, app: str, count: int = 1) -> None:
        """Move an app down in the stack (towards higher index) by count positions."""
        if app not in self._stack:
            logger.debug(f"Attempted to move app '{app}' down, but it's not in stack")
            return
        
        old_index = self._stack.index(app)
        new_index = min(len(self._stack) - 1, old_index + count)
        self.move_app_to_index(app, new_index)

    def clear(self) -> None:
        """Clear both stack and mapping."""
        logger.info("Clearing app stack and mappings")
        self._stack.clear()
        self._mapping.clear()
        self._current_index = 0

    def to_dict(self) -> Dict[str, Union[List[str], Dict[str, str], int]]:
        """Convert to dict for JSON serialization."""
        return {
            "appstack": self._stack.copy(),
            "appindex": self._current_index,
            "appmapping": self._mapping.copy(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AppState":
        """Create from dict (e.g., from JSON)."""
        return cls(
            stack=data.get("appstack", []),
            mapping=data.get("appmapping", {}),
            current_index=data.get("appindex", 0),
            # TODO: Support configuration of this
            on_current_changed=PLATFORM.focus_app,
        )

    def save_to_file(self, path: Optional[Path] = None) -> None:
        """
        Save state to JSON file.

        Args:
            path: Path to save to. If None, uses DEFAULT_STATE_PATH.
        """
        if path is None:
            path = self.DEFAULT_STATE_PATH

        # Ensure parent directory exists
        path.parent.mkdir(parents=True, exist_ok=True)

        # Serialize to JSON
        state_dict = self.to_dict()
        path.write_text(json.dumps(state_dict, indent=2))

    @classmethod
    def load_from_file(cls, path: Optional[Path] = None) -> "AppState":
        """
        Load state from JSON file.

        Args:
            path: Path to load from. If None, uses DEFAULT_STATE_PATH.

        Returns:
            AppState instance loaded from file, or new instance if file doesn't exist.
        """
        if path is None:
            path = cls.DEFAULT_STATE_PATH

        if not path.exists():
            # Return new instance with defaults
            instance = cls()
            instance.save_to_file(path)
            return instance

        # Load from file
        try:
            data = json.loads(path.read_text())
            return cls.from_dict(data)
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # If file is corrupted, create new instance
            print(f"Warning: Error loading state from {path}: {e}", file=sys.stderr)
            print("Creating new state file.", file=sys.stderr)
            instance = cls(on_current_changed=PLATFORM.focus_app)
            instance.save_to_file(path)
            return instance


@contextmanager
def state(path: Optional[Path] = None):
    """
    Context manager that handles loading and saving app state.

    Usage:
        with app_state_context() as app_state:
            # Use app_state here
            app_state.switch_to_app("Firefox")
        # State is automatically saved on exit

    Args:
        path: Path to state file. If None, uses DEFAULT_STATE_PATH.

    Yields:
        AppState instance loaded from file.
    """
    state_path = path or AppState.DEFAULT_STATE_PATH
    logger.debug(f"Loading state from {state_path}")
    app_state = AppState.load_from_file(path)
    logger.debug(f"Loaded state: {app_state.to_dict()}")
    try:
        yield app_state
    finally:
        # Always save state on exit, even if an error occurred
        logger.debug(f"Saving state to {state_path}")
        app_state.save_to_file(path)


class Platform:
    @abstractmethod
    def current_app_name(self) -> str: ...

    @abstractmethod
    def focus_app(self, app: str) -> None: ...


class MacOS(Platform):
    # Helper/system processes that should be ignored
    HELPER_PROCESSES = {
        "app_mode_loader",
        "loginwindow",
        "WindowServer",
        "Dock",
        "Finder",
        "SystemUIServer",
        "NotificationCenter",
    }

    def current_app_name(self) -> str:
        # Method 1: Simple direct query first (most reliable)
        cmd_simple = "osascript -e 'tell application \"System Events\" to get name of first application process whose frontmost is true'"
        result = os.popen(cmd_simple).read().strip()
        
        # If we got a valid result that's not a helper, return it
        if result and result not in self.HELPER_PROCESSES and "app_mode_loader" not in result.lower():
            logger.debug(f"Got app from simple query: '{result}'")
            return result
        
        # Method 2: If we got a helper or empty, try filtering through processes with windows
        if not result or result == "" or result in self.HELPER_PROCESSES or "app_mode_loader" in result.lower():
            logger.debug(f"Simple query gave '{result}', trying filtered method")
            cmd_filtered = """osascript -e 'tell application "System Events"
                set frontProcs to every application process whose frontmost is true
                repeat with proc in frontProcs
                    set procName to name of proc
                    if procName is not "" and procName is not "app_mode_loader" and procName is not "loginwindow" and procName is not "WindowServer" then
                        try
                            set procWindows to windows of proc
                            if (count of procWindows) > 0 then
                                return procName
                            end if
                        end try
                    end if
                end repeat
                -- Fallback: any non-helper process
                repeat with proc in frontProcs
                    set procName to name of proc
                    if procName is not "" and procName is not "app_mode_loader" and procName is not "loginwindow" then
                        return procName
                    end if
                end repeat
                -- Last resort
                if (count of frontProcs) > 0 then
                    return name of item 1 of frontProcs
                end if
                return ""
            end tell'"""
            result = os.popen(cmd_filtered).read().strip()
        
        # Final validation - must not be empty
        if not result or result.strip() == "":
            logger.error("Could not determine current app name - got empty string from all methods")
            raise RuntimeError("Could not determine current application name - got empty string")
        
        # Check for helper processes and warn
        if result in self.HELPER_PROCESSES or "app_mode_loader" in result.lower():
            logger.warning(f"Got helper process '{result}' instead of real app. You may need to manually add apps.")
        
        logger.debug(f"Final app name: '{result}'")
        return result

    def focus_app(self, app: str) -> None:
        logger.debug(f"Focusing app: {app}")
        os.system(f'open -a "{app}"')


# hard coded for now
PLATFORM = MacOS()

# Command registry for CLI
COMMANDS = {}


def register_command(name: str, description: Optional[str] = None):
    """Decorator to register a command handler."""

    def decorator(func):
        COMMANDS[name] = {
            "handler": func,
            "description": description or func.__doc__ or "",
        }
        return func

    return decorator


def setup_parser(parser: ArgumentParser):
    """Set up all command parsers."""
    subparsers = parser.add_subparsers(dest="cmd", help="Command to execute")

    # Stack navigation commands
    switch_parser = subparsers.add_parser("switch", help="Switch to an app")
    switch_parser.add_argument("app", help="App name to switch to")

    subparsers.add_parser("state", help="Show current state")

    subparsers.add_parser("clear", help="Clear the app stack and mappings")

    prev_parser = subparsers.add_parser("prev", help="Go to previous app in stack")

    next_parser = subparsers.add_parser("next", help="Go to next app in stack")

    last_parser = subparsers.add_parser("last", help="Go to last app in stack")

    first_parser = subparsers.add_parser("first", help="Go to first app in stack")

    index_parser = subparsers.add_parser("index", help="Go to app at index")
    index_parser.add_argument("n", type=int, help="Index (1-based)")

    remove_parser = subparsers.add_parser("remove", help="Remove an app from stack")
    remove_parser.add_argument("app", help="App name to remove")

    add_current_parser = subparsers.add_parser(
        "add-current", help="Add current app to stack"
    )
    add_current_parser.add_argument(
        "position",
        type=int,
        nargs="?",
        default=0,
        help="Position in stack to insert app (default: 0)",
    )

    subparsers.add_parser("remove-current", help="Remove current app from stack")

    # Mapping commands
    set_mapping_parser = subparsers.add_parser(
        "set-mapping", help="Set a key-to-app mapping"
    )
    set_mapping_parser.add_argument("key", help="Key to map")
    set_mapping_parser.add_argument(
        "app", nargs="?", help="App name to map to (default: current app)"
    )

    open_mapping_parser = subparsers.add_parser(
        "open-mapping", help="Open app by mapping key"
    )
    open_mapping_parser.add_argument("key", help="Key to open app for")

    get_mapping_parser = subparsers.add_parser(
        "get-mapping", help="Get app name for a mapping key"
    )
    get_mapping_parser.add_argument("key", help="Key to get app for")

    move_parser = subparsers.add_parser(
        "move", help="Move an app to a different index in the stack"
    )
    move_parser.add_argument("index", type=int, help="New index (1-based)")
    move_parser.add_argument(
        "app", nargs="?", help="App name to move (default: current app)"
    )

    move_up_parser = subparsers.add_parser(
        "move-up", help="Move an app up in the stack (towards index 1)"
    )
    move_up_parser.add_argument(
        "app", nargs="?", help="App name to move (default: current app)"
    )
    move_up_parser.add_argument(
        "--count", "-c", type=int, default=1, help="Number of positions to move up (default: 1)"
    )

    move_down_parser = subparsers.add_parser(
        "move-down", help="Move an app down in the stack (towards higher index)"
    )
    move_down_parser.add_argument(
        "app", nargs="?", help="App name to move (default: current app)"
    )
    move_down_parser.add_argument(
        "--count", "-c", type=int, default=1, help="Number of positions to move down (default: 1)"
    )

    return parser


# Command handlers
@register_command("switch", "Switch to an app and add to stack")
def cmd_switch(args, app_state: AppState):
    """Switch to an app and add to stack."""
    assert isinstance(args.app, str)
    app_state.current_app = args.app


@register_command("state", "Show current state")
def cmd_state(args, app_state: AppState):
    """Show current state (currently no-op, state is printed at end)."""
    pass


@register_command("clear", "Clear the app stack and mappings")
def cmd_clear(args, app_state: AppState):
    """Clear the app stack and mappings."""
    app_state.clear()


@register_command("prev", "Go to previous app in stack")
def cmd_prev(args, app_state: AppState):
    """Go to previous app in stack."""
    app_state.prev()


@register_command("next", "Go to next app in stack")
def cmd_next(args, app_state: AppState):
    """Go to next app in stack."""
    app_state.next()


@register_command("index", "Go to app at index")
def cmd_index(args, app_state: AppState):
    """Go to app at index."""
    if 1 <= args.n <= len(app_state):
        app_state.current_index = args.n - 1


@register_command("remove", "Remove an app from stack")
def cmd_remove(args, app_state: AppState):
    """Remove an app from stack."""
    cur = app_state.current_app
    app_state.remove_from_stack(args.app)


@register_command("add-current", "Add current app to stack")
def cmd_add_current(args, app_state: AppState):
    """Add current app to stack."""
    current_app = PLATFORM.current_app_name()
    
    # Validate that we got a real app name
    if not current_app or current_app.strip() == "":
        print(f"Error: Could not determine current application name", file=sys.stderr)
        logger.error("add-current command failed: got empty app name")
        exit(1)
    
    # Check for helper processes
    if current_app in MacOS.HELPER_PROCESSES or "app_mode_loader" in current_app.lower():
        print(f"Error: Detected helper process '{current_app}' instead of real app. Please manually specify the app name.", file=sys.stderr)
        logger.warning(f"add-current detected helper process: '{current_app}'")
        exit(1)
    
    position = max(0, args.position)
    if current_app not in app_state:
        app_state.insert(position, current_app)


@register_command("remove-current", "Remove current app from stack")
def cmd_remove_current(args, app_state: AppState):
    """Remove current app from stack."""
    current_app = PLATFORM.current_app_name()
    app_state.remove_from_stack(current_app)


@register_command("set-mapping", "Set a key-to-app mapping")
def cmd_set_mapping(args, app_state: AppState):
    """Set a mapping from key to app."""
    app = args.app if args.app is not None else PLATFORM.current_app_name()
    app_state[args.key] = app


@register_command("open-mapping", "Open app by mapping key")
def cmd_open_mapping(args, app_state: AppState):
    """Open app by mapping key and update stack order."""
    try:
        app = app_state[args.key]
        assert app is not None
        app_state.current_app = app
    except KeyError as e:
        print(str(e), file=sys.stderr)
        exit(1)


@register_command("get-mapping", "Get app name for a mapping key")
def cmd_get_mapping(args, app_state: AppState):
    """Get app by mapping key without opening."""
    app = app_state.get(args.key)
    if app is None:
        print(f"Error: No mapping found for key '{args.key}'", file=sys.stderr)
        exit(1)
    print(app)


@register_command("move", "Move an app to a different index in the stack")
def cmd_move(args, app_state: AppState):
    """Move an app to a different index in the stack."""
    # Always use the currently visible app from platform if not explicitly provided
    platform_app = PLATFORM.current_app_name()
    app = args.app if args.app is not None else platform_app
    
    # Try to find the app in the stack (with case-insensitive matching)
    found_app = app_state.find_app_in_stack(app)
    
    if found_app is None:
        # App not found, add the platform's current app to the stack
        logger.debug(f"App '{app}' not in stack, adding platform app '{platform_app}' first")
        app_state.append(platform_app)
        app_to_move = platform_app
    else:
        # Use the found app (might be different case)
        app_to_move = found_app
        # If we're using platform app but found a different case, log it
        if app == platform_app and found_app != platform_app:
            logger.debug(f"Found app '{found_app}' in stack (case differs from platform '{platform_app}')")
    
    if not (1 <= args.index <= len(app_state)):
        print(f"Error: Index {args.index} out of range (1-{len(app_state)})", file=sys.stderr)
        exit(1)
    
    # Convert 1-based index to 0-based
    app_state.move_app_to_index(app_to_move, args.index - 1)


@register_command("move-up", "Move an app up in the stack")
def cmd_move_up(args, app_state: AppState):
    """Move an app up in the stack (towards index 1)."""
    # Always use the currently visible app from platform if not explicitly provided
    platform_app = PLATFORM.current_app_name()
    app = args.app if args.app is not None else platform_app
    
    # Try to find the app in the stack (with case-insensitive matching)
    found_app = app_state.find_app_in_stack(app)
    
    if found_app is None:
        # App not found, add the platform's current app to the stack
        logger.debug(f"App '{app}' not in stack, adding platform app '{platform_app}' first")
        app_state.append(platform_app)
        app_to_move = platform_app
    else:
        app_to_move = found_app
    
    if args.count < 1:
        print(f"Error: Count must be at least 1", file=sys.stderr)
        exit(1)
    
    app_state.move_app_up(app_to_move, args.count)


@register_command("move-down", "Move an app down in the stack")
def cmd_move_down(args, app_state: AppState):
    """Move an app down in the stack (towards higher index)."""
    # Always use the currently visible app from platform if not explicitly provided
    platform_app = PLATFORM.current_app_name()
    app = args.app if args.app is not None else platform_app
    
    # Try to find the app in the stack (with case-insensitive matching)
    found_app = app_state.find_app_in_stack(app)
    
    if found_app is None:
        # App not found, add the platform's current app to the stack
        logger.debug(f"App '{app}' not in stack, adding platform app '{platform_app}' first")
        app_state.append(platform_app)
        app_to_move = platform_app
    else:
        app_to_move = found_app
    
    if args.count < 1:
        print(f"Error: Count must be at least 1", file=sys.stderr)
        exit(1)
    
    app_state.move_app_down(app_to_move, args.count)


def parse_args() -> Namespace:
    """Parse command line arguments."""
    parser = ArgumentParser(description="Manage app state and key mappings")
    setup_parser(parser)
    args = parser.parse_args()
    if not args.cmd:
        parser.print_help()
        exit(0)
    return args


if __name__ == "__main__":
    args = parse_args()

    with state() as app_state:
        # Get command handler from registry
        if args.cmd not in COMMANDS:
            logger.error(f"Unknown command '{args.cmd}'")
            print(f"Error: Unknown command '{args.cmd}'", file=sys.stderr)
            exit(1)

        # Log command execution
        cmd_args = {k: v for k, v in vars(args).items() if k != "cmd" and v is not None}
        logger.info(f"Executing command: {args.cmd} with args: {cmd_args}")

        handler = COMMANDS[args.cmd]["handler"]
        handler(args, app_state)

        logger.debug(f"State after command: {app_state.to_dict()}")

        # Print state after command execution
        print(json.dumps(app_state.to_dict(), indent=2))
