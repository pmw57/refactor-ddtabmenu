/*jslint browser */
var ddtabmenu = (function makeTabmenu() {
    const tabs = [];
    function init(initConfig) {
        const config = {
            // Disable hyperlinks in 1st level tabs with sub contents
            disableTabLinks: false,
            // Should tab revert back to default selected when mouse leaves menu
            snapToOriginal: {
                snap: true,
                delay: 300
            }
        };
        if (initConfig.hasOwnProperty("disabletablinks")) {
            config.disableTabLinks = initConfig.disabletablinks;
        }
        if (initConfig.hasOwnProperty("snap2original")) {
            config.snapToOriginal = {
                snap: initConfig.snap2original[0],
                delay: initConfig.snap2original[1]
            };
        }
        return config;
    }
    function getPathName() {
        // get current page url, minus hostname
        return window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, "");
    }
    function isSelected(menuUrl) {
        const menuPathName = menuUrl.replace("http://" + menuUrl.hostname, "").replace(/^\//, "");
        const currentPathName = getPathName();
        return currentPathName === menuPathName;
    }
    function clearRevertToDefault(tabId) {
        if (tabs[tabId].timer) {
            clearTimeout(tabs[tabId].timer);
        }
    }
    function showSubmenu(tabId, targetItem) {
        var menuItems = tabs[tabId].menuItems;
        clearRevertToDefault(tabId);
        var id = "";
        menuItems.forEach(function (menuItem) {
            menuItem.className = "";
            if (menuItem.hasSubContent === true) {
                id = menuItem.getAttribute("rel");
                document.getElementById(id).style.display = "none";
            }
        });
        targetItem.className = "current";
        if (targetItem.hasSubContent === true) {
            id = targetItem.getAttribute("rel");
            document.getElementById(id).style.display = "block";
        }
    }
    function revertToDefault(tabId) {
        const config = tabs[tabId].config;
        tabs[tabId].timer = setTimeout(function showDefault() {
            showSubmenu(tabId, tabs[tabId].defaultSelected);
        }, config.snapToOriginal.delay);
    }
    const handlers = {
    };

    function addEvent(target, taskName, callback) {
        const taskType = (
            window.addEventListener
            ? taskName
            : "on" + taskName
        );
        if (target.addEventListener) {
            target.addEventListener(taskType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent(taskType, callback);
        }
    }
    function initMenu(tabId, defaultSelected) {
        function disableClick() {
            return false;
        }
        function initWithSubmenu(tabId, tab, submenu) {
            function revert() {
                revertToDefault(tabId);
            }
            function clearRevert() {
                clearRevertToDefault(tabId);
            }
            tab.onmouseout = revert;
            submenu.onmouseover = clearRevert;
            submenu.onmouseout = revert;
        }
        function initWithoutSubmenu(tab) {
            const config = tabs[tabId].config;
            tab.onmouseout = function revertWithoutSubmenu() {
                tab.className = "";
                if (config.snapToOriginal.snap === true) {
                    revertToDefault(tab, tabId);
                }
            };
        }
        function initSubmenu(tab) {
            tab.onmouseover = function leaveTab() {
                showSubmenu(tabId, tab);
            };
        }
        var container = document.getElementById(tabId);
        var menuItems = container.querySelectorAll("a");
        tabs[tabId].menuItems = menuItems;
        var id = "";
        var submenu;
        var defaultIsShown = false;
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
    }
    function definemenu(tabId, defaultSelected) {
        tabs[tabId] = {
            config: Object.assign({}, init(ddtabmenu)),
            timer: [],
            menuItems: null,
            defaultSelected: -1
        };
        addEvent(window, "load", function initTabs() {
            ddtabmenu.initMenu(tabId, defaultSelected);
        });
    }
    return {
        definemenu,
        initMenu,
        handlers
    };
}());
