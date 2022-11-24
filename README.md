# lxn-dg1001
A small enhancement mod for the Asobo DG1001 Neo nav computer.

Update:

Task average Speed is displayed in bottom row datafields.

<h2>Installation:</h2>
Extract the zip to a temporary location and copy the included folder "Asobo_DG1001e_Neo-lxn" to your community folder. To uninstall delete the folder and you're "back to normal".

<h2>Features</h2>

This mod changes only the map view and "Airport" Page of the default LX9070. The map is replaced with a topographic map using prerendered google map tiles. The map can be zoomed by the default bottom left rotary knob, or keybinding INCREASE/DECREASE TRANSPONDER (10) - same as in the AS33 and my LXN mods.

Wind is indicated by to arrows in the center - purple is current wind, grey the average wind over the last minutes - and a bar on the left for vertical wind component.

- There are three thin lines pointing away from your glider:
  - the blue line is simply your plane's heading
  - the pink/magenta line is your gps ground track, the direction, your plane is travelling over the terrain. The stronger a crosswind, the more this will deviate from your heading.
  - the yellow line points to your current nav target. Depending on which page you are, this is the selected airport or the current waypoint. So as a rule of thumb: "put the pink on the yellow" and you're going where you are supposed to go ;-)

- Your loaded flightplan is diplayed as the current "task" in broader pink/magenta lines, circles and semi circles.
  - the active "leg" of the task is displayed in yellow.
  - perpedicular lines indicate the start and finish lines of the task, where the task timer will start and stop automatically.
  - Small pink circles mark the turnpoints of the task. Entering the circle around the current waypoint will trigger the "waypoint ok" message and automatically switch to the next wp.
  
To switch between waypoints you need to use the keybinding INCREASE/DECREASE TRANSPONDER (1000) as there is no default button or switch available to do that via mouse click.  
  
Datafields above the map display various information about the current waypoint (that is displayed on the very top of the screen), below the map is some data about your aircraft like altitude above ground and the current "speed to fly". That speed is used to calculate the expected arrival height at current waypoint (top right) and at the finish of the loaded task (bottom right).

Arrival height calculations and flight plan management is done by the fantastic B21_Soaring_Engine by Ian "B21" Lewis. To make the most out of it, the flightplan needs to provide more information than usually present in MSFS generated flightplans. Easiest way to achieve that is to use B21's task planner to plan your flights: https://xp-soaring.github.io/tasks/b21_task_planner/index.html

<h2>Known limitations</h2>

This is more or less just a hack to get some additional functionality into the overly complicated default code. So a lot of expectable features are missing:

- all data is displayed in metric units. No unit switching whatsoever, since there is no switch available. The device's menu shows a "Units" entry, that's greyed out. Maybe that's a hint for a later update.
- no map orientation north Up/Track Up switch. Again: no switch for it
- No other configuration options to show and hide any components.


<h2>Conflicts with other mods</h2>

This mod overwrites the panel.cfg of the aircraft. This file is also frequently used by livery mods. There's no secure way around such conflicts. I recommend to use either thsi mod or a livery mod. If you really want to use both, you can try and edit the panel.cfg files yourself. The changes made here are all in the section [VCockpit06]. You can try and copy that section over to the same file in any livery mod, but do so at your own risk ;-)


