import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

export default function FreeVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // AI düşünürken dönecek
  const [aiText, setAiText] = useState("Konuşmak için bas...");
  const recognitionRef = useRef<any>(null);
  const { user } = useUserStore();

  useEffect(() => {
    // 1. Tarayıcı Konuşma Motorunu Başlat
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = false; // Tek cümle alıp durur

      // 2. Sesi Yazıya Çevirince Burası Çalışır
      recognitionRef.current.onresult = async (event: any) => {
        const userText = event.results[0][0].transcript;
        setAiText(`Sen: ${userText}`);
        setIsListening(false); // Dinlemeyi durdur

        // GPT'ye Gönder
        await askGPT(userText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setAiText("Anlaşılamadı, tekrar deneyin.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setAiText("Tarayıcınız sesli komutları desteklemiyor.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 3. Backend'e Soru Sorup Ses Dosyasını Alma
  const askGPT = async (text: string) => {
    setIsProcessing(true); // Yükleniyor durumuna al
    setAiText("AI düşünüyor...");

    try {
      // DİKKAT: method: "POST" ekledik
      const res = await fetch("http://localhost:5001/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          email: user?.email
        })
      });

      const data = await res.json();

      // Backend'den gelen metni ekrana yaz
      setAiText(`AI: ${data.reply}`);

      // Backend'den gelen ses dosyasını oynat
      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }

    } catch (err) {
      console.error(err);
      setAiText("Sunucu hatası.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Ses Dosyasını Oynatma Fonksiyonu
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Ses oynatma hatası:", e));
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setAiText("Dinliyorum...");
      } catch (error) {
        console.error("Start error:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 animate-in fade-in duration-500 w-full max-w-md mx-auto">

      {/* Metin Alanı */}
      <div className="h-40 w-full overflow-y-auto text-center text-zinc-300 text-sm p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex items-center justify-center">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-emerald-500">
            <Loader2 className="animate-spin" />
            <span>Cevap hazırlanıyor...</span>
          </div>
        ) : (
          aiText
        )}
      </div>

      {/* Buton */}
      <button
        onClick={toggleListening}
        disabled={isProcessing} // İşlem sırasında butonu kilitle
        className={`p-5 rounded-full transition-all duration-300 shadow-lg active:scale-95 ${isListening
          ? "bg-red-500/90 hover:bg-red-600 animate-pulse shadow-red-500/20"
          : isProcessing
            ? "bg-zinc-700 cursor-not-allowed opacity-50"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
          }`}
      >
        {isListening ? (
          <Square fill="currentColor" className="text-white" size={28} />
        ) : (
          <Mic className="text-white" size={28} />
        )}
      </button>

      <p className="text-xs text-zinc-500 font-medium">
        {isListening ? "Dinleniyor..." : isProcessing ? "Lütfen bekleyin..." : "Dokun ve Konuş"}
      </p>
    </div>
  );
}