#!/usr/bin/env bash
# Symlinks this repo into ~/.config. Anything already there is moved to a
# timestamped backup first. Packages are not installed: see README.md.
#
#   ./install.sh            install
#   ./install.sh --dry-run  print what would happen, change nothing

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP="$HOME/.config-backup-$(date +%Y%m%d-%H%M%S)"
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

run() {
  if $DRY_RUN; then echo "  would run: $*"; else "$@"; fi
}

# link <path inside repo> <destination>
link() {
  local src="$REPO/$1" dest="$2"
  if [[ ! -e "$src" ]]; then
    echo "skip    $1 (not in repo)"
    return
  fi
  if [[ "$(readlink -f "$dest" 2>/dev/null)" == "$(readlink -f "$src")" ]]; then
    echo "ok      $dest"
    return
  fi
  if [[ -e "$dest" || -L "$dest" ]]; then
    local saved="$BACKUP/${dest#"$HOME"/}"
    echo "backup  $dest"
    run mkdir -p "$(dirname "$saved")"
    run mv "$dest" "$saved"
  fi
  echo "link    $dest"
  run mkdir -p "$(dirname "$dest")"
  run ln -s "$src" "$dest"
}

for dir in Thunar backgrounds gtk-3.0 gtk-4.0 hypr kitty matugen rofi swaylock swaync theme waybar wlogout yazi; do
  link "$dir" "$HOME/.config/$dir"
done

# VSCodium's directory holds live app data, so only link individual files.
link VSCodium/User/settings.json   "$HOME/.config/VSCodium/User/settings.json"
link VSCodium/matugen-theme.json   "$HOME/.config/VSCodium/matugen-theme.json"
link VSCodium/vscodium_scripts     "$HOME/.config/VSCodium/vscodium_scripts"

link bin/walset         "$HOME/.local/bin/walset"
link bin/walset-backend "$HOME/.local/bin/walset-backend"
link .zshrc             "$HOME/.zshrc"

link nvim "$HOME/.config/nvim"

if [[ -d "$BACKUP" ]]; then
  echo "Previous files saved in $BACKUP"
fi
$DRY_RUN && echo "Dry run: nothing was changed."
echo "Done. Reload with: hyprctl reload"
