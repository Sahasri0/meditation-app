import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [inputText, setInputText] = useState("");
  const [step, setStep] = useState("input"); // input -> duration -> playing
  const [duration, setDuration] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() !== "") setStep("duration");
  };

  const handleDurationSelect = async (min) => {
    setDuration(min);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5678/webhook-test/analyse-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, duration: min })
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStep("playing");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (audioUrl && step === "playing") {
    const playAudio = () => {
      const audio = audioRef.current;
      if (audio) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay prevented:", err);
          });
        }
      }
    };

    // Delay slightly to ensure audio element is mounted
    const timeout = setTimeout(playAudio, 100); // 100ms delay

    return () => clearTimeout(timeout);
  }
}, [audioUrl, step]);


  return (
    <div className="app-container">
      {step !== "playing" && <div className="bubble" />}
      
      {(step === "input" || step === "duration") && (
        <h1 className="prompt-text">How are you feeling?</h1>
      )}

      {step === "input" && (
        <form onSubmit={handleTextSubmit} className="form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your feeling..."
            className="input-box"
          />
          <button type="submit" className="submit-button">
            Make me feel good
          </button>
        </form>
      )}

      {step === "duration" && (
        <div className="duration-select">
          <p className="bubble-text">Choose how long you want to meditate</p>
          {[1, 3, 5, 10, 15, 30].map((min) => (
            <button
              key={min}
              className="duration-button"
              onClick={() => handleDurationSelect(min)}
            >
              {min} min
            </button>
          ))}
        </div>
      )}

      {loading && <p className="bubble-text">✨ Generating your meditation...</p>}

      {step === "playing" && audioUrl && (
        <div className="playing-section">
          <div className="bubble" />
          <div className="timer-track">
            <div
              className="timer-fill"
              style={{ animationDuration: `${duration * 60}s` }}
            ></div>
          </div>
          <audio autoPlay ref={audioRef} src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
}

export default App;
