import schedule from "../schedule.json"

// Helper to calculate minutes for the progress bar
const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number)
    return h * 60 + m
}

export function Dashboard() {
    // UI State for minimalism: toggle to show full schedule details
    const [expanded, setExpanded] = createState(false)

    // The Smart Tracker Poll: Updates every 60 seconds
    const trackerData = createPoll({ active: null, next: null, progress: 0 }, 60000, () => {
        const now = new Date()
        const currentDay = now.getDay()
        const currentMins = now.getHours() * 60 + now.getMinutes()

        // Get and sort today's schedule
        const todaysCourses = schedule
            .filter(c => c.day === currentDay)
            .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

        let active = null
        let next = null
        let progress = 0

        for (const course of todaysCourses) {
            const startM = toMinutes(course.start)
            const endM = toMinutes(course.end)

            if (currentMins >= startM && currentMins <= endM) {
                active = course
                progress = ((currentMins - startM) / (endM - startM)) * 100
            } else if (currentMins < startM && !next) {
                next = course
            }
        }

        return { active, next, progress }
    })

    return (
        <window 
            name="dashboard" 
            visible={false} 
            anchor={[]} // Empty array centers the window in Wayland
            keymode="on-demand" // Allows us to press Escape to close it
        >
            <box cssClasses={["dashboard-container"]}>
                {/* 1. MINIMALIST START SCREEN: The Smart Tracker */}
                <box cssClasses={["smart-tracker"]} orientation={1}> {/* 1 = Vertical */}
                    <label 
                        cssClasses={["tracker-title"]} 
                        label={trackerData(d => d.active ? "CURRENTLY IN CLASS" : "UPCOMING NEXT")} 
                    />
                    
                    <label 
                        cssClasses={["course-name"]} 
                        label={trackerData(d => d.active ? d.active.course : (d.next ? d.next.course : "Free Time!"))} 
                    />
                    
                    <label 
                        cssClasses={["course-time"]} 
                        label={trackerData(d => d.active ? `${d.active.start} - ${d.active.end}` : (d.next ? `Starts at ${d.next.start}` : "No more classes today."))} 
                    />

                    {/* Decreasing Progress Bar (Only visible if in class) */}
                    <levelbar 
                        cssClasses={["progress-bar"]} 
                        value={trackerData(d => d.active ? (100 - d.progress) / 100 : 0)} 
                        visible={trackerData(d => d.active !== null)}
                    />

                    {/* Expand Button */}
                    <button 
                        cssClasses={["expand-btn"]} 
                        onClicked={() => setExpanded(e => !e)}
                    >
                        <label label={expanded(e => e ? "▲ Hide Details" : "▼ Show Full Schedule")} />
                    </button>
                </box>

                {/* 2. THE DETAILED VIEW: Hidden by default */}
                <box cssClasses={["details-container", expanded(e => e ? "expanded" : "collapsed")]} orientation={1}>
                    {schedule.map(course => (
                        <box cssClasses={["course-card"]}>
                            <label cssClasses={["card-code"]} label={course.code} />
                            <box orientation={1}>
                                <label cssClasses={["card-title"]} label={course.course} />
                                <label cssClasses={["card-meta"]} label={`${course.doctor} • ${course.credit} Credits • ${course.start}-${course.end}`} />
                            </box>
                        </box>
                    ))}
                </box>
            </box>
        </window>
    )
}