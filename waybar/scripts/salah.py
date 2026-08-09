#!/usr/bin/env python3
import urllib.request
import json
import datetime
import os

# Configuration
CITY = "Istanbul"
COUNTRY = "Turkey"
METHOD = 13  # 13 is Diyanet İşleri Başkanlığı (Official for Turkey)
CACHE_FILE = os.path.expanduser("~/.cache/waybar_salah.json")
PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

def fetch_from_api():
    url = f"http://api.aladhan.com/v1/timingsByCity?city={CITY}&country={COUNTRY}&method={METHOD}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Waybar-Salah-Widget/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data['data']
    except Exception:
        return None

def get_prayer_data():
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # 1. Try to read from cache first
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                cache = json.load(f)
                # If cache is from today, use it
                if cache.get('date') == today:
                    return cache['data']
        except Exception:
            pass

    # 2. If no valid cache for today, fetch from API
    data = fetch_from_api()
    if data:
        # Save new data to cache
        try:
            os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
            with open(CACHE_FILE, 'w') as f:
                json.dump({'date': today, 'data': data}, f)
        except Exception:
            pass
        return data
    
    # 3. Fallback: If offline and API fails, just use whatever is in the cache
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                return json.load(f)['data']
        except Exception:
            pass
            
    return None

def main():
    data = get_prayer_data()
    
    # If completely offline and no cache exists yet
    if not data:
        print(json.dumps({"text": "🕌 Offline", "tooltip": "No internet and no cache found."}))
        return

    timings = data['timings']
    
    now = datetime.datetime.now()
    current_time_str = now.strftime("%H:%M")
    
    # Default to Fajr of the next day if we are past Isha
    next_prayer = "Fajr"
    next_time = timings["Fajr"]
    
    # Determine the *next* prayer
    for prayer in PRAYERS:
        if current_time_str < timings[prayer]:
            next_prayer = prayer
            next_time = timings[prayer]
            break

    # Build the Tooltip with all prayers
    tooltip_lines = [f"🕌 Prayer Times in {CITY}"]
    tooltip_lines.append(f"📅 {data['date']['readable']}")
    tooltip_lines.append("---------------------")
    
    for prayer in PRAYERS:
        # Put a pointer next to the upcoming prayer in the tooltip
        if prayer == next_prayer:
            tooltip_lines.append(f"👉 {prayer.ljust(7)} : {timings[prayer]}")
        else:
            tooltip_lines.append(f"   {prayer.ljust(7)} : {timings[prayer]}")

    # Output formatted JSON for Waybar
    waybar_output = {
        "text": f"🕌 {next_prayer} {next_time}",
        "tooltip": "\n".join(tooltip_lines),
        "class": next_prayer.lower() # Allows you to style specific prayers in style.css if you want
    }
    
    print(json.dumps(waybar_output))

if __name__ == "__main__":
    main()