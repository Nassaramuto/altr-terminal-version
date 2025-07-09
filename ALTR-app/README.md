# ALTR - AI Fitness Coach

ALTR is a mobile-first web application that uses MediaPipe Pose for real-time exercise tracking. Currently featuring a push-up tracker with plans to expand to other exercises.

## 🚀 Features

### Current
- 📱 **Mobile-First Design** - Full-screen video like TikTok/Instagram
- 🎯 **Real-time Push-up Tracking** - Counts reps using elbow angle detection
- 📐 **Live Angle Display** - Shows elbow angle in real-time
- ✅ **Form Feedback** - "Good Rep" vs "Partial Rep" indicators
- 🦴 **2D Skeleton Overlay** - Visual pose tracking on video feed
- 🌐 **No Server Required** - Runs entirely in the browser

### Planned
- 🗣️ Voice feedback and coaching
- 🏋️ Additional exercises (squats, planks, etc.)
- 📊 Workout history and analytics
- 🏆 Challenge modes and gamification
- 👥 Social sharing features

## 🛠️ Tech Stack

- **Vanilla JavaScript** - Clean, modular code structure
- **MediaPipe Pose** - 3D pose detection with 33 landmarks
- **HTML5/CSS3** - Mobile-responsive design
- **No Framework** - Pure JavaScript for simplicity and performance

## 📁 Project Structure

```
ALTR-app/
├── index.html              # Main entry point
├── css/
│   ├── style.css          # Core styles and responsive design
│   └── components.css     # UI component styles
├── js/
│   ├── app.js            # Application initialization
│   ├── camera.js         # Camera management
│   ├── pose-detector.js  # MediaPipe integration
│   ├── pushup-tracker.js # Exercise tracking logic
│   ├── ui-controller.js  # UI updates
│   └── utils.js          # Helper functions
└── assets/
    └── sounds/           # Audio feedback (future)
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ALTR-app
   ```

2. **Start a local server** (choose one):
   ```bash
   # Python
   python3 -m http.server 8000

   # Node.js
   npx http-server -p 8000

   # VS Code Live Server
   # Right-click index.html → "Open with Live Server"
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8000`
   - Allow camera permissions
   - Position yourself for push-ups
   - Start exercising!

## 📱 Usage

1. **Setup**: Position your device so your full body is visible
2. **Get Ready**: Get into push-up position
3. **Exercise**: Perform push-ups - the app will count automatically
4. **Feedback**: Watch the rep counter and angle display
5. **Reset**: Press 'R' key to reset the counter

## 🎮 Controls

- **R** - Reset rep counter
- **Space** - (Reserved for future features)

## 🔧 Configuration

Edit `js/pushup-tracker.js` to adjust:
- `angleThresholdDown`: 90° (elbow angle for down position)
- `angleThresholdUp`: 160° (elbow angle for up position)
- `partialRepThreshold`: 110° (minimum for partial rep)

## 📱 Browser Support

- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (iOS 14.5+)
- ✅ Firefox
- ✅ Edge

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this for your own projects!