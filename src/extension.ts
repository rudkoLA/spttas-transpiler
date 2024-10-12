import * as vscode from "vscode";
import * as fsPromise from "fs/promises";
import * as fs from "fs";
import { TFramebulk } from "./types";
import { convertToCFG, convertToTFramebulk } from "./functions";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "spttas-transpiler" is now active!'
  );

  const compile = async () => {
    if (!vscode.window.activeTextEditor) {
      return;
    }

    const filePath = vscode.window.activeTextEditor.document.fileName;

    if (!filePath.endsWith(".p2tas")) {
      return;
    }

    const lines: string[] = [
      "sv_cheats 1",
      "spt_set_ivp_seed_on_load 1",
      "spt_afterticks_reset_on_server_activate 0",
      "spt_focus_nosleep 1",
      "cl_mouseenable 0",
      "spt_afterticks_reset",
      "-forward",
      "-moveleft",
      "-moveright",
      "-left",
      "-right",
      "-back",
      "-moveup",
      "-movedown",
      "-jump",
      "-duck",
      "-use",
      "-attack",
      "-attack2",
      "-reload",
      "-walk",
      "-speed",
      "spt_tas_strafe_lgagst 0",
      "spt_tas_strafe 0",
      "spt_tas_strafe_type 0",
      "spt_tas_strafe_yaw 0",
      "spt_tas_strafe_capped_limit 10000",
      "spt_autojump 0",
      "spt_tas_strafe_jumptype 0",
      "spt_tas_aim_reset",
      "-spt_duckspam",
      "-spt_spam",
      "spt_yawspeed 0",
      "spt_pitchspeed 0",
      "spt_tas_anglespeed 10000",
      "spt_tas_strafe_afh 1",
      "spt_tas_strafe_autojb 0",
      'spt_tas_strafe_buttons ""',
      "spt_tas_strafe_dir 3 ",
      "spt_tas_strafe_vectorial 1",
      "spt_tas_strafe_scale 1",
      "spt_record_stop",
      "spt_afterticks_await_load",
      "host_framerate 0.015",
    ];

    let aTick = 0;

    let skipToTick;
    let playBackSpeed;

    const newFilePath =
      vscode.window.activeTextEditor.document.fileName.replace(
        ".p2tas",
        ".cfg"
      );

    const file = await fsPromise.open(filePath, "r");

    for await (const line of file.readLines()) {
      if (line.startsWith("skipto ")) {
        const tick = +line.replace("skipto ", "").trim();
        skipToTick = Number.isNaN(tick) ? null : tick;
        continue;
      }

      if (line.startsWith("playspeed ")) {
        const speed = +line.replace("playspeed", "").trim();
        playBackSpeed = Number.isNaN(speed) ? null : speed;
        continue;
      }

      if (line.startsWith("start ")) {
        const start = line.replace("start", "").trim();
        if (start.startsWith("map ")) {
          lines.push(start);
        } else if (start.startsWith("save ")) {
          lines.push(start.replace("save", "load"));
        }
        continue;
      }

      if (line.startsWith("demo ")) {
        const demoName = line.replace("demo ", "");
        lines.push(`spt_afterticks 0 "spt_record ${demoName}"`);
        continue;
      }

      const commentIndex = line.indexOf("//");
      if (commentIndex === 0 || !line.includes(">")) {
        lines.push(line);
        continue;
      }

      const lineTick = +line.substring(
        line.indexOf("+") + 1,
        line.indexOf(">")
      );
      aTick = line.startsWith("+") ? aTick + lineTick : lineTick;

      lines.push(
        convertToCFG(
          convertToTFramebulk(
            commentIndex === -1 ? line : line.substring(0, commentIndex),
            aTick
          )
        ) + (commentIndex === -1 ? "" : line.substring(commentIndex))
      );
    }

    if (skipToTick && playBackSpeed) {
      lines.push(
        "mat_norendering 1",
        "spt_cvar fps_max 0",
        `spt_afterticks ${skipToTick} "spt_cvar fps_max ${
          66.666666666666 * playBackSpeed
        }"`,
        `spt_afterticks ${skipToTick} "spt_cvar mat_norendering 0"`
      );
    } else if (skipToTick) {
      lines.push(
        "mat_norendering 1",
        "spt_cvar fps_max 0",
        `spt_afterticks ${skipToTick} "spt_cvar fps_max 66.666666666666"`,
        `spt_afterticks ${skipToTick} "spt_cvar mat_norendering 0"`
      );
    } else if (playBackSpeed) {
      lines.push(`spt_cvar fps_max ${66.666666666666 * playBackSpeed}`);
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
