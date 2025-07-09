// utils.js - Helper functions

const Utils = {
    /**
     * Calculate angle between three points
     * @param {Object} a - First point {x, y}
     * @param {Object} b - Middle point {x, y} (vertex)
     * @param {Object} c - Third point {x, y}
     * @returns {number} Angle in degrees
     */
    calculateAngle(a, b, c) {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        
        if (angle > 180.0) {
            angle = 360 - angle;
        }
        
        return angle;
    },

    /**
     * Calculate distance between two points
     * @param {Object} a - First point {x, y}
     * @param {Object} b - Second point {x, y}
     * @returns {number} Distance
     */
    distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    },

    /**
     * Check if landmark is visible
     * @param {Object} landmark - MediaPipe landmark
     * @param {number} threshold - Visibility threshold (0-1)
     * @returns {boolean}
     */
    isLandmarkVisible(landmark, threshold = 0.5) {
        return landmark && landmark.visibility > threshold;
    },

    /**
     * Get average of multiple landmarks
     * @param {Array} landmarks - Array of landmarks
     * @returns {Object} Average position {x, y, z}
     */
    getAverageLandmark(landmarks) {
        const sum = landmarks.reduce((acc, landmark) => ({
            x: acc.x + landmark.x,
            y: acc.y + landmark.y,
            z: acc.z + (landmark.z || 0)
        }), { x: 0, y: 0, z: 0 });

        return {
            x: sum.x / landmarks.length,
            y: sum.y / landmarks.length,
            z: sum.z / landmarks.length
        };
    },

    /**
     * Smoothing function for values
     * @param {number} currentValue - Current value
     * @param {number} targetValue - Target value
     * @param {number} smoothingFactor - Smoothing factor (0-1)
     * @returns {number} Smoothed value
     */
    smooth(currentValue, targetValue, smoothingFactor = 0.5) {
        return currentValue + (targetValue - currentValue) * smoothingFactor;
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format number with leading zeros
     * @param {number} num - Number to format
     * @param {number} digits - Number of digits
     * @returns {string} Formatted number
     */
    formatNumber(num, digits = 2) {
        return num.toString().padStart(digits, '0');
    },

    /**
     * MediaPipe Pose Landmark indices
     */
    POSE_LANDMARKS: {
        NOSE: 0,
        LEFT_SHOULDER: 11,
        RIGHT_SHOULDER: 12,
        LEFT_ELBOW: 13,
        RIGHT_ELBOW: 14,
        LEFT_WRIST: 15,
        RIGHT_WRIST: 16,
        LEFT_HIP: 23,
        RIGHT_HIP: 24,
        LEFT_KNEE: 25,
        RIGHT_KNEE: 26,
        LEFT_ANKLE: 27,
        RIGHT_ANKLE: 28
    },

    /**
     * Check if body is in horizontal position (for push-ups)
     * @param {Array} landmarks - Pose landmarks
     * @returns {boolean}
     */
    isHorizontalPosition(landmarks) {
        if (!landmarks || landmarks.length < 33) return false;

        const leftShoulder = landmarks[this.POSE_LANDMARKS.LEFT_SHOULDER];
        const rightShoulder = landmarks[this.POSE_LANDMARKS.RIGHT_SHOULDER];
        const leftHip = landmarks[this.POSE_LANDMARKS.LEFT_HIP];
        const rightHip = landmarks[this.POSE_LANDMARKS.RIGHT_HIP];

        if (!this.isLandmarkVisible(leftShoulder) || !this.isLandmarkVisible(rightShoulder) ||
            !this.isLandmarkVisible(leftHip) || !this.isLandmarkVisible(rightHip)) {
            return false;
        }

        // Check if shoulders are roughly at same height as hips (horizontal position)
        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const bodyAngle = Math.abs(shoulderY - hipY);

        return bodyAngle < 0.3; // Threshold for horizontal position
    }
};

// Make Utils globally available
window.Utils = Utils;