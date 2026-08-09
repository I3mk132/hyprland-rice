#!/bin/bash

# If an argument "toggle" is passed, trigger the connection change
if [ "$1" = "toggle" ]; then
    status=$(warp-cli status | grep -o "Connected\|Disconnected")
    if [ "$status" = "Connected" ]; then
        warp-cli disconnect
    else
        warp-cli connect
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