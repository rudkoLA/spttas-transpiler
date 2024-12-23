export type TFHold = "keep" | "on" | "off" | number;
export type TFToggle = "keep" | "on" | "off";
export type TFHoldKeys =
  | keyof TFramebulk["movement"]
  | keyof TFramebulk["buttons"];

export type TFStrafe =
  | { type: 0; angle: number } // spt_tas_strafe 1; spt_tas_strafe_type 0; spt_tas_strafe_yaw angle
  | { type: 1; angle: number } // spt_tas_strafe 1; spt_tas_strafe_type 1; spt_tas_strafe_yaw angle
  | { type: 2; angle: number; upsCap: number } // spt_tas_strafe 1; spt_tas_strafe_type 2; spt_tas_strafe_yaw angle; spt_tas_strafe_capped_limit upsCap
  | { type: 3; angle: number } // spt_tas_strafe 1; spt_tas_strafe_type 3; spt_tas_strafe_yaw angle
  | { type: 4; angle: number; scale: number }; // spt_tas_strafe 1; spt_tas_strafe_type 3; spt_tas_strafe_yaw angle; spt_tas_strafe_scale

export type TFSetang =
  | { type: 0; pitch: number; yaw: number } // spt_tas_aim pitch yaw
  | { type: 1; pitch: number; yaw: number; smoothing: number } // spt_tas_aim pitch yaw smoothing
  | { type: 2; x: number; y: number; z: number } // spt_tas_aim_point x y z
  | { type: 3; x: number; y: number; z: number; smoothing: number } // spt_tas_aim_point x y z smoothing
  | { type: 4; index: number } // spt_tas_aim_ent index
  | { type: 5; index: number; x: number; y: number; z: number } // spt_tas_aim_ent index x y z
  | {
      type: 6;
      index: number;
      x: number;
      y: number;
      z: number;
      smoothing: number;
    } // spt_tas_aim_ent index x y z smoothing
  | {
      type: 7;
      pitch: number;
      yaw: number;
      smoothing: number;
      cone: number;
    }; // spt_tas_aim pitch yaw smoothing cone

export type TFramebulk = {
  tools: {
    strafe: "keep" | "off" | TFStrafe; // spt_tas_strafe 0
    jump: "keep" | 0 | 1 | 2 | 3; // +jump spt_tas_strafe_jumptype 0 | 1 | 2 | 3 // afterticks tick +jump; afterticks tick+1 -jump
    autojump: "keep" | "off" | 0 | 1 | 2 | 3; // spt_autojump 1; spt_tas_strafe_jumptype 0 | 1 | 2 | 3
    setang: "keep" | "off" | TFSetang; // spt_tas_anglespeed 1000; spt_tas_aim_reset
    jumpbug: TFToggle; // spt_tas_strafe_autojb 1
    LGAGST: TFToggle; // spt_tas_strafe_lgagst 1
    usespam: TFToggle; // +spt_spam use
    duckspam: TFToggle; // +spt_spam duck
    saveload: null | string;
    awaitload: boolean;
  };
  movement: {
    forward: TFHold; // +forward
    left: TFHold; // +moveleft
    right: TFHold; // +moveright
    back: TFHold; // +back
    up: TFHold; // +moveup
    down: TFHold; // +movedown
  };
  buttons: {
    jump: TFHold; // +jump
    duck: TFHold; // +duck
    use: TFHold; // +use
    attack: TFHold; // +attack
    attack2: TFHold; // +attack2
    reload: TFHold; // +reload
    walk: TFHold; // +walk
    speed: TFHold; // +speed
    zoom: TFHold; // +zoom
  };
  ATick: number; // spt_afterticks
  commands: string;
};
