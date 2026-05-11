import requests
import json
from datetime import datetime

# Configuration (You can later move this to a separate JSON config file)
CITY = "Istanbul"
COUNTRY = "Turkey"
# Method 13 is Turkey's Diyanet İşleri Başkanlığı
API_URL = f"http://api.aladhan.com/v1/timingsByCity?city={CITY}&country={COUNTRY}&method=13"

def get_prayer_times():
    try:
        response = requests.get(API_URL)
        data = response.json()['data']['timings']
        # Filter out unnecessary times if you only want the main 5 + Sunrise
        return {k: v for k, v in data.items() if k in ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']}
    except Exception:
        return None

def main():
    times = get_prayer_times()
    if not times:
        print(json.dumps({"text": "API Error", "tooltip": "Could not fetch times"}))
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
            
    # If all prayers today are done, show Fajr for tomorrow (simplification: just shows Fajr)
    if not next_prayer:
        next_prayer = "Fajr"
        next_time = times["Fajr"]

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