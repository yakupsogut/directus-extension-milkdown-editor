# Directus Extension: Milkdown Editor

A powerful, beautiful, and highly customizable WYSIWYG Markdown editor interface for Directus, powered by [Milkdown](https://milkdown.dev/) and its [Crepe](https://github.com/Milkdown/milkdown) theme.

## Features

- **Modern UI/UX:** Built on top of Milkdown's Crepe theme, providing an elegant and distraction-free writing experience.
- **Native Directus Integration:** Fully supports Directus Light/Dark modes seamlessly by mapping native CSS variables.
- **Directus File Uploads:** Drag and drop images or use the file picker to upload files directly into your Directus **Files Library**. Includes an option to specify the target folder for uploads directly from the interface settings!
- **Markdown Output:** Saves purely standard Markdown strings into your database (perfect for SSG, frontend applications, and mobile apps).

## Installation

You can install this extension via npm:

```bash
npm install directus-extension-milkdown-editor
```

Or just find it in the **Directus Marketplace** under your project settings!

## Usage & Configuration

1. In your Directus Data Model, create or edit a **Text**, **String**, or **Markdown** field.
2. In the "Interface" section, choose **Milkdown Editor**.
3. **Image Folder (Optional):** In the options, you can select a specific folder from your Directus File Library where dragged/uploaded images should be stored. If left empty, images will be uploaded to the root file directory.

## Development

If you want to modify or build this extension yourself:

```bash
npm install
npm run build
```

The extension will be built into the `dist/` directory.

## License

This project is licensed under the MIT License.
