import {
  TFHold,
  TFHoldKeys,
  TFSetang,
  TFStrafe,
  TFToggle,
  TFramebulk,
} from "./types";

const toolToTFStrafe = (tool: string): TFStrafe | "off" | "keep" => {
  if (tool.includes("off")) {
    return "off";
  }

  const absmov = tool.includes("absmov");
  const absmovDeg = +tool.replace("absmov ", "");
  const strafe = tool.includes("strafe");
  const deg = tool.match(/\b(\d+(\.\d+)?)deg\b/);
  const ups = tool.match(/\b(\d+(\.\d+)?)ups\b/);
  const hasAng = tool.includes("ang");

  if (absmov && absmovDeg) {
    return { type: 3, angle: +absmovDeg };
  } else if (absmov && deg) {
    return { type: 3, angle: +deg[1] };
  } else if (strafe && deg && ups) {
    return { type: 2, angle: +deg[1], upsCap: +ups[1] };
  } else if (strafe && deg && hasAng) {
    return { type: 1, angle: +deg[1] };
  } else if (strafe && deg) {
    return { type: 0, angle: +deg[1] };
  }

  return "keep";
};

const toolToTFSetang = (tool: string): TFSetang | "off" | "keep" => {
  if (tool.includes("off")) {
    return "off";
  }

  const parameters = tool
    .replace("setang ", "")
    .replace("autoaim ", "")
    .replace("ent ", "")
    .split(" ");
  const setang = tool.includes("setang");
  const autoaim = tool.includes("autoaim");
  const autoaimEnt = tool.includes("ent");

  const parameter1 = parameters[0]; // pitch assuming setang, x position assuming autoaim to a point, index assuming auotoaim to an entity
  const parameter2 = parameters[1]; // yaw assuming setang, y position assuming autoaim to a point, x position assuming auotoaim to an entity
  const parameter3 = parameters[2]; // smoothing assuming setang, z position assuming autoaim to a point, y position assuming auotoaim to an entity
  const parameter4 = parameters[3]; // smoothing assuming autoaim to a point, z position assuming auotoaim to an entity
  const parameter5 = parameters[4]; // smoothing assuming auotoaim to an entity

  if (
    autoaim &&
    autoaimEnt &&
    parameter1 &&
    parameter2 &&
    parameter3 &&
    parameter4 &&
    parameter5
  ) {
    return {
      type: 6,
      index: +parameter1,
      x: +parameter2,
      y: +parameter3,
      z: +parameter4,
      smoothing: +parameter5,
    };
  } else if (
    autoaim &&
    autoaimEnt &&
    parameter1 &&
    parameter2 &&
    parameter3 &&
    parameter4
  ) {
    return {
      type: 5,
      index: +parameter1,
      x: +parameter2,
      y: +parameter3,
      z: +parameter4,
    };
  } else if (autoaim && autoaimEnt && parameter1) {
    return {
      type: 4,
      index: +parameter1,
    };
  } else if (autoaim && parameter1 && parameter2 && parameter3 && parameter4) {
    return {
      type: 3,
      x: +parameter1,
      y: +parameter2,
      z: +parameter3,
      smoothing: +parameter4,
    };
  } else if (autoaim && parameter1 && parameter2 && parameter3) {
    return {
      type: 2,
      x: +parameter1,
      y: +parameter2,
      z: +parameter3,
    };
  } else if (setang && parameter1 && parameter2 && parameter3) {
    return {
      type: 1,
      pitch: +parameter1,
      yaw: +parameter2,
      smoothing: +parameter3,
    };
  } else if (setang && parameter1 && parameter2) {
    return {
      type: 0,
      pitch: +parameter1,
      yaw: +parameter2,
    };
  }

  return "keep";
};

