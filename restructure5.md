### Improving the leaveTab code

Now that we are using onmouseenter for the event, we have a better solution for the following code:

```javascript
        function initSubmenu(menuItem) {
            function leaveTab(evt) {
                showSubmenu(tabId, menuItem);
            }
            menuItem.onmouseenter = leaveTab;
        }
```

Instead of using menuItem, we can get the element from evt.target, letting us extract the leaveTab function.

```javascript
        function leaveTab(evt) {
            showSubmenu(tabId, evt.target);
        }
        function initSubmenu(menuItem) {
            // function leaveTab(evt) {
            //     showSubmenu(tabId, menuItem);
            // }
            menuItem.onmouseenter = leaveTab;
        }
```

Because the initSubmenu function has so little to do now, we can replace the initSubmenu function calls with the onmouseenter assignment instead.

```javascript
        // function initSubmenu(menuItem) {
        //     menuItem.onmouseenter = leaveTab;
        // }
//...
        function initWithSubmenu(menuItem, id) {
            //...
            if (config.snapToOriginal.snap === true) {
                revertToSubmenu(menuItem, id);
            }
            // initSubmenu(menuItem);
            menuItem.onmouseenter = leaveTab;
        }
//...
        function initWithoutSubmenu(menuItem) {
            menuItem.onmouseenter = leaveTab;
            menuItem.onmouseleave = function revertWithoutSubmenu() {
                //...
            };
            // initSubmenu(menuItem);
        }
```

### Grouping onmouseenter with onmouseleave

For better clarity, it helps if related events are assigned in the same place.

Currently the revertToSubmenu function assigns onmouseleave and completely ignores onmouseenter.

```javascript
        function revertToSubmenu(menuItem, id) {
            //...
            menuItem.onmouseleave = revert;
            submenu.onmouseenter = clearRevert;
            submenu.onmouseleave = revert;
        }
```

We should assign onmouseenter at the same time as assigning onmouseleave. That means using an if/else structure for snapToOriginal, so that the revertToSubmenu function can assign menuItem.onmouseenter, and have the else clause also assign onmouseenter too.

```javascript
        function revertToSubmenu(menuItem, id) {
            //...
            menuItem.onmouseenter = leaveTab;
            menuItem.onmouseleave = revert;
            submenu.onmouseenter = clearRevert;
            submenu.onmouseleave = revert;
        }
            if (config.snapToOriginal.snap === true) {
                revertToSubmenu(menuItem, id);
            // }
            // menuItem.onmouseenter = leaveTab;
            } else {
                menuItem.onmouseenter = leaveTab;
            }
```

### Clearing the onmouseleave event handler too

In the else clause, along with the onmouseenter method, it makes good sense to also assign a matching onmouseleave method.

We already have a test that checks tha the onmouseleave event is null:

```javascript
            it("doesn't set the onmouseleave revert function", function () {
                ddtabmenu.snap2original[0] = false;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onmouseleave).to.be.null;
            });
```

Adding in that event handler helps to make the code more explicit, with both the enter and leave methods being assign in the same place at the same time.

```javascript
            } else {
                menuItem.onmouseenter = leaveTab;
                menuItem.onmouseleave = null;
            }
```


We even allowed the else statement to explicitly assign null to the event, to help inform everyone that we delibertely intend for no event to occur.

### Use a consistent naming scheme

It becomes clear now that leaveTab is not a suitable name for that event handler. To gain a better understanding of what to name them, we can group all of the event handler functions together.

```javascript
        function leaveTab(evt) {
            showSubmenu(tabId, evt.target);
        }
        function revert() {
            revertToDefault();
        }
        function clearRevert() {
            clearRevertToDefault();
        }
        function disableClick() {
            return false;
        }
```

It's a good standard to have `evt` as the function parameter. Regardless of whether evt is used or not, it also helps to use the term Handler in the event handler function names to help avoid confusion about them. As such, we can rename leaveTab to be menuEnterHandler, and add Handler to the clearRevert and disableClick functions:

```javascript
        // function leaveTab(evt) {
        function menuEnterHandler(evt) {
            showSubmenu(tabId, evt.target);
        }
        function revert() {
            revertToDefault();
        }
        // function clearRevertHandler() {
        function clearRevertHandler() {
            clearRevertToDefault(tabId);
        }
        // function disableClick() {
        function disableClickHandler() {
            return false;
        }
//...
            // menuItem.onmouseenter = leaveTab;
            menuItem.onmouseenter = menuEnterHandler;
            menuItem.onmouseleave = revert;
            const submenu = document.getElementById(id);
            // submenu.onmouseenter = clearRevert;
            submenu.onmouseenter = clearRevertHandler;
            submenu.onmouseleave = revert;
//...
            if (config.disableTabLinks) {
                // menuItem.onclick = disableClick;
                menuItem.onclick = disableClickHandler;
            }
//...
            } else {
                // menuItem.onmouseenter = leaveTab;
                menuItem.onmouseenter = menuEnterHandler;
```

### Improving the click prevention

The menuEnterHandler function does cause a test to fail because it's relying on the function name. That's kind of brittle. Instead of being so explicit we can afford to back off a bit, and just check that a function exists on the click handler instead, and click on the tab to check that nothing happens.

```javascript
            it("disables tab links", function () {
                ddtabmenu.disabletablinks = true;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                // expect(tabs[0].onclick.name).to.equal("disableClick");
                expect(tabs[0].onclick).to.be.a("function");
                tabs[0].click();
            });
```

A better way is to pass a fake event object to the function, and check that a preventDefault method has been called.

Earlier I said that I would keep an eye out for when we want to spy on something else, and use the chai-spies library. This is that time, which will be the next post.
