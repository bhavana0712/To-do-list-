# Matcha Strawberry To-Do Garden

A pastel, matcha-strawberry inspired to-do list that feels like a cozy stationery card. Add new tasks on the entry page, nurture them in the garden view, and celebrate their completion on a dedicated archive page. Everything runs in the browser with `localStorage`, so no backend is required.

## ✨ Features

- **Three-page flow**
  - `index.html`: add fresh tasks with a creamy matcha form.
  - `garden.html`: review active tasks, mark them complete, and enjoy celebratory overlays.
  - `completed.html`: revisit finished tasks, restore them, or clear them out.
- **Playful matcha–strawberry theme** with floating stickers, pill inputs, candy-colored task chips, and gentle animations.
- **Local persistence** via `localStorage`, so tasks survive refreshes per browser.
- **Responsive layout** that keeps the card centered and touch-friendly on phones.

## 🛠️ Tech Stack

- Plain HTML for structure
- CSS (custom properties + responsive layout) for the matcha aesthetic
- Vanilla JavaScript for task storage, rendering, and cross-page interactions

## 🚀 Getting Started

1. **Clone or download** this repository.
2. Open the project folder in your editor.
3. Launch `index.html` in your browser (double-click or use a simple HTTP server such as `npx serve`).
4. Add tasks → head to the Garden page → mark them done → view them on the Completed page.

> Tip: Because everything runs locally, each visitor/browser keeps its own task list.

## 🌐 Deploying

Any static host works. Two quick options:

- **GitHub Pages**: push the repo, then enable Pages (Settings → Pages → Branch `main`, folder `/`). Your site will appear at `https://<username>.github.io/<repo>/`.
- **Netlify / Vercel**: drag-and-drop the folder or connect the repo—no configuration needed.

Once deployed, share the public URL so friends can enjoy the matcha-strawberry planner too.

---

Made with matcha, strawberries, and plenty of cozy vibes. ♡
