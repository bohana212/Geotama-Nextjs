/**
 * Pengganti set_exception_handler / register_shutdown_function di PHP:
 * setiap error server di Next.js dikirim ke Telegram (kalau bot sudah diatur).
 */
export async function onRequestError(err: unknown, request: { path: string }) {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { notifyServerError } = await import('./lib/telegram');
    await notifyServerError(err, request.path);
  }
}
