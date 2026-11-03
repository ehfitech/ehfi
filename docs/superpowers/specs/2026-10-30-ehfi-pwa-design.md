# EHFI PWA Design

## Intent

Make the EHFI Next.js app installable from supported browsers and launch from a device icon in a standalone app window on Android, iOS, and desktop.

## Goals

- Publish a valid Web App Manifest using the Next.js App Router convention.
- Set the installed launch mode to `standalone`, with `/` as the start URL and app scope.
- Provide the manifest icon locations required by Chromium and an Apple touch icon location.
- Keep the existing `app/favicon.ico` as the browser favicon and an available fallback icon.
- Use the current EHFI visual tokens for the initial manifest and browser theme colors.
- Keep the app usable as a normal website in browsers that do not offer installation.

## Non-goals

- Web Push, notification permission prompts, VAPID keys, or push endpoints.
- Offline operation, a service worker, or custom caching behavior.
- A custom in-app install button or install prompt UI.
- Database, persistence, native Android/iOS binaries, app store packaging, or deployment.
- Generating or resizing the final app icon assets in code.

## User and platform behavior

- Android and Chromium desktop users can install through browser installation UI when their browser offers it.
- On iPhone/iPad, the user adds the site from Safari using Share → Add to Home Screen and enables Open as Web App. The installed site opens as a standalone web app without Safari's normal toolbar.
- On macOS, Safari can add a website to the Dock as a web app; Chromium browsers expose their own install UI.
- A PWA remains web content executed by the platform browser engine; it is not a native `.apk` or `.ipa` binary.
- Offline use is not promised. Without a service worker, app pages continue to need the network.

## Technical design

- The repository uses the Next.js App Router at the repository root and Next.js `16.4.3`.
- Add `app/manifest.ts`, returning `MetadataRoute.Manifest`. Next.js will publish it at `/manifest.webmanifest` and link it from the document head.
- The manifest uses `name` and `short_name` `EHFI`, `lang` `pt-BR`, `start_url` `/`, `scope` `/`, `display` `standalone`, `background_color` `#FFFFFF`, and a neutral `theme_color` fallback of `#FFFFFF`.
- Keep metadata and viewport configuration in the server root layout. Use the `viewport` export for media-aware `themeColor` fallbacks; do not use the deprecated `metadata.themeColor` option.
- At runtime, synchronize every `meta[name="theme-color"]` value to the resolved theme's computed `--background` token. This handles a manually selected theme as well as the system theme.
- Set the document language to `pt-BR`, define EHFI page/application metadata, expose Apple Web App metadata, and explicitly include `apple-mobile-web-app-capable=yes` for Safari compatibility.
- Keep the current favicon convention. Add the Apple touch icon link through Next metadata.

## Icon handoff

The existing `app/favicon.ico` remains the browser favicon and is referenced as a fallback only. It does not replace the mobile install icons. The user will create and place these PNGs under `public/pwa/`:

| File | Dimensions | Use |
| --- | ---: | --- |
| `icon-192.png` | 192×192 | Required Chromium manifest icon |
| `icon-512.png` | 512×512 | Required Chromium manifest icon |
| `apple-touch-icon.png` | 180×180 | iPhone/iPad Home Screen icon |
| `icon-maskable-512.png` | 512×512 | Optional Android adaptive/maskable icon; include in the manifest after the file exists |

The manifest references the first two files. The root metadata references the Apple icon. The optional maskable icon is documented but not referenced until it is available.

Until the required PNGs are added, the project configuration is in place but Chromium installability will not meet its required icon criteria. No image is renamed to a `.png` extension without actually being a PNG.

## Secure-origin requirement

`http://localhost` is acceptable for local browser development on the same device. A phone accessing a computer through its LAN IP is not accessing its own loopback origin, so that test needs HTTPS. A future Vercel Preview URL served over HTTPS is suitable for installation testing.

## Decisions and assumptions

- Use `EHFI` as the visible PWA name because it is the current package/repository name; change it if the product's final name differs.
- Use `#FFFFFF` for the manifest's static startup fallback; the live browser theme color comes from the `--background` token in `app/globals.css` (`#FFFFFF` in light mode and the dark token under `.dark`). The pink primary color remains an accent and must not color the status bar.
- Use Next.js built-in metadata conventions rather than the Tavvi host-specific manifest route/provider. EHFI currently has one root app/origin, while Tavvi's implementation separates multiple subdomains and includes offline and push behavior outside this scope.
- No dependency is required for the requested install-and-standalone behavior.
- Per project instructions, do not run or add tests, lint, type checking, or builds.
