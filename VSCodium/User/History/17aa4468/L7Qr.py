#!/usr/bin/env python3
import os
import json
import requests
import subprocess
import time

CONFIG_FILE = os.path.expanduser("~/.config/waybar/scripts/salah_config.json")

# Gruvbox ANSI Color Codes
YELLOW = '\033[38;2;250;189;47m'
GREEN = '\033[38;2;184;187;38m'
ORANGE = '\033[38;2;254;128;25m'
RED = '\033[38;2;251;73;52m'
FG = '\033[38;2;235;219;178m'
RESET = '\033[0m'

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    return {"city": "Istanbul", "country": "Turkey", "method": 13}

def save_config(city, country):
    config = load_config()
    config["city"] = city
    config["country"] = country
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)

def fetch_data(config):
    url = f"http://api.aladhan.com/v1/timingsByCity?city={config['city']}&country={config['country']}&method={config['method']}"
    try:
        response = requests.get(url)
        return response.json().get('data')
    except Exception:
        return None

def validate_location(city, country):
    """Pings the API to check if the city/country combination actually exists."""
    print(f"\n{FG}Validating location with the database...{RESET}")
    url = f"http://api.aladhan.com/v1/timingsByCity?city={city}&country={country}&method=13"
    try:
        response = requests.get(url)
        data = response.json()
        if data.get("code") == 200:
            return True
        return False
    except Exception:
        return False

def clear_screen():
    os.system('clear')

def main():
    while True:
        clear_screen()
        config = load_config()
        print(f"{ORANGE}=== Salah Configuration & Times ==={RESET}\n")
        print(f"{FG}Current Location:{RESET} {YELLOW}{config['city']}, {config['country']}{RESET}\n")
        
        print(f"{FG}Fetching today's data...{RESET}\n")
        data = fetch_data(config)
        
        if data:
            timings = data['timings']
            date_readable = data['date']['readable']
            hijri_date = f"{data['date']['hijri']['day']} {data['date']['hijri']['month']['en']} {data['date']['hijri']['year']}"
            
            print(f"{GREEN}Date:{RESET} {date_readable} ({hijri_date})")
            print(f"{ORANGE}-----------------------------------{RESET}")
            
            prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
            for p in prayers:
                print(f"{YELLOW}{p.ljust(10)}{RESET} : {FG}{timings.get(p, 'N/A')}{RESET}")
            print(f"{ORANGE}-----------------------------------{RESET}\n")
        else:
            print(f"{RED}Error fetching data. Please check your internet connection.{RESET}\n")

        print(f"{GREEN}Options:{RESET}")
        print(f"[{YELLOW}1{RESET}] Change Location (Country -> City)")
        print(f"[{YELLOW}2{RESET}] Exit")
        
        choice = input(f"\n{FG}Select an option (1/2): {RESET}")
        
        if choice == '1':
            print(f"\n{ORANGE}--- Update Location ---{RESET}")
            new_country = input(f"{FG}Enter Country (e.g., Turkey): {RESET}").strip()
            new_city = input(f"{FG}Enter City (e.g., Istanbul): {RESET}").strip()
            
            if new_city and new_country:
                if validate_location(new_city, new_country):
                    save_config(new_city, new_country)
                    print(f"{GREEN}Location validated and saved successfully!{RESET}")
                    # Signal Waybar to refresh the module immediately
                    subprocess.run(["killall", "-SIGUSR1", "waybar"], capture_output=True)
                    time.sleep(1) # Pause briefly so you can read the success message
                else:
                    print(f"{RED}Error: Could not find prayer times for '{new_city}, {new_country}'.{RESET}")
                    print(f"{YELLOW}Please check your spelling and try again.{RESET}")
                    input(f"\n{FG}Press Enter to return to menu...{RESET}")
                    
        elif choice == '2':
            clear_screen()
            break

if __name__ == "__main__":
    main()