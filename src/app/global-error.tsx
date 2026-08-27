"use client";

import { useEffect } from "react";

/**
 * Root error boundary — the last line of defense. Unlike error.tsx (which is
 * wrapped by the root layout), global-error replaces the entire document when
 * the failure happens in the layout itself, so it renders its own <html>/<body>
 * with inline styles that don't depend on the app's CSS having loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#faf7f1",
          color: "#14241c",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p style={{ fontSize: "3rem", fontWeight: 800, color: "#74c69d", margin: 0 }}>
            Oops
          </p>
          <h1 style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: ".5rem", color: "#3d4a43", lineHeight: 1.6 }}>
            A hiccup on our side — please try again. If it keeps happening,
            contact Farmgate on WhatsApp and we&apos;ll sort it out.
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: ".75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                height: "2.75rem",
                padding: "0 1.5rem",
                borderRadius: ".875rem",
                border: "none",
                background: "#2d6a4f",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                height: "2.75rem",
                padding: "0 1.5rem",
                display: "inline-flex",
                alignItems: "center",
                borderRadius: ".875rem",
                border: "1px solid #e2dccf",
                color: "#3d4a43",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
