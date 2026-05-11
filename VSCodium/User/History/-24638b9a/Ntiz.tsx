import { createState, createComputed, For } from "gnim";
import Gtk from "gi://Gtk?version=4.0";
import scheduleData from "../schedule.json";

// 1. Time Polling: Use standard setInterval with Gnim's createState
const [time, setTime] = createState(new Date());
setInterval(() => {
    setTime(new Date());
}, 1000);

// Put the static JSON data into a reactive state array so <For> can iterate over it properly
const [data] = createState(scheduleData);

// Helper to convert "HH:MM" to total minutes for math comparisons
const timeToMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

// 2. Derived reactive state
const classStatus = createComputed(() => {
    const now = time(); // Accessing the current state
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayStr = days[now.getDay()];
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // Filter and sort today's classes
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

// 3. The main widget component using native GTK4 properties
export default function ScheduleWidget() {
    return (
        <window
            name="class-schedule"
            cssClasses={["schedule-window"]}
            visible={true}
        >
            <revealer revealChild={true} transitionDuration={400}>
                {/* Replaced vertical={true} with orientation={Gtk.Orientation.VERTICAL} */}
                <box cssClasses={["schedule-container"]} orientation={Gtk.Orientation.VERTICAL}>
                    
                    {/* Header: Clock and Status */}
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

                    {/* Body: Replaced scrollarea with scrolledwindow */}
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