
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// Define the interface for the SpeechRecognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

// Extend the Window interface
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

type UseSpeechRecognitionOptions = {
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    lang?: string;
};

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const { onResult, onError, lang = 'en-US' } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        if(onResult) {
            onResult(fullTranscript);
        }
    };

    recognition.onerror = (event) => {
        const errorMessage = event.error === 'no-speech' 
            ? 'No speech was detected. Please try again.'
            : event.error;
        setError(errorMessage);
        if(onError) {
            onError(errorMessage);
        }
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    return () => {
        recognition.stop();
    };
  }, [lang, onResult, onError]);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, error, startListening, stopListening, hasPermission: !!recognitionRef.current };
};

