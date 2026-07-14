# KanjiCanvas vendor

Local client-side Kanji recognizer vendored from
[asdfjkl/kanjicanvas](https://github.com/asdfjkl/kanjicanvas).

- `kanji-canvas.min.js`: recognition implementation.
- `ref-patterns.js`: local reference model.
- `LICENSE.TXT`: upstream MIT license and required backlink.

The files are loaded lazily by `handwritingRecognition.js`; no strokes or
recognition requests leave the browser.
