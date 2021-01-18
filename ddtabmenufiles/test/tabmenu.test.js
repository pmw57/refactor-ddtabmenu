/*jslint browser */
/*global describe beforeEach it expect */
describe("test", function () {
    const tabs = [
        null,
        document.querySelectorAll("#ddtabs2 a")[0],
        document.querySelectorAll("#ddtabs2 a")[1],
        document.querySelectorAll("#ddtabs2 a")[2],
        document.querySelectorAll("#ddtabs2 a")[3],
        document.querySelectorAll("#ddtabs2 a")[4]
    ];
    const content = [
        null,
        document.querySelector("#gc1"),
        document.querySelector("#gc2"),
        document.querySelector("#gc3"),
        document.querySelector("#gc4"),
        document.querySelector("#gc5")
    ];
    beforeEach(function () {
        return;
    });
    describe("has an active tab", function () {
        it("tab2 is current", function () {
            expect(
                tabs[1].classList.contains("current"),
                "tab1 not current"
            ).to.not.equal(true);
            expect(
                tabs[2].classList.contains("current"),
                "tab2 is current"
            ).to.equal(true);
            expect(
                tabs[3].classList.contains("current"),
                "tab3 not current"
            ).to.not.equal(true);
            expect(
                tabs[4].classList.contains("current"),
                "tab4 not current"
            ).to.not.equal(true);
            expect(
                tabs[5].classList.contains("current"),
                "tab5 not current"
            ).to.not.equal(true);
        });
        it("content2 is shown", function () {
            expect(
                content[1].style.display,
                "content1 not shown"
            ).to.not.equal("block");
            expect(
                content[2].style.display,
                "content2 is shown"
            ).to.equal("block");
            expect(
                content[3].style.display,
                "content3 not shown"
            ).to.not.equal("block");
            expect(
                content[4],
                "content4 doesn't exist"
            ).to.equal(null);
            expect(
                content[5],
                "content5 doesn't exist"
            ).to.equal(null);
        });
    });
});