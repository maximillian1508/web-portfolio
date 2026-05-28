---
title: "MIT App Inventor Task Management"
description: "MIT App Inventor Task Management"
pubDate: 2026-05-28
featuredImage: ""
draft: false
lang: "en"
slug: "mit-app-inventor-task-management"
translationKey: "mit-app-inventor-task-management"
---

# Today's Routine — MIT App Inventor Build Guide
## Complete Step-by-Step (Approach B: 15 Pre-placed Rows)

---

## PART 1: DESIGNER VIEW — Screen1 Properties

1. Create a new project named **TaskRoutineApp**
2. Click on **Screen1** in the component tree
3. Set these properties:

| Property | Value |
|----------|-------|
| AboutScreen | Daily routine planner |
| ActionBar | ☐ unchecked |
| AppName | Today's Routine |
| BackgroundImage | Upload your scenic meadow image |
| ScreenOrientation | Portrait |
| Scrollable | ☑ checked |
| ShowStatusBar | ☐ unchecked |
| Title | (leave empty) |
| TitleVisible | ☐ unchecked |

---

## PART 2: DESIGNER VIEW — Build the Layout

Build components in this exact order, top to bottom.

### 2A. Title Label

Drag **Label** from User Interface → onto Screen1

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| Label | **lblTitle** | Text | TODAY'S ROUTINE |
| | | FontBold | ☑ |
| | | FontSize | 20 |
| | | FontTypeface | serif |
| | | TextAlignment | Center |
| | | TextColor | Dark blue (#2C3E50) |
| | | Width | Fill parent |

### 2B. Date Picker

Drag **DatePicker** from User Interface → onto Screen1 (below lblTitle)

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| DatePicker | **datePickerDay** | Text | DD/MM/YYYY |
| | | BackgroundColor | Light blue (#B0C8D8) |
| | | FontSize | 12 |
| | | Width | 160 pixels |
| | | Height | 35 pixels |
| | | TextColor | #4A6A7A |
| | | Shape | rounded |

### 2C. Task Input Row

Drag **HorizontalArrangement** from Layout → onto Screen1

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| HorizontalArrangement | **taskInputRow** | Width | Fill parent |
| | | AlignVertical | Center |

**Inside taskInputRow**, drag in these two components:

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| Label | **lblTaskLabel** | Text | Task: |
| | | FontBold | ☑ |
| | | FontItalic | ☑ |
| | | FontSize | 14 |
| | | TextColor | #4A5568 |
| | | Width | Automatic |
| TextBox | **txtTaskName** | Hint | Enter routine... |
| | | FontSize | 13 |
| | | Width | Fill parent |
| | | Height | 40 pixels |
| | | BackgroundColor | Light (#E8F0F6) |
| | | TextColor | #3A4A5A |

### 2D. Add Task Row

Drag **HorizontalArrangement** from Layout → onto Screen1

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| HorizontalArrangement | **addTaskRow** | Width | Fill parent |
| | | AlignVertical | Center |

**Inside addTaskRow**, drag in:

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| TimePicker | **timePickerNew** | Text | Set Time |
| | | BackgroundColor | #B8CCDA |
| | | FontSize | 12 |
| | | Width | 110 pixels |
| | | Height | 40 pixels |
| | | TextColor | #3A5A6A |
| | | Shape | rounded |
| Button | **btnAddTask** | Text | + Add Task |
| | | BackgroundColor | #6A9AB8 |
| | | FontBold | ☑ |
| | | FontSize | 13 |
| | | Width | Fill parent |
| | | Height | 40 pixels |
| | | TextColor | White |
| | | Shape | rounded |

### 2E. Task List Area

Drag **VerticalScrollArrangement** from Layout → onto Screen1

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| VerticalScrollArrangement | **taskListArea** | Width | Fill parent |
| | | Height | 60 percent |

---

### 2F. THE 15 TASK ROWS (Repeat this 15 times!)

**Inside taskListArea**, you will build 15 identical task rows. Each row is a HorizontalArrangement containing 4 components.

#### How to build ONE task row (Row 1 example):

**Step 1:** Drag **HorizontalArrangement** into taskListArea

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| HorizontalArrangement | **taskRow1** | Width | Fill parent |
| | | Height | 50 pixels |
| | | BackgroundColor | #DCE8F0 |
| | | AlignVertical | Center |
| | | Visible | ☐ unchecked (hidden by default) |

**Step 2:** Inside taskRow1, drag in these 4 components (left to right):

| # | Component | Rename to | Property | Value |
|---|-----------|-----------|----------|-------|
| 1 | Label | **lblTime1** | Text | 00.00 |
| | | | FontBold | ☑ |
| | | | FontSize | 12 |
| | | | Width | 60 pixels |
| | | | Height | 35 pixels |
| | | | TextAlignment | Center |
| | | | BackgroundColor | #B8CCDA |
| | | | TextColor | #3A5A6A |
| 2 | Label | **lblName1** | Text | Task 1 |
| | | | FontSize | 13 |
| | | | Width | Fill parent |
| | | | TextColor | #3A4A5A |
| 3 | Button | **btnDone1** | Text | (leave empty) |
| | | | Width | 40 pixels |
| | | | Height | 40 pixels |
| | | | BackgroundColor | #B0C0CC |
| | | | TextColor | #5A7A8A |
| | | | FontSize | 18 |
| | | | Shape | oval |
| 4 | Button | **btnDelete1** | Text | X |
| | | | Width | 40 pixels |
| | | | Height | 40 pixels |
| | | | BackgroundColor | None (transparent) |
| | | | TextColor | Red (#E24B4A) |
| | | | FontBold | ☑ |
| | | | FontSize | 14 |

**Step 3:** Add a small spacer after the row:

Drag **HorizontalArrangement** into taskListArea (after taskRow1)

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| HorizontalArrangement | **spacer1** | Height | 4 pixels |
| | | Width | Fill parent |
| | | Visible | ☐ unchecked |

#### NOW REPEAT for rows 2 through 15!

Copy the exact same pattern, just change the number in every name:

- Row 2: **taskRow2**, **lblTime2**, **lblName2**, **btnDone2**, **btnDelete2**, **spacer2**
- Row 3: **taskRow3**, **lblTime3**, **lblName3**, **btnDone3**, **btnDelete3**, **spacer3**
- Row 4: **taskRow4**, **lblTime4**, **lblName4**, **btnDone4**, **btnDelete4**, **spacer4**
- Row 5: **taskRow5**, **lblTime5**, **lblName5**, **btnDone5**, **btnDelete5**, **spacer5**
- Row 6: **taskRow6**, **lblTime6**, **lblName6**, **btnDone6**, **btnDelete6**, **spacer6**
- Row 7: **taskRow7**, **lblTime7**, **lblName7**, **btnDone7**, **btnDelete7**, **spacer7**
- Row 8: **taskRow8**, **lblTime8**, **lblName8**, **btnDone8**, **btnDelete8**, **spacer8**
- Row 9: **taskRow9**, **lblTime9**, **lblName9**, **btnDone9**, **btnDelete9**, **spacer9**
- Row 10: **taskRow10**, **lblTime10**, **lblName10**, **btnDone10**, **btnDelete10**, **spacer10**
- Row 11: **taskRow11**, **lblTime11**, **lblName11**, **btnDone11**, **btnDelete11**, **spacer11**
- Row 12: **taskRow12**, **lblTime12**, **lblName12**, **btnDone12**, **btnDelete12**, **spacer12**
- Row 13: **taskRow13**, **lblTime13**, **lblName13**, **btnDone13**, **btnDelete13**, **spacer13**
- Row 14: **taskRow14**, **lblTime14**, **lblName14**, **btnDone14**, **btnDelete14**, **spacer14**
- Row 15: **taskRow15**, **lblTime15**, **lblName15**, **btnDone15**, **btnDelete15** (no spacer needed after last)

**All 15 taskRows should have Visible = unchecked (hidden by default)**
**All 14 spacers should have Visible = unchecked (hidden by default)**

### 2G. Progress Label

Drag **Label** onto Screen1 (below taskListArea)

| Component | Rename to | Property | Value |
|-----------|-----------|----------|-------|
| Label | **lblProgress** | Text | 0/0 TASK DONE |
| | | FontBold | ☑ |
| | | FontSize | 11 |
| | | TextColor | #4A6A7A |
| | | Width | Fill parent |
| | | TextAlignment | Center |

### 2H. Non-Visible Components

Drag these from their respective drawers onto Screen1:

| Drawer | Component | Rename to |
|--------|-----------|-----------|
| User Interface | **Notifier** | **notifier1** |
| Storage | **TinyDB** | **tinyDB1** |
| Sensors | **Clock** | **clock1** |

For clock1, set **TimerEnabled = ☐ unchecked**

---

## FINAL COMPONENT TREE

Your component tree should look like this:

```
Screen1
├── lblTitle
├── datePickerDay
├── taskInputRow
│   ├── lblTaskLabel
│   └── txtTaskName
├── addTaskRow
│   ├── timePickerNew
│   └── btnAddTask
├── taskListArea (VerticalScrollArrangement)
│   ├── taskRow1 (HorizontalArrangement)
│   │   ├── lblTime1
│   │   ├── lblName1
│   │   ├── btnDone1
│   │   └── btnDelete1
│   ├── spacer1
│   ├── taskRow2
│   │   ├── lblTime2
│   │   ├── lblName2
│   │   ├── btnDone2
│   │   └── btnDelete2
│   ├── spacer2
│   ├── ... (rows 3-14 with spacers)
│   └── taskRow15
│       ├── lblTime15
│       ├── lblName15
│       ├── btnDone15
│       └── btnDelete15
├── lblProgress
├── notifier1 (non-visible)
├── tinyDB1 (non-visible)
└── clock1 (non-visible)
```

Total components: **Screen1 + 1 title + 1 datepicker + 2 arrangements + 2 inputs + 1 button + 1 scroll area + 15 rows × 5 components + 14 spacers + 1 progress label + 3 non-visible = about 100 components**

---

## PART 3: BLOCKS VIEW — All the Logic

Switch to the **Blocks** editor by clicking the "Blocks" button in the top right.

---

### STEP 1: Create Global Variables

From the **Variables** drawer, drag out 7 "initialize global [name] to" blocks:

| Variable name | Initial value | How to set it |
|---------------|---------------|---------------|
| **taskNames** | empty list | Use "create empty list" from Lists drawer |
| **taskTimes** | empty list | Use "create empty list" from Lists drawer |
| **taskDone** | empty list | Use "create empty list" from Lists drawer |
| **selectedDate** | "" | Use empty text block from Text drawer |
| **taskCount** | 0 | Use number block 0 from Math drawer |
| **deleteIndex** | 0 | Use number block 0 from Math drawer |
| **selectedTimeStr** | "" | Use empty text block from Text drawer |

---

### STEP 2: Create Procedure "saveTasks"

Go to **Procedures** drawer → drag "to procedure do" block → name it **saveTasks**

Inside it, stack these 3 blocks:

```
to saveTasks do
│
├── call tinyDB1.StoreValue
│   tag = join(get global selectedDate, "_names")
│   valueToStore = get global taskNames
│
├── call tinyDB1.StoreValue
│   tag = join(get global selectedDate, "_times")
│   valueToStore = get global taskTimes
│
└── call tinyDB1.StoreValue
    tag = join(get global selectedDate, "_done")
    valueToStore = get global taskDone
```

**How to build each StoreValue block:**
1. From **tinyDB1** drawer → drag "call tinyDB1.StoreValue"
2. For the `tag` socket → from **Text** drawer, drag "join" block
3. Snap "get global selectedDate" into first slot of join
4. Snap text block "_names" into second slot of join
5. For the `valueToStore` socket → snap "get global taskNames"
6. Repeat for _times and _done

---

### STEP 3: Create Procedure "updateProgress"

Go to **Procedures** drawer → "to procedure do" → name it **updateProgress**

```
to updateProgress do
│
├── initialize local [doneCount] to 0
│   │
│   ├── for each [i] from 1 to (length of list get global taskDone) by 1 do
│   │   │
│   │   └── if (select list item list=get global taskDone index=get i) = true
│   │       then → set local doneCount to (get local doneCount + 1)
│   │
│   └── set lblProgress.Text to
│       join(get local doneCount, "/", get global taskCount, " TASK DONE")
```

**How to build it:**
1. From **Variables** → drag "initialize local name to" → name it **doneCount**, set to 0
2. Inside its "in do" socket → from **Control** → drag "for each number from _ to _ by _"
   - Set variable name to **i**
   - "from" = 1
   - "to" = Lists drawer → "length of list" → snap "get global taskDone"
   - "by" = 1
3. Inside the for loop → drag "if then" from Control
   - IF condition: Logic drawer → " = " block
     - Left: Lists → "select list item" → list = "get global taskDone", index = "get i"
     - Right: Logic → "true"
   - THEN: set local doneCount to → Math → addition block → "get local doneCount" + 1
4. After the for loop (snap below it) → set **lblProgress.Text** to:
   - Text → "join" with 4 slots: "get local doneCount", "/", "get global taskCount", " TASK DONE"

---

### STEP 4: Create Procedure "renderTasks"

Go to **Procedures** drawer → "to procedure do" → name it **renderTasks**

This is the longest procedure. You need 15 if/else blocks, one per row.

**Pattern for EACH row (repeat for rows 1-15, changing the number):**

```
if (get global taskCount) >= 1
then
  ├── set taskRow1.Visible to true
  ├── set spacer1.Visible to true          ← skip for row 15
  ├── set lblTime1.Text to (select list item list=get global taskTimes index=1)
  ├── set lblName1.Text to (select list item list=get global taskNames index=1)
  └── if (select list item list=get global taskDone index=1) = true
      then → set btnDone1.Text to "✓"
      else → set btnDone1.Text to ""
else
  ├── set taskRow1.Visible to false
  └── set spacer1.Visible to false         ← skip for row 15
```

**How to build Row 1:**

1. From **Control** → drag "if then else"
2. IF condition: Math → " ≥ " → left: "get global taskCount", right: number 1
3. THEN (do this sequence, snapped together):
   a. **taskRow1** drawer → "set taskRow1.Visible to" → Logic → true
   b. **spacer1** drawer → "set spacer1.Visible to" → Logic → true
   c. **lblTime1** drawer → "set lblTime1.Text to" → Lists → "select list item" → list: "get global taskTimes", index: 1
   d. **lblName1** drawer → "set lblName1.Text to" → Lists → "select list item" → list: "get global taskNames", index: 1
   e. Inner **if then else**:
      - IF: (select list item list=taskDone index=1) = true
      - THEN: set btnDone1.Text to "✓"
      - ELSE: set btnDone1.Text to ""
4. ELSE:
   a. set taskRow1.Visible to false
   b. set spacer1.Visible to false

**Now repeat for rows 2-15, changing:**
- taskRow**1** → taskRow**2**, etc.
- spacer**1** → spacer**2**, etc.
- lblTime**1** → lblTime**2**, etc.
- lblName**1** → lblName**2**, etc.
- btnDone**1** → btnDone**2**, etc.
- The comparison number: ≥ **1** becomes ≥ **2**, etc.
- The list index: index **1** becomes index **2**, etc.
- For row 15: skip the spacer lines (there's no spacer15)

**TIP:** Build Row 1 completely, then right-click → Duplicate for Row 2. Change the numbers and component references. This saves a lot of time!

---

### STEP 5: Create Procedure "loadTasks"

Go to **Procedures** drawer → "to procedure do" → name it **loadTasks**

```
to loadTasks do
│
├── set global taskNames to
│   call tinyDB1.GetValue tag=join(get global selectedDate, "_names") valueIfTagNotThere=create empty list
│
├── set global taskTimes to
│   call tinyDB1.GetValue tag=join(get global selectedDate, "_times") valueIfTagNotThere=create empty list
│
├── set global taskDone to
│   call tinyDB1.GetValue tag=join(get global selectedDate, "_done") valueIfTagNotThere=create empty list
│
├── set global taskCount to (length of list get global taskNames)
│
├── call renderTasks
│
└── call updateProgress
```

**How to build:**
1. From **Variables** → "set global taskNames to"
2. From **tinyDB1** drawer → "call tinyDB1.GetValue"
   - tag: join("get global selectedDate", "_names")
   - valueIfTagNotThere: Lists → "create empty list"
3. Repeat for taskTimes and taskDone (with "_times" and "_done")
4. set global taskCount to → Lists → "length of list" → "get global taskNames"
5. From **Procedures** drawer → "call renderTasks"
6. From **Procedures** drawer → "call updateProgress"

---

### STEP 6: Screen1.Initialize Event

From **Screen1** drawer → drag "when Screen1.Initialize do"

```
when Screen1.Initialize do
│
├── set global selectedDate to
│   join(
│     call clock1.FormatDate instant=call clock1.Now pattern="dd",
│     "/",
│     call clock1.FormatDate instant=call clock1.Now pattern="MM",
│     "/",
│     call clock1.FormatDate instant=call clock1.Now pattern="yyyy"
│   )
│
├── set datePickerDay.Text to (get global selectedDate)
│
└── call loadTasks
```

**How to build:**
1. set global selectedDate to → Text → "join" (click blue gear to add 5 sockets)
   - Slot 1: clock1 → "call clock1.FormatDate" → instant = "call clock1.Now", pattern = "dd"
   - Slot 2: text "/"
   - Slot 3: clock1 → "call clock1.FormatDate" → instant = "call clock1.Now", pattern = "MM"
   - Slot 4: text "/"
   - Slot 5: clock1 → "call clock1.FormatDate" → instant = "call clock1.Now", pattern = "yyyy"
2. set datePickerDay.Text to → get global selectedDate
3. call loadTasks

---

### STEP 7: DatePicker AfterDateSet Event

From **datePickerDay** drawer → drag "when datePickerDay.AfterDateSet do"

```
when datePickerDay.AfterDateSet do
│
├── set global selectedDate to
│   join(get datePickerDay.Day, "/", get datePickerDay.Month, "/", get datePickerDay.Year)
│
├── set datePickerDay.Text to (get global selectedDate)
│
└── call loadTasks
```

---

### STEP 8: TimePicker AfterTimeSet Event

From **timePickerNew** drawer → drag "when timePickerNew.AfterTimeSet do"

```
when timePickerNew.AfterTimeSet do
│
├── set global selectedTimeStr to
│   join(
│     if (get timePickerNew.Hour < 10)
│       then join("0", get timePickerNew.Hour)
│       else get timePickerNew.Hour,
│     ".",
│     if (get timePickerNew.Minute < 10)
│       then join("0", get timePickerNew.Minute)
│       else get timePickerNew.Minute
│   )
│
└── set timePickerNew.Text to (get global selectedTimeStr)
```

**How to build the zero-padding:**
1. Text → "join" with 3 slots
2. Slot 1: Control → "if then else" EXPRESSION (the small one that returns a value, not the statement one)
   - IF: timePickerNew.Hour < 10
   - THEN: join("0", timePickerNew.Hour)
   - ELSE: timePickerNew.Hour
3. Slot 2: text "."
4. Slot 3: same pattern for Minute

**Note:** If you can't find the expression-style "if then else", use a simpler approach:
1. set global selectedTimeStr to join(get timePickerNew.Hour, ".", get timePickerNew.Minute)
2. set timePickerNew.Text to get global selectedTimeStr

This works fine — you just won't get the leading zero (e.g., "5.0" instead of "05.00").

---

### STEP 9: btnAddTask.Click Event

From **btnAddTask** drawer → drag "when btnAddTask.Click do"

```
when btnAddTask.Click do
│
├── if (get txtTaskName.Text) = ""
│   then → call notifier1.ShowAlert notice="Please enter a task name"
│
├── else if (get global selectedTimeStr) = ""
│   then → call notifier1.ShowAlert notice="Please set a time first"
│
├── else if (get global taskCount) >= 15
│   then → call notifier1.ShowAlert notice="Maximum 15 tasks reached!"
│
├── else
│   ├── add items to list list=get global taskNames item=get txtTaskName.Text
│   ├── add items to list list=get global taskTimes item=get global selectedTimeStr
│   ├── add items to list list=get global taskDone item=false
│   ├── set global taskCount to (get global taskCount + 1)
│   ├── call saveTasks
│   ├── call renderTasks
│   ├── call updateProgress
│   ├── set txtTaskName.Text to ""
│   ├── set global selectedTimeStr to ""
│   └── set timePickerNew.Text to "Set Time"
```

**How to build:**
1. Control → "if then else if then else" (click blue gear to add 2 "else if" and 1 "else")
2. First IF: Text → " = " → txtTaskName.Text and ""
3. Second IF: Text → " = " → global selectedTimeStr and ""
4. Third IF: Math → " ≥ " → global taskCount and 15
5. ELSE (the add-task logic):
   a. Lists → "add items to list" → list=global taskNames, item=txtTaskName.Text
   b. Lists → "add items to list" → list=global taskTimes, item=global selectedTimeStr
   c. Lists → "add items to list" → list=global taskDone, item=Logic→false
   d. set global taskCount to (global taskCount + 1)
   e. call saveTasks
   f. call renderTasks
   g. call updateProgress
   h. set txtTaskName.Text to ""
   i. set global selectedTimeStr to ""
   j. set timePickerNew.Text to "Set Time"

---

### STEP 10: btnDone Click Events (15 of them)

**For each row 1-15**, create a click handler:

From **btnDone1** drawer → "when btnDone1.Click do"

```
when btnDone1.Click do
│
└── if (get global taskCount) >= 1
    then
      ├── replace list item list=get global taskDone index=1
      │   replacement = not(select list item list=get global taskDone index=1)
      ├── call saveTasks
      ├── call renderTasks
      └── call updateProgress
```

**How to build:**
1. Control → "if then"
2. IF: global taskCount ≥ 1
3. THEN:
   a. Lists → "replace list item" → list=global taskDone, index=1
      - replacement: Logic → "not" → Lists → "select list item" → list=global taskDone, index=1
   b. call saveTasks
   c. call renderTasks
   d. call updateProgress

**Repeat for btnDone2 through btnDone15**, changing:
- btnDone**1** → btnDone**2**, etc.
- The comparison: ≥ **1** → ≥ **2**, etc.
- Both list index numbers: index=**1** → index=**2**, etc.

**TIP:** Build btnDone1.Click completely, then **duplicate** it (right-click → Duplicate). Then change the component references and numbers.

---

### STEP 11: btnDelete Click Events (15 of them)

**For each row 1-15**, create a click handler:

From **btnDelete1** drawer → "when btnDelete1.Click do"

```
when btnDelete1.Click do
│
├── set global deleteIndex to 1
│
└── call notifier1.ShowChooseDialog
    message = "ARE YOU SURE?"
    title = "Delete Task"
    button1Text = "OK"
    button2Text = "Cancel"
    cancelable = false
```

**How to build:**
1. set global deleteIndex to → number 1
2. notifier1 → "call notifier1.ShowChooseDialog"
   - message: "ARE YOU SURE?"
   - title: "Delete Task"
   - button1Text: "OK"
   - button2Text: "Cancel"
   - cancelable: Logic → false

**Repeat for btnDelete2 through btnDelete15**, changing:
- btnDelete**1** → btnDelete**2**
- set global deleteIndex to **1** → set global deleteIndex to **2**, etc.

The ShowChooseDialog part stays the same for all 15.

---

### STEP 12: Notifier AfterChoosing Event (handles delete confirmation)

From **notifier1** drawer → "when notifier1.AfterChoosing choice do"

```
when notifier1.AfterChoosing [choice] do
│
└── if (get choice) = "OK" AND (get global deleteIndex) > 0
    then
      ├── remove list item list=get global taskNames index=get global deleteIndex
      ├── remove list item list=get global taskTimes index=get global deleteIndex
      ├── remove list item list=get global taskDone index=get global deleteIndex
      ├── set global taskCount to (get global taskCount - 1)
      ├── set global deleteIndex to 0
      ├── call saveTasks
      ├── call renderTasks
      └── call updateProgress
```

**How to build:**
1. Control → "if then"
2. IF: Logic → "and" block
   - Left: Text " = " → get variable "choice" (the orange parameter) and "OK"
   - Right: Math " > " → get global deleteIndex and 0
3. THEN (stack all these):
   a. Lists → "remove list item" → list=global taskNames, index=global deleteIndex
   b. Lists → "remove list item" → list=global taskTimes, index=global deleteIndex
   c. Lists → "remove list item" → list=global taskDone, index=global deleteIndex
   d. set global taskCount to → (global taskCount − 1)
   e. set global deleteIndex to 0
   f. call saveTasks
   g. call renderTasks
   h. call updateProgress

---

## PART 4: TESTING

1. Click **Connect → AI Companion** in the menu
2. Scan the QR code with the **MIT AI2 Companion** app on your phone
3. Test the flow:
   - Type a task name → tap "Set Time" → pick a time → tap "+ Add Task"
   - Task should appear in the list
   - Tap the circle button to toggle ✓ done
   - Tap the X button → confirm delete → task removed
   - Tap the date button → pick a different date → tasks switch
   - Close and reopen the app → tasks should persist

---

## PART 5: TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Tasks don't save | Check that all 3 TinyDB.StoreValue calls in saveTasks use the correct tags with join |
| Rows don't show/hide | Check that renderTasks compares taskCount ≥ row number (not = or >) |
| Delete removes wrong task | Check that each btnDelete handler sets the correct deleteIndex number |
| Time shows without leading zero | This is cosmetic only — the simpler join approach works, just looks like "5.0" instead of "05.00" |
| Checkmark doesn't toggle | Make sure the replace list item uses "not" around "select list item" |
| Date doesn't format correctly | Make sure FormatDate pattern is "dd", "MM", "yyyy" (case-sensitive) |
| "Maximum 15 tasks" appears too early | Check that the comparison is ≥ 15, not > 14 |

---

## SUMMARY: Block Count

| Category | Count |
|----------|-------|
| Global variables | 7 |
| Procedures | 4 (saveTasks, loadTasks, renderTasks, updateProgress) |
| Screen1.Initialize | 1 |
| datePickerDay.AfterDateSet | 1 |
| timePickerNew.AfterTimeSet | 1 |
| btnAddTask.Click | 1 |
| btnDone1-15.Click | 15 |
| btnDelete1-15.Click | 15 |
| notifier1.AfterChoosing | 1 |
| **Total event/procedure blocks** | **46** |