export const convertToTFramebulk = (
  line: string,
  ATick: number
): TFramebulk => {
  const framebulk: TFramebulk = {
    tools: {
      strafe: "keep",
      jump: "keep",
      autojump: "keep",
      setang: "keep",
      jumpbug: "keep",
      LGAGST: "keep",
      duckspam: "keep",
      usespam: "keep",
      saveload: null,
    },
    movement: {
      forward: "keep",
      left: "keep",
      right: "keep",
      back: "keep",
      up: "keep",
      down: "keep",
    },
    buttons: {
      jump: "keep",
      duck: "keep",
      use: "keep",
      attack1: "keep",
      attack2: "keep",
      reload: "keep",
      walk: "keep",
      sprint: "keep",
    },
    ATick: ATick,
    commands: "",
  };

  const movementBulk = line.match(/>(.*?)\|/);
  if (movementBulk && movementBulk[1]) {
    const movementBulkArr = movementBulk[1].match(/\D\d*/gm);

    if (movementBulkArr) {
      movementBulkArr.forEach((movement) => {
        [
          ["f", "forward", "off"] as const,
          ["F", "forward", "on"] as const,
          ["l", "left", "off"] as const,
          ["L", "left", "on"] as const,
          ["r", "right", "off"] as const,
          ["R", "right", "on"] as const,
          ["b", "back", "off"] as const,
          ["B", "back", "on"] as const,
          ["u", "up", "off"] as const,
          ["U", "up", "on"] as const,
          ["d", "down", "off"] as const,
          ["D", "down", "on"] as const,
        ].forEach(([testMovement, path, value]) => {
          if (movement.includes(testMovement)) {
            if (movement.length > 1) {
              framebulk.movement[path] = +movement.substring(
                1,
                movement.length
              );
            } else {
              framebulk.movement[path] = value;
            }
          }
        });
      });
    }
  }

  const buttonsBulk =
    line.match(/>.*?\|.*?\|(.*?)\|/) || line.match(/>.*?\|.*?\|(.*)/);

  if (buttonsBulk && buttonsBulk[1]) {
    const buttonsBulkArr = buttonsBulk[1].match(/\D\d*/gm);
    if (buttonsBulkArr) {
      buttonsBulkArr.forEach((button) => {
        [
          ["j", "jump", "off"] as const,
          ["J", "jump", "on"] as const,
          ["d", "duck", "off"] as const,
          ["D", "duck", "on"] as const,
          ["u", "use", "off"] as const,
          ["U", "use", "on"] as const,
          ["m", "attack1", "off"] as const,
          ["M", "attack1", "on"] as const,
          ["a", "attack2", "off"] as const,
          ["A", "attack2", "on"] as const,
          ["b", "attack1", "off"] as const,
          ["B", "attack1", "on"] as const,
          ["o", "attack2", "off"] as const,
          ["O", "attack2", "on"] as const,
          ["r", "reload", "off"] as const,
          ["R", "reload", "on"] as const,
          ["w", "walk", "off"] as const,
          ["W", "walk", "on"] as const,
          ["s", "sprint", "off"] as const,
          ["S", "sprint", "on"] as const,
        ].forEach(([testButton, path, value]) => {
          if (button.includes(testButton)) {
            if (button.length > 1) {
              framebulk.buttons[path] = +button.substring(1, button.length);
            } else {
              framebulk.buttons[path] = value;
            }
          }
        });
      });
    }
  }

  const commandBulk =
    line.match(/>.*?\|.*?\|.*?\|(.*?)\|/) || line.match(/>.*?\|.*?\|.*?\|(.*)/);

  if (commandBulk) {
    framebulk.commands = commandBulk[1];
  }

  let tools: string[] = [];
  const lineRegexMatch = line.match(/>.*?\|.*?\|.*?\|.*?\|(.*)/);

  if (line.includes(">>")) {
    tools = line.substring(line.indexOf(">>") + 2, line.length).split("; ");
  } else if (lineRegexMatch) {
    tools = lineRegexMatch[1].split("; ");
  }

  if (tools && tools.length) {
    tools.forEach((tool) => {
      if (tool === "") {
        return;
      } else if (tool.startsWith("strafe") || tool.startsWith("absmov")) {
        framebulk.tools.strafe = toolToTFStrafe(tool);
      } else if (tool.startsWith("setang") || tool.startsWith("autoaim")) {
        framebulk.tools.setang = toolToTFSetang(tool);
      } else if (tool.startsWith("autojump")) {
        if (tool.includes("off")) {
          framebulk.tools.autojump = 0;
        } else if (tool.includes("on")) {
          framebulk.tools.autojump = 1;
        } else if (tool.includes("oe")) {
          framebulk.tools.autojump = 2;
        } else if (tool.includes("gl")) {
          framebulk.tools.autojump = 3;
        }
      } else if (tool.startsWith("jumpbug")) {
        if (tool.includes("on")) {
          framebulk.tools.jumpbug = "on";
        } else if (tool.includes("off")) {
          framebulk.tools.jumpbug = "off";
        }
      } else if (tool.startsWith("LGAGST")) {
        if (tool.includes("on")) {
          framebulk.tools.LGAGST = "on";
        } else {
          framebulk.tools.LGAGST = "off";
        }
      } else if (tool.startsWith("jump")) {
        if (tool.includes("on")) {
          framebulk.tools.jump = 1;
        } else if (tool.includes("oe")) {
          framebulk.tools.jump = 2;
        } else if (tool.includes("gl")) {
          framebulk.tools.jump = 3;
        } else {
          framebulk.tools.jump = 0;
        }
      } else if (tool.startsWith("saveload")) {
        const saveName = tool.replace("saveload ", "");
        framebulk.tools.saveload = saveName;
      }
    });
  }
  // console.log(framebulk);
  return framebulk;
};

const getStrafeAF = (strafe: TFramebulk["tools"]["strafe"]): string => {
  if (strafe === "keep") {
    return "";
  } else if (strafe === "off") {
    return "spt_tas_strafe 0; spt_tas_strafe_type 0; spt_tas_strafe_yaw 0; spt_tas_strafe_capped_limit 10000; ";
  } else if (strafe.type === 2) {
    return `spt_tas_strafe 1; spt_tas_strafe_type ${strafe.type}; spt_tas_strafe_yaw ${strafe.angle}; spt_tas_strafe_capped_limit ${strafe.upsCap}; `;
  }
  return `spt_tas_strafe 1; spt_tas_strafe_type ${strafe.type}; spt_tas_strafe_yaw ${strafe.angle}; `;
};

