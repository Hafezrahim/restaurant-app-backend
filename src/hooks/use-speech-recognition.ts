import { useState, useEffect, useCallback, useRef } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

type SupportedLanguage = 'ar' | 'en';

interface UseSpeechRecognitionOptions {
  language?: SupportedLanguage;
  autoDetect?: boolean;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  detectedLanguage: SupportedLanguage | null;
  autoDetect: boolean;
  setAutoDetect: (value: boolean) => void;
}

const languageCodes: Record<SupportedLanguage, string> = {
  ar: 'ar-SA',
  en: 'en-US',
};

// Function to detect language from text content
const detectLanguageFromText = (text: string): SupportedLanguage | null => {
  if (!text || text.trim().length === 0) return null;
  
  // Arabic Unicode range: \u0600-\u06FF (Arabic) and \u0750-\u077F (Arabic Supplement)
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  const hasArabic = arabicPattern.test(text);
  
  // If text contains Arabic characters, it's Arabic
  if (hasArabic) return 'ar';
  
  // Otherwise assume English
  return 'en';
};

export const useSpeechRecognition = (options?: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>(options?.language || 'ar');
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguage | null>(null);
  const [autoDetect, setAutoDetect] = useState(options?.autoDetect ?? true);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const languageRef = useRef(language);
  const autoDetectRef = useRef(autoDetect);

  // Keep refs in sync
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    autoDetectRef.current = autoDetect;
  }, [autoDetect]);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize recognition only once
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = languageCodes[language];

    recognitionInstance.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript;
      // Remove trailing dots/periods from the transcript
      const cleanedTranscript = transcriptResult.replace(/[.。،؛]+$/, '').trim();
      setTranscript(cleanedTranscript);
      
      // Auto-detect language from transcript content
      if (autoDetectRef.current && cleanedTranscript.length > 0) {
        const detected = detectLanguageFromText(cleanedTranscript);
        if (detected) {
          setDetectedLanguage(detected);
        }
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      recognitionInstance.abort();
    };
  }, [isSupported]); // Only depend on isSupported

  // Update language on recognition instance when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageCodes[language];
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setTranscript('');
    setDetectedLanguage(null);
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
    language,
    setLanguage,
    detectedLanguage,
    autoDetect,
    setAutoDetect,
  };
};
