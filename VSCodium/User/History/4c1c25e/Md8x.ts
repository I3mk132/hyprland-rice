import app from "ags/gtk4/app";
import style from "./style.scss";
import ScheduleWidget from "./widget/dashboard"; // Ensure this matches your file name

app.start({
  css: style,
  main() {
    // 1. Instantiate your widget (this executes the Gnim function and returns the GTK Window)
    const widget = ScheduleWidget();
    
    // 2. Attach it to the AGS application singleton
    // (We cast 'as any' just in case the LSP complains about Gnim's return type vs GTK's native window type)
    app.add_window(widget as any);
  },
});