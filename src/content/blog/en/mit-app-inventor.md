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

## Complete MIT App Inventor implementation

### Designer view — full component list

**Screen1 properties:**
- `Title` = "" (empty, we'll use a custom header)
- `BackgroundImage` = upload your meadow landscape image
- `ScreenOrientation` = Portrait
- `Scrollable` = true

**Component hierarchy:**

```
Screen1
├── VerticalArrangement (headerArea)
│   ├── Label (lblTitle)              → "TODAY'S ROUTINE"
│   ├── DatePicker (datePickerDay)    → text: "28/05/2026"
│   └── HorizontalArrangement (taskInputRow)
│       ├── Label (lblTaskLabel)      → "Task:"
│       └── TextBox (txtTaskName)     → hint: "Enter routine..."
│
├── VerticalScrollArrangement (taskListArea)
│   (dynamically filled — see blocks)
│
├── HorizontalArrangement (addTaskRow)
│   ├── TimePicker (timePickerNew)    → text: "Set time"
│   └── Button (btnAddTask)           → text: "+ Add"
│
├── HorizontalArrangement (progressRow)
│   ├── Label (lblProgress)           → "0/0 task done"
│   └── Slider (sliderProgress)       → disabled, visual only
│
├── Notifier (notifier1)              → non-visible
├── TinyDB (tinyDB1)                  → non-visible
└── Clock (clock1)                    → non-visible, for date
```

---

### Block-by-block logic

#### 1. Global variables

Create these using `initialize global ... to`:

```
global taskNames    → create empty list
global taskTimes    → create empty list
global taskDone     → create empty list    (stores true/false)
global selectedDate → ""
global taskCount    → 0
```

---

#### 2. Screen1.Initialize — load saved data

```
when Screen1.Initialize
  set global selectedDate to clock1.FormatDateTime(clock1.Now, "dd/MM/yyyy")
  set datePickerDay.Text to global selectedDate
  call loadTasks
```

**Create a procedure `loadTasks`:**
```
to loadTasks
  set global taskNames to TinyDB1.GetValue(
    tag: join(global selectedDate, "_names"),
    valueIfTagNotThere: create empty list
  )
  set global taskTimes to TinyDB1.GetValue(
    tag: join(global selectedDate, "_times"),
    valueIfTagNotThere: create empty list
  )
  set global taskDone to TinyDB1.GetValue(
    tag: join(global selectedDate, "_done"),
    valueIfTagNotThere: create empty list
  )
  set global taskCount to length of list (global taskNames)
  call renderTasks
  call updateProgress
```

This is the key design decision — tasks are stored **per date** so each day has its own routine.

---

#### 3. DatePicker.AfterDateSet — switch days

```
when datePickerDay.AfterDateSet
  set global selectedDate to join(datePickerDay.Day, "/", datePickerDay.Month, "/", datePickerDay.Year)
  set datePickerDay.Text to global selectedDate
  call loadTasks
```

When the user taps the date badge at the top, the DatePicker opens. After they pick a new date, the app loads that day's routine.

---

#### 4. Adding a task (the full flow)

The flow is: type task name in `txtTaskName`, tap `timePickerNew` to pick a time, then tap `btnAddTask`.

```
when btnAddTask.Click
  if txtTaskName.Text = ""
    then call notifier1.ShowAlert(notice: "Please enter a task name")
  else if timePickerNew.Text = "Set time"
    then call notifier1.ShowAlert(notice: "Please set a time first")
  else
    set local timeStr to join(
      if timePickerNew.Hour < 10 then join("0", timePickerNew.Hour) else timePickerNew.Hour,
      ".",
      if timePickerNew.Minute < 10 then join("0", timePickerNew.Minute) else timePickerNew.Minute
    )
    add items to list (global taskNames): txtTaskName.Text
    add items to list (global taskTimes): timeStr
    add items to list (global taskDone): false
    set global taskCount to global taskCount + 1
    call saveTasks
    call renderTasks
    call updateProgress
    set txtTaskName.Text to ""
    set timePickerNew.Text to "Set time"
```

---

#### 5. Save procedure

```
to saveTasks
  call TinyDB1.StoreValue(tag: join(global selectedDate, "_names"), value: global taskNames)
  call TinyDB1.StoreValue(tag: join(global selectedDate, "_times"), value: global taskTimes)
  call TinyDB1.StoreValue(tag: join(global selectedDate, "_done"),  value: global taskDone)
```

---

#### 6. Rendering tasks dynamically

Since MIT App Inventor's `ListView` doesn't support the row layout you designed (time badge + task + checkmark + delete), you need to build rows dynamically using `HorizontalArrangement` inside the `VerticalScrollArrangement`.

**Create a procedure `renderTasks`:**

```
to renderTasks
  remove all components from taskListArea

  for each index from 1 to length of list (global taskNames)
    create new HorizontalArrangement (taskRow) in taskListArea
      set Width = Fill parent, Height = 50px
      set BackgroundColor = light blue (#DCE8F0)
      set AlignVertical = Center

    create new Label (lblTime) in taskRow
      set Text = select list item (global taskTimes, index)
      set Width = 60px
      set FontSize = 12
      set TextAlignment = Center
      set BackgroundColor = #B8CCDA

    create new Label (lblName) in taskRow
      set Text = select list item (global taskNames, index)
      set Width = Fill parent
      set FontSize = 13

    create new CheckBox (chkDone) in taskRow
      set Checked = select list item (global taskDone, index)
      (tag it with index for identification)

    create new Button (btnDelete) in taskRow
      set Text = "🗑"
      set Width = 40px
      set BackgroundColor = transparent
      (tag it with index)
```

**The problem:** MIT App Inventor doesn't support dynamically creating components in the standard Blocks editor. So instead, use one of these two approaches:

**Approach A — use a ListView (simpler but less pretty):**

```
to renderTasks
  set local displayList to create empty list
  for each index from 1 to length of list (global taskNames)
    set local prefix to ""
    if select list item (global taskDone, index) = true
      then set prefix to "✓ "
    add items to list (displayList):
      join(select list item(global taskTimes, index),
           "  |  ",
           prefix,
           select list item(global taskNames, index))
  set lvTasks.Elements to displayList
```

**Approach B — pre-place fixed rows (matches your design):**

Place 5-6 pre-built `HorizontalArrangement` rows in the Designer, each containing a time label, task label, checkbox, and delete button. Then show/hide them:

```
to renderTasks
  set taskRow1.Visible to false
  set taskRow2.Visible to false
  set taskRow3.Visible to false
  set taskRow4.Visible to false
  set taskRow5.Visible to false

  if global taskCount >= 1
    set taskRow1.Visible to true
    set lblTime1.Text to select list item(global taskTimes, 1)
    set lblName1.Text to select list item(global taskNames, 1)
    set chk1.Checked to select list item(global taskDone, 1)
  if global taskCount >= 2
    set taskRow2.Visible to true
    ...repeat pattern...
```

I recommend **Approach B** because it matches your design mockup exactly — each row can have its own styled time badge, task label, checkmark button, and delete button.

---

#### 7. Checkbox toggle (mark done)

For each pre-placed checkbox:

```
when chk1.Changed
  replace list item (global taskDone, index: 1, replacement: chk1.Checked)
  call saveTasks
  call updateProgress
```

Repeat for `chk2`, `chk3`, etc.

---

#### 8. Delete with confirmation

For each delete button:

```
when btnDelete1.Click
  call notifier1.ShowChooseDialog(
    message: "ARE YOU SURE?",
    title: "Message",
    button1Text: "OK",
    button2Text: "Cancel",
    cancelable: true
  )
  set global deleteIndex to 1
```

Then handle the response:

```
when notifier1.AfterChoosing(choice)
  if choice = "OK"
    remove list item (global taskNames, index: global deleteIndex)
    remove list item (global taskTimes, index: global deleteIndex)
    remove list item (global taskDone, index: global deleteIndex)
    set global taskCount to global taskCount - 1
    call saveTasks
    call renderTasks
    call updateProgress
```

---

#### 9. Progress bar update

```
to updateProgress
  set local doneCount to 0
  for each item in (global taskDone)
    if item = true then set doneCount to doneCount + 1
  set lblProgress.Text to join(doneCount, "/", global taskCount, " TASK DONE")
  if global taskCount > 0
    set sliderProgress.ThumbPosition to (doneCount / global taskCount) * 100
  else
    set sliderProgress.ThumbPosition to 0
```

---

### Summary of the full user flow

| Step | User action | What happens |
|---|---|---|
| Open app | — | Loads today's date, fetches saved tasks for today |
| Tap date badge | DatePicker opens | Pick a new date, loads that day's tasks |
| Type in "Task:" field | Keyboard appears | User enters task name like "Do homework" |
| Tap "Set time" | TimePicker opens | Pick hour:minute, shows on button |
| Tap "+ Add" | Validates input | Creates new task row, saves to TinyDB |
| Tap checkmark | Toggles done state | Updates progress bar |
| Tap trash icon | Confirmation dialog | "ARE YOU SURE?" with OK/Cancel |
| Tap OK | Deletes task | Removes from lists, re-renders, saves |