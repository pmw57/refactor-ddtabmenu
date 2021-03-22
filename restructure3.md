Now that I have the tests in place, some refactoring can occur to this code.

The first thing that comes to mind is to reduce the scope of the config variable. It's not used by anything below the first else, so we can push it down into the if structure.

```javascript
        menuItems.forEach(function (menuItem, menuIndex) {
            // const config = tabs[tabId].config;
            if (menuItem.getAttribute("rel")) {
                const config = tabs[tabId].config;
                tabs[tabId].menuItems[menuIndex].hasSubContent = true;
                //...
            } else {
```

Next, the hasSubContent part isn't needed. It's only used when showing or hiding a menu section, so we can just directly check for the "rel" attribute at the time instead.

```javascript
            // if (menuItem.hasSubContent === true) {
            //     id = menuItem.getAttribute("rel");
            const id = menuItem.getAttribute("rel");
            if (id) {
                document.getElementById(id).style.display = "none";
            }
//...
        // if (targetItem.hasSubContent === true) {
        //     id = targetItem.getAttribute("rel");
        const id = targetItem.getAttribute("rel");
        if (id) {
            document.getElementById(id).style.display = "block";
        }
//...
menuItems.forEach(function (menuItem, menuIndex) {
            if (menuItem.getAttribute("rel")) {
                const config = tabs[tabId].config;
                // tabs[tabId].menuItems[menuIndex].hasSubContent = true;
                //...
            } else {
```

We can also bring that assign id and check id idea into the if/else code too:

```javascript
        menuItems.forEach(function (menuItem, menuIndex) {
            const id = menuItem.getAttribute("rel");
            // if (menuItem.getAttribute("rel")) {
            if (id) {
                const config = tabs[tabId].config;
                if (config.disableTabLinks) {
                    menuItem.onclick = disableClick;
                }
                if (config.snapToOriginal.snap === true) {
                    // id = menuItem.getAttribute("rel");
                    submenu = document.getElementById(id);
                    initWithSubmenu(tabId, menuItem, submenu);
                }
            } else {
```

### Paranoia

Things are going well and despite all of the changes that I'm makingm the tests are all passing. That has me feeling paranoid. Years ago I was updating a different set of code than what was being tested, so the tests kept on passing while unknown problems were being made.

As a result I now check that the tests are connected to the code that I'm working on by deliberately mess up something in the code, usually by commenting out a line. It can be reassuring to see that the tests fail for some reason.

The tests suitably fail, giving me reassurance and I can restore that commented-out line feeling better about things.

### Plans from here

We have simplified the code so that there there are now three main things that the code is doing. I want to move those out to separate functions, so that it's easier to understand what's going on.


What I want to have, but we don't have yet, is something like the following simpler code:

```javascript
        menuItems.forEach(function (menuItem, menuIndex) {
            const id = menuItem.getAttribute("rel");
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                initWithoutSubmenu(menuItem);
            }
            showDefaultMenu(menuItem);
        });
```

Which I'll work on in the next post.
