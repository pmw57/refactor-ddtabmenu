This thread is my attempt to achieve several things:

- retain sanity throughout the process of improving some code
- let others know that I don't have improved code, yet
- give you an interesting insight into behind the scenes work

I have some some code that I want to restructure, so that the if/else parts aren’t as nested as they currently are.

```javascript
        menuItems.forEach(function (menuItem, menuIndex) {
            const config = tabs[tabId].config;
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
            initSubmenu(menuItem);
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
        });
```

The problem that I'm faced with is that I fear breaking something when I make any structural changes. That fear prevents the code from improving. Tests free us from that fear, as they give almost immediate feedback on changes that we make.

This code wasn't written with tests in mind. That doesn't mean that it's impossible to test though, just difficult.

### Can we run tests on the code?

Tests mean repeatedly running the code with different inputs, so that we can check for different desired outcomes.

The first thing to figure out is if we can change the environment and run the code, to get different results.

I have an HTML page all set up with a set of tabs being shown, and [Mocha] with [Chai] for the testing framework:

test/index.html

```html
<html>
<head>
    <title>Dynamic Drive DHTML Scripts- DD Tab Menu Demos</title>
    <!-- CSS for Tab Menu #2 -->
    <link rel="stylesheet" type="text/css" href="../glowtabs.css" />
    <link rel="stylesheet" type="text/css" href="lib/mocha.css" />
</head>
<body>
    <div id="ddtabs1" class="glowingtabs">
        <ul>
            <li><a href="http://www.dynamicdrive.com" rel="gc1"><span>Home</span></a></li>
            <li><a href="http://www.dynamicdrive.com/new.htm" rel="gc2"><span>DHTML</span></a></li>
            <li><a href="http://www.dynamicdrive.com/style/" rel="gc3"><span>CSS</span></a></li>
            <li><a href="http://www.dynamicdrive.com/forums/"><span>Forums</span></a></li>
            <li><a href="http://tools.dynamicdrive.com/imageoptimizer/"><span>Gif Optimizer</span></a></li>
        </ul>
    </div>
    <div class="tabcontainer">
        <div id="gc1" class="tabcontent">
            Return to the <a href="http://www.dynamicdrive.com">frontpage</a> of Dynamic Drive.
        </div>
        <div id="gc2" class="tabcontent">
            See the new scripts recently added to Dynamic Drive. <a href="http://www.dynamicdrive.com/new.htm">Click here</a>.
        </div>
        <div id="gc3" class="tabcontent">
            Original, practical <a href="http://www.dynamicdrive.com/style/">CSS codes and examples</a> such as CSS menus for your site.
        </div>
    </div>
    <div id="mocha"></div>
    <script type="text/javascript" src="../ddtabmenu.js"></script>
    <script src="lib/mocha.js"></script>
    <script src="lib/chai.js"></script>
    <script class="mocha-init">
      mocha.setup("bdd");
      mocha.checkLeaks();
      const expect = chai.expect;
    </script>
    <script src="tabmenu.test.js"></script>
    <script class="mocha-exec">
      mocha.run();
    </script>
</body>
</html>
```

