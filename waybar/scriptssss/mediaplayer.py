#!/usr/bin/env python3
import subprocess
import json

def get_media_info():
    try:
        # Get status (Playing/Paused)
        status = subprocess.check_output(['playerctl', 'status'], text=True).strip()
        # Get metadata (Artist - Title)
        metadata = subprocess.check_output(['playerctl', 'metadata', '--format', '{{artist}} - {{title}}'], text=True).strip()
        
        icon = "" if status == "Playing" else ""
        
        return json.dumps({"text": f"{icon} {metadata}", "class": status.lower()})
    except:
        return json.dumps({"text": "", "class": "stopped"})

print(get_media_info())
