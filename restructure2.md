When it comes to writing tests for the if/else code, at each potential branching location we want to come up with an effective way to confirm that one branch or the other was taken.

### Testing the "rel" if condition

The first part of the if/else code that we are testing is about the rel attribute:

```javascript
            if (menuItem.getAttribute("rel")) {
                tabs[tabId].menuItems[menuIndex].hasSubContent = true;
                if (config.disableTabLinks) {
                    menuItem.onclick = disableClick;
                }
                if (config.snapToOriginal.snap === true) {
                    id = menuItem.getAttribute("rel");
                    submenu = document.getElementById(id);
                    initWithSubmenu(tabId, menuItem, submenu);
                }
            } else {
                // for items without a submenu, add onMouseout effect
                initWithoutSubmenu(menuItem);
            }
```

In the else section, the initWithoutSubmenu function assigns an onmouseout event:

```javascript
        function initWithoutSubmenu(tab) {
            //...
            tab.onmouseout = function revertWithoutSubmenu() {
                //...
            };
        }
```

As a preliminary test, we can check the name of the function assigned to the onmouseout event handler.

```javascript
    describe("when tab has submenu", function () {
        it("investigate onmouseout", function () {
            ddtabmenu.initMenu("ddtabs1", 0);
            console.log(tabs[0].onmouseout.name);
            console.log(tabs[1].onmouseout.name);
            console.log(tabs[2].onmouseout.name);
            console.log(tabs[3].onmouseout.name);
            console.log(tabs[4].onmouseout.name);
        });
    });
```

The first three tabs have a submenu, and the last two don't. We get the following information sent tot he browser console:

```text
tabmenu.test.js:56 revert
tabmenu.test.js:57 revert
tabmenu.test.js:58 revert
tabmenu.test.js:59 revertWithoutSubmenu
tabmenu.test.js:60 revertWithoutSubmenu
```

That's good news. We can use the onmouseout name to confirm that one branch or the other was taken, letting us replace the above investigation code with the following:

```javascript
    describe("initMenu forEach if/else structure", function () {
        describe("submenu tabs have different onmouseout functions", function () {
            before(function () {
                ddtabmenu.initMenu("ddtabs1", 0);
            });
            it("has revert on tab 0", function () {
                expect(tabs[0].onmouseout.name).to.equal("revert");
            });
            it("has revert on tab 1", function () {
                expect(tabs[0].onmouseout.name).to.equal("revert");
            });
            it("has revert on tab 2", function () {
                expect(tabs[0].onmouseout.name).to.equal("revert");
            });
            it("hasrevertWithoutSubmenu on tab 3", function () {
                expect(tabs[0].onmouseout.name).to.equal("revert");
            });
            it("hasrevertWithoutSubmenu on tab 4", function () {
                expect(tabs[0].onmouseout.name).to.equal("revert");
            });
        });
    });
});
```

### Testing the disableTabLinks config

This disableTabLinks condition is one that doesn't change with different tabs.

```javascript
                if (config.disableTabLinks) {
                    menuItem.onclick = disableClick;
                }
```

We need to setup a different environment before checking each state. At least we can confidently use the onclick attribute to test this one.

In this case, the tabmenu uses a property value to initialize disabletablinks when the definemenu method is being run.

```javascript
        describe("disableTabLinks config", function () {
            beforeEach(function () {
                tabs[0].onclick = null;
            });
            it("disables tab links", function () {
                ddtabmenu.disabletablinks = true;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onclick.name).to.equal("disableClick");
            });
            it("doesn't disable tab links", function () {
                ddtabmenu.disabletablinks = false;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onclick).to.be.null;
            });
        });
```

### Testing snap2original config

The next condition to test is for the following condition:

```javascript
                if (config.snapToOriginal.snap === true) {
                    id = menuItem.getAttribute("rel");
                    submenu = document.getElementById(id);
                    initWithSubmenu(tabId, menuItem, submenu);
                }
```

That initWithSubmenu function sets some onmouseout and onmouseover events,

```javascript
        function initWithSubmenu(tabId, tab, submenu) {
            //...
            tab.onmouseout = revert;
            submenu.onmouseover = clearRevert;
            submenu.onmouseout = revert;
        }
```

which we should be able to use to easily test that the condition.

