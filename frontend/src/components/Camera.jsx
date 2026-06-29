import React, { useEffect, useRef, useState } from 'react';

const Camera = ({ isInterviewActive }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null); 
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Please allow camera and microphone permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (isInterviewActive) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isInterviewActive]);

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            {error ? (
                <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
                    {error}
                </div>
            ) : (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        backgroundColor: '#000',
                        transform: 'scaleX(-1)' 
                    }} 
                />
            )}
        </div>
    );
};

export default Camera;