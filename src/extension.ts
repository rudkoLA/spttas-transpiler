// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fsPromise from "fs/promises";
import * as fs from "fs";
import { TFramebulk } from "./types";
import { convertToAfterFrames, convertToTFramebulk } from "./functions";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "spttas-transpiler" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  let compile = vscode.commands.registerCommand(
    "spttas-transpiler.compile",
    async () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }

      const filePath = vscode.window.activeTextEditor.document.fileName;

      if (!filePath.endsWith(".p2tas")) {
        return;
      }

      const lines: Array<TFramebulk | string> = [];
      let aTick = 0;

      const newFilePath =
        vscode.window.activeTextEditor.document.fileName.replace(
          ".p2tas",
          ".cfg"
        );

      const file = await fsPromise.open(filePath, "r");

      for await (const line of file.readLines()) {
        if (line.startsWith("//") || !line.includes(">")) {
          lines.push(line);
          continue;
        }

        const lineTick = +line.substring(
          line.indexOf("+") + 1,
          line.indexOf(">")
        );

        if (line.startsWith("+")) {
          aTick += lineTick;
          lines.push(convertToAfterFrames(convertToTFramebulk(line, aTick)));
        } else {
          aTick = lineTick;
          lines.push(convertToAfterFrames(convertToTFramebulk(line, aTick)));
        }
      }
      fs.writeFileSync(newFilePath, lines.join("\n"));
    }
  );

  context.subscriptions.push(compile);
}

// This method is called when your extension is deactivated
export function deactivate() {}
