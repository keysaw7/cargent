export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export function actionOk<T = unknown>(data?: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionError(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function postgresErrorMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return "Cette valeur est déjà utilisée.";
  }

  return error.message;
}
