/*jslint browser */
/*global chai describe before beforeEach afterEach after it expect ddtabmenu */
describe("menutabs", function () {
    let tabs;
    before(function () {
        tabs = document.querySelectorAll("#ddtabs1 a");
        ddtabmenu.definemenu("ddtabs1", 0);
    });
    describe("when tab 0 init'd", function () {
        beforeEach(function () {
            ddtabmenu.definemenu("ddtabs1", 0);
            ddtabmenu.initMenu("ddtabs1");
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
    describe("when tab 1 init'd", function () {
        beforeEach(function () {
            ddtabmenu.definemenu("ddtabs1", 1);
            ddtabmenu.initMenu("ddtabs1");
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
            ddtabmenu.definemenu("ddtabs1", 2);
            ddtabmenu.initMenu("ddtabs1");
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
    describe("initMenu forEach if/else structure", function () {
        let mouseleaveEvent;
        let revertSubmenuSpy;
        let revertNoSubmenuSpy;
        before(function () {
            mouseleaveEvent = new window.MouseEvent("mouseleave", {
                view: window,
                bubbles: true,
                cancelable: true
            });
            revertSubmenuSpy = chai.spy.on(
                ddtabmenu.handlers,
                "revert"
            );
            revertNoSubmenuSpy = chai.spy.on(
                ddtabmenu.handlers,
                "revertWithoutSubmenu"
            );
            ddtabmenu.definemenu("ddtabs1", 0);
            ddtabmenu.initMenu("ddtabs1");
        });
        describe("disableTabLinks config", function () {
            beforeEach(function () {
                tabs[0].onclick = null;
            });
            it("has a click handler", function () {
                expect(ddtabmenu.handlers.disableClick).to.be.a("function");
            });
            it("prevents the default action", function () {
                const spy = chai.spy(function () {
                    return;
                });
                const evt = {
                    preventDefault: spy
                };
                ddtabmenu.handlers.disableClick(evt);
                expect(spy).to.have.been.called();
            });
            it("disables tab links", function () {
                ddtabmenu.disabletablinks = true;
                const spy = chai.spy.on(ddtabmenu.handlers, "disableClick");
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1");
                tabs[0].click();
                expect(spy).to.have.been.called();
            });
            it("doesn't disable tab links", function () {
                ddtabmenu.disabletablinks = false;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1");
                expect(tabs[0].onclick).to.equal(null);
            });
        });
        describe("tabs have onmouseleave functions", function () {
            it("has revert on tab 0", function () {
                tabs[0].dispatchEvent(mouseleaveEvent);
                expect(revertSubmenuSpy).to.have.been.called();
            });
            it("has revert on tab 1", function () {
                tabs[1].dispatchEvent(mouseleaveEvent);
                expect(revertSubmenuSpy).to.have.been.called();
            });
            it("has revert on tab 2", function () {
                tabs[2].dispatchEvent(mouseleaveEvent);
                expect(revertSubmenuSpy).to.have.been.called();
            });
            it("hasrevertWithoutSubmenu on tab 3", function () {
                tabs[3].dispatchEvent(mouseleaveEvent);
                expect(revertNoSubmenuSpy).to.have.been.called();
            });
            it("hasrevertWithoutSubmenu on tab 4", function () {
                tabs[4].dispatchEvent(mouseleaveEvent);
                expect(revertNoSubmenuSpy).to.have.been.called();
            });
        });
        describe("snapToOriginal config", function () {
            beforeEach(function () {
                ddtabmenu.snap2original = [true, 300];
                tabs[0].onmouseleave = null;
            });
            it("sets the onmouseleave revert function", function () {
                ddtabmenu.snap2original[0] = true;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1");
                tabs[0].dispatchEvent(mouseleaveEvent);
                expect(revertSubmenuSpy).to.have.been.called();
            });
            it("doesn't set the onmouseleave revert function", function () {
                ddtabmenu.snap2original[0] = false;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1");
                tabs[0].dispatchEvent(mouseleaveEvent);
                expect(revertSubmenuSpy).to.have.been.called();
            });
        });
    });
    describe("show default menu", function () {
        let tab0href;
        beforeEach(function () {
            tab0href = tabs[0].href;
            tabs[0].href = window.location;
            tabs[0].className = "";
        });
        afterEach(function () {
            tabs[0].href = tab0href;
        });
        it("auto-shows the default", function () {
            const defaultSelected = "auto";
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            ddtabmenu.initMenu("ddtabs1");
            expect(tabs[0].className).to.contain("current");
        });
        it("shows tab but not as default, when not auto", function () {
            const defaultSelected = 0;
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            ddtabmenu.initMenu("ddtabs1");
            expect(tabs[0].className).to.contain("current");
        });
    });
});