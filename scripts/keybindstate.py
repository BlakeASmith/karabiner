#!/usr/bin/env python3
import json
import os
from argparse import ArgumentParser, Namespace
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import final

STATE_PATH = Path("~/.local/state/keybindstate.json").expanduser()
STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
if not STATE_PATH.exists():
    appstack = []
    appindex = 0
    windowindex = 1
    state = dict(appstack=appstack, appindex=appindex, windowindex=windowindex)
    STATE_PATH.write_text(json.dumps(state))
else:
    state = json.loads(STATE_PATH.read_text())
    appstack = state.get("appstack", [])
    appindex = state.get("appindex", 0)
    windowindex = state.get("windowindex", 1)


def focus_window(app: str, win_number: int):
    cmd = f"""
osascript -e 'tell application "System Events" to tell process "{app}"' \
    -e 'set frontmost to true' \
    -e 'if windows is not {{}} then perform action "AXRaise" of item {win_number} of windows' \
    -e 'end tell'
    """
    print(cmd)
    os.system(cmd)


def parse_args() -> Namespace:
    parser = ArgumentParser()
    subparsers = parser.add_subparsers(dest="cmd")

    switch = subparsers.add_parser("switch")
    _ = switch.add_argument("app")

    _state = subparsers.add_parser("state")
    clear = subparsers.add_parser("clear")
    prev = subparsers.add_parser("prev")
    next = subparsers.add_parser("next")
    last = subparsers.add_parser("last")
    first = subparsers.add_parser("first")
    index = subparsers.add_parser("index")
    _ = index.add_argument("n", type=int)
    remove = subparsers.add_parser("remove")
    _ = remove.add_argument("app")
    win_next = subparsers.add_parser("win-next")
    win_prev = subparsers.add_parser("win-prev")

    args = parser.parse_args()
    if not args.cmd:
        parser.print_help()
        exit(0)
    return args


if __name__ == "__main__":
    args = parse_args()

    try:
        if args.cmd == "switch":
            # expect an app name to be given
            # switch to that app and add to stack
            os.system(f'open -a "{args.app}"')
            # If it isn't there
            if args.app not in appstack:
                appstack.insert(0, args.app)
                appindex = 0
            else:
                # it's there already, so we just go to that position
                appindex = appstack.index(args.app)
        elif args.cmd == "state":
            ...
            # print(json.dumps(state, indent=2))
        elif args.cmd == "clear":
            appindex = 0
            appstack = 0
            windowindex = 1
            state = {"appstack": [], "appindex": 0, "windowindex": 1}
        elif args.cmd == "prev":
            # go back one (to older item, higher index)
            appindex += 1
            # wrap
            if appindex >= len(appstack):
                appindex = 0
            # open whatever it is
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "next":
            # go forward one (to newer item, lower index)
            appindex -= 1
            # wrap
            if appindex < 0:
                appindex = len(appstack) - 1
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "last":
            appindex = len(appstack) - 1
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "first":
            appindex = 0
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "index":
            if 1 <= args.n <= len(appstack):
                print("true?")
                appindex = args.n - 1
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "remove":
            cur = appstack[appindex]
            appstack.remove(args.app)
            if cur in appstack:
                appindex = appstack.index(cur)
        elif args.cmd == "win-next":
            windowindex += 1
            cur = appstack[appindex]
            # The "process" names don't match the app names
            focus_window("iTerm2", windowindex)
        elif args.cmd == "win-prev":
            cur = appstack[appindex]
            windowindex -= 1
            focus_window(cur, windowindex)

    finally:
        # always persist the state
        state["appindex"] = appindex
        state["windowindex"] = windowindex
        STATE_PATH.write_text(json.dumps(state))

        print(json.dumps(state, indent=2))
