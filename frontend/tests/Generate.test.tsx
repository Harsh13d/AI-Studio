import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AuthProvider } from '../src/context/AuthContext';
import App from '../src/App';

const session = {
  token: 'test-token',
  user: { id: 'user-1', email: 'tester@modelia.ai' },
};

const createJsonResponse = (data: unknown, init?: { status?: number }) => {
  const status = init?.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    blob: async () =>
      data instanceof Blob ? data : new Blob([JSON.stringify(data)], { type: 'application/json' }),
  };
};

describe('AI Studio generate flow', () => {
  beforeEach(() => {
    localStorage.setItem('ai-studio-session', JSON.stringify(session));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const mockSuccessfulFetch = () =>
    vi.spyOn(window, 'fetch').mockImplementation((...args) => {
      const [input, init] = args as Parameters<typeof window.fetch>;
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.endsWith('/generations') && (!init || init.method === 'GET')) {
        return Promise.resolve(createJsonResponse([]) as Response);
      }
      if (url.endsWith('/generations') && init?.method === 'POST') {
        return Promise.resolve(
          createJsonResponse({
            id: 'gen-1',
            prompt: 'Neon future',
            style: 'Avant Garde',
            imageUrl: '/uploads/mock.png',
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
          }) as Response,
        );
      }
      return Promise.resolve(
        createJsonResponse(new Blob(['fake'], { type: 'image/png' })) as Response,
      );
    });

  const renderApp = () =>
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    );

  it('renders upload, prompt, and style inputs', async () => {
    mockSuccessfulFetch();
    renderApp();
    expect(
      await screen.findByText(/drop a png or jpeg/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/style/i)).toBeInTheDocument();
  });

  it('completes generate flow and updates history', async () => {
    mockSuccessfulFetch();
    renderApp();
    const fileInput = screen.getByLabelText(/upload reference/i) as HTMLInputElement;
    const file = new File(['hi'], 'fit.png', { type: 'image/png' });
    await waitFor(() => expect(fileInput).toBeInTheDocument());
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(screen.getByLabelText(/prompt/i), {
      target: { value: 'Neon future look' },
    });
    fireEvent.change(screen.getByLabelText(/style/i), {
      target: { value: 'Avant Garde' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate look/i }));

    await waitFor(() =>
      expect(screen.getByText(/generation ready/i)).toBeInTheDocument(),
    );

    const historyRegion = await screen.findByRole('region', { name: /recent generations/i });
    expect(within(historyRegion).getByText(/neon future/i)).toBeInTheDocument();
  });

  it('handles overload retry messaging', async () => {
    const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(
      (() => {
        let callCount = 0;
        return (...args) => {
          const [input, init] = args as Parameters<typeof window.fetch>;
          const url =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.toString()
                : input.url;
          if (url.endsWith('/generations') && (!init || init.method === 'GET')) {
            return Promise.resolve(createJsonResponse([]) as Response);
          }
          if (url.endsWith('/generations') && init?.method === 'POST') {
            callCount += 1;
            if (callCount === 1) {
              return Promise.resolve(
                createJsonResponse({ message: 'Model overloaded' }, { status: 503 }) as Response,
              );
            }
            return Promise.resolve(
              createJsonResponse({
                id: `gen-${callCount}`,
                prompt: 'Retry prompt',
                style: 'Avant Garde',
                imageUrl: '/uploads/retry.png',
                status: 'COMPLETED',
                createdAt: new Date().toISOString(),
              }) as Response,
            );
          }
          return Promise.resolve(createJsonResponse({}) as Response);
        };
      })(),
    );

    renderApp();
    const fileInput = screen.getByLabelText(/upload reference/i) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(['retry'], 'retry.png', { type: 'image/png' })] },
    });
    fireEvent.change(screen.getByLabelText(/prompt/i), {
      target: { value: 'Retry prompt' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate look/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/model is overloaded/i),
      ).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(screen.getByText(/generation ready/i)).toBeInTheDocument(),
    );

    expect(fetchMock).toHaveBeenCalledTimes(3); // one GET + two POST attempts
  });

  it('allows aborting in-flight requests', async () => {
    let abortSignal: AbortSignal | undefined;
    vi.spyOn(window, 'fetch').mockImplementation((...args) => {
      const [input, init] = args as Parameters<typeof window.fetch>;
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.endsWith('/generations') && (!init || init.method === 'GET')) {
        return Promise.resolve(createJsonResponse([]) as Response);
      }
      if (url.endsWith('/generations') && init?.method === 'POST') {
        abortSignal = init?.signal ?? undefined;
        return new Promise((_resolve, reject) => {
          abortSignal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }
      return Promise.resolve(createJsonResponse({}) as Response);
    });

    renderApp();
    const fileInput = screen.getByLabelText(/upload reference/i) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(['abort'], 'abort.png', { type: 'image/png' })] },
    });
    fireEvent.change(screen.getByLabelText(/prompt/i), {
      target: { value: 'Abort prompt' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate look/i }));
    const abortButtons = await screen.findAllByRole('button', { name: /abort/i });
    fireEvent.click(abortButtons[abortButtons.length - 1]);

    await waitFor(() => expect(abortSignal?.aborted).toBe(true));

    await waitFor(() =>
      expect(screen.getByText(/generation aborted/i)).toBeInTheDocument(),
    );
  });
});