The `mocha.setup` and `mocha.run` parts are from the instructions on [running Mocha in the browser](https://mochajs.org/#running-mocha-in-the-browser).

### Testing something

The ddtabmenu code has an initMenu method, that takes parameters of tabId and defaultSelected. We get an error when just using that, so we need to  use definemenu before doing anything else.

```javascript
describe("menutabs", function () {
    it("when tab 0 init'd, tab 0 is current", function () {
        ddtabmenu.definemenu("ddtabs1", 0);
        const tabs = document.querySelectorAll("#ddtabs1 a");
        ddtabmenu.initMenu("ddtabs1", 0);
        const tab = tabs[0];
        expect(tab.className).to.contain("current");
    });
});
```

It can be confusing to think of and write about the first tab and second tab, when they are zero-indexed the first tab is tab 0, and the second tab is tab 1. To avoid that confusion I will deal with them using a zero-index notation, as tab 0 and tab 1 instead.

### Add tests, bringing common pieces together

We can then check if the other tabs don't have the current class, moving some of the code out to things that should be updated before all of the tests run, and ones that should update before each individual test is run.


```javascript
    before(function () {
        ddtabmenu.definemenu("ddtabs1", 0);
    });
    let tabs;
    beforeEach(function () {
        tabs = document.querySelectorAll("#ddtabs1 a");
    });
    it("when tab 0 init'd, tab 0 is current", function () {
        ddtabmenu.initMenu("ddtabs1", 0);
        const tab = tabs[0];
        expect(tab.className).to.contain("current");
    });
    it("when tab 0 init'd, tab 1 is not current", function () {
        ddtabmenu.initMenu("ddtabs1", 0);
        const tab = tabs[1];
        expect(tab.className).to.not.contain("current");
    });
    it("when tab 0 init'd, tab 2 is not current", function () {
        ddtabmenu.initMenu("ddtabs1", 0);
        const tab = tabs[2];
        expect(tab.className).to.not.contain("current");
    });
```

It's important that each of those expect statements is in a separate test section. Here's what that could look like when the expect statements are all in the same test section:

```javascript
    it("when tab 0 init'd, tab 0 is current", function () {
        ddtabmenu.initMenu("ddtabs1", 0);
        const tab = tabs[0];
        expect(tab.className).to.contain("current");
        expect(tab.className).to.not.contain("current");
        expect(tab.className).to.not.contain("current");
    });
```

While that's more condensed, the problem is that we don't get to know much about which of the expect statements failed when a problem happens. That makes it harder to figure out what went wrong and further investigation is then needed to work out what went wrong and why. That's not a problem that we need. Putting each expect statement in a separate test section helps to give us more details information about what went wrong, letting us more easily understand what went wrong and why.

Before doing other tests when initing other tabs, we should group these tests for tab 0 together. We can put them inside of a describe section, and rename the descriptions so that they make more sense together. The initMenu command can also be lifted up to be out of the it sections too.

```javascript
    describe("when tab 0 init'd", function () {
        beforeEach(function () {
            ddtabmenu.initMenu("ddtabs1", 0);
        });
        it("tab 0 is current", function () {
            expect(tabs[0].className).to.contain("current");
        });
        it("tab 1 isn't current", function () {
            expect(tabs[1].className).to.not.contain("current");
        });
        it("tab 2 isn't current", function () {
            expect(tabs[2].className).to.not.contain("current");
        });
    });
```

### Test when other tabs are current

We can now use similar code to check what happens when tab 1 and tab 2 are init'd too.

```javascript
    describe("when tab 1 init'd", function () {
        beforeEach(function () {
            ddtabmenu.initMenu("ddtabs1", 1);
        });
        it("tab 0 isn't current", function () {
            expect(tabs[0].className).to.not.contain("current");
        });
        it("tab 1 is current", function () {
            expect(tabs[1].className).to.contain("current");
        });
        it("tab 2 isn't current", function () {
            expect(tabs[2].className).to.not.contain("current");
        });
    });
    describe("when tab 2 init'd", function () {
        beforeEach(function () {
            ddtabmenu.initMenu("ddtabs1", 2);
        });
        it("tab 0 is current", function () {
            expect(tabs[0].className).to.not.contain("current");
        });
        it("tab 1 isn't current", function () {
            expect(tabs[1].className).to.not.contain("current");
        });
        it("tab 2 isn't current", function () {
            expect(tabs[2].className).to.contain("current");
        });
    });
```

Those initial tests work, so we look to be ready to get started on testing the if/else code structure in the initMenu function.

We can set up different environment situations and try to trigger each of the different parts of the if/else code structure, which I'll investigate in the next post.
