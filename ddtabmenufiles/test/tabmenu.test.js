/*jslint browser */
/*global describe before beforeEach afterEach after it expect ddtabmenu */
describe("menutabs", function () {
    let tabs;
    before(function () {
        tabs = document.querySelectorAll("#ddtabs1 a");
        ddtabmenu.definemenu("ddtabs1", 0);
    });
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
    describe("initMenu forEach if/else structure", function () {
        describe("submenu tabs have different onmouseleave functions", function () {
            before(function () {
                ddtabmenu.initMenu("ddtabs1", 0);
            });
            it("has revert on tab 0", function () {
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
            it("has revert on tab 1", function () {
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
            it("has revert on tab 2", function () {
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
            it("hasrevertWithoutSubmenu on tab 3", function () {
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
            it("hasrevertWithoutSubmenu on tab 4", function () {
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
        });
        describe("disableTabLinks config", function () {
            beforeEach(function () {
                tabs[0].onclick = null;
            });
            it("has a click handler", function () {
                expect(ddtabmenu.handlers.disableClick).to.be.a("function");
            });
            it("prevents the default action", function () {
                const spy = chai.spy(function () {});
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
                ddtabmenu.initMenu("ddtabs1", 0);
                tabs[0].click();
                expect(spy).to.have.been.called();
            });
            it("doesn't disable tab links", function () {
                ddtabmenu.disabletablinks = false;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onclick).to.be.null;
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
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onmouseleave.name).to.equal("revert");
            });
            it("doesn't set the onmouseleave revert function", function () {
                ddtabmenu.snap2original[0] = false;
                ddtabmenu.definemenu("ddtabs1", 0);
                ddtabmenu.initMenu("ddtabs1", 0);
                expect(tabs[0].onmouseleave).to.be.null;
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
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            expect(tabs[0].className).to.contain("current");
        });
        it("shows tab but not as default, when not auto", function () {
            const defaultSelected = 0;
            ddtabmenu.definemenu("ddtabs1", defaultSelected);
            const result = ddtabmenu.initMenu("ddtabs1", defaultSelected);
            expect(tabs[0].className).to.contain("current");
        });
    });
});