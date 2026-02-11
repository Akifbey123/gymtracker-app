import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Webcam from 'react-webcam';
import { Camera, Send, RefreshCcw, SwitchCamera } from 'lucide-react'; // İkonlar için (isteğe bağlı)
import { apiClient } from '../services/apiClient';
const CameraCapture = ({ onAnalyzeSuccess }: { onAnalyzeSuccess?: (data: any) => void }) => {
    const webcamRef = useRef<Webcam>(null); // Kamerayı kontrol etmek için referans
    const [imgSrc, setImgSrc] = useState<string | null>(null); // Çekilen fotoğrafı tutan state
    const [loading, setLoading] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const [isCameraStarted, setIsCameraStarted] = useState(false); // Kamera izni/başlatma durumu
    const [cameraError, setCameraError] = useState<string | null>(null);

    const toggleCamera = useCallback(() => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    }, []);

    const handleUserMediaError = useCallback((err: string | DOMException) => {
        console.error("Camera Error:", err);
        let msg = "Kamera erişim hatası.";
        // Basit kontrol
        if (String(err).includes("NotAllowed")) msg = "Kamera izni reddedildi.";
        if (String(err).includes("NotFound")) msg = "Kamera bulunamadı.";
        if (String(err).includes("NotReadable")) msg = "Kamera kullanılamıyor.";

        setCameraError(msg + " Lütfen HTTPS bağlantısı kullandığınızdan emin olun.");
        toast.error(msg);
    }, []);

    // --- FOTOĞRAF ÇEKME FONKSİYONU ---
    const capture = useCallback(() => {
        if (webcamRef.current) {
            // getScreenshot() bize base64 formatında (data:image/jpeg;base64,...) bir string verir.
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    // --- FOTOĞRAFI İPTAL ETME ---
    const retake = () => {
        setImgSrc(null);
    };

    // --- FOTOĞRAFI AI BACKEND'İNE GÖNDERME ---
    const sendToAI = async () => {
        if (!imgSrc) return;
        setLoading(true);

        try {
            // Frontend'de çekilen base64 fotoğrafı Blob'a çevir
            const blob = await fetch(imgSrc).then(res => res.blob());

            // FormData oluştur
            const formData = new FormData();
            formData.append('image', blob, 'capture.jpg'); // Backend 'image' adıyla bekliyor

            // Backend'deki yeni rotamıza istek atıyoruz
            const data = await apiClient.post<{ result: any }>('/analyze-image', formData);
            console.log("AI Cevabı:", data.result);


            let parsedData;
            try {
                parsedData = JSON.parse(data.result);
            } catch (e) {
                parsedData = data.result;
            }

            if (onAnalyzeSuccess) {
                onAnalyzeSuccess(parsedData);
            }

        } catch (error) {
            console.error("Hata:", error);
            toast.error("Fotoğraf gönderilemedi.");
        } finally {
            setLoading(false);
        }
    };

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: facingMode
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">

            {/* 1. KAMERA VEYA ÇEKİLEN FOTOĞRAF ALANI */}
            <div className="relative w-full max-w-[500px] aspect-video bg-black rounded-xl overflow-hidden border border-zinc-700">
                {imgSrc ? (
                    // Fotoğraf çekildiyse onu göster
                    <img src={imgSrc} alt="Captured" className="w-full h-full object-cover -scale-x-100" />
                ) : cameraError ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-2 ring-1 ring-red-500/50">
                            <Camera size={32} className="text-red-400" />
                        </div>
                        <p className="text-red-400 font-medium max-w-[280px]">{cameraError}</p>
                        <button
                            onClick={() => { setIsCameraStarted(false); setCameraError(null); }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                ) : !isCameraStarted ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2 ring-1 ring-zinc-700">
                            <Camera size={32} className="text-zinc-400" />
                        </div>
                        <div className="space-y-2 max-w-[280px]">
                            <h3 className="text-white font-bold text-lg">Kamera Erişimi</h3>
                            <p className="text-zinc-400 text-sm">AI ile besin analizi yapabilmek için kameranızı açmanız gerekiyor.</p>
                        </div>
                        <button
                            onClick={() => setIsCameraStarted(true)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                        >
                            <Camera size={20} />
                            Kamerayı Başlat
                        </button>
                    </div>
                ) : (
                    // Fotoğraf çekilmediyse canlı kamerayı göster
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover -scale-x-100"
                            onUserMediaError={handleUserMediaError}
                        />
                        <button
                            onClick={toggleCamera}
                            className="absolute top-4 right-4 bg-zinc-900/60 text-white p-2.5 rounded-full hover:bg-zinc-800 transition-colors backdrop-blur-sm border border-zinc-700"
                        >
                            <SwitchCamera size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* 2. BUTONLAR */}
            <div className="flex gap-4">
                {!imgSrc ? (
                    // Canlı moddayken "Çek" butonu
                    isCameraStarted && (
                        <button onClick={capture} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95">
                            <Camera size={20} /> Fotoğraf Çek
                        </button>
                    )
                ) : (
                    // Fotoğraf çekildikten sonraki butonlar
                    <>
                        <button onClick={retake} className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-3 rounded-full flex items-center gap-2">
                            <RefreshCcw size={20} /> Tekrar Dene
                        </button>

                        <button onClick={sendToAI} disabled={loading} className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 disabled:opacity-50">
                            {loading ? "Gönderiliyor..." : <><Send size={20} /> AI'a Gönder</>}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;