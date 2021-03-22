The forEach code that we are wanting to improve is as follows:

```javascript
        menuItems.forEach(function (menuItem, menuIndex) {
            const id = menuItem.getAttribute("rel");
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                initWithoutSubmenu(menuItem);
            }
            if (
                defaultSelected === "auto" &&
                defaultIsShown !== true &&
                isSelected(menuItem)
            ) {
                showSubmenu(tabId, menuItem);
                tabs[tabId].defaultSelected = menuItem;
                defaultIsShown = true;
            } else if (parseInt(defaultSelected) === menuIndex) {
                showSubmenu(tabId, menuItem);
                tabs[tabId].defaultSelected = menuItem;
            }
        });
```

The first if statement is a good example of what we should be aiming for. We want a nice simple condition, followed by a simple function call.

### Remove test-specific code

We returned a defaultIsShown value so that a test can tell what's going on.

```javascript
        return {
            defaultIsShown
        };
```


I would rather not do that, and want to try to get that same information without that code.

In the tests we are already checking that the appropriate menu is showing, so we can remove that defaultIsShown code.

test/tabmenu.test.js

```javascript
        it("auto-shows the default", function () {
            const defaultSelected = "auto";
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            // expect(result.defaultIsShown).to.be.true;
            expect(tabs[0].className).to.contain("current");
        });
```

ddtabmenu.js

```javascript
        // return {
        //     defaultIsShown
        // };
```

With that gone, the rest should be quite easy to achieve.

### Split up the forEach statement

Let's simplify things by splitting up the forEach statement, so that we only have to deal with a smaller set of code.

```javascript
        menuItems.forEach(function (menuItem) {
            const id = menuItem.getAttribute("rel");
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                initWithoutSubmenu(menuItem);
            }
        });
        menuItems.forEach(function (menuItem, menuIndex) {
            if (
                defaultSelected === "auto" &&
                defaultIsShown !== true &&
                isSelected(menuItem)
            ) {
                showSubmenu(tabId, menuItem);
                tabs[tabId].defaultSelected = menuItem;
                defaultIsShown = true;
            } else if (parseInt(defaultSelected) === menuIndex) {
                showSubmenu(tabId, menuItem);
                tabs[tabId].defaultSelected = menuItem;
            }
        });
```

### Move code out to functions

Simplifying things further, we can move the if conditions and body statements into separate functions. That way, the structure of the code is easier to understand and manipulate.

```javascript
        function isAutoDefault(defaultSelected, menuItem) {
            return (
                defaultSelected === "auto" &&
                isSelected(menuItem)
            );
        }
        function isSpecifiedMenu(defaultSelected, menuIndex) {
            return parseInt(defaultSelected) === menuIndex;
        }
        function showDefaultMenu(menuItem) {
            showSubmenu(tabId, menuItem);
            tabs[tabId].defaultSelected = menuItem;
        }
//...
        menuItems.forEach(function (menuItem, menuIndex) {
            if (
                defaultIsShown !== true &&
                isAutoDefault(defaultSelected, menuItem)
            ) {
                showDefaultMenu(menuItem);
                defaultIsShown = true;
            } else if (isSpecifiedMenu(defaultSelected, menuIndex)) {
                showDefaultMenu(menuItem);
            }
        });
```

### Be more explicit with defaultIsShown

The defaultIsShown boolean is designed to ensure that only one menu item is shown. We can make that more explicit by using separate if statements to return early, if the default is already shown.

```javascript
        menuItems.forEach(function (menuItem, menuIndex) {
            if (defaultIsShown === true) {
                return;
            }
            if (isAutoDefault(defaultSelected, menuItem)) {
                showDefaultMenu(menuItem);
                defaultIsShown = true;
            }
            if (defaultIsShown === true) {
                return;
            }
            if (
                defaultIsShown !== true &&
                isSpecifiedMenu(defaultSelected, menuIndex)
            ) {
                showDefaultMenu(menuItem);
            }
        });
```

It's now very clear that we only want to show the default menu once.

### Use Array find method instead

A more suitable way to do something only once is to use the Array find method to find a suitable item.

To achieve that, we want menuItems to be a proper array.

```javascript
        const menuItems = Array.from(container.querySelectorAll("a"));
```

We can now easily find the default menu, and show it.

```javascript
        function isDefaultMenu(menuItem, menuIndex) {
            return (
                isAutoDefault(defaultSelected, menuItem) ||
                isSpecifiedMenu(defaultSelected, menuIndex)
            );
        }
        //...
        const defaultMenu = menuItems.find(isDefaultMenu);
        showDefaultMenu(defaultMenu);
```

The forEach code no longer serves ant benefit, and can now be removed.

### Cleaning up

The showDefaultMenu doesn't seem to be necessary now, so we can inline that function, and remove the remaining defaultIsShown code too.

```javascript
        // function showDefaultMenu(menuItem) {
        //     showSubmenu(tabId, menuItem);
        //     tabs[tabId].defaultSelected = menuItem;
        // }
//...
        // const defaultIsShown = false;
//...
        const defaultMenu = menuItems.find(isDefaultMenu);
        // showDefaultMenu(defaultMenu);
        showSubmenu(tabId, defaultMenu);
        tabs[tabId].defaultSelected = defaultMenu;
```

The tests all still pass, and we are left with the following much simplified code that does everything that's needed.

```javascript
        const defaultMenu = menuItems.find(isDefaultMenu);
        showSubmenu(tabId, defaultMenu);
        tabs[tabId].defaultSelected = defaultMenu;
```

### Conclusion

That brings this exploration to an end.

The tests have help to inform me whenever I start to diverge from what works. Most of those warnings I haven't broadcast, ad instead have used undo to walk back to what does work, so that I can make another more successful attempt.

I hope that you found parts of this to provide some beneficial insight.