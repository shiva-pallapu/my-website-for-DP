# 🎂 Happy Birthday — Ra Devi

A beautiful, interactive birthday wish website featuring an animated curtain reveal, a 3D photo carousel, a real-time age tracker, and a virtual cake.

## ✨ Features

- **🎭 Curtain Reveal** — Click "OPEN" to reveal a romantic birthday experience behind animated velvet curtains
- **📸 Photo Gallery** — View 11 photos in a stunning 3D Three.js carousel or a grid view with lightbox
- **⏱️ Real-Time Age Tracker** — Live counter showing years, months, days, hours, minutes, and seconds since birth
- **🎂 Virtual Cake** — Interactive 3D CSS cake with candles you can "cut" by clicking
- **💌 Special Message** — A heartfelt birthday letter
- **🌸 Romantic Theme** — Floating particles, confetti bursts, sparkle effects, and floating hearts

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   node server.js
   ```

3. Open your browser and visit:
   - **Main page:** [http://localhost:3000](http://localhost:3000)
   - **Gallery page:** [http://localhost:3000/gallery.html](http://localhost:3000/gallery.html)
   - **Cake page:** [http://localhost:3000/cake.html](http://localhost:3000/cake.html)

## 📁 Project Structure

```
├── server.js              # Express server
├── package.json
└── public/
    ├── index.html          # Main page — curtain reveal + story flow
    ├── gallery.html        # Photo gallery — 3D carousel + grid view
    ├── cake.html           # Interactive cake page
    ├── css/
    │   └── style.css       # All styles (romantic birthday theme)
    ├── js/
    │   ├── main.js         # Main page logic (curtains, story steps, age tracker)
    │   ├── gallery.js      # Gallery page logic (Three.js carousel, grid, lightbox)
    │   └── cake.js         # Cake page logic (cake interactions)
    └── images/
        ├── photo-1.jpg     # Your photos (11 total)
        ├── photo-2.jpg
        └── ...
```

## 🖼️ Photo Gallery

The gallery offers two viewing modes:

1. **🎠 3D Carousel** — An interactive Three.js carousel where photos float in a circle. Drag to rotate, click a photo to view it full-size, or use the navigation buttons. Auto-rotates after 3 seconds of inactivity.

2. **📸 Grid View** — A responsive grid layout with hover zoom effects. Click any photo to open it in the lightbox.

## 🛠️ Customization

- **Birth date:** Edit `BIRTH_DATE` in `public/js/main.js`
- **Photo captions:** Edit the `photoData` array in `public/js/gallery.js` and the `photos` array in the `createGalleryCards` function in `public/js/main.js`
- **Message content:** Edit the HTML in `public/index.html` (step 5 section)
- **Colors/theme:** Edit CSS variables in `public/css/style.css`

## 📦 Dependencies

- [Express](https://expressjs.com/) — Web server
- [Three.js](https://threejs.org/) — 3D carousel (loaded via CDN)
- [Google Fonts](https://fonts.google.com/) — Great Vibes, Playfair Display, Montserrat (loaded via CDN)
