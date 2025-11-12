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


if __name__ == "__main__":
    args = parse()
    if args.action == "vsplit":
        iterm2.run_until_complete(vsplit)
    else:
        print("worked")
