#!/usr/bin/env bash

# Output folder
VIDEOS_DIR="$HOME/Videos/Recordings"
mkdir -p "$VIDEOS_DIR"

FILENAME="$VIDEOS_DIR/recording_$(date +'%Y-%m-%d_%H-%M-%S').mp4"

# Check if wf-recorder is already running
if pgrep -x "wf-recorder" >/dev/null; then
  pkill -INT wf-recorder
  notify-send -u low "Screen Recorder" "Recording saved to $VIDEOS_DIR"
  exit 0
fi

MODE=$1

if [ "$MODE" == "area" ]; then
  GEOM=$(slurp)
  if [ -z "$GEOM" ]; then
    exit 1 # Canceled area selection
  fi
  notify-send "Screen Recorder" "Recording selected area..."
  wf-recorder -a -g "$GEOM" -f "$FILENAME" --pixel-format yuv420p &
else
  notify-send "Screen Recorder" "Recording full screen..."
  wf-recorder -a -f "$FILENAME" --pixel-format yuv420p &
fi
