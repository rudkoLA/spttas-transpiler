# Documentation for the spttas-transpiler

(half stolen from [.srctas documentation](https://docs.google.com/document/d/11iu9kw5Ufa3-QaiR7poJWBwfe1I56wI6fBtDgmWZ8Aw/edit?usp=sharing) and half from [Portal 2 TAS-ing wiki page](https://wiki.portal2.sr/TASing))

## How do I run a script?

Load SPT. Then use the command:

- `exec <script path>`

The path is relative to the cfg directory inside of the game directory (hl2/portal/ep2/etc). The path is written without the extension(appended automatically). All `.p2tas` scripts will have a duplicate with the `.cfg` file extension.

## Headers

### Start

All scripts must have a save file to start from.

_Syntax_:
- `start save <save name>` OR `start map <map name>`
_Examples_: 
- `save coast` - loads the save called `coast` and starts the tas.
- `save tas/d1_trainstation_02` - loads a save located in the `tas` folder which was made on the first tick of the map of the same name.
- `map d3_breen_01` - starts the tas after loading into the map d3_breen_01.
### Demo

All scripts should also have a demo line to start demo recording.

_Syntax_:
- `demo <demo name>`
_Examples_:
- `demo coast` - starts recording demos where after every consecutive segment will be changed to `coast_[n]` where n is the number of the segment  
- `demo demos/tases/fullgame/d1_trainstation_01` - same as the first example but starts recording to `[game_directory]/demos/tases/fullgame/d1_trainstation_01_[n]`
## Comments

You can comment the file by using double slash comments. Anything on the line after the comment will be ignored by the parser. 
_Example_:

- `save tas // this starts the tas from the "tas" save file` 
- `demo mydemo // this makes the script set the demo name to mydemo`
- `// +5>|||save quick`

will be read by the parser as:
- `save tas`
- `demo mydemo`
- *nothing*
## Framebulk

Framebulks store the inputs and commands that should be executed by a virtual controller at a given tick. Every line that isn’t a header line, a repeat block (explained later) or a comment is considered to be a framebulk. They’re formatted like this:

```
tick>movement|blank|buttons|commands|tools
```
or
```
tick>>tools
```

Below is an explanation of each field in a framebulk:
### Tick

The number of ticks since the beginning of the TAS. This dictates when the framebulk will be executed. It can also be written with a `+` in front, in which case it will indicate the number of ticks compared to the previous framebulk instead.

_Examples_:

- If a tick value is `20`, the framebulk will be executed 20 ticks after TAS script has started.
- If a tick value is `+10`, the framebulk will be executed 10 ticks after the previous framebulk.

### Movement

A list of digital inputs that should be pressed or released. Each digital action has a letter assigned. An uppercase letter presses down the input, a lowercase releases it. Additionally, by putting a number after an uppercase button, you can specify a number of ticks after which it will be released automatically. 

Here are all the possible entries:

- F - `forward`
- L - `left`
- R - `right`
- B - `back`
- U - `up` (in water)
- D - `down` (in water)

_Examples_:

- `B10` will be moving backwards for 10 ticks.
- `U` will start moving upwards in water. `u` will stop moving upwards in water.
- `FR` will move diagonally forwards right.
- `bF` will stop moving backwards and start moving forwards.
- `BLUDFR` will attempt to move in all directions and in turn will do nothing.

### Blank

So far there's no use of this area of the framebulk: `x>|[here]|||`, but that may or may not change in the future!

### Buttons

A list of digital inputs that should be pressed or released. Each digital action has a letter assigned. An uppercase letter presses down the input, a lowercase releases it. Additionally, by putting a number after an uppercase button, you can specify a number of ticks after which it will be released automatically.

Here are all the possible entries:

- J - `jump`
- D - `duck`
- U - `use`
- M - `attack` (main attack)
- A - `attack2` (alt attack)
- B - `attack` (blue portal)
- O - `attack2` (orange portal)
- R - `reload`
- W - `walk`
- S - `speed` (sprint)
- Z - `zoom`

Jump, Duck, Use, M (Attack), A (Attack2), Blue portal, Orange portal, Reload, Walk, Sprint (M and A are interchangeable with B and O)

_Examples_:

- `D` will press the duck input. `d` will release the duck input.
- `D8` will press and hold the duck input for 8 ticks, then release it.
- `dU1J` will release the duck input, press the use input for 1 tick, and press the jump input. All other inputs will remain at their previous state.

### Commands

A string representing a console command or multiple console commands separated by semicolons. Everything typed here will be executed in the console at the given tick.

_Example_: `echo I hate this game; quit` will print "_I hate this game_" the console and turn the game off.

### Tools

A string representing an automation tool command or a set of tool commands separated by semicolons. The usage of automation tools will be explained later.

  
Everything connected together gives us an example of a fully populated framebulk:

```
20>B||dU1J|echo I hate this game; quit|strafe 90deg; setang 0 90 20
```

## Preserving rules

The TAS script player will keep the previously set state of a virtual controller input if no information about it was given for current tick. This allows you to skip certain parts of a framebulk or even entire framebulks if you want specific input to continue for a specific amount of ticks.

  
Examples below are just random framebulks. Dots at the top and the bottom are there to show that it’s only a part of a full script, and you should think about these examples as such.

_Example 1_: There are no framebulks for ticks 11 to 19, the player will just continue going forward until the tick 20.

```
...
10>F
20>f
...
```
_Example 2_: Framebulk 15 is missing information about button states. Duck will be held for that tick until tick 20 where it is unpressed.

```
...
14>||D
15>
20>||d|echo tick 20!!!!
...
```

_Example 3_: Framebulk 21 has only movement field and 22 has only button field with lowercase d. Player will move for 11 ticks while trying to crouch, stop moving at tick 21 and stop crouching at tick 22.

```
...
10>F||D
21>0 0
22>||d
...
```

Notice that, even though fields are not mandatory, you have to use the separator `|` characters to reach the correct field. Button field is the third one, so even if you don’t use movement and analog fields, you have to put two separators before it.

Additionally, commands and tools fields are not preserved. In other words, they won't be repeatedly executed every tick until the field is “cleaned up”. They will execute only once in a tick specified by a framebulk.

## Tools bulk

When TASing, you'll find yourself commonly writing framebulks that only contain information in the tools field. For instance:
```
+7>||||strafe 0deg
```

To improve readability of such bulks you can use "tool bulks", which only contain the tools field:

```
tick>>tools
```

The previous example as a tool bulk would be:
```
+7>>strafe 0deg
```

# Automation tools

Automation tools are controlled through the tools field in a framebulk, which works in a similar way to the commands field. They work by modifying the view/movement analog and button fields in the framebulk every tick.

## Strafe tool

The `strafe` tool will adjust player input to get a different kind of strafing depending on parameters.

_**Syntax**_: `strafe [parameters]`

_**Possible parameters**_:

_Strafe Tool:
- `off` - disables strafing entirely.
- `ang` - makes the autostrafer try to reach the target angle as fast as possible even if it loses speed.
- `[number]ups` - sets a target velocity of `[number]` units per second for the autostrafer.
- `[number]deg` - sets a target yaw angle of `[number]` degrees autostrafer should strafe towards.

_**Examples**_:

- `strafe 180deg` - strafes towards angle 180 with optimizing for speed gain.
- `strafe -30deg 1000ups`  - strafes towards angle -30 while trying to keep under 1000ups.
- `strafe 5.4deg ang` - strafes towards angle 5.4deg while optimizing for angle change.

## Autojump tool

Autojump tool will change the jump button state depending on whether the player is grounded or not, resulting in automatically jumping on the earliest contact with a ground.

_**Syntax**_: `autojump [on|ah|oe|gl|off]`
- `autojump on` - jumps normally.
- `autojump ah` - jumps while trying to abh/afh etc.
- `autojump oe` - jumps optimally for old engine.
- `autojump gl` - jumps optimally for glitchless.
- `autojump off` - turn off autojump.

## Jump tool

Jump uses the same syntax as the autojump tool, but instead of constantly being on, the jump tool does a singular jump and turns off a tick later. If no parameter is specified, simply does a normal jump.

_**Syntax**_: `jump [ah|oe|gl]`

## Absolute movement tool

Absolute movement tool will generate movement values depending on the absolute move direction you provide in degrees.

_**Syntax**_: `absmov <angle> [strength]`

Giving `off` as an argument will disable the tool. The strength parameter must be between 0 and 1 (default) and controls how fast the player will move.

_**Examples**_:

- `absmov 90` - enables absolute movement towards positive Y.
- `absmov 90 0.5` - enables absolute movement towards positive Y, but half as fast.
- `absmov off` - disables absolute movement.

## Set view angles tool

This tool works basically the same as `setang` console command. It will adjust the view analog in a way so the camera is looking towards given angles.

_**Syntax**_: `setang <pitch> <yaw> [time] [cone]`

The tool will set the pitch and yaw according to given angles in degrees. `time` specifies how long a transition to new angles takes, in ticks. If omitted, transition happens instantly. `cone` specifies the spread cone, only used in hl2 to negate recoil/spread, AR2: 3, Pistol & SMG: 5.

_**Examples**_:

- `setang 69 42.0` - instantly rotates the camera to angles 69 42.0.
- `setang 0 0 20` - slowly rotates the camera towards angles 0 0 over the next 20 ticks.
- `setang 90 0 10 exp` - rotates the camera the camera towards angles 90 0 over 10 ticks using the exponential easing.
- `setang -3 -16 1 3` - instantly looks at angles -3 -16 and uses the AR2 cone to aim.

## Auto aim tool

The Auto Aim tool will automatically aim towards a specified point in 3D space.

_**Syntax**_: `autoaim <x> <y> <z> [time]` OR `autoaim ent <index> [time]`

To find the name or index of an entity, do `developer 1` and  `ent_text` in console while looking at it. The first line is `(<index>) Name: <name> (<classname>)`

The easing types are the same as the `setang` tool above

_**Examples**_:
- `autoaim 0 0 0` - aims at world origin.
- `autoaim 0 0 0 20` - aims at world origin, but smoothed over 20 ticks.
- `autoaim 1000 2134 47381` - aims fucking nowhere.
- `autoaim ent 212 30` - aims at entity index 212, smoothed over 30 ticks.
## Jump Bug tool

The Jump Bug tool will try to execute a jumpbug, if possible, when enabled

_**Syntax**_: `jumpbug on|off`
## LGAGST tool

LGAGST stands for Leave Ground at Air-Ground Speed Threshold, enables most optimal jumping for glitchless in portal 1.

_**Syntax**_: `LGAGST on|off`

## Saveload tool

Saves 

_**Syntax**_: `LGAGST on|off`
