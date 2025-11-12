set -e 

ln -s "$PWD/scripts/iterm/itermctl.py" "$HOME/.local/bin/itermctl"
chmod +x "$HOME/.local/bin/itermctl"
npm run build
pip install iterm2
