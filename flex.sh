#!/bin/bash

hyprctl dispatch exec "kitty yazi"
sleep 0.5
hyprctl dispatch exec "kitty btop"
sleep 0.5
hyprctl dispatch exec "kitty nvim dotfiles/CCode.c"
sleep 0.5
hyprctl dispatch exec "kitty cava"
sleep 0.5
hyprctl dispatch exec "kitty fastfetch"
sleep 0.5
hyprctl dispatch exec "kitty tty-clock -sc"
