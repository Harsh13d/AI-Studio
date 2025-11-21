import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGenerations } from '../hooks/useGenerations';
import { useGenerate } from '../hooks/useGenerate';
import { UploadInput } from './UploadInput';
import { HistoryList } from './HistoryList';
import { StatusBanner } from './StatusBanner';
import { Spinner } from './Spinner';
import type { Generation } from '../types';

const STYLE_OPTIONS = ['Avant Garde', 'Streetwear Luxe', 'Minimal Tailored', 'Resort Glow'];

export const Studio = () => {
  const { user, token, logout } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(STYLE_OPTIONS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const { items, isLoading: historyLoading, error: historyError, addGeneration } =
    useGenerations(token);

  const {
    generate,
    abort,
    status,
    error,
    currentGeneration,
    retryState,
  } = useGenerate(token, addGeneration);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setFormError(null);
  };

  const handleClearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileName(null);
  };

  const validateForm = () => {
    if (!selectedFile) {
      setFormError('Please upload a reference image.');
      return false;
    }
    if (!prompt || prompt.length < 5) {
      setFormError('Prompt should be at least 5 characters.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm() || !selectedFile) return;

    const formData = new FormData();
    formData.append('prompt', prompt.trim());
    formData.append('style', style);
    formData.append('image', selectedFile);

    try {
      await generate(formData);
    } catch {
      // error surfaced via banner
    }
  };

  const restoreFromHistory = async (generation: Generation) => {
    setIsRestoring(true);
    setPrompt(generation.prompt);
    setStyle(generation.style);
    setFileName('Restored look');
    try {
      const response = await fetch(generation.imageUrl);
      const blob = await response.blob();
      const restoredFile = new File([blob], 'restored-look.png', { type: blob.type });
      handleFileSelect(restoredFile);
    } catch {
      setPreviewUrl(generation.imageUrl);
      setSelectedFile(null);
    } finally {
      setIsRestoring(false);
    }
  };

  const canAbort = status === 'loading';
  const isGenerating = status === 'loading';

  const retryAttemptsMessage = useMemo(() => {
    if (retryState.attempts === 0 && !retryState.isRetrying) return null;
    return `Retrying… attempt ${Math.min(
      retryState.attempts + 1,
      retryState.maxAttempts,
    )}/${retryState.maxAttempts}`;
  }, [retryState]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
      <section className="w-full rounded-3xl bg-slate-900/70 p-8 shadow-xl lg:w-2/3">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-slate-500">
              Studio
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Welcome back, {user?.email.split('@')[0]}
            </h2>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
          >
            Log out
          </button>
        </header>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <UploadInput
            onFileSelect={handleFileSelect}
            onClear={handleClearFile}
            previewUrl={previewUrl}
            fileName={fileName}
            disabled={isGenerating}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="prompt">
              Prompt
              <textarea
                id="prompt"
                className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-3 py-3 text-base text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                placeholder="Describe the vibe, fabrics, silhouettes…"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                disabled={isGenerating}
                required
              />
            </label>

            <label className="text-sm font-semibold text-slate-300" htmlFor="style">
              Style
              <select
                id="style"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                value={style}
                onChange={(event) => setStyle(event.target.value)}
                disabled={isGenerating}
              >
                {STYLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formError && <StatusBanner status="error" message={formError} />}
          {status === 'loading' && (
            <StatusBanner status="info" message="Generating your look…" attempts={retryAttemptsMessage ?? undefined} />
          )}
          {retryState.isRetrying && (
            <StatusBanner status="info" message="Model is overloaded, holding your request…" attempts={retryAttemptsMessage ?? undefined} />
          )}
          {error && status !== 'success' && (
            <StatusBanner status="error" message={error} attempts={retryAttemptsMessage ?? undefined} />
          )}
          {status === 'success' && currentGeneration && (
            <StatusBanner
              status="success"
              message="Generation ready! Scroll down to revisit anytime."
            />
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600"
              disabled={isGenerating}
            >
              {isGenerating && <Spinner />}
              {isGenerating ? 'Generating' : 'Generate look'}
            </button>
            {canAbort && (
              <button
                type="button"
                onClick={abort}
                className="rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
              >
                Abort
              </button>
            )}
            {isRestoring && <p className="text-sm text-slate-400">Restoring look…</p>}
          </div>
        </form>
      </section>

      <aside className="w-full rounded-3xl bg-slate-900/40 p-6 shadow-xl lg:w-1/3">
        <HistoryList
          items={items}
          isLoading={historyLoading}
          error={historyError}
          onSelect={restoreFromHistory}
        />
      </aside>
    </div>
  );
};

