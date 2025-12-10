/**
 * Voice Recorder Component
 * Allows recording voice notes for wellness check-ins
 */

import { useState, useRef } from 'react';
import { Mic, Square, X } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps): React.ReactElement {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch {
      console.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Mic size={16} />
            <span className="text-sm font-medium">Record Voice Note</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-sm font-bold text-rose-400 tabular-nums">{formatTime(recordingTime)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all"
            >
              <Square size={16} fill="currentColor" />
            </button>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-3 flex-1">
            <audio src={audioUrl} controls className="flex-1 h-10" />
            <button
              onClick={() => {
                setAudioUrl(null);
                onRecordingComplete('');
              }}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-muted hover:text-rose-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
