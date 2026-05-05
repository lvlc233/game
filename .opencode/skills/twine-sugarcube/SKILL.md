---
name: twine-sugarcube
description: SugarCube v2 story format development for Twine 2 interactive narratives. Use when creating, editing, or debugging SugarCube-based stories, writing macros, managing game state, building custom UI, or converting between Twine HTML and Twee source. Covers SugarCube macro syntax, variable systems, save/load, audio, and story lifecycle.
---

# SugarCube v2 Story Format Skill

Expert knowledge for developing interactive stories with SugarCube v2 in Twine 2.

## Core Concepts

SugarCube is a free (gratis and libre) story format for Twine/Twee that continues Twine 1 traditions while expanding functionality. It is more powerful than Harlowe but requires greater programming knowledge for advanced usage.

### Passage Structure

Passages are the basic unit of content:

```html
<!-- In a Twine HTML file -->
<tw-passagedata pid="1" name="Start" tags="" position="100,100" size="100,100">
  Passage content with [[links->OtherPassage]] and <<macros>>.
</tw-passagedata>
```

Passage attributes:
- `pid`: Numeric passage ID
- `name`: Unique passage name (case-sensitive)
- `tags`: Space-separated tag string
- `position`: X,Y coordinates for Twine editor
- `size`: Width,Height for Twine editor

### Story Data

```html
<tw-storydata
  name="StoryTitle"
  startnode="1"
  creator="Twine"
  creator-version="2.5.1"
  format="SugarCube"
  format-version="2.36.1"
  ifid="UUID-HERE"
  options=""
  tags=""
  zoom="1"
  hidden="">
```

## Macro System

SugarCube uses `<< >>` delimiters for macros.

### Variables

```html
<!-- Setting variables -->
<<set $name to "Player">>
<<set $health = 100>>
<<set $inventory to []>>
<<set $flags = {}>>

<!-- Temporary variables (single underscore, scope-limited) -->
<<set _temp to "local">>

<!-- Destructuring -->
<<set [$a, $b, $c] to [1, 2, 3]>>
<<set {name: $n, age: $a} to $person>>

<!-- Deleting -->
<<run delete $variable>>
```

### Control Flow

```html
<<if $health > 50>>
  You are healthy.
<<elseif $health > 20>>
  You are wounded.
<<else>>
  You are dying.
<</if>>

<<switch $class>>
  <<case "warrior">> Strong and brave.
  <<case "mage">> Wise and powerful.
  <<default>> A commoner.
<</switch>>

<<for _i to 0; _i < $array.length; _i++>>
  Item _i: <<=$array[_i]>>
<</for>>

<<for _item range $array>>
  <<=_item>>
<</for>>

<<while $condition>>
  Looping...
<<capture $modifying>> <!-- capture ensures correct closure -->
<</while>>
```

### Links and Navigation

```html
<!-- Simple link -->
[[Passage Name]]
[[Link Text->Passage Name]]
[[Passage Name<-Link Text]]
[[Link Text|Passage Name]]

<!-- Setter link -->
[[Link Text->Passage Name][$health to $health - 10]]

<<link "Click me">>
  <<set $clicked to true>>
<</link>>

<<link "Go somewhere" "Destination">>
  <<set $visitedDest to true>>
<</link>>

<<button "Confirm">>
  <<set $confirmed to true>>
  <<goto "Next">>
<</button>>

<!-- Return to previous passage -->
<<return>>
<<back>>

<!-- Conditional link -->
<<linkif $hasKey "Unlock door" "Inside">><</linkif>>
```

### Display and Include

```html
<!-- Include another passage's content -->
<<include "Passage Name">>
<<include "Passage Name" "div" "class-name">> <!-- wrap in element -->

<<nobr>>
  Removes all line breaks from rendered output.
<</nobr>>

<<silently>>
  Executes macros without rendering output.
<</silently>>
```

### Interactive Elements

```html
<!-- Text input -->
<<textbox "$name" "Default" "NextPassage" autofocus>>

<!-- Number input -->
<<numberbox "$age" 18 "NextPassage">>

<!-- Textarea -->
<<textarea "$notes" "Write here...">>

<!-- Cycling link -->
<<cycle "$mood" autoselect>>
  <<option "happy">>
  <<option "sad">>
  <<option "angry">>
<</cycle>>

<!-- Dropdown/listbox -->
<<listbox "$weapon">>
  <<option "sword" "Sword">>
  <<option "axe" "Axe">>
<</listbox>>

<!-- Checkbox -->
<<checkbox "$agreed" true false>>

<<radiobutton "$choice" "option1">> Option 1
<<radiobutton "$choice" "option2">> Option 2
```

### Timed Effects

```html
<!-- Typewriter effect -->
<<type 30ms>>
  Text appears character by character.
<</type>>

<<type 20ms start 1s>> <!-- with start delay -->
  Delayed typing.
<</type>>

<<next 2s>>
  Content appears after delay.
<</next>>

<<timed 3s>>
  Auto-appearing content.
  <<next 2s>>More after 2 more seconds.<</next>>
<</timed>>
```

### DOM Manipulation

```html
<<run>> <!-- Execute arbitrary JavaScript -->
  document.title = "New Title";
<</run>>

<<script>> <!-- Longer JavaScript block -->
  /* Multi-line JavaScript */
  console.log(State.variables);
<</script>>

<!-- Dynamic content replacement -->
<<done>>
  <<replace "#target">>New content<</replace>>
<</done>>

<<append "#target">>Added at end<</append>>
<<prepend "#target">>Added at start<</prepend>>

<<remove "#target">> <!-- Remove elements -->

<<addclass "#target" "highlight">>
<<removeclass "#target" "highlight">>
<<toggleclass "#target" "active">>
```

## Variable Systems

