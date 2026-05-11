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
    if (request === "toggle") {
      const win = App.get_window("uni-dashboard")
      if (win) win.visible = !win.visible
    }
    res("ok")
  },
})