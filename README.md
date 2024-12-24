# SPTTAS Transpiler

## Overview
The SPTTAS Transpiler is a tool designed to convert TASes written in the .p2tas format into the SPT afterticks TAS format. The converted code is then written to a .cfg file, which can be ran in game using the `exec` command. This allows people to write TASes using the .p2tas format inside of games like Half-Life 2, Portal 1, and other games that run on the same engine and have SPT support.

## Building
To build the SPTTAS Transpiler, clone the repository and install the dependencies:
```bash
git clone https://github.com/rudkoLA/spttas-transpiler.git
cd spttas-transpiler
npm install
npm install -g vsce
vsce package
```

## Usage
To transpile a file from .p2tas to the SPT afterticks format, follow these steps:

1. Build the extension yourself or download the latest release from [here](https://github.com/rudkoLA/spttas-transpiler/releases).
2. Open a folder containing the .p2tas file in Visual Studio Code.
3. Right-click on the file and select "Install Extension VSIX".
4. Press `Ctrl + Shift + P`, type "Compile", and press Enter.
5. Every time you save a .p2tas file, a corresponding .cfg file will be generated.

**IMPORTANT!** Make sure to execute the "Compile" command every time you start a new vscode window so that your TAS is actually being converted and you're not running the same file without changes.

## Documentation
You can find the documentation for using this version of .p2tas [here](https://github.com/rudkoLA/spttas-transpiler/blob/main/docs.md).

## Contact
For any questions or feedback, please open an issue on the [GitHub repository](https://github.com/rudkoLA/spttas-transpiler) or message p2tas directly on Discord.