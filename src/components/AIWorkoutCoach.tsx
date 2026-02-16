import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS, type Results } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Upload, Play, Pause, RefreshCw } from 'lucide-react';

const AIWorkoutCoach: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [feedback, setFeedback] = useState<string>("Video yükleyin ve analizi başlatın.");
    const [isProperDepth, setIsProperDepth] = useState<boolean>(false);
    const [videoSource, setVideoSource] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [pose, setPose] = useState<Pose | null>(null);
    const requestRef = useRef<number>(0);

    // Calculate angle between three points
    const calculateAngle = (a: any, b: any, c: any) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const onResults = (results: Results) => {
        if (!canvasRef.current || !videoRef.current) return;

        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        // Set canvas dimensions to match video
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

        if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

            const landmarks = results.poseLandmarks;

            // Check visibility of necessary points (Left side)
            // AND Right side to support both profiles
            const leftIndices = [23, 25, 27];
            const rightIndices = [24, 26, 28];

            const getAvgVisibility = (indices: number[]) =>
                indices.reduce((sum, idx) => sum + (landmarks[idx]?.visibility || 0), 0) / indices.length;

            const leftVis = getAvgVisibility(leftIndices);
            const rightVis = getAvgVisibility(rightIndices);

            let chosenSide = null;
            // Lower threshold slightly
            if (leftVis > 0.4 && leftVis >= rightVis) chosenSide = 'left';
            else if (rightVis > 0.4) chosenSide = 'right';

            if (chosenSide) {
                const [hipIdx, kneeIdx, ankleIdx] = chosenSide === 'left' ? leftIndices : rightIndices;
                const hip = landmarks[hipIdx];
                const knee = landmarks[kneeIdx];
                const ankle = landmarks[ankleIdx];

                const angle = calculateAngle(hip, knee, ankle);

                // Draw angle text
                canvasCtx.font = "bold 16px Arial";
                canvasCtx.fillStyle = "white";
                canvasCtx.fillText(`${Math.round(angle)}°`, knee.x * videoWidth + 10, knee.y * videoHeight);

                // Draw circle at knee
                canvasCtx.beginPath();
                canvasCtx.arc(knee.x * videoWidth, knee.y * videoHeight, 5, 0, 2 * Math.PI);
                canvasCtx.fillStyle = angle < 90 ? "#00FF00" : "orange"; // Green if good depth
                canvasCtx.fill();


                if (angle < 90) {
                    setFeedback("Derinlik Harika! (Good Depth)");
                    setIsProperDepth(true);
                } else if (angle < 110) {
                    setFeedback("Biraz daha aşağı! (Go Lower)");
                    setIsProperDepth(false);
                } else {
                    setFeedback("Çömelmeye başlayın / Devam edin");
                    setIsProperDepth(false);
                }
            } else {
                setFeedback("Vücut tam algılanamıyor. Yan profilden çekim yapın.");
                setIsProperDepth(false);
            }
        }
        canvasCtx.restore();
    };

    useEffect(() => {
        const poseInstance = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        poseInstance.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        poseInstance.onResults(onResults);
        setPose(poseInstance);

        return () => {
            poseInstance.close();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, []);

    const animate = React.useCallback(async () => {
        if (
            videoRef.current &&
            pose &&
            !videoRef.current.paused &&
            !videoRef.current.ended &&
            isPlaying // Check state too
        ) {
            await pose.send({ image: videoRef.current });
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [pose, isPlaying]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoSource(url);
            setFeedback("Video yüklendi. Oynatmaya başlayın.");
            setIsPlaying(false);
            // Reset canvas
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const restartVideo = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
        }
    }

    // Effect to trigger animation loop when playing state changes
    useEffect(() => {
        if (isPlaying && pose) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, [isPlaying, animate, pose]);


    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-zinc-950 p-4">
            <div className="w-full max-w-[300px] mb-4">
                <h2 className="text-xl font-bold text-white mb-1 text-center">AI Form Analizi</h2>
                <p className="text-zinc-400 text-center mb-6 text-sm">Squat formunuzu analiz etmek için videonuzu yükleyin.</p>

                {!videoSource && (
                    <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                        <Upload size={32} className="text-emerald-500 mb-4" />
                        <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-6 rounded-xl transition-colors">
                            Video Seç
                            <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        <p className="mt-2 text-[10px] text-zinc-500">MP4, WEBM, MOV desteklenir</p>
                    </div>
                )}
            </div>

            {videoSource && (
                <div className="relative w-full max-w-[300px] border border-zinc-800 rounded-2xl overflow-hidden bg-black shadow-2xl">
                    <video
                        ref={videoRef}
                        src={videoSource}
                        className="w-full h-auto block"
                        playsInline
                        loop
                        muted
                        onEnded={() => setIsPlaying(false)}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />

                    {/* Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={togglePlay} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition-colors">
                                {isPlaying ? <Pause size={16} fill='currentColor' /> : <Play size={16} fill='currentColor' />}
                            </button>
                            <button onClick={restartVideo} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition-colors">
                                <RefreshCw size={16} />
                            </button>
                            <label className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white transition-colors cursor-pointer">
                                <Upload size={16} />
                                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className={`px-3 py-1 rounded-md font-bold text-xs text-white backdrop-blur-md ${isProperDepth ? 'bg-emerald-500/80' : 'bg-orange-500/80'}`}>
                            {feedback}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIWorkoutCoach;
