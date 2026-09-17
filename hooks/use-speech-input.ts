'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognitionConstructor = new () => SpeechRecognition;

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const scoped = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return scoped.SpeechRecognition ?? scoped.webkitSpeechRecognition ?? null;
}

const subscribe = () => () => {};

export function useSpeechInput(onFinal: (text: string) => void) {
  const supported = useSyncExternalStore<boolean | null>(
    subscribe,
    () => recognitionConstructor() !== null,
    () => null,
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  const start = useCallback(() => {
    const Recognition = recognitionConstructor();
    if (!Recognition) return;
    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    recognition.onresult = event => {
      let pending = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result?.[0]?.transcript ?? '';
        if (result?.isFinal) onFinalRef.current(text.trim());
        else pending += text;
      }
      setInterim(pending.trim());
    };
    recognition.onerror = event => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      setError(
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'The browser blocked the microphone. Allow it in the address bar, or type instead.'
          : 'Listening stopped. Tap the mic to try again, or type instead.',
      );
    };
    recognition.onend = () => {
      setListening(false);
      setInterim('');
      if (recognitionRef.current === recognition) recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setError(null);
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('Listening could not start. Tap the mic again, or type instead.');
    }
  }, []);

  return { supported, listening, interim, error, start, stop };
}
