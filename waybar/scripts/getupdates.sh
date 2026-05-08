threshhold_green=0
threshhold_yellow=15
threshhold_red=100

# -------------------------------------------------------
# Calculate the available updates for pacman and AUR (with yay)
# -------------------------------------------------------
list_updates_arch=$(checkupdates | sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2};?)?)?[mGK]//g")
list_updates_aur=$(yay -Qua | sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2};?)?)?[mGK]//g")

if ! updates_arch=$(checkupdates | wc -l); then
    updates_arch=0
fi

if ! updates_aur=$(yay -Qua | wc -l); then
    updates_aur=0  # fixed typo: was updtates_aur
fi

list_updates=""

if [ "$updates_arch" -gt 0 ]; then
    list_updates+="${list_updates_arch}"
    if [ "$updates_aur" -gt 0 ]; then
        list_updates+="\n"
    fi
fi

if [ "$updates_aur" -gt 0 ]; then
    list_updates+="${list_updates_aur}"
fi

# -------------------------------------------------------
# Output in JSON format for Waybar custom/updates module
# -------------------------------------------------------
updates=$(("$updates_arch" + "$updates_aur"))
tooltip="Update System (<span size=\"small\">${updates} Package(s):"$'\n'"${list_updates}</span>"

if [ "$updates" -lt $threshhold_yellow ]; then
    css_class="green"
elif [ "$updates" -lt $threshhold_red ]; then
    css_class="yellow"
else
    css_class="red"
fi

jq -nc \
    --arg text "$updates" \
    --arg tooltip "$tooltip" \
    --arg class "$css_class" \
    '{
        text: $text,
        tooltip: $tooltip,
        class: $class
    }'