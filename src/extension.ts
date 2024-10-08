// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fsPromise from "fs/promises";
import * as fs from "fs";
import { TFramebulk } from "./types";
import { convertToafterticks, convertToTFramebulk } from "./functions";

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

  const compile = async () => {
    if (!vscode.window.activeTextEditor) {
      return;
    }

    const filePath = vscode.window.activeTextEditor.document.fileName;

    if (!filePath.endsWith(".p2tas")) {
      return;
    }

    const lines: Array<TFramebulk | string> = [];
    let aTick = 0;
    let waitTick = 0;

    const newFilePath =
      vscode.window.activeTextEditor.document.fileName.replace(
        ".p2tas",
        ".srctas"
      );

    const file = await fsPromise.open(filePath, "r");

    for await (const line of file.readLines()) {
      if (line.startsWith("skipto")) {
        const tick = +line.replace("skipto", "").trim();
        if (!Number.isNaN(tick)) {
          lines.push(`|||-|-|${tick - waitTick}|`);
        }
        continue;
      }

      if (line.startsWith("//") || !line.includes(">")) {
        lines.push(line);
        continue;
      }

      if (line.startsWith("0>|||")) {
        lines.push("|||-|-|1|" + line.substring(5, line.length));
        continue;
      }

      const lineTick = +line.substring(
        line.indexOf("+") + 1,
        line.indexOf(">")
      );

      if (line.startsWith("+")) {
        aTick += lineTick;
        lines.push(
          convertToafterticks(convertToTFramebulk(line, aTick), ++waitTick)
        );
      } else {
        aTick = lineTick;
        lines.push(
          convertToafterticks(convertToTFramebulk(line, aTick), ++waitTick)
        );
      }
    }
    fs.writeFileSync(newFilePath, lines.join("\n"));
  };

  let compileVSCommand = vscode.commands.registerCommand(
    "spttas-transpiler.compile",
    compile
  );

  vscode.workspace.onDidSaveTextDocument(compile);

  context.subscriptions.push(compileVSCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
