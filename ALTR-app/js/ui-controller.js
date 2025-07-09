// ui-controller.js - UI updates and display

const UIController = {
    elements: {
        loadingScreen: null,
        repCount: null,
        angleDisplay: null,
        angleValue: null,
        repQuality: null,
        qualityText: null,
        statusMessage: null,
        repCounter: null
    },

    qualityMessages: {
        good: 'Good Rep!',
        partial: 'Partial Rep',
        shallow: 'Go Deeper',
        ready: 'Ready',
        waiting: 'Get in Position',
        down: 'Push Up!',
        up: 'Go Down'
    },

    /**
     * Initialize UI controller
     */
    init() {
        // Cache DOM elements
        this.elements.loadingScreen = document.getElementById('loadingScreen');
        this.elements.repCount = document.getElementById('repCount');
        this.elements.angleDisplay = document.getElementById('angleDisplay');
        this.elements.angleValue = document.querySelector('.angle-value');
        this.elements.repQuality = document.getElementById('repQuality');
        this.elements.qualityText = document.querySelector('.quality-text');
        this.elements.statusMessage = document.getElementById('statusMessage');
        this.elements.repCounter = document.querySelector('.rep-counter');

        // Handle orientation changes
        this.handleOrientationChange();
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
    },

    /**
     * Hide loading screen
     */
    hideLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 300);
        }
    },

    /**
     * Show loading screen with message
     * @param {string} message - Loading message
     */
    showLoading(message = 'Initializing...') {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'flex';
            this.elements.loadingScreen.classList.remove('hidden');
            const loadingText = this.elements.loadingScreen.querySelector('p');
            if (loadingText) loadingText.textContent = message;
        }
    },

    /**
     * Update rep counter
     * @param {number} count - Rep count
     */
    updateRepCount(count) {
        if (this.elements.repCount) {
            this.elements.repCount.textContent = count;
            this.elements.repCounter.classList.add('pulse');
            setTimeout(() => {
                this.elements.repCounter.classList.remove('pulse');
            }, 300);
        }
    },

    /**
     * Update angle display
     * @param {number} angle - Elbow angle
     */
    updateAngle(angle) {
        if (this.elements.angleValue) {
            this.elements.angleValue.textContent = angle || '--';
            
            // Change color based on angle
            if (angle !== null) {
                if (angle < 90) {
                    this.elements.angleValue.style.color = '#4ade80'; // Green
                } else if (angle < 110) {
                    this.elements.angleValue.style.color = '#fbbf24'; // Yellow
                } else {
                    this.elements.angleValue.style.color = '#60a5fa'; // Blue
                }
            }
        }
    },

    /**
     * Show rep quality feedback
     * @param {string} quality - Rep quality type
     */
    showRepQuality(quality) {
        if (!this.elements.repQuality) return;

        // Remove all quality classes
        this.elements.repQuality.classList.remove('good', 'partial', 'ready', 'visible');
        
        // Add new quality class
        this.elements.repQuality.classList.add(quality, 'visible');
        this.elements.qualityText.textContent = this.qualityMessages[quality] || quality;

        // Auto-hide after 2 seconds
        clearTimeout(this.qualityTimeout);
        this.qualityTimeout = setTimeout(() => {
            this.elements.repQuality.classList.remove('visible');
        }, 2000);
    },

    /**
     * Update status message
     * @param {string} message - Status message
     */
    updateStatus(message) {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
        }
    },

    /**
     * Update UI based on tracker state
     * @param {string} state - Tracker state
     */
    updateState(state) {
        switch (state) {
            case 'waiting':
                this.updateStatus('Position yourself for push-ups');
                this.elements.repCounter.classList.remove('active');
                break;
            case 'ready':
                this.updateStatus('Ready! Start your push-ups');
                this.elements.repCounter.classList.add('active');
                this.showRepQuality('ready');
                break;
            case 'down':
                this.updateStatus('Push up to complete rep');
                break;
            case 'up':
                this.updateStatus('Lower down for next rep');
                break;
        }
    },

    /**
     * Handle rep completion
     * @param {Object} repData - Rep completion data
     */
    onRepComplete(repData) {
        this.updateRepCount(repData.count);
        this.showRepQuality(repData.quality);
        
        // Vibrate on mobile if available
        if ('vibrate' in navigator) {
            navigator.vibrate(repData.quality === 'good' ? 100 : 50);
        }
    },

    /**
     * Handle errors
     * @param {string} error - Error message
     */
    showError(error) {
        this.updateStatus(`Error: ${error}`);
        this.elements.statusMessage.style.color = '#ef4444';
    },

    /**
     * Handle orientation changes
     */
    handleOrientationChange() {
        // Adjust UI for landscape mode
        const isLandscape = window.innerWidth > window.innerHeight;
        document.body.classList.toggle('landscape', isLandscape);
    },

    /**
     * Reset UI
     */
    reset() {
        this.updateRepCount(0);
        this.updateAngle(null);
        this.updateStatus('Position yourself for push-ups');
        this.elements.repCounter.classList.remove('active');
        if (this.elements.repQuality) {
            this.elements.repQuality.classList.remove('visible');
        }
    }
};

// Make UIController globally available
window.UIController = UIController;