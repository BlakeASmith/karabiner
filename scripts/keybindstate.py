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
    appindex = -1
    state = dict(appstack=appstack, appindex=appindex)
    STATE_PATH.write_text(json.dumps(state))
else:
    state = json.loads(STATE_PATH.read_text())
    appstack = state.get("appstack", [])
    appindex = state.get("appindex", -1)


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
                appstack.append(args.app)
            else:
                # it's there alredy, so we just go to that position
                _appindex = appstack.index(args.app)
                # invert
                appindex = -(len(appstack) - _appindex)
        elif args.cmd == "state":
            ...
            # print(json.dumps(state, indent=2))
        elif args.cmd == "clear":
            state = {"appstack": [], "appindex": -1}
        elif args.cmd == "prev":
            # go back one
            appindex -= 1
            # wrap
            if abs(appindex) > len(appstack):
                appindex = -1
            # open whatever it is
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "next":
            # go forward one
            appindex += 1
            # wrap
            if appindex >= 0:
                appindex = -len(appstack)
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "last":
            ...
        elif args.cmd == "first":
            ...
        elif args.cmd == "index":
            if 1 <= args.n <= len(appstack):
                print("true?")
                appindex = 0 - args.n
            os.system(f'open -a "{appstack[appindex]}"')
        elif args.cmd == "remove":
            cur = appstack[appindex]
            appstack.remove(args.app)
            if cur in appstack:
                appindex = appstack.index(cur)

    finally:
        # always persist the state
        state["appindex"] = appindex
        STATE_PATH.write_text(json.dumps(state))

        print(json.dumps(state, indent=2))
