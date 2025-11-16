-- Project level nvim config
-- To use, enable `vim.opt.exrc = true` in your main config

vim.keymap.set("n", "<leader>bb", ":!npm run build<CR>", { desc = "build" })
