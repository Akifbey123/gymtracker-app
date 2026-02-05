import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Webcam from 'react-webcam';
import { Camera, Send, RefreshCcw } from 'lucide-react'; // İkonlar için (isteğe bağlı)
const CameraCapture = ({ onAnalyzeSuccess }: { onAnalyzeSuccess?: (data: any) => void }) => {
    const webcamRef = useRef<Webcam>(null); // Kamerayı kontrol etmek için referans
    const [imgSrc, setImgSrc] = useState<string | null>(null); // Çekilen fotoğrafı tutan state
    const [loading, setLoading] = useState(false);

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
            const response = await fetch('http://localhost:5001/analyze-image', {
                method: 'POST',
                // headers: { 'Content-Type': 'multipart/form-data' }, // Tarayıcı bunu otomatik ayarlar
                body: formData,
            });

            const data = await response.json();
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
        facingMode: "user" // "environment" yaparsan arka kamera açılır (telefonda)
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">

            {/* 1. KAMERA VEYA ÇEKİLEN FOTOĞRAF ALANI */}
            <div className="relative w-full max-w-[500px] aspect-video bg-black rounded-xl overflow-hidden border border-zinc-700">
                {imgSrc ? (
                    // Fotoğraf çekildiyse onu göster
                    <img src={imgSrc} alt="Captured" className="w-full h-full object-cover -scale-x-100" />
                ) : (
                    // Fotoğraf çekilmediyse canlı kamerayı göster
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="w-full h-full object-cover -scale-x-100"

                    />
                )}
            </div>

            {/* 2. BUTONLAR */}
            <div className="flex gap-4">
                {!imgSrc ? (
                    // Canlı moddayken "Çek" butonu
                    <button onClick={capture} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2">
                        <Camera size={20} /> Fotoğraf Çek
                    </button>
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