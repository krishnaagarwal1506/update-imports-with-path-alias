# ts-path-alias-cli

A command-line tool for updating import paths in JavaScript and TypeScript projects based on TypeScript path aliases defined in `tsconfig.app.json`.

## Features

- Automatically updates import statements in your project files to use path aliases.
- Supports TypeScript and JavaScript files.
- Recursively processes files in the specified source directory.

## Installation

To install the package, clone the repository and run:

```
npm install
```

## Usage

After installation, you can run the tool using the following command:

```
npx ts-path-alias
```

This command will read the `tsconfig.app.json` file in the project root and update the import paths in the `src` directory.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.