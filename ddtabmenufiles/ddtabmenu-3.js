/*jslint browser */
var ddtabmenu = (function makeTabmenu() {
    const config = {
        // Disable hyperlinks in 1st level tabs with sub contents
        disabletablinks: false,
        // Should tab revert back to default selected when mouse leaves menu
        snap2original: [true, 300]
    };
    function getcurrentpageurl() {
        // get current page url, minus hostname
        return window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, "");
    }
    function isSelected(menuurl) {
        menuurl = menuurl.replace("http://" + menuurl.hostname, "").replace(/^\//, "");
        const currentpageurl = getcurrentpageurl();
        return (currentpageurl === menuurl);
    }
    function isContained(m, e) {
        e = window.event || e;
        var c = e.relatedTarget || (
            (e.type === "mouseover")
            ? e.fromElement
            : e.toElement
        );
        while (c && c !== m) {
            try {
                c = c.parentNode;
            } catch (ignore) {
                c = m;
            }
        }
        if (c === m) {
            return true;
        } else {
            return false;
        }
    }
    function clearrevert2default(tabid) {
        if (window.timer[tabid]) {
            clearTimeout(window.timer[tabid]);
        }
    }
    function showsubmenu(tabid, targetitem) {
        var menuitems = ddtabmenu[tabid + "-menuitems"];
        clearrevert2default(tabid);
        var id = "";
        menuitems.forEach(function (menuitem) {
            menuitem.className = "";
            if (menuitem.hasSubContent === true) {
                id = menuitem.getAttribute("rel");
                document.getElementById(id).style.display = "none";
            }
        });
        targetitem.className = "current";
        if (targetitem.hasSubContent === true) {
            id = targetitem.getAttribute("rel");
            document.getElementById(id).style.display = "block";
        }
    }
    function revert2default(outobj, tabid, e) {
        if (!isContained(outobj, tabid, e)) {
            window.timer[tabid] = setTimeout(function showDefault() {
                const defaultTab = ddtabmenu[tabid + "-dselected"];
                showsubmenu(tabid, defaultTab);
            }, config.snap2original[1]);
        }
    }
    function addEvent(target, functionref, tasktype) {
        tasktype = (
            window.addEventListener
            ? tasktype
            : "on" + tasktype
        );
        if (target.addEventListener) {
            target.addEventListener(tasktype, functionref, false);
        } else if (target.attachEvent) {
            target.attachEvent(tasktype, functionref);
        }
    }
    function init(tabid, dselected) {
        function disableClick() {
            return false;
        }
        function initWithSubmenu(tabid, tab, submenu) {
            function revert(e) {
                revert2default(submenu, tabid, e);
            }
            function clearRevert() {
                clearrevert2default(tabid);
            }
            tab.onmouseout = revert;
            submenu.onmouseover = clearRevert;
            submenu.onmouseout = revert;
        }
        function initWithoutSubmenu(tab) {
            tab.onmouseout = function revertWithoutSubmenu(e) {
                tab.className = "";
                if (config.snap2original[0] === true) {
                    revert2default(tab, tabid, e);
                }
            };
        }
        function initSubmenu(tab) {
            tab.onmouseover = function leaveTab() {
                showsubmenu(tabid, tab);
            };
        }
        var container = document.getElementById(tabid);
        var menuitems = container.querySelectorAll("a");
        ddtabmenu[tabid + "-menuitems"] = menuitems;
        var id = "";
        var submenu;
        var setalready = false;
        menuitems.forEach(function (menuitem, x) {
            if (menuitem.getAttribute("rel")) {
                ddtabmenu[tabid + "-menuitems"][x].hasSubContent = true;
                if (ddtabmenu.disabletablinks) {
                    menuitem.onclick = disableClick;
                }
                if (config.snap2original[0] === true) {
                    id = menuitem.getAttribute("rel");
                    submenu = document.getElementById(id);
                    initWithSubmenu(tabid, menuitem, submenu);
                }
            } else {
                //for items without a submenu, add onMouseout effect
                initWithoutSubmenu(menuitems[x]);
            }
            initSubmenu(menuitems[x]);
            if (
                dselected === "auto" &&
                setalready === true &&
                isSelected(menuitem.href)
            ) {
                showsubmenu(tabid, menuitem);
                ddtabmenu[tabid + "-dselected"] = menuitem;
                setalready = true;
            } else if (parseInt(dselected) === x) {
                showsubmenu(tabid, menuitem);
                ddtabmenu[tabid + "-dselected"] = menuitem;
            }
        });
    }
    function definemenu(tabid, dselected) {
        window.timer = [];
        ddtabmenu[tabid + "-menuitems"] = null;
        ddtabmenu[tabid + "-dselected"] = -1;
        addEvent(window, function initTabs() {
            ddtabmenu.init(tabid, dselected);
        }, "load");
    }
    return {
        definemenu,
        init
    };
}());