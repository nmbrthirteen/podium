'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { useMediaRecorder } from '@/hooks/use-media-recorder';

type RecordingPreviewProps = {
  recorder: ReturnType<typeof useMediaRecorder>;
  onSkipRecording: () => void;
};

export function RecordingPreview({ recorder, onSkipRecording }: RecordingPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { state, stream, request } = recorder;

  useEffect(() => {
    if (state === 'idle') void request();
  }, [state, request]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  if (state === 'denied' || state === 'unsupported' || state === 'error') {
    const message =
      state === 'denied'
        ? 'Camera or microphone access is blocked. Allow it in your browser site settings, then try again.'
        : state === 'unsupported'
          ? 'This browser cannot record video. Run without recording, or open the app in Chrome.'
          : 'The camera did not start. Check that no other app is using it, then try again.';
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-danger-soft p-4" role="alert">
        <p className="font-medium text-danger">{message}</p>
        <div className="flex flex-wrap gap-2">
          {state !== 'unsupported' && (
            <Button variant="secondary" size="sm" onClick={() => void request()}>
              Try again
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onSkipRecording}>
            Run without recording
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        aria-label="Camera preview"
        className="aspect-video w-full -scale-x-100 rounded-card bg-inset object-cover"
      />
      <p className="text-sm text-muted">
        {state === 'requesting' ? 'Waiting for camera and microphone access.' : 'Check your framing, then start.'}
      </p>
    </div>
  );
}
