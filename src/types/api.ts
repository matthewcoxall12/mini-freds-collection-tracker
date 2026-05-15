export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
