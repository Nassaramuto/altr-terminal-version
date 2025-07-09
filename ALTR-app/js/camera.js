// camera.js - Camera setup and management

const Camera = {
    video: null,
    stream: null,
    canvas: null,
    isInitialized: false,

    /**
     * Initialize camera
     * @param {HTMLVideoElement} videoElement - Video element
     * @param {HTMLCanvasElement} canvasElement - Canvas element
     * @returns {Promise<boolean>} Success status
     */
    async init(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;

        try {
            // Request camera permissions
            const stream = await this.requestCamera();
            if (!stream) return false;

            this.stream = stream;
            this.video.srcObject = stream;
            
            // Wait for video to be ready
            await this.waitForVideo();
            
            // Set canvas size to match video
            this.updateCanvasSize();
            
            this.isInitialized = true;
            
            // Handle orientation changes
            window.addEventListener('resize', () => this.updateCanvasSize());
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.updateCanvasSize(), 100);
            });

            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            return false;
        }
    },

    /**
     * Request camera access
     * @returns {Promise<MediaStream>} Camera stream
     */
    async requestCamera() {
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user', // Front camera for mobile
                frameRate: { ideal: 30 }
            },
            audio: false
        };

        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            // Fallback to basic constraints
            try {
                return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            } catch (fallbackError) {
                console.error('Camera access denied:', fallbackError);
                throw new Error('Camera access denied. Please enable camera permissions.');
            }
        }
    },

    /**
     * Wait for video to be ready
     * @returns {Promise<void>}
     */
    waitForVideo() {
        return new Promise((resolve) => {
            if (this.video.readyState >= 2) {
                resolve();
            } else {
                this.video.addEventListener('loadeddata', () => resolve(), { once: true });
            }
        });
    },

    /**
     * Update canvas size to match video and viewport
     */
    updateCanvasSize() {
        if (!this.video || !this.canvas) return;

        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Set canvas internal size to match video
        this.canvas.width = videoWidth;
        this.canvas.height = videoHeight;

        // Calculate scale to cover the viewport
        const scaleX = windowWidth / videoWidth;
        const scaleY = windowHeight / videoHeight;
        const scale = Math.max(scaleX, scaleY);

        // Apply CSS to maintain aspect ratio and cover viewport
        this.canvas.style.width = `${videoWidth * scale}px`;
        this.canvas.style.height = `${videoHeight * scale}px`;
    },

    /**
     * Get video dimensions
     * @returns {Object} Width and height
     */
    getVideoDimensions() {
        return {
            width: this.video?.videoWidth || 0,
            height: this.video?.videoHeight || 0
        };
    },

    /**
     * Stop camera
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
        this.isInitialized = false;
    },

    /**
     * Check if camera is ready
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized && this.video && this.video.readyState >= 2;
    }
};

// Make Camera globally available
window.Camera = Camera;