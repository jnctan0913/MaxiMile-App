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

        {/* PWA: iOS standalone mode — hides Safari browser bar on home screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MaxiMile" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* PWA: Android + desktop */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F5F0E8" />

        <ScrollViewStyleReset />
        {/* Preload the font so the browser fetches it at high priority */}
        <link
          rel="preload"
          href="/fonts/Ionicons.ttf"
          as="font"
          type="font/ttf"
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vvjr0ap4km");
        `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
