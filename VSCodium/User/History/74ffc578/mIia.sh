#!/bin/bash

# Pomodoro timer for Waybar
# State file
STATE_FILE="/tmp/pomodoro_state"
PID_FILE="/tmp/pomodoro_pid"

start_timer() {
    local seconds=$1
    local label=$2

    # Kill any existing timer
    stop_timer

    # Save state
    echo "$(($(date +%s) + seconds)) $label" > "$STATE_FILE"

    # Background countdown loop
    (
        end_time=$(($(date +%s) + seconds))
        while [ "$(date +%s)" -lt "$end_time" ]; do
            sleep 0.5
            # Wake waybar module
            pkill -RTMIN+9 waybar 2>/dev/null
        done
        # Timer finished — send notification
        notify-send "🍅 Pomodoro" "$label timer done!" -u normal 2>/dev/null
        rm -f "$STATE_FILE" "$PID_FILE"
        pkill -RTMIN+9 waybar 2>/dev/null
    ) &

    echo $! > "$PID_FILE"
    pkill -RTMIN+9 waybar 2>/dev/null
}

stop_timer() {
    if [ -f "$PID_FILE" ]; then
        kill "$(cat "$PID_FILE")" 2>/dev/null
        rm -f "$PID_FILE"
    fi
    rm -f "$STATE_FILE"
    pkill -RTMIN+9 waybar 2>/dev/null
}

get_status() {
    if [ ! -f "$STATE_FILE" ]; then
        echo '{"text":"🍅","tooltip":"Click to start Pomodoro","class":"idle"}'
        return
    fi

    read -r end_time label < "$STATE_FILE"
    now=$(date +%s)
    remaining=$((end_time - now))

    if [ "$remaining" -le 0 ]; then
        rm -f "$STATE_FILE"
        echo '{"text":"🍅","tooltip":"No timer running","class":"idle"}'
        return
    fi

    mins=$((remaining / 60))
    secs=$((remaining % 60))
    time_str=$(printf "%d:%02d" "$mins" "$secs")

    echo "{\"text\":\"🍅 ${time_str}\",\"tooltip\":\"${label} — ${time_str} left\",\"class\":\"running\"}"
}

case "$1" in
    start)
        # Show rofi menu
        choice=$(printf "⏲️ 30 min\n⏳ 1 hour\n🕒 2 hours\n🛑 Stop" | rofi -dmenu -p "🍅 Pomodoro" -theme-str '
            window { width: 250px; 
                    location: northwest; 
                    x-offset: 460px; 
                    transparency: "background";
                    border-radius: 30px;
                    }
            listview {
                lines: 2;
                columns: 1;
                cycle: true;
                spacing: 0px;
            }
            element-icon {
                size: 0px; margin: 0px; padding: 0px; border: 0px; spacing: 0px;
            }
            element-text {
                spacing: 0px; highlight: "bold";
                font: "Fira Code 20";
            }
            inputbar {
                enabled: false;
            }
            element {
                padding: 0px 0 10px 0;
            }
        ')
        case "$choice" in
            "⏲️ 30 min")  start_timer 1800  "30 min" ;;
            "⏳ 1 hour")  start_timer 3600  "1 hour" ;;
            "🕒 2 hours") start_timer 7200  "2 hours" ;;
            "🛑 Stop")    stop_timer ;;
        esac
        ;;
    status)
        get_status
        ;;
    stop)
        stop_timer
        ;;
esac