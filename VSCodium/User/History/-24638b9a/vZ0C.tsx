import { createState, createComputed, For } from "gnim";
import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0"; // Added Gdk for keyval constants
import scheduleData from "../schedule.json";

const [time, setTime] = createState(new Date());
setInterval(() => {
    setTime(new Date());
}, 1000);

const [data] = createState(scheduleData);
const [isVisible, setIsVisible] = createState(true); // Added visibility state

const timeToMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

const classStatus = createComputed(() => {
    // ... (keep your existing classStatus logic exactly the same)
    const now = time(); 
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayStr = days[now.getDay()];
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const todayClasses = scheduleData
        .filter((c: any) => c.day === todayStr)
        .sort((a: any, b: any) => timeToMins(a.start) - timeToMins(b.start));

    for (const cls of todayClasses) {
        const startMins = timeToMins(cls.start);
        const endMins = timeToMins(cls.end);

        if (nowMins >= startMins && nowMins < endMins) {
            const left = endMins - nowMins;
            const h = Math.floor(left / 60);
            const m = left % 60;
            return `🔴 In Class: ${cls.name} (Ends in ${h > 0 ? h + 'h ' : ''}${m}m)`;
        } else if (nowMins < startMins) {
            const left = startMins - nowMins;
            const h = Math.floor(left / 60);
            const m = left % 60;
            return `⏳ Next: ${cls.name} in ${h > 0 ? h + 'h ' : ''}${m}m`;
        }
    }
    return "🎉 No more classes today!";
});

export default function ScheduleWidget() {
    return (
        <window
            name="class-schedule"
            cssClasses={["schedule-window"]}
            visible={isVisible()} // Bind to our new state
            setup={(widget) => {
                // Create a key event controller for GTK4
                const keyController = new Gtk.EventControllerKey();
                
                keyController.connect("key-pressed", (_controller, keyval) => {
                    // Close on Escape
                    if (keyval === Gdk.KEY_Escape) {
                        setIsVisible(false);
                        return true; // Event handled
                    }
                    
                    // Example: Do something else on 'r' or 'R'
                    if (keyval === Gdk.KEY_r || keyval === Gdk.KEY_R) {
                        console.log("R pressed - you could trigger a data refresh here!");
                        return true;
                    }
                    
                    return false; // Event not handled, pass it on
                });

                widget.add_controller(keyController);
            }}
        >
            <revealer revealChild={isVisible()} transitionDuration={400}>
                <box cssClasses={["schedule-container"]} orientation={Gtk.Orientation.VERTICAL}>
                    
                    <box cssClasses={["header"]} orientation={Gtk.Orientation.VERTICAL}>
                        <label 
                            cssClasses={["clock"]} 
                            label={createComputed(() => time().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }))} 
                        />
                        <label 
                            cssClasses={["status"]} 
                            label={classStatus} 
                        />
                    </box>

                    <scrolledwindow cssClasses={["class-list"]} vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}>
                        <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
                            <For each={data}>
                                {(cls) => (
                                    <box cssClasses={["class-card"]} orientation={Gtk.Orientation.VERTICAL}>
                                        <label cssClasses={["class-name"]} label={cls.name} halign={Gtk.Align.START} />
                                        <box cssClasses={["class-details"]}>
                                            <label cssClasses={["class-time"]} label={`${cls.start} - ${cls.end}`} />
                                            <label cssClasses={["class-room"]} label={cls.room} hexpand={true} halign={Gtk.Align.END} />
                                        </box>
                                    </box>
                                )}
                            </For>
                        </box>
                    </scrolledwindow>
                </box>
            </revealer>
        </window>
    );
}