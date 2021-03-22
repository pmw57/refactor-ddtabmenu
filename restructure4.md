We can make a start with the initWithSubmenu code, where the code that was in there gets moved out to a separate revertToSubmenu function instead.

```javascript
        function revertToSubmenu(menuItem, id) {
            const submenu = document.getElementById(id);
            
            function revert() {
                revertToDefault(tabId);
            }
            function clearRevert() {
                clearRevertToDefault(tabId);
            }
            menuItem.onmouseout = revert;
            submenu.onmouseover = clearRevert;
            submenu.onmouseout = revert;
        }

        function initWithSubmenu(menuItem, id) {
            if (config.disableTabLinks) {
                menuItem.onclick = function disableClick() {
                    return false;
                };
            }
            if (config.snapToOriginal.snap === true) {
                revertToSubmenu(menuItem, id);
            }
        }
//...
        menuItems.forEach(function (menuItem, menuIndex) {
            const id = menuItem.getAttribute("rel");
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                // add onMouseout effect
                initWithoutSubmenu(menuItem);
            }
            initSubmenu(menuItem);
```

That initSubmenu code just adds an onmouseover event.

```javascript
        function initSubmenu(tab) {
            tab.onmouseover = function leaveTab() {
                showSubmenu(tabId, tab);
            };
        }
```

Instead of doing that, I'll move the leaveTab function out of it, and do the tab.onmouseover command from both the initWithSubmenu and initWithoutSubmenu code. That way the event assignment is nice and consistent in both places.

I tried doing this all in one go and things went bad, so stepped back to here where we'll do it more slowly.

First, the showSubmenu gets moved to the bottom of both the initWithSubmenu and initWithoutSubmenu functions.

```javascript
        function initWithSubmenu(menuItem, id) {
            //...
            initSubmenu(menuItem);
        }
        function initWithoutSubmenu(menuItem) {
            //...
            initSubmenu(menuItem);
        }
//...
        menuItems.forEach(function (menuItem, menuIndex) {
            const id = menuItem.getAttribute("rel");
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                // add onMouseout effect
                initWithoutSubmenu(menuItem);
            }
            // initSubmenu(menuItem);
```

Here is the initSubmenu code that we are wanting to remove the need for.

```javascript
            function leaveTab(evt) {
                showSubmenu(tabId, menuItem);
            }
            menuItem.onmouseover = leaveTab;
```

We can now move the leaveTab function out of the initSubmenu code. Actually, no we can't. The menuItem variable is a dependency.

The onmouseover event doesn't make it all that easy for us to access the menuItem element. What can be done instead is to replace the onmouseover and onmouseout events with onmouseenter and onmouseleave instead. That way it doesn't trigger on span and other elements within the item, it only triggers when appropriately entering or leaving.

```javascript
            // menuItem.onmouseout = revert;
            menuItem.onmouseleave = revert;
            // submenu.onmouseover = clearRevert;
            submenu.onmouseenter = clearRevert;
            // submenu.onmouseout = revert;
            submenu.onmouseleave = revert;
//...
            // menuItem.onmouseover = leaveTab;
            menuItem.onmouseenter = leaveTab;
//...
            // menuItem.onmouseout = function revertWithoutSubmenu() {
            menuItem.onmouseleave = function revertWithoutSubmenu() {
```

Those changes break the tests so we step back and undo those changes, while we seek to better understand the problem.

We should be able to replace onmouseover for onmouseenter, and onmouseout for  one at a time without anything going bad. Let's do those one at a time and examine what occurs.

Replacing onmouseover in the revertToSubmenu function is successful.

```javascript
        function revertToSubmenu(menuItem, id) {
            //...
            menuItem.onmouseout = revert;
            // submenu.onmouseover = clearRevert;
            submenu.onmouseenter = clearRevert;
            submenu.onmouseout = revert;
        }
```


The other onmouseover in the initSubmenu function is also succesfully replaced.

```javascript
        function initSubmenu(menuItem) {
            function leaveTab(evt) {
                showSubmenu(tabId, menuItem);
            }
            // menuItem.onmouseover = leaveTab;
            menuItem.onmouseenter = leaveTab;
        }
```

The onmouseleave is where trouble occurs:

```javascript
            // menuItem.onmouseout = revert;
            menuItem.onmouseleave = revert;
            submenu.onmouseenter = clearRevert;
            // submenu.onmouseout = revert;
            submenu.onmouseleave = revert;
```

The problem is that the test code is checking for onmouseout. It would have been better if we didn't use onmouseout and instead simulated the mouse movement in some way, but that gets a lot harder to do properly. As a result, we can just rename onmouseout to onmouseleave in the tests instead.

```javascript
            it("has revert on tab 0", function () {
                // expect(tabs[0].onmouseout.name).to.equal("revert");
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
            it("has revert on tab 1", function () {
                // expect(tabs[0].onmouseout.name).to.equal("revert");
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
```

A different way to test that is to make the event handler function accessible so that we can replace that function with a spy instead, using an expansion to Chai called chai-spies. That could be something to investigate if we come across the same problem.

For now though, the updated code is all working properly as it should do, and the event handler now has much better access to the information that it needs.

### Out of date comment

Of course, the comment about onmouseout is now misleading and out of date.

```javascript
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                // add onMouseout effect
                initWithoutSubmenu(menuItem);
            }
```

So that comment can be removed. Not only is ther no onmouseout effect anymore, we plan to also have other events being setup in there too (both enter and leave). As the comment serves no beneficial purpose, it gets removed.

### Next steps

Now that more suitable mouse events are being used, we can head back to separating the leaveTab function from the initSubmenu function - in the next post.
