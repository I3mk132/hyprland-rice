import requests
import json
import os
from datetime import datetime

# Define file paths
CONFIG_DIR = os.path.expanduser("~/.config/waybar/scripts")
CONFIG_FILE = os.path.join(CONFIG_DIR, "salah_config.json")
CACHE_FILE = os.path.join(CONFIG_DIR, "salah_cache.json")

# Ensure the scripts directory exists
os.makedirs(CONFIG_DIR, exist_ok=True)

# Default config if file doesn't exist
config = {"city": "Istanbul", "country": "Turkey", "method": 13}

if os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, "r") as f:
        config = json.load(f)
else:
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)

API_URL = f"http://api.aladhan.com/v1/timingsByCity?city={config['city']}&country={config['country']}&method={config['method']}"

def get_prayer_times():
    try:
        # Added a 5-second timeout so Waybar doesn't hang if offline
        response = requests.get(API_URL, timeout=5)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
        data = response.json()['data']['timings']
        # Filter out unnecessary times
        times = {k: v for k, v in data.items() if k in ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']}
        
        # Save the successful fetch to the cache file
        with open(CACHE_FILE, "w") as f:
            json.dump(times, f)
            
        return times
        
    except (requests.exceptions.RequestException, KeyError, ValueError):
        # If the API request fails, try to load from the cache
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

def main():
    times = get_prayer_times()
    
    if not times:
        # Only shows error if both the API fails AND there is no cached data
        print(json.dumps({"text": "Offline", "tooltip": "No API response and no cached data", "class": "error"}))
        return

    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    
    next_prayer = None
    next_time = None

    # Find the next prayer
    for prayer, time_str in times.items():
        if current_time_str < time_str:
            next_prayer = prayer
            next_time = time_str
            break
            
    # If all prayers today are done, show Fajr for tomorrow
    if not next_prayer:
        next_prayer = "Fajr"
        next_time = times.get("Fajr", "00:00")

    # Format the tooltip (Hover calendar)
    tooltip = "🕌 <b>Today's Salah</b>\n\n"
    for p, t in times.items():
        indicator = "👉 " if p == next_prayer else "   "
        tooltip += f"{indicator}{p}: {t}\n"

    # Waybar JSON output
    waybar_data = {
        "text": f"🕌 {next_prayer} {next_time}",
        "tooltip": tooltip.strip(),
        "class": "salah"
    }
    
    print(json.dumps(waybar_data))

if __name__ == "__main__":
    main()