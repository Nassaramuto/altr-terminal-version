// pose-detector.js - MediaPipe Pose integration

const PoseDetector = {
    pose: null,
    canvasCtx: null,
    drawingUtils: null,
    isProcessing: false,
    onResultsCallback: null,

    /**
     * Initialize MediaPipe Pose
     * @param {HTMLCanvasElement} canvasElement - Canvas for drawing
     * @param {Function} onResults - Callback for pose results
     */
    async init(canvasElement, onResults) {
        this.canvasCtx = canvasElement.getContext('2d');
        this.onResultsCallback = onResults;

        // Initialize MediaPipe Pose
        this.pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        // Set up results callback
        this.pose.onResults((results) => this.onResults(results));

        // Initialize drawing utilities
        this.drawingUtils = window.drawingUtils;

        await this.pose.initialize();
    },

    /**
     * Process video frame
     * @param {HTMLVideoElement} videoElement - Video element
     */
    async processFrame(videoElement) {
        if (!this.pose || this.isProcessing || !Camera.isReady()) return;

        this.isProcessing = true;
        try {
            await this.pose.send({ image: videoElement });
        } catch (error) {
            console.error('Error processing frame:', error);
        }
        this.isProcessing = false;
    },

    /**
     * Handle pose detection results
     * @param {Object} results - MediaPipe results
     */
    onResults(results) {
        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);

        // Draw the video frame
        this.canvasCtx.drawImage(
            results.image, 0, 0, 
            this.canvasCtx.canvas.width, 
            this.canvasCtx.canvas.height
        );

        // Draw pose landmarks and connections
        if (results.poseLandmarks) {
            this.drawSkeleton(results.poseLandmarks);
            
            // Call external callback with results
            if (this.onResultsCallback) {
                this.onResultsCallback({
                    landmarks: results.poseLandmarks,
                    worldLandmarks: results.poseWorldLandmarks
                });
            }
        }

        this.canvasCtx.restore();
    },

    /**
     * Draw skeleton overlay
     * @param {Array} landmarks - Pose landmarks
     */
    drawSkeleton(landmarks) {
        // Define connections for skeleton
        const connections = [
            // Face
            [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
            // Arms
            [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
            // Torso
            [11, 23], [12, 24], [23, 24],
            // Legs
            [23, 25], [25, 27], [24, 26], [26, 28]
        ];

        // Draw connections
        this.canvasCtx.strokeStyle = '#00FF00';
        this.canvasCtx.lineWidth = 4;
        
        connections.forEach(([start, end]) => {
            const startLandmark = landmarks[start];
            const endLandmark = landmarks[end];
            
            if (startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
                this.canvasCtx.beginPath();
                this.canvasCtx.moveTo(
                    startLandmark.x * this.canvasCtx.canvas.width,
                    startLandmark.y * this.canvasCtx.canvas.height
                );
                this.canvasCtx.lineTo(
                    endLandmark.x * this.canvasCtx.canvas.width,
                    endLandmark.y * this.canvasCtx.canvas.height
                );
                this.canvasCtx.stroke();
            }
        });

        // Draw landmarks
        this.canvasCtx.fillStyle = '#FF0000';
        landmarks.forEach((landmark, index) => {
            if (landmark.visibility > 0.5) {
                // Larger circles for key joints
                const radius = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index) ? 8 : 5;
                
                this.canvasCtx.beginPath();
                this.canvasCtx.arc(
                    landmark.x * this.canvasCtx.canvas.width,
                    landmark.y * this.canvasCtx.canvas.height,
                    radius,
                    0,
                    2 * Math.PI
                );
                this.canvasCtx.fill();
            }
        });

        // Highlight arms for push-up tracking
        this.highlightArms(landmarks);
    },

    /**
     * Highlight arm joints for push-up tracking
     * @param {Array} landmarks - Pose landmarks
     */
    highlightArms(landmarks) {
        const armJoints = [
            Utils.POSE_LANDMARKS.LEFT_SHOULDER,
            Utils.POSE_LANDMARKS.LEFT_ELBOW,
            Utils.POSE_LANDMARKS.LEFT_WRIST,
            Utils.POSE_LANDMARKS.RIGHT_SHOULDER,
            Utils.POSE_LANDMARKS.RIGHT_ELBOW,
            Utils.POSE_LANDMARKS.RIGHT_WRIST
        ];

        this.canvasCtx.fillStyle = '#FFFF00';
        armJoints.forEach(index => {
            const landmark = landmarks[index];
            if (landmark.visibility > 0.5) {
                this.canvasCtx.beginPath();
                this.canvasCtx.arc(
                    landmark.x * this.canvasCtx.canvas.width,
                    landmark.y * this.canvasCtx.canvas.height,
                    10,
                    0,
                    2 * Math.PI
                );
                this.canvasCtx.fill();
            }
        });
    },

    /**
     * Start continuous detection
     * @param {HTMLVideoElement} videoElement - Video element
     */
    startDetection(videoElement) {
        const detect = async () => {
            await this.processFrame(videoElement);
            requestAnimationFrame(detect);
        };
        detect();
    }
};

// Make PoseDetector globally available
window.PoseDetector = PoseDetector;