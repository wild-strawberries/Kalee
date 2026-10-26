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
