echo "Pacman update list:"
checkupdates
echo "AUR update list:"
yay -Qua
read -n1 -rep 'Download updates? (y,n)' UPD
if [[ $UPD == "Y" || $UPD == "y" ]]; then
    yay --noconfirm -Syu
fi