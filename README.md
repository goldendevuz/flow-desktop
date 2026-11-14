<div align="center">
  <h1>SaveTube for Windows</h1>
  <p>An open-source YouTube and YouTube Music client with a native, fully local recommendation engine.</p>
  <p>
    <a href="https://goldendevuz.github.io/savetube-website/">Website</a> ·
    <a href="https://github.com/goldendevuz/savetube-android">Android app</a> ·
    <a href="https://github.com/goldendevuz/savetube-extension">Browser extension</a>
  </p>
</div>

---

> **SaveTube** is a personal fork of [Flow Desktop](https://github.com/Flow-Tube/Flow-Desktop) by A-EDev, released under the GNU GPL v3.0. It is made for personal use and has no paid version.

SaveTube uses YouTube's public data without an official API, so it can stop working when YouTube changes something. It is not affiliated with or endorsed by YouTube or Google. The installer is not code-signed, so Windows SmartScreen may warn before it runs.

## Features

- Native video playback with quality and codec selection, chapters, subtitles, playback speed, queues, mini-player and Picture-in-Picture.
- YouTube Music home, search, artists, albums, playlists, synchronized lyrics and an equalizer.
- A Shorts feed, local subscriptions, playlists, Watch Later, likes, history and Continue Watching.
- SponsorBlock, DeArrow and Return YouTube Dislike.
- Imports from Flow backups, Google Takeout, NewPipe, LibreTube, FreeTube and OPML.
- A local recommendation engine (SaveTube Neuro) that learns from watches, skips, likes and searches, and keeps everything on your PC.

### What SaveTube adds to Flow

- **Home filters:** hide videos below a number of views (10 up to 1 billion), hide channels below a number of subscribers, hide music videos, hide a single video from the card menu, and choose whether fresh uploads from your subscriptions are pinned. Changing a filter rebuilds Home at once.
- **Subscribe** from the video card menu, the channel card in search and the channel page.
- **Subscriptions** sort by name, recent upload, subscribers, video count and when you subscribed.
- **Regions:** Uzbekistan and Automatic send no country limit (YouTube rejects `gl=UZ` on browse), and Uzbek view and subscriber counts (ming, mln, mlrd) are read correctly.
- **Sync** with the Android app for Shorts and Home filter settings, history, likes, playlists and subscriptions, always on, through a WebDAV folder you own, end-to-end encrypted.
- **Browser extension:** the [SaveTube extension](https://github.com/goldendevuz/savetube-extension) sends YouTube videos to this app through a loopback bridge on port 47893 (or the `savetube://` link).
- Zoom with Ctrl +, Ctrl − and Ctrl 0, remembered between launches.

## Install

Download the installer from the [latest release](https://github.com/goldendevuz/flow-desktop/releases/latest) and run it. New versions install over the old one and keep your data. Builds also come from [GitHub Actions](https://github.com/goldendevuz/flow-desktop/actions/workflows/windows-exe.yml) (Run workflow, then download the artifact).

## Privacy

- No Google account is required, and there is no advertising or analytics code.
- History, settings, library data and recommendation state are stored locally in SQLite.
- Media is relayed through a tokenized loopback-only proxy, and the extension bridge accepts only loopback requests.

SaveTube still contacts YouTube, and the optional services SponsorBlock, DeArrow, Return YouTube Dislike and the lyrics providers you enable, when their features are used.

## Build it yourself

You need Node.js 22, pnpm and the Rust toolchain.

```sh
pnpm install
pnpm tauri dev          # run
pnpm tauri build        # build an installer
```

CI runs `cargo fmt --check`, the Rust and web tests, and a store inventory check: every new settings key and table needs a row in `src-tauri/tests/profiles/store_inventory.tsv`.

## Credits

SaveTube is built on [Flow Desktop](https://github.com/Flow-Tube/Flow-Desktop) and the projects it thanks, including [NewPipeExtractor](https://github.com/TeamNewPipe/NewPipeExtractor), [Tauri](https://tauri.app/), SponsorBlock and DeArrow. If you like the app, consider supporting the original author: [Flow on Open Collective](https://opencollective.com/flow-tube).

## Licence

GNU GPL v3.0, like Flow. See [LICENSE](LICENSE) and [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
