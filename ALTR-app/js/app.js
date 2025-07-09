// app.js - Main application initialization

const App = {
    video: null,
    canvas: null,
    isInitialized: false,

    /**
     * Initialize application
     */
    async init() {
        console.log('ALTR Push-up Tracker - Initializing...');

        try {
            // Get DOM elements
            this.video = document.querySelector('.input-video');
            this.canvas = document.querySelector('.output-canvas');

            if (!this.video || !this.canvas) {
                throw new Error('Required DOM elements not found');
            }

            // Initialize UI
            UIController.init();

            // Initialize camera
            UIController.updateStatus('Requesting camera access...');
            const cameraInitialized = await Camera.init(this.video, this.canvas);
            
            if (!cameraInitialized) {
                throw new Error('Failed to initialize camera');
            }

            // Initialize pose detector
            UIController.updateStatus('Loading pose detection model...');
            await PoseDetector.init(this.canvas, (results) => this.onPoseResults(results));

            // Initialize push-up tracker
            PushupTracker.init({
                onRepComplete: (repData) => UIController.onRepComplete(repData),
                onAngleUpdate: (angle) => UIController.updateAngle(angle),
                onStateChange: (state) => UIController.updateState(state)
            });

            // Start detection
            PoseDetector.startDetection(this.video);

            // Hide loading screen
            UIController.hideLoading();
            UIController.updateStatus('Position yourself for push-ups');

            this.isInitialized = true;

            // Set up event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Initialization error:', error);
            UIController.showError(error.message);
        }
    },

    /**
     * Handle pose detection results
     * @param {Object} results - Pose detection results
     */
    onPoseResults(results) {
        if (!this.isInitialized) return;

        // Process pose for push-up tracking
        PushupTracker.processPose(results);
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause detection when page is hidden
                console.log('Page hidden - pausing detection');
            } else {
                // Resume detection when page is visible
                console.log('Page visible - resuming detection');
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Reset button (optional - add to HTML if needed)
        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.reset());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'r':
                case 'R':
                    this.reset();
                    break;
                case ' ':
                    e.preventDefault();
                    // Space bar can be used for manual rep counting if needed
                    break;
            }
        });
    },

    /**
     * Reset application
     */
    reset() {
        PushupTracker.reset();
        UIController.reset();
        console.log('Tracker reset');
    },

    /**
     * Clean up resources
     */
    cleanup() {
        Camera.stop();
        this.isInitialized = false;
    },

    /**
     * Check browser compatibility
     */
    checkCompatibility() {
        const errors = [];

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            errors.push('Camera API not supported');
        }

        if (!window.MediaPipe) {
            errors.push('MediaPipe not loaded');
        }

        return errors;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check compatibility
    const compatibilityErrors = App.checkCompatibility();
    if (compatibilityErrors.length > 0) {
        UIController.showError(compatibilityErrors.join(', '));
        return;
    }

    // Initialize application
    App.init();
});

// Make App globally available for debugging
window.App = App;