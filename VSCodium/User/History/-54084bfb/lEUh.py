#!/usr/bin/env python3
import json
import requests
from datetime import datetime

# Mapping wttr.in weather codes to Nerd Font / Emoji icons
WEATHER_CODES = {
    '113': '☀️', '116': '⛅', '119': '☁️', '122': '☁️', '143': '🌫', '176': '🌦',
    '179': '🌧', '182': '🌧', '185': '🌧', '200': '⛈', '227': '🌨', '230': '❄️',
    '248': '🌫', '260': '🌫', '263': '🌦', '266': '🌦', '281': '🌧', '284': '🌧',
    '293': '🌦', '296': '🌦', '299': '🌧', '302': '🌧', '305': '🌧', '308': '🌧',
    '311': '🌧', '314': '🌧', '317': '🌧', '320': '🌨', '323': '🌨', '326': '🌨',
    '329': '❄️', '332': '❄️', '335': '❄️', '338': '❄️', '350': '🌧', '353': '🌦',
    '356': '🌧', '359': '🌧', '362': '🌧', '365': '🌧', '368': '🌨', '371': '❄️',
    '374': '🌧', '377': '🌧', '386': '⛈', '389': '🌩', '392': '⛈', '395': '❄️'
}

def get_weather():
    try:
        # Fetching data for your current IP location
        r = requests.get("https://wttr.in/?format=j1", timeout=10)
        data = r.json()
        curr = data['current_condition'][0]
        
        # Main bar text
        temp = curr['FeelsLikeC']
        code = curr['weatherCode']
        icon = WEATHER_CODES.get(code, '✨')
        
        # Tooltip construction
        tooltip = f"<b>{curr['weatherDesc'][0]['value']} {curr['temp_C']}°C</b>\n"
        tooltip += f"Feels like: {temp}°C\n"
        tooltip += f"Humidity: {curr['humidity']}%\n\n"

        # Forecast for 3 days
        for i, day in enumerate(data['weather']):
            title = "Today" if i == 0 else "Tomorrow" if i == 1 else day['date']
            tooltip += f"<b>{title}</b>: ⬆️{day['maxtempC']}° ⬇️{day['mintempC']}°\n"
            # Optional: Add sunrise/sunset
            tooltip += f"  🌅 {day['astronomy'][0]['sunrise']}  🌇 {day['astronomy'][0]['sunset']}\n"

        out = {
            "text": f"{icon}  {temp}°C",
            "tooltip": tooltip.strip()
        }
        print(json.dumps(out))
    except Exception:
        print(json.dumps({"text": "󰖐 Off", "tooltip": "Offline"}))

if __name__ == "__main__":
    get_weather()
