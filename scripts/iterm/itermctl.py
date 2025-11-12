#!/usr/bin/env python3
# Script for controlling Iterm2
# Takes an action name as input and performs the action using iterm2 API
# :: depends on https://github.com/julienXX/terminal-notifier
# :: install with `brew install terminal-notifier`
# :: depends on iterm2 Python library
# :: install with `pip install iterm2`
# :: you will also need to enable python API in iterm2 settings, and install the python runtime (scripts > manager> install runtime)
# :: finally, set "allow all apps to connect" (under "magic" in the settings)
import subprocess
from argparse import ArgumentParser, Namespace

import iterm2


def parse() -> Namespace:
    parser = ArgumentParser()
    # one subparser for each action, in case there are params
    subparsers = parser.add_subparsers(dest="action", required=True)
    subparsers.add_parser("vsplit")
    subparsers.add_parser("hsplit")
    subparsers.add_parser("newtab")
    subparsers.add_parser("newwindow")
    color_parser = subparsers.add_parser("setcolor")
    color_parser.add_argument("color_num", type=int, choices=[1, 2, 3, 4, 5])
    subparsers.add_parser("test")

    return parser.parse_args()


async def vsplit(connection):
    print("something")
    app = await iterm2.async_get_app(connection)
    assert app is not None
    window = app.current_terminal_window
    assert window is not None
    tab = window.current_tab
    assert tab is not None
    session = tab.current_session
    assert session is not None
    await session.async_split_pane(vertical=True)


async def hsplit(connection):
    app = await iterm2.async_get_app(connection)
    assert app is not None
    window = app.current_terminal_window
    assert window is not None
    tab = window.current_tab
    assert tab is not None
    session = tab.current_session
    assert session is not None
    await session.async_split_pane(vertical=False)


async def newtab(connection):
    app = await iterm2.async_get_app(connection)
    assert app is not None
    window = app.current_terminal_window
    assert window is not None
    await window.async_create_tab()


async def newwindow(connection):
    app = await iterm2.async_get_app(connection)
    assert app is not None
    await app.async_create_window()


# Color definitions for tabs (RGB values 0-1)
COLORS = {
    1: iterm2.Color(1.0, 0.2, 0.2),  # Red
    2: iterm2.Color(0.2, 0.8, 0.2),  # Green
    3: iterm2.Color(0.2, 0.2, 1.0),  # Blue
    4: iterm2.Color(1.0, 0.8, 0.2),  # Yellow/Orange
    5: iterm2.Color(0.8, 0.2, 0.8),  # Magenta/Purple
}


async def setcolor(connection, color_num: int):
    app = await iterm2.async_get_app(connection)
    assert app is not None
    window = app.current_terminal_window
    assert window is not None
    tab = window.current_tab
    assert tab is not None
    color = COLORS.get(color_num)
    if color:
        await tab.async_set_tab_color(color)


if __name__ == "__main__":
    args = parse()
    if args.action == "vsplit":
        iterm2.run_until_complete(vsplit)
    elif args.action == "hsplit":
        iterm2.run_until_complete(hsplit)
    elif args.action == "newtab":
        iterm2.run_until_complete(newtab)
    elif args.action == "newwindow":
        iterm2.run_until_complete(newwindow)
    elif args.action == "setcolor":
        async def setcolor_wrapper(connection):
            await setcolor(connection, args.color_num)
        iterm2.run_until_complete(setcolor_wrapper)
    else:
        print("worked")
