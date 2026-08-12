import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  AudioLines,
  Check,
  LoaderCircle,
  Mic,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';

import {
  transcribeAudio,
  type TranscriptionLanguage,
} from '../../../services/api/transcription';

type VoiceState = 'idle' | 'preparing' | 'recording' | 'transcribing' | 'confirming' | 'error';

interface VoicePromptProps {
  disabled?: boolean;
  onConfirm: (idea: string) => void;
}

const MAX_RECORDING_MS = 10_000;

function getSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;

  return [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ].find((type) => MediaRecorder.isTypeSupported(type));
}

function speak(text: string, language: TranscriptionLanguage): Promise<void> {
  if (
    typeof speechSynthesis === 'undefined'
    || typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return Promise.resolve();
  }

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
  utterance.rate = 0.9;

  const matchingVoice = speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith(language));
  if (matchingVoice) utterance.voice = matchingVoice;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

export function VoicePrompt({ disabled = false, onConfirm }: VoicePromptProps) {
  const { t, i18n } = useTranslation();
  const language: TranscriptionLanguage = i18n.resolvedLanguage?.startsWith('zh') ? 'zh' : 'en';
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearRecordingTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopRecording = () => {
    clearRecordingTimer();
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearRecordingTimer();
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop();
      }
      cleanupStream();
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    };
  }, []);

  const startListening = async () => {
    if (disabled) return;

    setTranscript('');
    setErrorMessage('');
    setVoiceState('preparing');

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('unsupported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      await speak(t('coloring.voice.ask'), language);
      if (!mountedRef.current) {
        cleanupStream();
        return;
      }

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        clearRecordingTimer();
        cleanupStream();
        if (!mountedRef.current) return;

        const audio = new Blob(chunks, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        if (audio.size === 0) {
          setErrorMessage(t('coloring.voice.noSpeech'));
          setVoiceState('error');
          return;
        }

        setVoiceState('transcribing');
        try {
          const recognizedText = await transcribeAudio(audio, language);
          if (!mountedRef.current) return;
          setTranscript(recognizedText);
          setVoiceState('confirming');
          await speak(
            t('coloring.voice.confirmSpeech', { idea: recognizedText }),
            language
          );
        } catch {
          if (!mountedRef.current) return;
          setErrorMessage(t('coloring.voice.transcriptionFailed'));
          setVoiceState('error');
        }
      };

      recorder.start();
      setVoiceState('recording');
      timerRef.current = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch (error) {
      cleanupStream();
      if (!mountedRef.current) return;
      const isPermissionError = error instanceof DOMException
        && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError');
      setErrorMessage(
        isPermissionError
          ? t('coloring.voice.permissionDenied')
          : t('coloring.voice.unsupported')
      );
      setVoiceState('error');
    }
  };

  const replayTranscript = () => {
    if (!transcript) return;
    void speak(t('coloring.voice.confirmSpeech', { idea: transcript }), language);
  };

  const confirmTranscript = () => {
    if (!transcript || disabled) return;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    onConfirm(transcript);
  };

  return (
    <section
      className="rounded-2xl bg-orange-50 p-3 sm:p-4"
      aria-label={t('coloring.voice.sectionLabel')}
    >
      <div className="mb-3 flex items-center gap-2 text-orange-900">
        <AudioLines className="h-5 w-5" />
        <p className="font-bold">{t('coloring.voice.title')}</p>
      </div>

      {(voiceState === 'idle' || voiceState === 'preparing') && (
        <button
          type="button"
          onClick={startListening}
          disabled={disabled || voiceState === 'preparing'}
          aria-label={t('coloring.voice.start')}
          className="flex min-h-24 w-full items-center justify-center gap-4 rounded-2xl bg-orange-500 px-5 py-4 text-white shadow-md transition-transform hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 motion-reduce:transition-none"
        >
          {voiceState === 'preparing' ? (
            <LoaderCircle className="h-11 w-11 animate-spin motion-reduce:animate-none" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
          <span className="text-lg font-bold">
            {voiceState === 'preparing'
              ? t('coloring.voice.gettingReady')
              : t('coloring.voice.start')}
          </span>
        </button>
      )}

      {voiceState === 'recording' && (
        <button
          type="button"
          onClick={stopRecording}
          aria-label={t('coloring.voice.stop')}
          className="flex min-h-24 w-full items-center justify-center gap-4 rounded-2xl bg-red-500 px-5 py-4 text-white shadow-md transition-transform active:scale-[0.98] motion-reduce:transition-none"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <span className="absolute h-full w-full animate-ping rounded-full bg-white/20 motion-reduce:animate-none" />
            <Square className="relative h-7 w-7 fill-current" />
          </span>
          <span className="text-lg font-bold">{t('coloring.voice.stop')}</span>
        </button>
      )}

      {voiceState === 'transcribing' && (
        <div
          className="flex min-h-24 items-center justify-center gap-3 rounded-2xl bg-amber-100 px-5 py-4 text-amber-900"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="h-10 w-10 animate-spin motion-reduce:animate-none" />
          <span className="font-bold">{t('coloring.voice.understanding')}</span>
        </div>
      )}

      {voiceState === 'confirming' && (
        <div aria-live="polite">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-white/80 p-3">
            <p className="min-w-0 truncate text-sm text-orange-950">
              {t('coloring.voice.parentTranscript', { idea: transcript })}
            </p>
            <button
              type="button"
              onClick={replayTranscript}
              aria-label={t('coloring.voice.replay')}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 transition-transform active:scale-95"
            >
              <Volume2 className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void startListening()}
              disabled={disabled}
              aria-label={t('coloring.voice.retry')}
              className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-3 py-3 font-bold text-orange-700 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <RotateCcw className="h-8 w-8" />
              <span>{t('coloring.voice.retry')}</span>
            </button>
            <button
              type="button"
              onClick={confirmTranscript}
              disabled={disabled}
              aria-label={t('coloring.voice.confirm')}
              className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-green-500 px-3 py-3 font-bold text-white shadow-md transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <Check className="h-9 w-9 stroke-[3]" />
              <span>{t('coloring.voice.confirm')}</span>
            </button>
          </div>
        </div>
      )}

      {voiceState === 'error' && (
        <div aria-live="assertive">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-red-50 p-3 text-red-800">
            <AlertCircle className="h-7 w-7 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => void startListening()}
            disabled={disabled}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            <Mic className="h-6 w-6" />
            {t('coloring.voice.tryAgain')}
          </button>
        </div>
      )}
    </section>
  );
}
