#!/bin/bash

# If an argument "toggle" is passed, trigger the connection change
if [ "$1" = "toggle" ]; then
    STATUS=$(warp-cli status | grep -i "Status update" | awk '{print $NF}')

    if [ "$STATUS" = "Connected" ]; then
    warp-cli disconnect
    notify-send "WARP" "Disconnected 🔴" --icon=network-vpn-disconnected
    else
    warp-cli connect
    notify-send "WARP" "Connected 🟢" --icon=network-vpn
    fi
    # Give it a split second to initiate change before updating UI
    sleep 0.2
fi

# Check current status
status=$(warp-cli status | grep -o "Connected\|Disconnected")

if [ "$status" = "Connected" ]; then
    # Connected: Output icon and a class for styling
    echo '{"text": "󰖂", "alt": "on", "tooltip": "WARP: Connected", "class": "connected"}'
else
    # Disconnected: Output distinct icon or muted style
    echo '{"text": "󰖃", "alt": "off", "tooltip": "WARP: Disconnected", "class": "disconnected"}'
fi