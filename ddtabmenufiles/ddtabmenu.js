/*jslint browser */
const ddtabmenu = (function makeTabmenu() {
    const tabs = [];
    const handlers = {};
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
    function isSelected(menuLink) {
        const menuPathName = menuLink.href.replace("http://" + menuLink.hostname, "").replace(/^\//, "");
        const currentPathName = getPathName();
        return currentPathName === menuPathName;
    }
    function clearRevertToDefault(tabId) {
        if (tabs[tabId].timer) {
            clearTimeout(tabs[tabId].timer);
        }
    }
    function showSubmenu(tabId, targetItem) {
        const menuItems = tabs[tabId].menuItems;
        clearRevertToDefault(tabId);
        menuItems.forEach(function (menuItem) {
            menuItem.className = "";
            const id = menuItem.getAttribute("rel");
            if (id) {
                document.getElementById(id).style.display = "none";
            }
        });
        targetItem.className = "current";
        const id = targetItem.getAttribute("rel");
        if (id) {
            document.getElementById(id).style.display = "block";
        }
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
    function revertToDefault(tabId) {
        function showDefaultTab() {
            showSubmenu(tabId, tabs[tabId].defaultSelected);
        }
        const config = tabs[tabId].config;
        const delay = config.snapToOriginal.delay;
        tabs[tabId].timer = setTimeout(showDefaultTab, delay);
    }
    function getTabmenuViaRel(el) {
        let menuTab = el;
        if (!el.rel) {
            const submenuId = el.id;
            menuTab = document.querySelector("[rel=" + submenuId + "]");
        }
        const ul = menuTab.parentNode.parentNode;
        const tabmenu = ul.parentNode;
        return tabmenu;
    }
    function menuEnterHandler(evt) {
        const tabmenu = getTabmenuViaRel(evt.target);
        showSubmenu(tabmenu.id, evt.target);
    }
    function revert(evt) {
        const tabmenu = getTabmenuViaRel(evt.target);
        revertToDefault(tabmenu.id);
    }
    function clearRevertHandler(evt) {
        const tabmenu = getTabmenuViaRel(evt.target);
        clearRevertToDefault(tabmenu.id);
    }
    function disableClickHandler(evt) {
        evt.preventDefault();
    }
    function initMenu(tabId, defaultSelected) {
        const config = tabs[tabId].config;

        function revertToSubmenu(menuItem, id) {
            menuItem.onmouseenter = ddtabmenu.handlers.menuEnter;
            menuItem.onmouseleave = ddtabmenu.handlers.revert;
            const submenu = document.getElementById(id);
            submenu.onmouseenter = ddtabmenu.handlers.clearRevert;
            submenu.onmouseleave = ddtabmenu.handlers.revert;
        }

        function initWithSubmenu(menuItem, id) {
            if (config.disableTabLinks) {
                menuItem.onclick = ddtabmenu.handlers.disableClick;
            }
            if (config.snapToOriginal.snap === true) {
                revertToSubmenu(menuItem, id);
            } else {
                menuItem.onmouseenter = handlers.menuEnter;
                menuItem.onmouseleave = null;
            }
        }
        function initWithoutSubmenu(menuItem) {
            menuItem.onmouseleave = function revertWithoutSubmenu() {
                menuItem.className = "";
                if (config.snapToOriginal.snap === true) {
                    revertToDefault(tabId);
                }
            };
        }
        const container = document.getElementById(tabId);
        const menuItems = Array.from(container.querySelectorAll("a"));
        tabs[tabId].menuItems = menuItems;
        menuItems.forEach(function (menuItem) {
            const id = menuItem.getAttribute("rel");
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                initWithoutSubmenu(menuItem);
            }
        });
        function isAutoDefault(defaultSelected, menuItem) {
            return (
                defaultSelected === "auto" &&
                isSelected(menuItem)
            );
        }
        function isDefaultSelected(defaultSelected, menuIndex) {
            return parseInt(defaultSelected) === menuIndex;
        }
        function isDefaultMenu(menuItem, menuIndex) {
            return (
                isAutoDefault(defaultSelected, menuItem) ||
                isDefaultSelected(defaultSelected, menuIndex)
            );
        }
        menuItems.forEach(function (menuItem) {
            const id = menuItem.getAttribute("rel");
            if (id) {
                initWithSubmenu(menuItem, id);
            } else {
                initWithoutSubmenu(menuItem);
            }
        });
        const defaultMenu = menuItems.find(isDefaultMenu);
        showSubmenu(tabId, defaultMenu);
        tabs[tabId].defaultSelected = defaultMenu;
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

    handlers.menuEnter = menuEnterHandler;
    handlers.revert = revert;
    handlers.clearRevert = clearRevertHandler;
    handlers.disableClick = disableClickHandler;

    return {
        definemenu,
        initMenu,
        handlers
    };
}());
