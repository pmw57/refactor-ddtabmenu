When it comes to testing the click event handler, we now need a way to check that the clicked-on link was prevented from being followed. The event object has a preventDefault method that achieves that, but we don't yet have access to that.

What we can do is to store the event handlers in a handlers object, that is accessible both from the code and when testing too.

We can get started by testing for a click handler.

### Testing the click handler

First we test that a click handler exists:

```javascript
            it("has a click handler", function () {
                expect(ddtabmenu.handlers.click).to.be.a("function");
            });
```

That causes the test to fail, so we make the test pass by adding a handlers.click method.

```javascript
    return {
        definemenu,
        initMenu,
        handlers: {
            click: undefined
        }
    };
```

The test is now happy about the click part, and expects a function instead of undefined.

We can move all of the event handlers to that handlers object. I don't want all of the handler functions to be defined at the end of the code, so I'll define them at the start of the code in a handlers object, and just assign that handlers object at the end.

```javascript
    const handlers = {
    };
//...
    return {
        definemenu,
        initMenu,
        handlers
    };
```

The disable click handler can be assignedto the handlers object:

```javascript
        function disableClickHandler(evt) {
            evt.preventDefault();
        }
        handlers.disableClick = disableClickHandler;
//...
            if (config.disableTabLinks) {
                // menuItem.onclick = disableClickHandler;
                menuItem.onclick = handlers.disableClick;
            }
```

That causes the test to pass, which indicates that we are on the right track.

### Move other event handlers to handlers object

It doesn't make much sense for only the click handler to be on the handlers object, so let's put the rest of the event handlers on that handlers object too:

```javascript
        handlers.menuEnter = menuEnterHandler;
        handlers.revert = revertHandler;
        handlers.clearRevert = clearRevertHandler;
        handlers.disableClick = disableClickHandler;
//...
            // menuItem.onmouseenter = menuEnterHandler;
            menuItem.onmouseenter = handlers.menuEnter;
            // menuItem.onmouseleave = revertHandler;
            menuItem.onmouseleave = handlers.revert;
            const submenu = document.getElementById(id);
            // submenu.onmouseenter = clearRevertHandler;
            submenu.onmouseenter = handlers.clearRevert;
            // submenu.onmouseleave = revertHandler;
            submenu.onmouseleave = handlers.revert;
```

Now that we have handlers that can be used by the code, and are easily accesible to testing, this is now a good time to install chai-spies. We will do in the next post.
