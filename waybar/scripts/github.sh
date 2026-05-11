#!/bin/bash

threshhold_green=0
threshhold_yellow=5
threshhold_red=50

token=`cat ~/.config/.secrets/notifications.token`
raw=`curl -s -u I3mk132:${token} https://api.github.com/notifications 2>/dev/null`
count=`echo "$raw" | jq '. | length' 2>/dev/null`

# Default to 0 if count is empty or not a number
if ! [[ "$count" =~ ^[0-9]+$ ]]; then
    count=0
fi

css_class="green"

if [ "$count" -gt $threshhold_yellow ]; then
    css_class="yellow"
fi

if [ "$count" -gt $threshhold_red ]; then
    css_class="red"
fi

printf '{"text": "%d","tooltip":"$tooltip","class": "%s"}' "$count" "$css_class"