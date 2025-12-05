/**
 * pbnj configuration
 * @see https://github.com/bhavnicksm/pbnj
 */
export default {
  // Site name shown in title
  name: "pbnj",

  // Path to logo image
  logo: "/logo.png",

  // How paste IDs are generated: 'sandwich' | 'short' | 'uuid'
  idStyle: "sandwich",

  // Show public paste listing on homepage
  homepage: true,

  // Sort order for pastes on homepage: 'newest' | 'oldest'
  sortOrder: "oldest",

  // Maximum paste size (e.g., '1mb', '500kb')
  maxPasteSize: "1mb",

  // Theme preset - controls syntax highlighting and UI colors
  // Available themes:
  //   Light: 'flexoki-light' (default), 'github-light', 'gruvbox-light', 'catppuccin-latte'
  //   Dark: 'flexoki-dark', 'github-dark', 'nord', 'gruvbox-dark', 'dracula',
  //         'catppuccin-frappe', 'catppuccin-macchiato', 'catppuccin-mocha'
  theme: "flexoki-light",

  // Footer configuration (optional)
  // footer: {
  //   text: "spread the code 🥪",
  //   link: "https://github.com/bhavnicksm/pbnj",
  // },
};
