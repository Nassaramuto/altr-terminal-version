# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ALTR is a mobile-first AI fitness web application that uses MediaPipe Pose for real-time exercise tracking. Currently implementing a push-up tracker with plans to expand to other exercises.

## Architecture

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (mobile-first design)
- **Pose Detection**: MediaPipe Pose with 3D landmarks
- **Deployment**: Static site (can be hosted on GitHub Pages, Netlify, etc.)

## Directory Structure

```
ALTR-app/
├── index.html              # Main HTML entry point
├── css/
│   ├── style.css          # Main styles and responsive design
│   └── components.css     # UI component styles
├── js/
│   ├── app.js            # Application initialization
│   ├── camera.js         # Camera setup and management
│   ├── pose-detector.js  # MediaPipe Pose integration
│   ├── pushup-tracker.js # Push-up counting logic
│   ├── ui-controller.js  # UI updates and display
│   └── utils.js          # Helper functions
├── assets/
│   └── sounds/           # Audio feedback files
├── backend/              # (Legacy - to be removed)
└── frontend/             # (Legacy - to be removed)
```

## Development Commands

```bash
# Start local development server (using Python)
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000

# Or using Live Server VS Code extension
# Right-click index.html -> "Open with Live Server"
```

## Key Features

### Push-up Tracker
- Full-screen camera view (mobile responsive)
- Real-time elbow angle tracking
- Rep counting with quality assessment
- Visual feedback overlay

### MediaPipe Integration
- 33 pose landmarks with 3D coordinates
- 2D skeleton overlay on video
- Optimized for mobile performance
- No server-side processing required

## Pose Landmark Reference

Key landmarks for push-up tracking:
- 11, 12: Shoulders
- 13, 14: Elbows  
- 15, 16: Wrists
- 23, 24: Hips

## Angle Calculation

The app calculates angles between three points (e.g., shoulder-elbow-wrist) to track exercise form:
- Push-up down position: elbow angle < 90°
- Push-up up position: elbow angle > 160°

## Mobile Optimization

1. **Full-screen video**: Uses viewport units and object-fit
2. **Touch-friendly UI**: Large tap targets, minimal controls
3. **Performance**: RequestAnimationFrame for smooth rendering
4. **Orientation**: Handles portrait/landscape changes

## Development Guidelines

1. **Module Pattern**: Each JS file exports a single module
2. **Event-Driven**: Modules communicate via custom events
3. **Mobile-First CSS**: Base styles for mobile, enhance for desktop
4. **Progressive Enhancement**: Core functionality works without latest features
5. **Performance**: Minimize DOM updates, use CSS transforms