import { useEffect, useRef, useCallback } from "react";

export const useVoice = ({
  voiceMode,
  isListening,
  setIsListening,
  voiceContext,
  currentParentId,
  activeWindowId,
  addCard,
  setSearchQuery,
  setInputText,
  activeTabRef,
}: {
  voiceMode: any;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  voiceContext: any;
  currentParentId: any;
  activeWindowId: any;
  addCard: (text: string) => void;
  setSearchQuery: (val: string) => void;
  setInputText: (val: string) => void;
  activeTabRef: React.RefObject<HTMLButtonElement>;
}) => {
  const recognitionRef = useRef<any>(null);
  const voiceModeRef = useRef(voiceMode);
  const isListeningRef = useRef(isListening);
  const voiceContextRef = useRef(voiceContext);
  const currentParentIdRef = useRef(currentParentId);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechBufferRef = useRef<string>("");

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentParentId, activeTabRef]);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    voiceContextRef.current = voiceContext;
  }, [voiceContext]);

  useEffect(() => {
    currentParentIdRef.current = currentParentId;
  }, [currentParentId]);

  const windowIdRef = useRef(activeWindowId);
  useEffect(() => {
    windowIdRef.current = activeWindowId;
  }, [activeWindowId]);

  const handleVoiceTranscription = useCallback(
    (transcript: string) => {
      const mode = voiceModeRef.current;
      if (mode === "single" || mode === "continuous") {
        addCard(transcript);
      } else {
        const words = transcript.split(/\s+/).filter((w: string) => {
          const cleaned = w.trim().replace(/[.,!?]/g, "");
          return cleaned.length > 3;
        });
        words.forEach((word: string) => addCard(word));
      }
    },
    [addCard],
  );

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "ru-RU";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        if (!isListeningRef.current) return;
        const mode = voiceContextRef.current === "search" ? "single" : voiceModeRef.current;
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

        if (mode !== "continuous") {
          silenceTimeoutRef.current = setTimeout(() => {
            setIsListening(false);
            isListeningRef.current = false;
            recognitionRef.current?.stop();
          }, 5000);
        }

        let currentInterim = "";
        let currentFinal = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript + " ";
          }
        }

        currentFinal = currentFinal.trim();
        currentInterim = currentInterim.trim();
        
        const combinedLower = (currentFinal + " " + currentInterim).toLowerCase();
        if (combinedLower.includes("стоп")) {
            setIsListening(false);
            isListeningRef.current = false;
            recognitionRef.current?.stop();
            
            if (mode === "continuous") {
                if (currentFinal) speechBufferRef.current = (speechBufferRef.current + " " + currentFinal).trim();
                const sIdx = speechBufferRef.current.toLowerCase().indexOf("стоп");
                if (sIdx !== -1) {
                    speechBufferRef.current = speechBufferRef.current.slice(0, sIdx).trim();
                }
                if (voiceContextRef.current === "search") {
                    setSearchQuery(speechBufferRef.current);
                } else {
                    setInputText(speechBufferRef.current);
                }
            } else {
                let chunk = currentFinal ? currentFinal.toLowerCase().split("стоп")[0].trim() : currentInterim.toLowerCase().split("стоп")[0].trim();
                if (voiceContextRef.current === "search") {
                    setSearchQuery(chunk);
                } else {
                    if (currentFinal && chunk) handleVoiceTranscription(chunk);
                    else setInputText(chunk);
                }
            }
            return;
        }

        if (mode === "continuous") {
            if (currentFinal) {
               speechBufferRef.current = (speechBufferRef.current + " " + currentFinal).trim();
            }
            
            let lower = speechBufferRef.current.toLowerCase();

            while (lower.includes("помни")) {
                let pIdx = lower.indexOf("помни");
                let textBefore = speechBufferRef.current.slice(0, pIdx).trim();
                if (textBefore) {
                    addCard(textBefore);
                }
                speechBufferRef.current = speechBufferRef.current.slice(pIdx + 5).trim();
                lower = speechBufferRef.current.toLowerCase();
            }
            
            if (voiceContextRef.current === "search") {
                setSearchQuery((speechBufferRef.current + (currentInterim ? " " + currentInterim : "")).trim());
            } else {
                setInputText((speechBufferRef.current + (currentInterim ? " " + currentInterim : "")).trim());
            }
        } else {
            if (currentFinal) {
              if (voiceContextRef.current === "search") {
                setSearchQuery(currentFinal);
                setIsListening(false);
                isListeningRef.current = false;
                recognitionRef.current?.stop();
              } else {
                handleVoiceTranscription(currentFinal);
                setInputText("");
              }
            } else {
              if (voiceContextRef.current === "search") {
                setSearchQuery(currentInterim);
              } else {
                setInputText(currentInterim);
              }
            }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
          setInputText("");
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.continuous = false;
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
    }
  }, [handleVoiceTranscription, setIsListening, setSearchQuery, setInputText]);

  useEffect(() => {
    if (isListening) {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        setIsListening(false);
        isListeningRef.current = false;
        if (recognitionRef.current) recognitionRef.current.stop();
      }, 5000);
    } else {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    }
  }, [isListening, setIsListening]);
  
  const stopVoiceRecognition = useCallback(() => {
     if (isListeningRef.current) {
         setIsListening(false);
         isListeningRef.current = false;
         if (recognitionRef.current) recognitionRef.current.stop();
     }
  }, [setIsListening]);

  const startSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        isListeningRef.current = true;
        setIsListening(true);
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start speech recognition", e);
      }
    }
  }, [setIsListening]);

  return { stopVoiceRecognition, startSpeechRecognition, speechBufferRef };
};
