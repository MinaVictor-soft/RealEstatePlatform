import type { ValidationProblemDetails } from '../types/contracts';

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, payload?: Partial<ApiError>) {
    super(message);
    this.status = status;
    this.title = payload?.title;
    this.detail = payload?.detail;
    this.errors = payload?.errors;
  }
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (import.meta.env.DEV) {
    return normalizedPath;
  }
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(buildUrl(path), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const problem = data as ValidationProblemDetails | null;
      throw new ApiError(
        response.status,
        problem?.title ?? problem?.detail ?? response.statusText ?? 'Request failed',
        {
          title: problem?.title,
          detail: problem?.detail,
          errors: problem?.errors,
        },
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, error instanceof Error && error.name === 'AbortError' ? 'Request timed out' : 'Network error');
  } finally {
    window.clearTimeout(timeout);
  }
}