const getAutojumpAF = (autojump: TFramebulk["tools"]["autojump"]): string => {
  return autojump === "keep"
    ? ""
    : `spt_autojump 1; spt_tas_strafe_jumptype ${autojump}; `;
};

const getJumpAF = (jump: TFramebulk["tools"]["jump"]): string => {
  return jump === "keep"
    ? ""
    : `spt_tas_strafe_jumptype ${jump}; +jump; spt_afterframes 1 -jump; `;
};

const getSetangAF = (setang: TFramebulk["tools"]["setang"]): string => {
  if (setang === "keep") {
    return "";
  } else if (setang === "off") {
    return "spt_tas_aim_reset; ";
  } else if (setang.type === 0) {
    return `spt_tas_aim ${setang.pitch} ${setang.yaw}; `;
  } else if (setang.type === 1) {
    return `spt_tas_aim ${setang.pitch} ${setang.yaw} ${setang.smoothing}; `;
  } else if (setang.type === 2) {
    return `spt_tas_aim_point ${setang.x} ${setang.y} ${setang.z}; `;
  } else if (setang.type === 3) {
    return `spt_tas_aim_point ${setang.x} ${setang.y} ${setang.z} ${setang.smoothing}; `;
  } else if (setang.type === 4) {
    return `spt_tas_aim_ent ${setang.index}; `;
  } else if (setang.type === 5) {
    return `spt_tas_aim_ent ${setang.index} ${setang.x} ${setang.y} ${setang.z}; `;
  } else if (setang.type === 6) {
    return `spt_tas_aim_ent ${setang.index} ${setang.x} ${setang.y} ${setang.z} ${setang.smoothing}; `;
  }
  return "";
};

const getTFHoldAF = (status: TFHold, key: TFHoldKeys): string => {
  if (["left", "right", "up", "down"].includes(key)) {
    key = "move" + key;
  }
  if (status === "keep") {
    return "";
  } else if (status === "on") {
    return `+${key}; `;
  } else if (status === "off") {
    return `-${key}; `;
  } else if (status >= 1) {
    return `+${key}; spt_afterframes ${status} -${key}; `;
  }
  return "";
};

const getJumpbugAF = (jumpbug: TFToggle): string => {
  if (jumpbug === "keep") {
    return "";
  } else if (jumpbug === "on") {
    return "spt_tas_strafe_autojb 1; ";
  } else if (jumpbug === "off") {
    return "spt_tas_strafe_autojb 0; ";
  }
  return "";
};

const getLGAGSTAF = (LGAGST: TFToggle): string => {
  if (LGAGST === "keep") {
    return "";
  } else if (LGAGST === "on") {
    return "spt_tas_strafe_lgagst 1; ";
  } else if (LGAGST === "off") {
    return "spt_tas_strafe_lgagst 0; ";
  }
  return "";
};

const getUsespamAF = (usespam: TFToggle): string => {
  if (usespam === "keep") {
    return "";
  } else if (usespam === "on") {
    return "+spt_spam use; ";
  } else if (usespam === "off") {
    return "-spt_spam use; ";
  }
  return "";
};

const getDuckspamAF = (duckspam: TFToggle): string => {
  if (duckspam === "keep") {
    return "";
  } else if (duckspam === "on") {
    return "+spt_spam duck; ";
  } else if (duckspam === "off") {
    return "-spt_spam duck; ";
  }
  return "";
};

const getSaveloadAF = (saveload: TFramebulk["tools"]["saveload"]): string => {
  if (saveload) {
    return `save ${saveload}; load ${saveload}; spt_afterframes_await_load`;
  }
  return "";
};

export const convertToAfterFrames = (framebulk: TFramebulk) => {
  const FHoldMovementKeys = Object.keys(
    framebulk.movement
  ) as (keyof TFramebulk["movement"])[];

  const FHoldButtonsKeys = Object.keys(
    framebulk.buttons
  ) as (keyof TFramebulk["buttons"])[];

  const FHoldMovementKeysAF = FHoldMovementKeys.map((movement) => {
    return getTFHoldAF(framebulk.movement[movement], movement as TFHoldKeys);
  }).join("");

  const FHoldButtonsKeysAF = FHoldButtonsKeys.map((buttons) => {
    return getTFHoldAF(framebulk.buttons[buttons], buttons as TFHoldKeys);
  }).join("");

  return `spt_afterframes ${
    framebulk.ATick
  } \"${FHoldMovementKeysAF}${FHoldButtonsKeysAF}${getJumpbugAF(
    framebulk.tools.jumpbug
  )}${getLGAGSTAF(framebulk.tools.LGAGST)}${getUsespamAF(
    framebulk.tools.usespam
  )}${getDuckspamAF(framebulk.tools.duckspam)}${getStrafeAF(
    framebulk.tools.strafe
  )}${getAutojumpAF(framebulk.tools.autojump)}${getJumpAF(
    framebulk.tools.jump
  )}${getSetangAF(framebulk.tools.setang)}${framebulk.commands}${getSaveloadAF(
    framebulk.tools.saveload
  )}\"`;
};
