# Smart Definer (Chrome Extension)

A sleek, context-aware Chrome extension that provides instant, highly relevant dictionary definitions for any word you select on a webpage. 

Unlike basic dictionary extensions, **Smart Definer** reads the sentence surrounding your selected word to determine the correct context, ensuring the most accurate definition is displayed first. 

## ✨ Features

- **Context-Aware Definitions**: Analyzes the surrounding sentence to intelligently rank and display the most relevant definition for words with multiple meanings.
- **Hover to Expand**: Instantly shows the top definition, saving screen space. Hover over the tooltip to smoothly expand and reveal alternative meanings, parts of speech, examples, and synonyms.
- **Beautiful UI & Typography**: Features a modern, non-intrusive design using the `Cascadia Mono` font family and an elegant Emerald green accent palette.
- **Auto Light/Dark Mode**: Dynamically adapts to your operating system or browser's preferred color scheme.
- **Lightning Fast**: Powered by the [Free Dictionary API](https://dictionaryapi.dev/), providing rapid lookups without leaving your current tab.

## 🚀 Installation 

Since this extension is loaded locally (not yet on the Chrome Web Store), follow these steps to install it in your browser:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** by toggling the switch in the top right corner.
4. Click the **"Load unpacked"** button in the top left.
5. Select the folder containing this extension's files (`selection-tooltip-ext`).
6. The extension is now installed and ready to use!

## 🖱️ Usage

1. Highlight any word or short phrase (up to 3 words) on any webpage.
2. A stylish tooltip will automatically appear near your cursor.
3. Read the most contextually accurate definition.
4. Hover your mouse over the tooltip to unravel more dictionary definitions, synonyms, and example sentences.
5. Click anywhere else on the page to close the tooltip.

## 🛠️ Built With

- Vanilla JavaScript (ES6+)
- CSS3 (with CSS Variables for Theming)
- HTML DOM Manipulation
- [Free Dictionary API](https://dictionaryapi.dev/) for accurate, open-source dictionary data.
