// pushup-tracker.js - Push-up counting logic

const PushupTracker = {
    // State
    repCount: 0,
    currentState: 'waiting', // 'waiting', 'ready', 'down', 'up'
    lastElbowAngle: null,
    smoothedAngle: null,
    
    // Configuration
    config: {
        angleThresholdDown: 90,    // Elbow angle for down position
        angleThresholdUp: 160,     // Elbow angle for up position
        partialRepThreshold: 110,  // Minimum angle for partial rep
        smoothingFactor: 0.3,      // Angle smoothing
        minVisibility: 0.5,        // Minimum landmark visibility
        horizontalThreshold: 0.25  // Threshold for horizontal body position
    },

    // Callbacks
    onRepComplete: null,
    onAngleUpdate: null,
    onStateChange: null,

    /**
     * Initialize tracker with callbacks
     * @param {Object} callbacks - Event callbacks
     */
    init(callbacks = {}) {
        this.onRepComplete = callbacks.onRepComplete || (() => {});
        this.onAngleUpdate = callbacks.onAngleUpdate || (() => {});
        this.onStateChange = callbacks.onStateChange || (() => {});
        
        this.reset();
    },

    /**
     * Process pose landmarks
     * @param {Object} poseData - Pose detection results
     */
    processPose(poseData) {
        if (!poseData || !poseData.landmarks) return;

        const landmarks = poseData.landmarks;
        
        // Check if key landmarks are visible
        if (!this.areKeyLandmarksVisible(landmarks)) {
            this.updateState('waiting');
            return;
        }

        // Check if in push-up position
        if (!Utils.isHorizontalPosition(landmarks)) {
            this.updateState('waiting');
            return;
        }

        // Calculate elbow angles (average of both arms)
        const leftElbowAngle = this.calculateElbowAngle(landmarks, 'left');
        const rightElbowAngle = this.calculateElbowAngle(landmarks, 'right');
        
        if (leftElbowAngle === null && rightElbowAngle === null) {
            return;
        }

        // Use the average of visible elbows
        let currentAngle;
        if (leftElbowAngle !== null && rightElbowAngle !== null) {
            currentAngle = (leftElbowAngle + rightElbowAngle) / 2;
        } else {
            currentAngle = leftElbowAngle || rightElbowAngle;
        }

        // Smooth the angle
        if (this.smoothedAngle === null) {
            this.smoothedAngle = currentAngle;
        } else {
            this.smoothedAngle = Utils.smooth(this.smoothedAngle, currentAngle, this.config.smoothingFactor);
        }

        // Update angle display
        this.onAngleUpdate(Math.round(this.smoothedAngle));

        // Track push-up state
        this.trackPushupState(this.smoothedAngle);
    },

    /**
     * Check if key landmarks are visible
     * @param {Array} landmarks - Pose landmarks
     * @returns {boolean}
     */
    areKeyLandmarksVisible(landmarks) {
        const keyIndices = [
            Utils.POSE_LANDMARKS.LEFT_SHOULDER,
            Utils.POSE_LANDMARKS.RIGHT_SHOULDER,
            Utils.POSE_LANDMARKS.LEFT_ELBOW,
            Utils.POSE_LANDMARKS.RIGHT_ELBOW,
            Utils.POSE_LANDMARKS.LEFT_WRIST,
            Utils.POSE_LANDMARKS.RIGHT_WRIST
        ];

        // At least one complete arm should be visible
        const leftArmVisible = 
            Utils.isLandmarkVisible(landmarks[Utils.POSE_LANDMARKS.LEFT_SHOULDER], this.config.minVisibility) &&
            Utils.isLandmarkVisible(landmarks[Utils.POSE_LANDMARKS.LEFT_ELBOW], this.config.minVisibility) &&
            Utils.isLandmarkVisible(landmarks[Utils.POSE_LANDMARKS.LEFT_WRIST], this.config.minVisibility);

        const rightArmVisible = 
            Utils.isLandmarkVisible(landmarks[Utils.POSE_LANDMARKS.RIGHT_SHOULDER], this.config.minVisibility) &&
            Utils.isLandmarkVisible(landmarks[Utils.POSE_LANDMARKS.RIGHT_ELBOW], this.config.minVisibility) &&
            Utils.isLandmarkVisible(landmarks[Utils.POSE_LANDMARKS.RIGHT_WRIST], this.config.minVisibility);

        return leftArmVisible || rightArmVisible;
    },

    /**
     * Calculate elbow angle
     * @param {Array} landmarks - Pose landmarks
     * @param {string} side - 'left' or 'right'
     * @returns {number|null} Angle in degrees
     */
    calculateElbowAngle(landmarks, side) {
        const indices = side === 'left' ? {
            shoulder: Utils.POSE_LANDMARKS.LEFT_SHOULDER,
            elbow: Utils.POSE_LANDMARKS.LEFT_ELBOW,
            wrist: Utils.POSE_LANDMARKS.LEFT_WRIST
        } : {
            shoulder: Utils.POSE_LANDMARKS.RIGHT_SHOULDER,
            elbow: Utils.POSE_LANDMARKS.RIGHT_ELBOW,
            wrist: Utils.POSE_LANDMARKS.RIGHT_WRIST
        };

        const shoulder = landmarks[indices.shoulder];
        const elbow = landmarks[indices.elbow];
        const wrist = landmarks[indices.wrist];

        if (!Utils.isLandmarkVisible(shoulder, this.config.minVisibility) ||
            !Utils.isLandmarkVisible(elbow, this.config.minVisibility) ||
            !Utils.isLandmarkVisible(wrist, this.config.minVisibility)) {
            return null;
        }

        return Utils.calculateAngle(shoulder, elbow, wrist);
    },

    /**
     * Track push-up state machine
     * @param {number} angle - Current elbow angle
     */
    trackPushupState(angle) {
        switch (this.currentState) {
            case 'waiting':
                if (angle > this.config.angleThresholdUp) {
                    this.updateState('ready');
                }
                break;

            case 'ready':
            case 'up':
                if (angle < this.config.angleThresholdDown) {
                    this.updateState('down');
                    this.lastElbowAngle = angle;
                }
                break;

            case 'down':
                if (angle > this.config.angleThresholdUp) {
                    // Complete rep
                    this.completeRep(this.lastElbowAngle < this.config.angleThresholdDown);
                    this.updateState('up');
                } else if (angle < this.lastElbowAngle) {
                    // Track deepest point
                    this.lastElbowAngle = angle;
                }
                break;
        }
    },

    /**
     * Complete a rep
     * @param {boolean} isGoodRep - Whether rep was performed correctly
     */
    completeRep(isGoodRep) {
        this.repCount++;
        const repQuality = isGoodRep ? 'good' : 
                          (this.lastElbowAngle < this.config.partialRepThreshold ? 'partial' : 'shallow');
        
        this.onRepComplete({
            count: this.repCount,
            quality: repQuality,
            angle: this.lastElbowAngle
        });
    },

    /**
     * Update state
     * @param {string} newState - New state
     */
    updateState(newState) {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.onStateChange(newState);
        }
    },

    /**
     * Reset tracker
     */
    reset() {
        this.repCount = 0;
        this.currentState = 'waiting';
        this.lastElbowAngle = null;
        this.smoothedAngle = null;
    },

    /**
     * Get current stats
     * @returns {Object} Current tracking stats
     */
    getStats() {
        return {
            repCount: this.repCount,
            currentState: this.currentState,
            currentAngle: this.smoothedAngle ? Math.round(this.smoothedAngle) : null
        };
    }
};

// Make PushupTracker globally available
window.PushupTracker = PushupTracker;