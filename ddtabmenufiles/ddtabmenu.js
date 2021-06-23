/*jslint browser */
var ddtabmenu = (function makeTabmenu() {
    const tabs = [];

    function getTabId(el) {
        if (el.classList.contains("tabcontent")) {
            return getTabId(document.querySelector("[rel=" + el.id + "]"));
        }
        while (el && el.nodeName !== "DIV") {
            el = el.parentNode;
        }
        return el.id;
    }
    function clearRevertToDefault(tabId) {
        if (tabs[tabId].timer) {
            clearTimeout(tabs[tabId].timer);
        }
    }
    function hasSubMenu(menuItem) {
        return menuItem.getAttribute("rel");
    }
    function showSubmenu(tabId, targetItem) {
        var menuItems = tabs[tabId].menuItems;
        clearRevertToDefault(tabId);
        var id = "";
        menuItems.forEach(function (menuItem) {
            menuItem.className = "";
            if (hasSubMenu(menuItem)) {
                id = menuItem.getAttribute("rel");
                document.getElementById(id).style.display = "none";
            }
        });
        targetItem = targetItem || tabs[tabId].defaultSelected;
        targetItem.className = "current";
        if (hasSubMenu(targetItem)) {
            id = targetItem.getAttribute("rel");
            document.getElementById(id).style.display = "block";
        }
    }
    function revertToDefault(tabId) {
        const config = tabs[tabId].config;
        tabs[tabId].timer = setTimeout(function showDefault() {
            showSubmenu(tabId);
        }, config.snapToOriginal.delay);
    }
    const handlers = {
        revert(evt) {
            const tabId = getTabId(evt.target);
            revertToDefault(tabId);
        },
        clearRevert(evt) {
            const tabId = getTabId(evt.target);
            clearRevertToDefault(tabId);
        },
        revertWithoutSubmenu(evt) {
            const tab = evt.target;
            const tabId = getTabId(tab);
            const config = tabs[tabId].config;
            tab.className = "";
            if (config.snapToOriginal.snap === true) {
                revertToDefault(tabId);
            }
        },
        leaveTab(evt) {
            const tab = evt.target;
            const tabId = getTabId(tab);
            showSubmenu(tabId, tab);
        },
        disableClick(evt) {
            evt.preventDefault();
        },
        initTabsWrapper(tabId) {
            return function () {
                ddtabmenu.initMenu(tabId);
            };
        }
    };

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
    function isCurrentPage(menuLink) {
        const menuUrl = menuLink.href;
        const host = "http://" + menuLink.hostname;
        const menuPathName = menuUrl.replace(host, "").replace(/^\//, "");
        const currentPathName = getPathName();
        return currentPathName === menuPathName;
    }
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
    function initMenu(tabId) {
        function initWithSubmenu(menuItem) {
            const config = tabs[tabId].config;
            if (config.disableTabLinks) {
                addEvent(menuItem, "click", handlers.disableClick);
            }
            if (config.snapToOriginal.snap === true) {
                const id = menuItem.getAttribute("rel");
                const submenu = document.getElementById(id);
                addEvent(menuItem, "mouseenter", handlers.leaveTab);
                addEvent(menuItem, "mouseleave", handlers.revert);
                addEvent(submenu, "mouseenter", handlers.clearRevert);
                addEvent(submenu, "mouseleave", handlers.revert);
            }
        }
        function initWithoutSubmenu(menuItem) {
            addEvent(menuItem, "mouseenter", handlers.leaveTab);
            addEvent(menuItem, "mouseleave", handlers.revertWithoutSubmenu);
        }   
        function isAutoTabForPage(tabId, menuItem) {
            var defaultTab = tabs[tabId].defaultTab;
            if (tabs[tabId].defaultIsShown || defaultTab !== "auto") {
                return false;
            }
            return isCurrentPage(menuItem);
        }
        function resetTab(tabId, menuItem) {
            showSubmenu(tabId, menuItem);
            tabs[tabId].defaultSelected = menuItem;
            tabs[tabId].defaultIsShown = true;
        }
        function isDefaultTab(tabId, menuIndex) {
            var defaultTab = tabs[tabId].defaultTab;
            return parseInt(defaultTab) === menuIndex;
        }
        var container = document.getElementById(tabId);
        var menuItems = container.querySelectorAll("a");
        tabs[tabId].menuItems = menuItems;
        tabs[tabId].defaultIsShown = false;
        menuItems.forEach(function (menuItem, menuIndex) {
            if (hasSubMenu(menuItem)) {
                initWithSubmenu(menuItem);
            } else {
                initWithoutSubmenu(menuItem);
            }
            if (isAutoTabForPage(tabId, menuItem)) {
                resetTab(tabId, menuItem);
            } else if (isDefaultTab(tabId, menuIndex)) {
                resetTab(tabId, menuItem);
            }
        });
    }
    function definemenu(tabId, defaultTab) {
        tabs[tabId] = {
            config: Object.assign({}, init(ddtabmenu)),
            timer: [],
            menuItems: null,
            defaultSelected: -1,
            defaultTab: defaultTab
        };
        const initTabs = handlers.initTabsWrapper(tabId);
        addEvent(window, "load", initTabs);
    }
    return {
        definemenu,
        initMenu,
        handlers
    };
}());
