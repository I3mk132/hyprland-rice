#!/bin/bash

WAYBAR_DIR="$HOME/.config/waybar"

# Added Nord and Dracula to the menu list
THEME=$(echo -e "Mocha\nGruvbox\nTokyoNight\nNord\nDracula" | wofi --dmenu --prompt "Select Theme:")

case "$THEME" in
    "Mocha")
        ln -sf "$WAYBAR_DIR/themes/mocha.css" "$WAYBAR_DIR/colors.css"
        ;;
    "Gruvbox")
        ln -sf "$WAYBAR_DIR/themes/gruvbox.css" "$WAYBAR_DIR/colors.css"
        ;;
    "TokyoNight")
        ln -sf "$WAYBAR_DIR/themes/tokyonight.css" "$WAYBAR_DIR/colors.css"
        ;;
    "Nord")
        ln -sf "$WAYBAR_DIR/themes/nord.css" "$WAYBAR_DIR/colors.css"
        ;;
    "Dracula")
        ln -sf "$WAYBAR_DIR/themes/dracula.css" "$WAYBAR_DIR/colors.css"
        ;;
    *)
        exit 0
        ;;
esac

# Restart Waybar
killall waybar
sleep 0.5
waybar & disown