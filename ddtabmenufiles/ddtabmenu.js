/*jslint browser */
var ddtabmenu = {
    // Disable hyperlinks in 1st level tabs with sub contents
    disabletablinks: false,
    // Should tab revert back to default selected when mouse moves out of menu
    snap2original: [true, 300],

    // get current page url (minus hostname, ie: http://www.dynamicdrive.com/)
    currentpageurl: window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, ""),

    definemenu: function defineMenu(tabid, dselected) {
        window.timer = [];
        ddtabmenu[tabid + "-menuitems"] = null;
        ddtabmenu[tabid + "-dselected"] = -1;
        ddtabmenu.addEvent(window, function initTabs() {
            ddtabmenu.init(tabid, dselected);
        }, "load");
    },

    showsubmenu: function showSubmenu(tabid, targetitem) {
        var menuitems = ddtabmenu[tabid + "-menuitems"];
        ddtabmenu.clearrevert2default(tabid);
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
    },

    isSelected: function isSelected(menuurl) {
        menuurl = menuurl.replace("http://" + menuurl.hostname, "").replace(/^\//, "");
        return (ddtabmenu.currentpageurl === menuurl);
    },

    isContained: function isContained(m, e) {
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
    },

    revert2default: function revertToDefault(outobj, tabid, e) {
        if (!ddtabmenu.isContained(outobj, tabid, e)) {
            window.timer[tabid] = setTimeout(function showDefault() {
                ddtabmenu.showsubmenu(tabid, ddtabmenu[tabid + "-dselected"]);
            }, ddtabmenu.snap2original[1]);
        }
    },

    clearrevert2default: function clearRevert(tabid) {
        if (window.timer[tabid]) {
            clearTimeout(window.timer[tabid]);
        }
    },

    // assign a function to execute to an event handler (ie: onunload)
    addEvent: function addEvent(target, functionref, tasktype) {
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
    },

    init: function initTabs(tabid, dselected) {
        function disableClick() {
            return false;
        }
        function initWithSubmenu(tabid, tab, submenu) {
            function revert(e) {
                ddtabmenu.revert2default(submenu, tabid, e);
            }
            function clearRevert() {
                ddtabmenu.clearrevert2default(tabid);
            }
            tab.onmouseout = revert;
            submenu.onmouseover = clearRevert;
            submenu.onmouseout = revert;
        }
        function initWithoutSubmenu(tab) {
            tab.onmouseout = function revertWithoutSubmenu(e) {
                tab.className = "";
                if (ddtabmenu.snap2original[0] === true) {
                    ddtabmenu.revert2default(tab, tabid, e);
                }
            };
        }
        function initSubmenu(tab) {
            tab.onmouseover = function showSubmenu() {
                ddtabmenu.showsubmenu(tabid, tab);
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
                if (ddtabmenu.snap2original[0] === true) {
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
                ddtabmenu.isSelected(menuitem.href)
            ) {
                ddtabmenu.showsubmenu(tabid, menuitem);
                ddtabmenu[tabid + "-dselected"] = menuitem;
                setalready = true;
            } else if (parseInt(dselected) === x) {
                ddtabmenu.showsubmenu(tabid, menuitem);
                ddtabmenu[tabid + "-dselected"] = menuitem;
            }
        });
    }
};