-- bootstrap lazy.nvim, LazyVim and your plugins
require("config.lazy")

os.execute("python ~/.config/nvim/pywal/chadwal.py &> /dev/null &")

local autocmd = vim.api.nvim_create_autocmd

autocmd("Signal", {
  pattern = "SIGUSR1",
  callback = function()
    require("nvchad.utils").reload()
  end,
})
