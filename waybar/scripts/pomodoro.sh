#!/usr/bin/env bash
# =============================================================
#  pomodoro.sh — Waybar Pomodoro Module
#  Usage:
#    pomodoro.sh status        → JSON for Waybar (stdout)
#    pomodoro.sh start 30      → start 30-min timer
#    pomodoro.sh start 60      → start 60-min timer
#    pomodoro.sh start 120     → start 120-min timer
#    pomodoro.sh stop          → stop/reset timer
#    pomodoro.sh toggle        → start default (25min) or stop
# =============================================================

STATE_FILE="${XDG_RUNTIME_DIR:-/tmp}/pomodoro_state"

# ── helpers ────────────────────────────────────────────────────
now() { date +%s; }

save_state() {
    # end_time minutes label
    echo "$1 $2 $3" > "$STATE_FILE"
}

load_state() {
    if [[ -f "$STATE_FILE" ]]; then
        read -r END_TIME TOTAL_MINS LABEL < "$STATE_FILE"
    else
        END_TIME=0; TOTAL_MINS=0; LABEL=""
    fi
}

clear_state() {
    rm -f "$STATE_FILE"
}

notify() {
    command -v notify-send &>/dev/null && \
        notify-send -u normal -i "⏰" "Pomodoro" "$1"
}

# ── commands ────────────────────────────────────────────────────
cmd_start() {
    local mins="${1:-25}"
    local end=$(( $(now) + mins * 60 ))
    local label
    case "$mins" in
        30)  label="30 min" ;;
        60)  label="1 hour" ;;
        120) label="2 hours" ;;
        *)   label="${mins} min" ;;
    esac
    save_state "$end" "$mins" "$label"
    notify "Started: $label focus session 🍅"
}

cmd_stop() {
    clear_state
    notify "Pomodoro stopped."
}

cmd_status() {
    load_state
    local n
    n=$(now)

    if [[ "$END_TIME" -eq 0 || "$n" -ge "$END_TIME" ]]; then
        # Timer done or not running
        if [[ "$END_TIME" -gt 0 && "$n" -ge "$END_TIME" ]]; then
            # Was running, just finished — fire notification once then clear
            notify "🎉 Pomodoro done! Take a break."
            clear_state
            echo '{"text":"🍅 Done!","tooltip":"Session complete — take a break!","class":"done"}'
        else
            echo '{"text":"🍅","tooltip":"No active session\nClick to start 25 min","class":"idle"}'
        fi
        return
    fi

    local remaining=$(( END_TIME - n ))
    local mins=$(( remaining / 60 ))
    local secs=$(( remaining % 60 ))
    local total_secs=$(( TOTAL_MINS * 60 ))
    local elapsed=$(( total_secs - remaining ))
    local pct=$(( elapsed * 100 / total_secs ))

    # Progress bar (10 chars)
    local filled=$(( pct / 10 ))
    local bar=""
    for (( i=0; i<10; i++ )); do
        if (( i < filled )); then bar+="█"; else bar+="░"; fi
    done

    local display
    if (( mins > 0 )); then
        display=$(printf "🍅 %d:%02d" "$mins" "$secs")
    else
        display=$(printf "🍅 0:%02d" "$secs")
    fi

    local tooltip
    tooltip=$(printf "Focus: %s\n%s %d%%\n%d min remaining" \
        "$LABEL" "$bar" "$pct" "$(( remaining / 60 + 1 ))")

    # Urgency class
    local class="running"
    (( remaining <= 300 )) && class="urgent"   # last 5 min
    (( remaining <= 60  )) && class="critical"  # last 1 min

    printf '{"text":"%s","tooltip":"%s","class":"%s","percentage":%d}\n' \
        "$display" "$tooltip" "$class" "$pct"
}

cmd_menu() {
    # Rofi/wofi menu to pick duration
    local choice
    choice=$(printf "30 min\n1 hour\n2 hours\nStop" | \
        rofi -dmenu -p "🍅 Pomodoro" -theme-str 'window {width: 200px;}' 2>/dev/null \
        || printf "30 min\n1 hour\n2 hours\nStop" | \
        wofi --dmenu --prompt "🍅 Pomodoro" 2>/dev/null)

    case "$choice" in
        "30 min")  cmd_start 30  ;;
        "1 hour")  cmd_start 60  ;;
        "2 hours") cmd_start 120 ;;
        "Stop")    cmd_stop      ;;
    esac
}

# ── dispatch ────────────────────────────────────────────────────
case "${1:-status}" in
    status)       cmd_status ;;
    start)        cmd_start "${2:-25}" ;;
    stop)         cmd_stop ;;
    menu)         cmd_menu ;;
    toggle)
        load_state
        if [[ "$END_TIME" -gt 0 && "$(now)" -lt "$END_TIME" ]]; then
            cmd_stop
        else
            cmd_menu
        fi
        ;;
    *)
        echo "Usage: $0 {status|start <mins>|stop|menu|toggle}" >&2
        exit 1
        ;;
esac