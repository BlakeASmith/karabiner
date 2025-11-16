set -e 

if [ ! -e "$HOME/.local/bin/itermctl" ]; then
    ln -s "$PWD/scripts/iterm/itermctl.py" "$HOME/.local/bin/itermctl"
fi
chmod +x "$HOME/.local/bin/itermctl"
npm run build
pip install iterm2

if [ ! -e "$HOME/.local/bin/keybindstate" ]; then
    ln -s "$PWD/scripts/keybindstate.py" "$HOME/.local/bin/keybindstate"
fi
chmod +x "$HOME/.local/bin/keybindstate"
