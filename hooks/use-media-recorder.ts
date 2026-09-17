'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderState =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'recording'
  | 'stopped'
  | 'denied'
  | 'unsupported'
  | 'error';

const preferredTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];

export function useMediaRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const release = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    setStream(null);
  }, []);

  useEffect(() => release, [release]);

  const request = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState('unsupported');
      return;
    }
    setState('requesting');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 } }, audio: true });
      streamRef.current = media;
      setStream(media);
      setState('ready');
    } catch (error) {
      const blocked = error instanceof DOMException && ['NotAllowedError', 'SecurityError'].includes(error.name);
      setState(blocked ? 'denied' : 'error');
    }
  }, []);

  const start = useCallback(() => {
    const media = streamRef.current;
    if (!media) return;
    const mimeType = preferredTypes.find(type => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = event => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setState('recording');
  }, []);

  const stop = useCallback(
    () =>
      new Promise<Blob | null>(resolve => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          release();
          resolve(null);
          return;
        }
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
          release();
          setState('stopped');
          resolve(blob.size > 0 ? blob : null);
        };
        recorder.stop();
      }),
    [release],
  );

  return { state, stream, request, start, stop, release };
}
