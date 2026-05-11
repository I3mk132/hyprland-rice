#!/bin/bash

STATE_FILE="/tmp/pomodoro.state"
END_FILE="/tmp/pomodoro.end"

# إنشاء الملفات إذا لم تكن موجودة
if [ ! -f "$STATE_FILE" ]; then
    echo "INACTIVE" > "$STATE_FILE"
fi

case "$1" in
    menu)
        # واجهة Rofi الخفيفة لاختيار الوقت
        choice=$(echo -e "🍅 25 Min Work\n🍅 1 Hour Work\n🍅 2 Hour Work\n🍅 50 Min Work\n☕ 5 Min Break\n☕ 10 Min Break\n☕ 15 Min Break\n☕ 30 Min Break\n☕ 1 Hour Break\n🛑 Stop" | rofi -dmenu -p "Pomodoro Timer:" -lines 3 -width 20)
        
        case "$choice" in
            "🍅 25 Min Work")
                echo "WORK" > "$STATE_FILE"
                echo $(($(date +%s) + 25*60)) > "$END_FILE"
                ;;
            "🍅 1 Hour Work")
                echo "WORK" > "$STATE_FILE"
                echo $(($(date +%s) + 60*60)) > "$END_FILE"
                ;;
            "🍅 2 Hour Min Work")
                echo "WORK" > "$STATE_FILE"
                echo $(($(date +%s) + 120*60)) > "$END_FILE"
                ;;
            "🍅 50 Min Work")
                echo "WORK" > "$STATE_FILE"
                echo $(($(date +%s) + 50*60)) > "$END_FILE"
                ;;
            "☕ 5 Min Break")
                echo "BREAK" > "$STATE_FILE"
                echo $(($(date +%s) + 5*60)) > "$END_FILE"
                ;;
            "☕ 10 Min Break")
                echo "BREAK" > "$STATE_FILE"
                echo $(($(date +%s) + 10*60)) > "$END_FILE"
                ;;
            "☕ 15 Min Break")
                echo "BREAK" > "$STATE_FILE"
                echo $(($(date +%s) + 15*60)) > "$END_FILE"
                ;;
            "☕ 30 Min Break")
                echo "BREAK" > "$STATE_FILE"
                echo $(($(date +%s) + 30*60)) > "$END_FILE"
                ;;
            "☕ 1 Hour Break")
                echo "BREAK" > "$STATE_FILE"
                echo $(($(date +%s) + 60*60)) > "$END_FILE"
                ;;
            "🛑 Stop")
                echo "INACTIVE" > "$STATE_FILE"
                ;;
        esac
        # تحديث Waybar فوراً بعد الاختيار
        pkill -RTMIN+8 waybar
        ;;
    *)
        # حساب الوقت المتبقي وتحديث حالة Waybar
        state=$(cat "$STATE_FILE")
        if [ "$state" == "INACTIVE" ]; then
            # الحالة المطفية (زر دائري فقط)
            echo '{"text": "⏱️", "class": "inactive", "tooltip": "Pomodoro - Inactive"}'
        else
            end_time=$(cat "$END_FILE")
            current_time=$(date +%s)
            left=$((end_time - current_time))

            if [ $left -le 0 ]; then
                # انتهاء الوقت
                notify-send -u critical "Pomodoro" "Time is up!"
                echo "INACTIVE" > "$STATE_FILE"
                echo '{"text": "⏱️", "class": "inactive"}'
            else
                mins=$((left / 60))
                secs=$((left % 60))
                time_str=$(printf "%02d:%02d" $mins $secs)
                
                # إرسال البيانات للـ Waybar
                if [ "$state" == "WORK" ]; then
                    echo '{"text": "🍅 '$time_str'", "class": "work"}'
                elif [ "$state" == "BREAK" ]; then
                    echo '{"text": "☕ '$time_str'", "class": "break"}'
                fi
            fi
        fi
        ;;
esac