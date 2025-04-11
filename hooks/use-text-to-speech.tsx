'use client';

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef,
  ReactNode,
} from 'react';

interface TextToSpeechOptions {
  pitch?: number; // 0 to 2
  rate?: number; // 0.1 to 10
  volume?: number; // 0 to 1
  autoPlay?: boolean; // New option to control auto-play behavior
}

// Regex to match emoji characters
const emojiRegex =
  /[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2B00}-\u{2BFF}]/gu;

interface TextToSpeechContextType {
  speak: (text: string, force?: boolean) => void;
  stop: () => void;
  isPlaying: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
}

const TextToSpeechContext = createContext<TextToSpeechContextType | null>(null);

export function TextToSpeechProvider({ children }: { children: ReactNode }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastPlayedRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      console.log(availableVoices, 'available voices');

      // Try to find Samantha (en-US) first
      const samantha = availableVoices.find(
        (voice) => voice.name === 'Samantha' && voice.lang.startsWith('en-US'),
      );

      if (samantha) {
        setSelectedVoice(samantha);
        return;
      }

      // Fallback to any en-US voice
      const usVoice = availableVoices.find((voice) =>
        voice.lang.startsWith('en-US'),
      );

      if (usVoice) {
        setSelectedVoice(usVoice);
        return;
      }

      // Final fallback to any en-GB voice
      const ukVoice = availableVoices.find((voice) =>
        voice.lang.startsWith('en-GB'),
      );

      if (ukVoice) {
        setSelectedVoice(ukVoice);
        return;
      }

      // Last resort: use first available voice
      setSelectedVoice(availableVoices[0]);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const speak = useCallback(
    (text: string, force = false) => {
      if (
        !text ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window) ||
        (!force && text === lastPlayedRef.current)
      )
        return;

      // Strip emojis and clean text
      const cleanText = text.replace(emojiRegex, '').trim();
      if (!cleanText) return;

      lastPlayedRef.current = text;
      window.speechSynthesis.cancel();

      // Check if using a remote voice (Google voices)
      const isRemoteVoice = selectedVoice?.name.startsWith('Google');

      if (isRemoteVoice) {
        // Break text into chunks for remote voices
        const chunks: string[] = [];
        let currentChunk = '';

        const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

        sentences.forEach((sentence) => {
          const trimmedSentence = sentence.trim();
          if (currentChunk.length + trimmedSentence.length <= 200) {
            currentChunk += ' ' + trimmedSentence;
          } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = trimmedSentence;
          }
        });
        if (currentChunk) chunks.push(currentChunk.trim());

        // Queue all chunks at once
        chunks.forEach((chunk, index) => {
          const utterance = new SpeechSynthesisUtterance(chunk);

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.pitch = 1;
          utterance.rate = 1;
          utterance.volume = 1;

          if (index === 0) {
            utterance.onstart = () => setIsPlaying(true);
          }
          if (index === chunks.length - 1) {
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
          }

          window.speechSynthesis.speak(utterance);
        });
      } else {
        // For local voices, speak the entire text at once
        const utterance = new SpeechSynthesisUtterance(cleanText);

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
      }
    },
    [selectedVoice],
  );

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const value = {
    speak,
    stop,
    isPlaying,
    voices,
    selectedVoice,
    setSelectedVoice,
  };

  return (
    <TextToSpeechContext.Provider value={value}>
      {children}
    </TextToSpeechContext.Provider>
  );
}

export function useTextToSpeech() {
  const context = useContext(TextToSpeechContext);
  if (!context) {
    throw new Error(
      'useTextToSpeech must be used within a TextToSpeechProvider',
    );
  }
  return context;
}
