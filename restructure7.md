Now that we have handlers that can be used by the code, and are easily accesible to testing.

### Testing preventDefault

When an function that's handing an event returns false, that prevents more than just the default action. It also prevents the event from bubbling up to parent nodes. These days instead of returning false, it's preferred to more explicitly call the event method preventDefault(). Not only is that more explicit and easier to understand, it also helps to ensure that you don't have a larger impact on the system than intended.

Without chai-spies, we would have a fucntion update a local variable so that we can check that the function was run.

```javascript
            it("prevents the default action", function () {
                let spyWasCalled = false;
                const spy = function () {
                    spyWasCalled = true;
                };
                const evt = {
                    preventDefault: spy
                };
                ddtabmenu.handlers.disableClick(evt);
                expect(spyWasCalled).to.be.true;
            });
```

Right now that test appropriately fails. We can update the scripting code to use preventDefault instead of false.

```javascript
        // function disableClickHandler() {
        function disableClickHandler(evt) {
            // return false;
            evt.preventDefault();
        }
```

The test now passes with good results.

This is a good time to install chai-spies, to replace the test code with something more designed for the job.

### Installing chai-spies

Chai-spies prefers to be installed using Node, but I'm not using it in a Node environment so I must obtain it in some other way.

CDN's are a good way to obtain JavaScript libraries, and I find chai-spies at https://www.jsdelivr.com/package/npm/chai-spies
I can then download it from there to my test/lib/ folder, and add chai-spies to the test page.

```html
    <script src="lib/mocha.min.js"></script>
    <script src="lib/chai.min.js"></script>
    <script src="lib/chai-spies.min.js"></script>
```

### Using chai.spy

I can now remove the temporary variable in the test and use chai.spy instead, with `to.have.been.called()` checking that the function was called.

```javascript
            it("prevents the default action", function () {
                const spy = chai.spy(function () {});
                const evt = {
                    preventDefault: spy
                };
                ddtabmenu.handlers.disableClick(evt);
                expect(spy).to.have.been.called();
            });
```

The spy makes it easier to understand what the test is wanting to achieve.

We can now move on to using a spy with the click test too.

### Using chai.spy elsewhere
The test after that which actually triggers the click event, can be updated to use a spy too.

```javascript
            it("disables tab links", function () {
                ddtabmenu.disabletablinks = true;
                ddtabmenu.definemenu("ddtabs1", 0);
                const spy = chai.spy.on(ddtabmenu.handlers, "disableClick");
                ddtabmenu.handlers.disableClick = undefined;
                ddtabmenu.initMenu("ddtabs1", 0);
                tabs[0].click();
                expect(spy).to.have.been.called();
            });
```

That **should** work, but currently doesn't.

### Investigating the issue

Somehow the event handler is not being replaced by the spy, before it gets assigned to the click event.

I've scattered some console.log statements around to let me study the existing order in which things happen:

```javascript
    function disableClickHandler(evt) {
        console.log("6. handler called");
        evt.preventDefault();
    }
//...
        console.log("1. define handler");
        handlers.disableClick = disableClickHandler;
//...
            if (config.disableTabLinks) {
                console.log("4. assign onclick");
                menuItem.onclick = ddtabmenu.handlers.disableClick;
```

With other log statements numbered to help me place things in a desired order.

```javascript
            it("disables tab links", function () {
                ddtabmenu.disabletablinks = true;
                ddtabmenu.definemenu("ddtabs1", 0);
                console.log("2. create spy");
                const spy = chai.spy.on(ddtabmenu.handlers, "disableClick");
                console.log("3. replace handler");
                ddtabmenu.handlers.disableClick = undefined;
                ddtabmenu.initMenu("ddtabs1", 0);
                console.log("5. click element");
                tabs[0].click();
                console.log("7. expect spy");
                expect(spy).to.have.been.called();
            });
```

That gives a console log of:

```text
2. create spy           tabmenu.test.js:90
3. replace handler      tabmenu.test.js:92
1. define handler       ddtabmenu.js:94
4. assign onclick       ddtabmenu.js:107
5. click element        tabmenu.test.js:95
6. handler called       ddtabmenu.js:69
7. expect spy           tabmenu.test.js:97
```

The define handler part is out of order. We want that to happen before everything else, or at least between defining and replacing the handler.

We'll delve in to why that is happening in the next post.