```javascript
        describe("snapToOriginal config", function () {
            beforeEach(function () {
                ddtabmenu.snap2original = [true, 300];
                tabs[0].onmouseout = null;
            });
            it("sets the onmouseout revert function", function () {
                ddtabmenu.snap2original[0] = true;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onmouseout.name).to.equal("revert");
            });
            it("doesn't set the onmouseout revert function", function () {
                ddtabmenu.snap2original[0] = false;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onmouseout).to.be.null;
            });
        });
    });
```

That seems to test the snap2original config setting quite well.

### Testing the default menu code

The last part to test is this complex set of code:

```javascript
            if (
                defaultSelected === "auto" &&
                defaultIsShown !== true &&
                isSelected(menuItem.href)
            ) {
                showSubmenu(tabId, menuItem);
                tabs[tabId].defaultSelected = menuItem;
                defaultIsShown = true;
            } else if (parseInt(defaultSelected) === menuIndex) {
                showSubmenu(tabId, menuItem);
                tabs[tabId].defaultSelected = menuItem;
            }
```

Fortunately when testing, I don't necessarily have to understand what the code does. I only have to ensure that I keep track of the effect that the code has, so that later on when I do work with the code, the tests can ensure that the updated code still has the same effects.

The if condition though is going to be tricky to achieve. The isSelected function call only returns true when the tab link and the current page url match.

As a result, before doing any of these default menu tests, I'll force the tab 0 link to be the current page url, and reset it back to what it was after the tests are done.

```javascript
    describe("show default menu", function () {
        let tab0href;
        before(function () {
            tab0href = tabs[0].href;
            tabs[0].href = window.location;
        });
        after(function () {
            tabs[0].href = tab0href;
        });
        it("auto-shows the default", function () {
            ...
        });
    });
```

I'm now left with a puzzle about how I tell which of the if/else sections of code has been run. Both sections are identical all but for the defaultIsShown variable. As that defaultIsShown variable seems to be the only difference, I can update the initMenu function to return an object that contains that variable, for testing purposes. It's not the ideal solution, but "needs must" when it comes to dealing with untestable code, and more appropriate techniques can be used later on.

We can now test that "auto" part with the following test:

```javascript
    describe("show default menu", function () {
        let tab0href;
        beforeEach(function () {
            tab0href = tabs[0].href;
            tabs[0].className = "";
        });
        afterEach(function () {
            tabs[0].href = tab0href;
        });
        it("auto-shows the default", function () {
            tabs[0].href = window.location;
            const defaultSelected = "auto";
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            expect(tabs[0].className).to.contain("current");
            expect(result.defaultIsShown).to.be.true;
        });
    });
```

The expect test is checking that defaultIsShown is true, helping us to be sure that the first section of the if statement has been accessed.
A separate "current" classname is emptied before each test and checked. Strictly speaking it's not needed for this test, but with the next tests it is needed so putting it in here too helps to make things consistent.

We can check that the first part of the if statement was not accessed, by changing only the "auto" part to 0, and checking that defaultIsShown is false.

```javascript
        it("shows tab but not as default, when not auto", function () {
            tabs[0].href = window.location;
            const defaultSelected = 0;
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            expect(tabs[0].className).to.contain("current");
            expect(result.defaultIsShown).to.be.false;
        });
```

All in all the tests for the if/else code dealing with the default menu, are taken care of by the following tests:

```javascript
    describe("show default menu", function () {
        let tab0href;
        beforeEach(function () {
            tab0href = tabs[0].href;
            tabs[0].className = "";
        });
        afterEach(function () {
            tabs[0].href = tab0href;
        });
        it("auto-shows the default", function () {
            tabs[0].href = window.location;
            const defaultSelected = "auto";
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            expect(result.defaultIsShown).to.be.true;
            expect(tabs[0].className).to.contain("current");
        });
        it("shows tab but not as default, when not auto", function () {
            tabs[0].href = window.location;
            const defaultSelected = 0;
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            expect(result.defaultIsShown).to.be.false;
            expect(tabs[0].className).to.contain("current");
        });
        it("doesn't show default when given tab index not found", function () {
            const defaultSelected = -1;
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            expect(result.defaultIsShown).to.be.false;
            expect(tabs[0].className).to.not.contain("current");
        });
    });
```
We should now have enough tests in place to give us good coverage when making improvements to the if/else structure of the default menu code, which I'll start making improvements to in the next post.

