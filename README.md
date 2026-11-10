# Kalee

Kalee (कली, "bud") is a small app for learning Hindi.

- **Study**: nouns, adverbs, adjectives and verbs, grouped by theme, searchable in English, romanized Hindi or Devanagari, with a sentence-structure guide.
- **Play → Words**: type the translation of single words (English → Hindi, Hindi → English or mixed). Answers in Hindi can be romanized or Devanagari; spelling variations like *jana / jaana* are accepted.

It is a Progressive Web App: open it on your phone and use **Add to Home Screen** to install it.

## Live app
https://wild-strawberries.github.io/Kalee/

## Editing the words
All vocabulary lives in `src/data/lexicon.json`. Study and the games both read from it.

## Running it on a computer
```
npm install
npm run dev
```

## Publishing
Every push to `main` builds the app and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`).

## Games
- **Words**: single words from the Study lists (`src/data/lexicon.json`).
- **Sentences**: 900 sentences in three levels — Easy (2–5 words), Medium (6–9) and Hard (10–15) — from `src/data/sentences.json`. Answers are compared word by word, tolerant of spelling; if an answer is a valid alternative translation, the player can count it as correct.
- **Recognition**: a word in one language and six choices in the other — the right one, similar words (meaning or spelling), a different form of the word when the bank has one (close → closed), and other words of the same type. Choices are built in `src/options.ts`.
