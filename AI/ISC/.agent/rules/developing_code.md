---
trigger: always_on
---

# Architecture & Constraints

- **Strict Client-Side Only**: This project uses Vanilla HTML/CSS/JS and LocalStorage. NEVER introduce backend dependencies, databases, or server-side frameworks (like Node.js runtime code) unless explicitly requested.
- **Frameworkless**: Avoid build tools (Webpack/Vite) or heavy frameworks (React/Vue) unless working in a specific app that already uses them.
