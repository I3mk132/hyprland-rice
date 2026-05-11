import app from "ags/gtk4/app"
import style from "./style.scss"
import { createDashboard } from "./src/widget"

app.start({
  // Compiled SCSS is injected as application CSS
  css: style,

  // Instance name used by `ags toggle <name>`
  instanceName: "uni-dashboard",

  main() {
    // Instantiate the layer-shell window (starts hidden)
    createDashboard()
  },

  // Requesting the instance a second time toggles visibility
  requestHandler(request, res) {
    // Ensure we are comparing the string value of the request
    if (String(request) === "toggle") {
        // Use the lowercase 'app' you imported on line 1
        const win = app.get_window("uni-dashboard")
        if (win) win.visible = !win.visible
    }
    res("ok")
},
})