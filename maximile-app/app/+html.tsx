import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Custom HTML shell for the web build.
 *
 * Loads Ionicons font via a clean path (/fonts/Ionicons.ttf) with
 * font-display:block so the browser waits for the font bytes before
 * rendering any icon glyphs — preventing blank squares on Safari/Firefox.
 *
 * The font file is served from public/fonts/Ionicons.ttf (no hash, no @
 * character in the path, which caused 404s on Vercel CDN).
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {/* Preload the font so the browser fetches it at high priority */}
        <link
          rel="preload"
          href="/fonts/Ionicons.ttf"
          as="font"
          type="font/truetype"
          // @ts-ignore — crossOrigin is valid HTML here
          crossOrigin="anonymous"
        />
        {/* Register the font-face with font-display:block.
            "block" = browser waits up to 3s for the font bytes before
            rendering — no blank squares during load. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: "ionicons";
                src: url("/fonts/Ionicons.ttf") format("truetype");
                font-weight: normal;
                font-style: normal;
                font-display: block;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
