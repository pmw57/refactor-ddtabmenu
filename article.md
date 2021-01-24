# 10 Easy Steps to Refactor Your JavaScript Code

Every time that you deal with code there are many improvements that can be made to it, but we don't. Maybe it's because we don't have the time, or the skill, or it might be that once you touch it you own any other problems that come your way.

Refactoring your code though results in the code being cleaner, and easier to manage. Typically such improvements are only small in nature, but a lot of small improvements add up to a large change. This is why  in programming circles there is the [Boy Scout Rule](https://97-things-every-x-should-know.gitbooks.io/97-things-every-programmer-should-know/content/en/thing_08/), to leave the code a little better than you found it.

Code that hasn't changed for a long time tends to rot. This is because the code hasn't beeen capable of benefitting from improvements, and the environment tends to change over time. A useful way to experience this is to look at code from several years ago, and the improvements that can be made.

## What is refactoring?

When working with code there are two main ways that code can be improved, redesigning and refactoring.

When redesigning code you change the way that the code behaves so that the same initial input has a different output or different results. The benefit of redesigning code is that you change its behaviour so that it does something different than i did before.

When refactoring code you deliberately keep the design the same while making other improvements to the code. If you have tests for all of the expected behaviour of the code before doing refactoring, all of the tests should still show exactly the same behaviour when the refactoring is complete. The benefits of refactoring code is to make the code easier to understand, and to make it easier to later on redesign some aspects of the code.

### Redesigning vs refactoring

When working with code it's a good policy to perform the redesigning or the refactoring separately. Either redesign the code, or refactor the code. Mixing the two together tends to lead to less successful results as your attention is divided across multiple concerns. Good programming practice tends to switches frequently between the two, but in a structured way.

For example with test-driven development you have a red, green, and refactor cycle. To redesign the code you add a test causing the test to fail and go red, then you redesign the code causing the test to go green. After that you refactor the code, which is where you ensure that the tests remain green (the design doesn't change) while you make improvements to the code.

In this article I demonstrate ten different techniques to refactor your code, resulting in code that is easier to understand and work with.

## Refactoring ddtabmenu

I've chosen to focus on some quite old dHTML code from the days of Netscape 4. The choice isn't because the code is necessarily bad. Instead, the age of the code serves to act as handy demonstration of the types of refactorings that can occur to the code, some that could have occurred at the time, and others that have become available since then.

In this case the code is for the [DD Tab Menu](http://www.dynamicdrive.com/dynamicindex1/ddtabmenu.htm) from [Dynamic Drive](http://www.dynamicdrive.com/), as that is the first kind of dHTML tab menu code that I found. The JavaScript code from this simply library forms the basis for our exploration into refactoring code.

Refactoring is [a series of small changes](https://refactoring.guru/refactoring/techniques), such as extract method, move field, change value to reference, that together are used to achieve larger goals. Here I take you through how those goals are achieved.

## 1. Lint the code

When you come across some code that you haven't worked with before, it can be helpful to first lint the code. This is where computer-automated tools inform you of many small refactorings that you can do to make the code more consistent. I choose to use JSLint as my linter, but there are many linters available including esLint, ..., etc.

The benefit of linting is that it gives a minimum consistent standard for the code, and it also introduces you to what the code does and gives you some useful time to understand how the code works.

What's important when linting is that you and your team agree to remain consistent with using the same linter. That way you're not fighting between each other about spaces or tabs, and can make progress instead with doing beneficial work on the code.

My process when linting with JSLint is to first use [JS Beautifier](https://beautifier.io) to tidy up the formatting and indenting of the code, before using the linter to give advice about other refactorings to make to the code. A lot of them are small, but significant improvements.

The linting refactorings that were done with the tab menu code include:

- line length ([extract variable](https://refactoring.guru/extract-variable#typescript))
- the this keyword 
- semicolons
- braces
- loops
- variable definitions
- comparisons
- ternary formatting
- naming functions

This is what some of the code looks like before linting:

```javascript
showsubmenu:function(tabid, targetitem){
	var menuitems=this[tabid+"-menuitems"]
	this.clearrevert2default(tabid)
 for (i=0; i<menuitems.length; i++){
		menuitems[i].className=""
		if (typeof menuitems[i].hasSubContent!="undefined")
			document.getElementById(menuitems[i].getAttribute("rel")).style.display="none"
	}
	targetitem.className="current"
	if (typeof targetitem.hasSubContent!="undefined")
		document.getElementById(targetitem.getAttribute("rel")).style.display="block"
},
```

Here is how that section of code looks after linting:

```javascript
    showsubmenu: function showSubmenu(tabid, targetitem) {
        var menuitems = ddtabmenu[tabid + "-menuitems"];
        ddtabmenu.clearrevert2default(tabid);
        menuitems.forEach(function (menuitem) {
            menuitem.className = "";
            if (menuitem.hasSubContent === true) {
                document.getElementById(
                    menuitem.getAttribute("rel")
                ).style.display = "none";
            }
        });
        targetitem.className = "current";
        if (targetitem.hasSubContent === true) {
            document.getElementById(
                targetitem.getAttribute("rel")
            ).style.display = "block";
        }
    },
```

After having linted that code I notice that both the object property and the function names are the same, and are not really needed on the same line. That becomes my focus for the next few refactorings that occur.

## 2. Secure scope of event target

A part of the linting resulted in turning the this keyword into named references instead. One of the challenges that happen when doing that is when an event wants to refer to the element on which it was assigned.

When using the this keyword inside of an event handler, it refers to the element to which the event was assigned. In this case, it is the menuitems[x] element.

```javascript
            } else {
                // for items without a submenu, add onMouseout effect
                menuitems[x].onmouseout = function(e) {
                    this.className = "";
                    if (snap2original[0] == true) {
                        revert2default(this, tabid, e);
                    }
                };
            }
```

With my linter though we're not allowed to keep the this keyword, resulting in other techniques being used.

In this case, the this keyword can't just be replaced with menuitems[x] because by the time the event function runs, the x parameter won't have the correct value. Instead, we can move the code out to a separate function, in this case called initEmptyTab, and pass menuitems[x] as an argument to the initEmptyTab function. 

```javascript
            function initWithoutSubmenu(tab) {
                tab.onmouseout = function revertWithoutSubmenu(e) {
                    tab.className = "";
                    if (ddtabmenu.snap2original[0] === true) {
                        ddtabmenu.revert2default(tab, tabid, e);
                    }
                };
            }
        //...
            var menuitem = menuitems[x];
        //...
            } else {
                // for items without a submenu, add onMouseout effect
                initWithoutSubmenu(menuitem, tabid);
            }

```

Using the function call helps us to preserve the menuitem information so that when the event is triggered later on, it can access the menuitem element in a meaningful manner.

## 3. Add a module structure

Back when the code was written 15 years ago, it was popular to try and keep all of your code inside of the one object. We have learned a few things since then and now use an improved module structure. It still results in the same object, but it's easier to organise things inside of it.

Here is the object structure that's initially used by the code:

```javascript
var ddtabmenu = {
    disabletablinks: false,
    snap2original: [true, 300],
    //...
};
```

And here is the module structure that we wrap around the returned object.

```javascript
const ddtabmenu = (function makeTabMenu() {
    // config and variables
    //...
    // functions
    //...
    return {
        disabletablinks: false,
        snap2original: [true, 300],
        //...
    };
}());
```

We still end up with the object structure, but it's now much easier to organise and arrange the functions and configuration information used by the code, which is what we will do next.

### 3.1 Extract functions from returned object

Currently all of the functions are tied directly on the returned object. Most of those functions aren't wanted there, and are better placed inside of the makeTabMenu code itself before being returned in the object.

As an example, the isSelected function starts off on the tabmenu object, and is called later on in the code:

```javascript
const ddtabmenu = (function () {
    //...
    return {
        //...
        isSelected: function (menuurl) {
            //...
        },
        //...
            if (
                dselected === "auto" &&
                setalready !== true &&
                ddtabmenu.isSelected(menuitem.href)
            ) {
        //...
    };
}());
```

As an intermediate step, we can move the function up out of the return statement:

```javascript
const ddtabmenu = (function () {
    //...
   function isSelected(menuurl) {
        //...
    }
    //...
    return {
        //...
        isSelected,
        //...
    };
}());
```

We can then replace references to ddtabmenu.isSelected with just `isSelected`, letting us remove isSelected from the returned object too.

```javascript
    //...
            if (
                dselected === "auto" &&
                setalready !== true &&
                // ddtabmenu.isSelected(menuitem.href)
                isSelected(menuitem.href)
            ) {
    //...
    return {
        //...
        // isSelected,
        //...
    };
```

After doing that with all of the functions, we end up with a much smaller and easier to understand return object, that has some config information and only two needed function references.

```javascript
    return {
        // Disable hyperlinks in 1st level tabs with
        //   sub contents (true or false)?
        disabletablinks: false,
        // Should tab revert back to default selected when
        //   mouse moves out of menu? ([true/false, delay_millisec]
        snap2original: [true, 300],
        // get current page url, minus hostname
        currentpageurl: window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, ""),
        definemenu,
        initmenu
    };
```

The config information really should be placed at the top of the module though, so the next refactorings help to address that.

### 3.2 Group config variables

Config variables shouldn't be scattered about in the return object.

Here's what the config variables look like before this refactoring:

```javascript
const ddtabmenu = (function () {
    //...
    return {
        // Disable hyperlinks in 1st level tabs with
        //   sub contents (true or false)?
        disabletablinks: false,
        // Should tab revert back to default selected when
        //   mouse moves out of menu? ([true/false, delay_millisec]
        snap2original: [true, 300],
        // get current page url, minus hostname
        currentpageurl: window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, ""),
        definemenu,
        initmenu
    };
```

The intermediate phase here is to move the config information to a config object at the top of the module. That helps us to more easily find what we're looking for.

```javascript
const ddtabmenu = (function () {
    const config = {
        // Disable hyperlinks in 1st level tabs with
        //   sub contents (true or false)?
        disabletablinks: false,
        // Should tab revert back to default selected when
        //   mouse moves out of menu? ([true/false, delay_millisec]
        snap2original: [true, 300]
    };
    //...
    return {
        // Disable hyperlinks in 1st level tabs with
        //   sub contents (true or false)?
        disabletablinks: false,
        // Should tab revert back to default selected when
        //   mouse moves out of menu? ([true/false, delay_millisec]
        snap2original: [true, 300],
        // get current page url, minus hostname
        currentpageurl: window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, "")
        definemenu,
        initmenu
    };
```

Those comments can us to improve the code so that the comments are no longer needed. We can add that to a TODO list, and come back to it after more urgent refactorings have been done.

Carrying on with the config refactoring, we can now rename all references to ddtabmenu.disabletablinks to `config.disabletablinks` instead, and similarly rename ddtabmenu.snap2original to `config.snap2original` too.

```javascript
                if (config.disabletablinks) {
                    menuitem.onclick = disableClick;
                }
//...
            window.timer[tabid] = setTimeout(function showDefault() {
                //...
            }, config.snap2original[1]);
//...
                if (config.snap2original[0] === true) {
                    ddtabmenu.revert2default(tab, tabid, e);
                }
//...
                if (config.snap2original[0] === true) {
                    //...
                }
```


The return object now has only two different types of information in there.

```javascript
    return {
        // get current page url, minus hostname
        currentpageurl: window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, "")
        definemenu,
        initmenu
    };
```

### 3.3 currentpageurl doesn't need to be config

We can simplify the return object even further.

The currentpageurl variable is only used in the isSelected function. It could be placed entirely in that function, but I'll be nice and moved into a separate function instead.

```javascript
const ddtabmenu = (function () {
    function getcurrentpageurl() {
        // get current page url, minus hostname
        return window.location.href.replace("http://" + window.location.hostname, "").replace(/^\//, "");
    }
    function isSelected(menuurl) {
        //...
        const currentpageurl = getcurrentpageurl();
        return (currentpageurl === pageurl);
    }
    //...
    return {
        definemenu,
        init
    };
```

That return object is a lot tidier now that several types of info aren't being crammed in there.

### 4 Making the config accessible

With the config information being in a separate object, it's also now possible to use an init method to update the config variables.

It is normally a separate init method that is used to init the config, so we can add one to the code. Strictly speaking the definemenu method does that init job for now, so for now while we are only refactoring, we can initialize the config from the definemenu function.

```javascript
    function init(initConfig) {
        if (initConfig.hasOwnProperty("disabletablinks")) {
            9config.disabletablinks = initConfig.disabletablinks;
        }
        if (initConfig.hasOwnProperty("snap2original")) {
            config.snap2original = initConfig.snap2original;
        }
        return config;
    }
    function definemenu(tabId, defaultSelected) {
        tabs[tabId] = {
            config: Object.assign({}, init(ddtabmenu)),
            timer: [],
            menuItems: null,
            defaultSelected: -1
        };
        //...
    }
```

Later on we can redesign things and remove the the init call from definemenu, letting us more appropriately init things before defining the menus, and update the documentation to reflect the improved usage.

```javascript
ddtabmenu.init({
    disabletablinks: true,
    snap2original: [true, 0]
});
ddtabmenu.definemenu(...);
```

We won't do the separete init yet though as it's a redesign of the interface of the code, of how we interact with ddtabmenu. We are currently refactoring, not redesigning, so we shouldn't change the program interface just yet. What we can do though is to add it to our growing TODO list, and get on to it after the refactoring has been done.

## 5. Object properties instead of array items

Currently the `snap2original` config property uses an array to hold different types of information. That isn't all that appropriate, as the types of information in the array are of different types, and aren't able to be easily expressed.

```javascript
const ddtabmenu = (function () {
    const config = {
        //...
        // Should tab revert back to default selected when
        //   mouse moves out of menu? ([true/false, delay_millisec]
        snap2original: [true, 300]
    };
    //...
        if (!isContained(outobj, tabid, e)) {
            ddtabmenu["hidetimer_" + tabid] = setTimeout(
                showMenu,
                config.snap2original[1]
            );
        }
    //...
                if (config.snap2original[0] === true) {
                    //...
                }
```

Those array index values of `[0]` and `[1]` don't give us much information about what's happening. Instead of using an array, we can use an object so that the types of information can be more clearly expressed.

```javascript
const ddtabmenu = (function () {
    const config = {
        //...
        // Should tab revert back to default selected when
        //   mouse moves out of menu? ([true/false, delay_millisec]
        snap2original: {
            snap: true,
            delay: 300
        }
    };
    //...
        if (!isContained(outobj, tabid, e)) {
            ddtabmenu["hidetimer_" + tabid] = setTimeout(
                showMenu,
                config.snap2original.delay
            );
        }
    //...
                if (config.snap2original.snap === true) {
                    //...
                }
```

It's now much easier to understand the code thanks to the snap2original.snap and snap2original.delay properties.

We do though have to update the init code so that this refactor doesn't change the existing design of the code. Currently the documentation still uses the array, so we can translate from that to the config object instead.

```javascript
        if (initConfig.hasOwnProperty("snap2original")) {
            config.snap2original = {
                snap: initConfig.snap2original[0],
                delay: initConfig.snap2original[1]
            }
        }
```

Later on we can remove that change to the init, but only after properly documenting that object properties are to be used for the snap2original config instead of an array. We have another item to add to our redesign TODO list.

By staying focused on ensuring that the refactor doesn't change the existing interface of the code, we can ensure that a redesign gets done later on to ensure that the config improvement is properly captured in the documentation as well.

## 6. Expressive variable names

## 7. Group tabs info together

## 8. Avoid passing evt object as a function argument

## 9. Simplify if statements

## 10. 