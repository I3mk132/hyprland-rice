#!/bin/bash

# Define the path to your Waybar config
WAYBAR_DIR="$HOME/.config/waybar"

# Use Wofi to present a menu and get the user's choice
THEME=$(echo -e "Mocha\nGruvbox\nTokyoNight" | wofi --dmenu --prompt "Select Theme:")

# Link the chosen theme to colors.css based on the selection
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
    *)
        # Exit if the user presses Esc or clicks away
        exit 0
        ;;
esac

# Send a signal to Waybar to reload its CSS without killing the process entirely
killall -SIGUSR2 waybar