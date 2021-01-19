/*jslint browser */
/*global describe before it expect ddtabmenu */
describe("menutabs", function () {
    function getTabs(menuSelector) {
        const tabContainer = document.querySelector(menuSelector);
        const tabLinks = tabContainer.querySelectorAll("a");
        const tabs = Array.from(tabLinks);
        tabs.unshift(null);
        return tabs;
    }
    function getContent(menuSelector) {
        const container = document.querySelector(menuSelector);
        const contentContainer = container.nextElementSibling;
        const tabContent = contentContainer.querySelectorAll(".tabcontent");
        const content = Array.from(tabContent);
        content.unshift(null);
        return content;
    }
    function getMenuParts(menuSelector) {
        return {
            tabs: getTabs(menuSelector),
            content: getContent(menuSelector)
        };
    }
    function isCurrent(tab) {
        return tab.classList.contains("current");
    }
    function isVisible(panel) {
        return (panel && panel.style.display) === "block";
    }

    const {tabs, content} = getMenuParts("#ddtabs1");

    before(function () {
        ddtabmenu.disabletablinks = true;
        ddtabmenu.snap2original = [true, 100];
        ddtabmenu.definemenu("ddtabs1", 1);
    });

    describe("has an active tab", function () {
        it("tab2 is current", function () {
            expect(isCurrent(tabs[1]), "tab1").to.equal(false);
            expect(isCurrent(tabs[2]), "tab2").to.equal(false);
            expect(isCurrent(tabs[3]), "tab3").to.equal(false);
            expect(isCurrent(tabs[4]), "tab4").to.equal(false);
            expect(isCurrent(tabs[5]), "tab5").to.equal(false);
        });
        it("content2 is shown", function () {
            expect(isVisible(content[1]), "content1").to.equal(false);
            expect(isVisible(content[2]), "content2").to.equal(false);
            expect(isVisible(content[3]), "content3").to.equal(false);
            expect(isVisible(content[4]), "content4").to.equal(false);
            expect(isVisible(content[5]), "content5").to.equal(false);
        });
    });
    describe("disabletablinks", function () {
        it("ignores tab click", function () {
            const click = new Event("click");
            tabs[1].dispatchEvent(click);
            expect(isCurrent(tabs[1]), "tab1").to.equal(false);
        });
    });
});