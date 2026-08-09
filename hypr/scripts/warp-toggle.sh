#!/bin/bash
STATUS=$(warp-cli status | grep -i "Status update" | awk '{print $NF}')

if [ "$STATUS" = "Connected" ]; then
  warp-cli disconnect
  notify-send "WARP" "Disconnected 🔴" --icon=network-vpn-disconnected
else
  warp-cli connect
  notify-send "WARP" "Connected 🟢" --icon=network-vpn
fi
