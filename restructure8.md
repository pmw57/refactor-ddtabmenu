The problem that we have is that the event handers are being defined and assigned both at the same time.

```text
2. create spy           tabmenu.test.js:90
3. replace handler      tabmenu.test.js:92
1. define handler       ddtabmenu.js:94
4. assign onclick       ddtabmenu.js:107
```

We need to split that up a bit, so that the event handlers are first defined, letting us replace them with a spy, so that the updated event handler can then be assigned.

### Init disableClick handler when first run

We want to assign disableClick to the handlers as soon as practical, before we even use the defineMenu and initMenu functions.

That means extracting the disableClickHandler function out of the initMenu function:

```javascript
    function initMenu(tabId, defaultSelected) {
        //...
        handlers.menuEnter = menuEnterHandler;
        handlers.revert = revert;
        handlers.clearRevert = clearRevertHandler;
        // handlers.disableClick = disableClickHandler;
        //...
    }
    //...    
    handlers.disableClick = disableClickHandler;

    return {
        definemenu,
        initMenu,
        handlers
    };
```

and moving the disableClickHandler function so that it can be found from outside of the initMenu function.

```javascript
    function disableClickHandler(evt) {
        evt.preventDefault();
    }
    function initMenu(tabId, defaultSelected) {
    //...
        // function disableClickHandler(evt) {
        //     evt.preventDefault();
        // }
    //...
    }
```

That all works now, and all of the console statements can be removed.

As this event handler restructure has been beneficial, we really should move the other event handlers to be in the same place too.

### Move other event handlers to join the disableClickHandler

Currently we have several functions inside of the initMenu function. It will be easier to move them around once we move them to be outside of the initMenu function.

There are complicating factors though. Several of the event handler functions use closure to access the tabId variable. For example:

```javascript
        function clearRevertHandler() {
            clearRevertToDefault(tabId);
        }
```

How are we to get that tabId in some other way? It must be via an event handler variable called evt.

```javascript
        // function clearRevertHandler() {
        function clearRevertHandler(evt) {
            const tabId = ???
            clearRevertToDefault(tabId);
        }
```

We do have a way via the HTML elements. We have the tab menu using `rel` to refer to a submenu.

```html
    <div id="ddtabs1" class="glowingtabs">
        <ul>
            <li><a href="http://www.dynamicdrive.com" rel="gc1"><span>Home</span></a></li>
            <!-- ... -->
        </ul>
    </div>
    <div class="tabcontainer">
        <div id="gc1" class="tabcontent">
            Return to the <a href="http://www.dynamicdrive.com">frontpage</a> of Dynamic Drive.
        </div>
            <!-- ... -->
    </div>
```

The evt.target reference will refer to one of the tabcontent sections. We can get gc1 from the id, find the element with rel="gc1", and walk up its parents to the UL element and further to the id="ddtabs1" element.

```javascript
        function clearRevertHandler(evt) {
            const submenuId = evt.target.id;
            const menuTab = document.querySelector("[rel=" + submenuId + "]");
            const ul = menuTab.parentNode.parentNode;
            const tabId = ul.parentNode.id;
            clearRevertToDefault(tabId);
        }
```

We can simplify that by moving most of the code into a separate function that does the search:

```javascript
        function getTabmenuViaRel(el) {
            const submenuId = el.id;
            const menuTab = document.querySelector("[rel=" + submenuId + "]");
            const ul = menuTab.parentNode.parentNode;
            const tabmenu = ul.parentNode;
            return tabmenu;
        }
        function clearRevertHandler(evt) {
            const tabmenu = getTabmenuViaRel(evt.target);
            clearRevertToDefault(tabmenu.id);
        }
```

and those two functions can now be extracted up out of the initMenu function.

We can carry on by using getTabmenuViaRel() to get the tabId in the other functions, allowing us to extract them up out of the initMenu function too.

### Extract the revert event handler

The revert event handler uses revertToDefault, which also accesses the tabId variable. We can get that tabId from tabmenu.id, and update reverToDefault to use a function parameter to get the tabId.