### Story Variables (`$`)
- Persist across passages
- Saved in save files
- Stored in `State.variables`

### Temporary Variables (`_`)
- Scoped to the current passage/section
- Not saved
- Stored in `State.temporary`

### Special Variables
```html
<!-- Game configuration -->
<<set Config.history.maxStates to 1>>  <!-- Disable history -->
<<set Config.saves.autosave = true>>   <!-- Enable autosave -->
<<set Config.saves.autoload = "prompt">> <!-- Prompt to autoload -->
```

## Save System

```html
<!-- Open save dialog -->
<<run UI.saves()>>

<!-- Programmatic save -->
<<run Save.save()>>
<<run Save.save("slotName")>>

<!-- Programmatic load -->
<<run Save.load("slotName")>>

<!-- Delete save -->
<<run Save.delete("slotName")>>

<!-- Check if slots exist -->
<<if Save.slots.has("slotName")>>
  Save exists!
<</if>>
```

## Story Lifecycle Functions

```html
<!-- Initialization (runs once at story start) -->
:: StoryInit
<<set $gold to 100>>
<<set $hp to 10>>

<!-- JavaScript initialization -->
:: StoryJavaScript [script]
Config.history.controls = false;

<!-- Styles -->
:: StoryStylesheet [stylesheet]
.passage { font-family: Georgia, serif; }
```

## JavaScript API

SugarCube exposes powerful runtime APIs:

```javascript
// State
State.variables.$name = "value";
State.temporary._temp = "local";

// Navigation
Engine.goToPassage("Passage Name");
Engine.restart();

// Story
Story.get("Passage Name");       // Get passage object
Story.lookup("tag", "forest");   // Find passages by tag
Story.has("Passage Name");       // Check existence

// Passage object properties
passage.name, passage.tags, passage.text

// History
History.back();
History.forward();

// UI
UIBar.destroy();                 // Remove sidebar
UIBar.stow();                    // Collapse sidebar
Dialog.setup("Title");           // Create modal
Dialog.wiki("Content");          // Add content
Dialog.open();                   // Show modal

// Audio (SugarCube v2.36+)
SimpleAudio.tracks.add("bgm", "audio.mp3");
SimpleAudio.play("bgm");
SimpleAudio.stop("bgm");
SimpleAudio.volume("bgm", 0.5);

// Utilities
clone(variable);                 // Deep clone
random(1, 6);                    // Dice roll
either("A", "B", "C");          // Random pick
previous();                      // Last passage name
passage();                       // Current passage name
tags();                          // Current passage tags
turns();                         // Turn count
visited("Passage");              // Visit count
visitedCount("Passage");         // Total visits
hasVisited("Passage");           // Boolean

// String/Array helpers
String.format("{0} {1}", a, b);
[1,2,3].concatUnique(4);
[1,2,3].delete(2);
[1,2,3].deleteAt(1);
[1,2,3].insertAt(1, 9);
[1,2,3].pluck();                 // Random remove
[1,2,3].pushUnique(4);

// Object helpers
Object.keys(obj);
Object.values(obj);
Object.entries(obj);
obj.hasOwnProperty("key");
```

## Custom Macros

```javascript
// In StoryJavaScript
Macro.add('helloworld', {
  handler : function () {
    this.output.appendChild(document.createTextNode('Hello, world!'));
  }
});

// With arguments
Macro.add('greet', {
  handler : function () {
    var name = this.args[0];
    this.output.appendChild(document.createTextNode('Hello, ' + name + '!'));
  }
});

// With content
Macro.add('warning', {
  tags : null,
  handler : function () {
    var content = this.payload[0].contents;
    var wrapper = document.createElement('div');
    wrapper.className = 'warning';
    wrapper.innerHTML = content;
    this.output.appendChild(wrapper);
  }
});
```

## Custom CSS Styling

SugarCube renders passages in `#passages` container with `.passage` class.

```css
/* Base passage styling */
.passage {
  line-height: 1.75;
  max-width: 54em;
  margin: 0 auto;
}

/* Tag-based styling via data attributes */
html[data-tags~="dark"] body {
  background-color: #111;
  color: #eee;
}

html[data-tags~="dark"] a {
  color: #68d;
}

/* UI dialog styling */
#ui-dialog {
  max-width: 66em;
}

#ui-dialog-titlebar {
  background-color: #444;
}

/* Debug bar */
#debug-bar {
  background-color: #222;
  border: 1px solid #444;
}
```

## Twee Notation

SugarCube stories can be written in Twee format and compiled with Tweego:

```twee
:: StoryTitle
My Story

:: StoryData
{
  "ifid": "A1B2C3D4-E5F6-7890-1234-567890ABCDEF",
  "format": "SugarCube",
  "format-version": "2.36.1"
}

:: Start
Welcome to my story!

[[Go North->Forest]]
[[Go South->Desert]]

:: Forest [tag1 tag2]
You are in a dark forest.
<<set $seenForest to true>>

:: StoryJavaScript [script]
Config.history.maxStates = 1;

:: StoryStylesheet [stylesheet]
.passage { font-family: monospace; }
```

## Common Patterns

### Inventory System
```html
<<set $inventory to []>>
<<link "Take sword">>
  <<set $inventory to $inventory.concatUnique("sword")>>
  <<remove "#sword">>
<</link>>
```

### Checkpoint System
```html
<<link "Save checkpoint">>
  <<run Save.save("checkpoint")>>
  Checkpoint saved!
<</link>>
```

### Conditional Passage Content
```html
<<if visited("SecretRoom")>>
  You remember the secret room.
<</if>>
```

### Character Dialogue System
```html
<<set $speaker to "Alice">>
<<set $dialogue to "Hello there!">>
<span class="speaker"><<=$speaker>></span>: <<=$dialogue>>
```
