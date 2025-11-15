set -e 

ln -s "$PWD/scripts/iterm/itermctl.py" "$HOME/.local/bin/itermctl"
chmod +x "$HOME/.local/bin/itermctl"
npm run build
pip install iterm2

ln -s "$PWD/scripts/keybindstate.py" "$HOME/.local/bin/keybindstate"
chmod +x "$HOME/.local/bin/keybindstate"
