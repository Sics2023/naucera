"use client";

export default function DashError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card mx-4 mx-auto mt-16 max-w-lg p-6">
      <h1 className="text-lg font-semibold">Something went wrong loading this page</h1>
      <p className="mt-2 text-sm text-stone-600">
        If this is a new installation, check the database settings (<code>DB_HOST</code>, <code>DB_NAME</code>, <code>DB_USER</code>,{" "}
        <code>DB_PASSWORD</code>) in your hosting environment variables, then redeploy.
      </p>
      {error.digest && <p className="mt-2 text-xs text-stone-400">Error reference: {error.digest}</p>}
      <button onClick={reset} className="btn-primary mt-4">Try again</button>
    </div>
  );
}