```javascript
        // function revertToDefault() {
        function revertToDefault(tabId) {
            const delay = config.snapToOriginal.delay;
            tabs[tabId].timer = setTimeout(showDefaultTab, delay);
        }
        function revert(evt) {
            const tabmenu = getTabmenuViaRel(evt.target);
            // revertToDefault();
            revertToDefault(tabmenu.id);
        }
//...
                if (config.snapToOriginal.snap === true) {
                    // revertToDefault();
                    revertToDefault(tabId);
                }

```

The revertToDefault function also needs access to the config, so we need up update that too:

```javascript
        // function revertToDefault() {
        function revertToDefault(tabId) {
            const config = tabs[tabId].config;
            const delay = config.snapToOriginal.delay;
            tabs[tabId].timer = setTimeout(showDefaultTab, delay);
        }
```

The showDefaultTab function also needs the tabId. As it's only used by the timeout, we can move that function inside of revertToDefault so that it can access tabId by closure.


```javascript
    function revertToDefault(tabId) {
        function showDefaultTab() {
            showSubmenu(tabId, tabs[tabId].defaultSelected);
        }
        const config = tabs[tabId].config;
        const delay = config.snapToOriginal.delay;
        tabs[tabId].timer = setTimeout(showDefaultTab, delay);
    }
```

We can now extract both the revertToDefault and the revert functions up out of the initMenu function.

### Extract the menuEnterHandler function

We also need to use getTabmenuViaRel to get the tab id when the menuEnterHandler function is called:

```javascript
        function menuEnterHandler(evt) {
            const tabmenu = getTabmenuViaRel(evt.target);
            showSubmenu(tabId, evt.target);
        }
```

This menu handler though has a different menu link, so we need to update getTabmenuViaRel so that it checks if there's a `rel` attribute, and if there isn't then it finds it using the id.

```javascript
    function getTabmenuViaRel(el) {
        let menuTab = el;
        if (!el.rel) {
            const submenuId = el.id;
            menuTab = document.querySelector("[rel=" + submenuId + "]");
        }
        const ul = menuTab.parentNode.parentNode;
        const tabmenu = ul.parentNode;
        return tabmenu;
    }
```

We can now extract the menuEnterHandler function up out of the initMenu function.

### Move the handler assignments to the end of the code

We now have the event handlers all nicely grouped together, outside of the initMenu function where they are more easily accessed.

```javascript
    function getTabmenuViaRel(el) {
        let menuTab = el;
        if (!el.rel) {
            const submenuId = el.id;
            menuTab = document.querySelector("[rel=" + submenuId + "]");
        }
        const ul = menuTab.parentNode.parentNode;
        const tabmenu = ul.parentNode;
        return tabmenu;
    }
    function menuEnterHandler(evt) {
        const tabmenu = getTabmenuViaRel(evt.target);
        showSubmenu(tabmenu.id, evt.target);
    }
    function revert(evt) {
        const tabmenu = getTabmenuViaRel(evt.target);
        revertToDefault(tabmenu.id);
    }
    function clearRevertHandler(evt) {
        const tabmenu = getTabmenuViaRel(evt.target);
        clearRevertToDefault(tabmenu.id);
    }
    function disableClickHandler(evt) {
        evt.preventDefault();
    }
```

The code that assigns those handlers to the handlers object can now be moved down to the bottom of the code:

```javascript
    handlers.menuEnter = menuEnterHandler;
    handlers.revert = revert;
    handlers.clearRevert = clearRevertHandler;
    handlers.disableClick = disableClickHandler;

    return {
        definemenu,
        initMenu,
        handlers
    };
```

### Conclusion

All of the tests that we have in place still pass, major improvements have happened to the code while keeping everything still working.

A next step could be to investigate the coverage of the tests. Currently 80% of the code is handled by the tests, which means that 20% of the code can change without the tests picking up any problem at all. We could flesh out tests for the above event handlers, and use built-in browser tools to help us improve that coverage further, but that's for another time.

The intention here was to use the tests to help us reduce the if/else nesting in some forEach code, which has been suitably achieved. I'll finish up in my next post by returning back to that forEach code to tidy things up.