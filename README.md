# Hyprland Rice

My Arch Linux + [Hyprland](https://hypr.land) desktop. Pick a wallpaper and the whole
desktop recolors itself to match it: bar, terminal, launcher, notifications, GTK apps
and window borders.

<!-- TODO: add a screenshot at assets/screenshot.png and uncomment:
![Desktop](assets/screenshot.png)
-->

## What's included

| Role | Program | Config |
| --- | --- | --- |
| Compositor | Hyprland | [`hypr/`](hypr) |
| Lock / idle | hyprlock, hypridle, swaylock | [`hypr/`](hypr), [`swaylock/`](swaylock) |
| Bar | Waybar | [`waybar/`](waybar) |
| Launcher | Rofi | [`rofi/`](rofi) |
| Notifications | SwayNotificationCenter | [`swaync/`](swaync) |
| Logout menu | wlogout | [`wlogout/`](wlogout) |
| Terminal | kitty | [`kitty/`](kitty) |
| Shell | zsh, Oh My Zsh, Powerlevel10k | [`.zshrc`](.zshrc) |
| Editors | Neovim (LazyVim), VSCodium | [`nvim/`](nvim), [`VSCodium/`](VSCodium) |
| Files | Thunar, yazi | [`Thunar/`](Thunar), [`yazi/`](yazi) |
| Colors | matugen, pywal | [`matugen/`](matugen) |
| Wallpapers | awww | [`backgrounds/`](backgrounds) |
| GTK themes | Gruvbox, Catppuccin, Nordic, Dracula, Tokyo Night and more | [`theme/`](theme) |

## How the theming works

`SUPER + T` opens a wallpaper picker in Rofi, then [`bin/walset-backend`](bin/walset-backend):

1. sets the wallpaper with `awww`
2. generates colors with `pywal` and `matugen`
3. writes them through the [`matugen/templates`](matugen/templates) into Waybar, Hyprland,
   GTK 3/4, kitty, Rofi, yazi and swaync
4. reloads kitty, Waybar and swaync

Because of step 3, files like `waybar/colors.css` and `hypr/look/colors.conf` change every
time you switch wallpaper.

## Install

> [!WARNING]
> Written for my machine: an Arch laptop with a single `eDP-1` monitor. Read the scripts
> and expect to adjust things. Try `./install.sh --dry-run` first.

**1. Install the packages** (a few may come from the AUR):

```sh
yay -S --needed hyprland hyprlock hypridle hyprshot waybar rofi swaync wlogout swaylock-effects \
  awww matugen python-pywal kitty zsh yazi thunar neovim \
  cliphist wl-clipboard wf-recorder slurp playerctl brightnessctl jq libnotify blueman kdeconnect \
  ttf-jetbrains-mono-nerd ttf-cascadia-code-nerd ttf-fira-code
```

**2. Install the shell framework and prompt:**

```sh
RUNZSH=no CHSH=no KEEP_ZSHRC=yes sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
```

**3. Clone and link.** The clone is large because of the wallpapers.

```sh
git clone https://github.com/I3mk132/hyprland-rice.git ~/dotfiles
cd ~/dotfiles
./install.sh
```

`install.sh` symlinks everything into `~/.config`, plus `.zshrc` and `~/.local/bin/walset`.
Existing files are moved to `~/.config-backup-<date>` first. It doesn't install packages.

Make sure `~/.local/bin` is on your `PATH`, then log in to Hyprland.

## Keybindings

`SUPER` is the main modifier.

| Keys | Action |
| --- | --- |
| `SUPER + Q` | Terminal |
| `SUPER + W` | Close window |
| `SUPER + R` | App launcher |
| `SUPER + E` | File manager |
| `SUPER + T` | Pick wallpaper and recolor |
| `SUPER + N` | Notification center |
| `SUPER + SHIFT + D` | Do not disturb |
| `SUPER + F` | Fullscreen |
| `SUPER + V` | Float window |
| `SUPER + B` | Center floating window |
| `SUPER + SHIFT + P` | Pin window |
| `SUPER + P` / `SUPER + J` | Pseudo-tile / toggle split |
| `SUPER + 1-0` | Switch workspace |
| `SUPER + SHIFT + 1-0` | Move window to workspace |
| `SUPER + S` / `SUPER + SHIFT + S` | Show / send to scratchpad |
| `SUPER + SHIFT + V` | Clipboard history |
| `SUPER + SPACE` | Switch keyboard layout (us, ara) |
| `SUPER + SHIFT + L` | Lock screen |
| `SUPER + SHIFT + O` | Toggle Cloudflare WARP |
| `SUPER + SHIFT + M` | Exit Hyprland |
| `Print` | Screenshot a region |
| `SUPER + Print` / `SUPER + SHIFT + Print` | Screenshot a monitor / window |
| `SUPER + SHIFT + R` / `SUPER + ALT + SHIFT + R` | Record screen / selected area |
| `SUPER + SHIFT + X` | Stop recording |

All bindings are in [`hypr/keybindings/keybindings1.conf`](hypr/keybindings/keybindings1.conf).

## Make it yours

| What | Where |
| --- | --- |
| Monitor | [`hypr/monitors.conf`](hypr/monitors.conf) |
| Default wallpaper | [`hypr/hyprpaper.conf`](hypr/hyprpaper.conf) |
| Keyboard layouts | [`hypr/input/input1.conf`](hypr/input/input1.conf) |
| Prayer times city | `CITY` and `COUNTRY` in [`waybar/scripts/salah.py`](waybar/scripts/salah.py) |
| Bar modules | [`waybar/config.jsonc`](waybar/config.jsonc) |

### Waybar modules that need secrets

These read private values from `~/.config/.secrets/`, which is not part of this repo.
Create the files you need, or remove the module from `waybar/config.jsonc`.

| Module | File | Contents |
| --- | --- | --- |
| `custom/github` | `notifications.token` | GitHub token with the `notifications` scope |
| `custom/tailscale` | `hostname.txt`, `hostnames.txt` | Tailscale hosts |
| `custom/wol` | `ip-address.txt`, `mac-address.txt` | Wake-on-LAN target |

Other bar modules use `warp-cli`, `yay`, `tailscale` and `wl-gammarelay`, so install those
if you enable the modules.

## Credits

- Rofi launchers, applets and power menus: [adi1090x/rofi](https://github.com/adi1090x/rofi) (GPL-3.0)
- VSCodium cursor trail: [this Reddit post](https://www.reddit.com/r/vscode/comments/11e66xh/i_made_neovide_alike_cursor_effect_on_vscode/)
- Neovim config: based on [LazyVim starter](https://github.com/LazyVim/starter); see the license files in `nvim/`
- GTK themes and wallpapers belong to their original creators. If something here is yours
  and you want it credited or removed, please open an issue.

## License

My own configs and scripts are under the [MIT License](LICENSE). Third-party parts keep their
original licenses: `rofi/` is GPL-3.0, `nvim/` and `nvim/pywal/` keep their own license files, and `theme/` and `backgrounds/` are not covered by
the MIT License.
