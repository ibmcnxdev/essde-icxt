var icxtbar = icxtbar || {};
icxtbar.util = icxtbar.util || {};

icxtbar.util.loadCSSCors = function (stylesheet_uri) {
    if (dojo.config.isDebug) {
        console.log("icxtbar.util.loadCSSCors > url:'" + stylesheet_uri + "'");
    }
    var _xhr = window.XMLHttpRequest;
    var has_cred = false;
    try {
        has_cred = _xhr && ('withCredentials' in (new _xhr()));
    } catch (e) {
    }

    if (!has_cred) {
        return;
    }
    var xhr = new _xhr();
    xhr.open('GET', stylesheet_uri);
    xhr.onload = function () {
        xhr.onload = xhr.onerror = null;
        if (xhr.status < 200 || xhr.status >= 300) {
            if (dojo.config.isDebug) {
                console.error('icxtbar.util.loadCSSCors - style failed to load: ' + stylesheet_uri)
            }
        } else {
            var style_tag = document.createElement('style');
            style_tag.appendChild(document.createTextNode(xhr.responseText));
            document.head.appendChild(style_tag);
        }
        ;
    }
    xhr.onerror = function () {
        xhr.onload = xhr.onerror = null;
        if (dojo.config.isDebug) {
            console.error('icxtbar.util.loadCSSCors - XHR CORS CSS fail:' + styleURI);
        }
    };
    xhr.send();
};

icxtbar.util.getSidebarContainer = function (open) {
    var elem = null;
    if (open) {
        elem = document.querySelector("#icxt-sidebar-open");
    } else {
        elem = document.querySelector("#icxt-sidebar-closed");
    }
    return elem;
};

icxtbar.util.toggleSidebarContainer = function (open, display) {
    var elem = icxtbar.util.getSidebarContainer(open);

    if (display) {
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
};

icxtbar.util.terminateSidebar = function () {
    if (dojo.config.isDebug) {
        console.log("icxt.ui.terminateSidebar >");
    }
    var openElem = icxtbar.util.getSidebarContainer(true);
    var icxtParentElem = openElem.parentElement;
    icxtParentElem.style.display = "hidden";
    if (dojo.config.isDebug) {
        console.log("icxt.ui.terminateSidebar <");
    }
}

icxtbar.util.activateSidebar = function () {
    if (dojo.config.isDebug) {
        console.log("icxt.ui.activateSidebar >");
    }
    var openElem = icxtbar.util.getSidebarContainer(true);
    var icxtParentElem = openElem.parentElement;
    icxtParentElem.style.display = "block";

    // get closed container, remove empty from class if exists, add onclick action
    var elem = icxtbar.util.getSidebarContainer(false);
    if (elem) {
        if (elem.className && elem.className.indexOf('empty') >= 0) {
            elem.className = elem.className.replace('empty', '');
        }
    }
    elem.onclick = function (evt) {
        evt.preventDefault();
        var elem = icxtbar.util.getSidebarContainer(true);
        elem.style.width = "400px";
        elem.focus();
    }

    if (dojo.config.isDebug) {
        console.log("icxt.ui.activateSidebar <");
    }
}

icxtbar.util.showEmptySidebar = function () {
    if (dojo.config.isDebug) {
        console.log("icxt.ui.showEmptySidebar >");
    }
    // get open container, remove actions
    var elem = document.querySelector("#icxt-sidebar-actionsList");
    if (elem) {
        elem.innerHTML = '';
    }
    // get closed container, add inactive class, remove click method
    elem = icxtbar.util.getSidebarContainer(false);
    elem.onclick = function (evt) {
        evt.preventDefault();
        return 0;
    }
    elem.className += " empty";
    if (dojo.config.isDebug) {
        console.log("icxt.ui.showEmptySidebar <");
    }
}

icxtbar.util.loadSidebarClosedTitle = function () {
    var elem = icxtbar.util.getSidebarContainer(false);
    var translateObject = {
        actionSize : icxtbar.actions ? icxtbar.actions.length : '0'
    }
    var elemTitle = icxtbar.util.translate('actionsavailable.title', translateObject);
    elem.title = elemTitle;
}

icxtbar.util.getURLParameter = function (/* string */name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [ , "" ])[1].replace(/\+/g, '%20')) || null;
};

icxtbar.util.loadConfig = function (data) {
    if (dojo.config.isDebug) {
        console.log("icxt.ui.loadConfig > '" + JSON.stringify(data) + "'");
    }
    if (data.respData) {
        data = data.respData;
    }

    /* check whether the user is allowed to see the sidebar */
    if (data == null || data.permissions == null) {
        if (dojo.config.isDebug) {
            console.log("icxt.ui.loadConfig - No data given");
        }
        icxtbar.util.terminateSidebar();
        return;
    }
    if (data.permissions.indexOf('ICXTSideBar') < 0) {
        if (dojo.config.isDebug) {
            console.log("icxt.ui.loadConfig - user has no permission to see the 'ICXTSideBar'");
        }
        icxtbar.util.terminateSidebar();
        return;
    }

    if (data.actions == null) {
        if (dojo.config.isDebug) {
            console.log("icxt.ui.loadConfig - No actions given");
        }
        icxtbar.util.terminateSidebar();
        return;
    }

    if (data.actions) {
        // activate sidebar (display it)
        icxtbar.util.activateSidebar();
        icxtbar.util.resetActions();
        icxtbar.actions = data.actions;
        if (data.context) {
            icxtbar.context = data.context;
        } else {
            icxtbar.context = {};
        }
        icxtbar.util.loadSidebarClosedTitle();
        if (icxtbar.actions.length == 0) {
            icxtbar.util.showEmptySidebar();
            return;
        }
        for (var i = 0; i < icxtbar.actions.length; i++) {
            icxtbar.util.addAction(icxtbar.actions[i], icxtbar.context);
        }
    }

    if (dojo.config.isDebug) {
        console.log("icxt.ui.addActionsToSidebar < ");
    }
};

icxtbar.util.resetActions = function () {
    if (dojo.config.isDebug) {
        console.log("icxt.ui.resetActions > ");
    }

    var elem = document.querySelector("#icxt-sidebar-actionsList");
    if (elem) {
        elem.innerHTML = '';
    }

    if (dojo.config.isDebug) {
        console.log("icxt.ui.resetActions < ");
    }
}

icxtbar.util.addAction = function (action, context) {
    if (dojo.config.isDebug) {
        console.log("icxt.ui.addAction > action: '" + JSON.stringify(action) + "', context: '" + JSON.stringify(context) + "'");
    }

    if (action == null) {
        if (dojo.config.isDebug) {
            console.log("icxt.ui.addAction < no action given");
        }
        return;
    }

    var contextApp = "" || context.app;
    var contextUuid = "" || context.uuid;

    // in case the is an & in the UUID, this must be encoded
    if(contextUuid.indexOf('&')) {
      contextUuid = contextUuid.replace("&", "%26");
    }

    var replacementMap = {};
    replacementMap["{{app}}"] = contextApp;
    replacementMap["{{uuid}}"] = contextUuid;
    var uri = icxtbar.util.replacePlaceHolders(action.url, replacementMap);
    uri += "&iframe=resize,hidefooter,hidenav";

    if (icxtbar.util.getURLParameter('jsdebug')) {
        uri += "&jsdebug=" + icxtbar.util.getURLParameter('jsdebug');
    }
    if (icxtbar.util.getURLParameter('jscomponents')) {
        uri += "&jscomponents=" + icxtbar.util.getURLParameter('jscomponents');
    }

    if (uri.indexOf("/") == 0) {
        uri = icxtbar.host + uri;
    }

    var label = icxtbar.util.translate(action.name + ".label");
    var desc = icxtbar.util.translate(action.name + ".hover");

    var d = document;

    var elem = d.querySelector("#icxt-sidebar-actionsList");

    var containerDiv = d.createElement("div");
    containerDiv.className = "actionContainer";

    var imgDiv = d.createElement("div");
    imgDiv.className = "actionImg";
    var img = document.createElement("img");
    var imgSrc = action.iconUrl;
    if (imgSrc.indexOf("/") == 0) {
        imgSrc = icxtbar.host + imgSrc;
    }
    img.src = imgSrc;
    imgDiv.appendChild(img);
    containerDiv.appendChild(imgDiv);

    var infoDiv = d.createElement("div");
    infoDiv.className = "actionInfo";
    var a = document.createElement("a");
    a.href = "javascript:;";
    a.innerHTML = label;

    var br = document.createElement("br");
    var span = document.createElement("span");
    span.innerHTML = desc;

    containerDiv.onclick = function (e) {
        e.preventDefault();
        // close sidebar container
        var elem = icxtbar.util.getSidebarContainer(true);
        elem.style.width = "0px";

        // add the iframe
        icxtbar.util.addIFrameDialog(label, uri);
        return false;
    }

    infoDiv.appendChild(a);
    infoDiv.appendChild(br);
    infoDiv.appendChild(span);
    containerDiv.appendChild(infoDiv);
    elem.appendChild(containerDiv);

    icxtbar.util.toggleSidebarContainer(false, true);

    if (dojo.config.isDebug) {
        console.log("icxt.ui.addAction <");
    }
};

icxtbar.util.addIFrameDialog = function (label, uri) {
    var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], windowX = w.innerWidth || e.clientWidth || g.clientWidth, windowY = w.innerHeight || e.clientHeight || g.clientHeight;

    windowX = windowX * 0.9;
    windowY = windowY * 0.8;

    if (windowX < 700) {
        windowX = 700;
    }
    if (windowY < 550) {
        windowY = 550;
    }
    ;

    var dialogHtml = "<div aria-labelledby=\"dialog_title_0\" role=\"dialog\" class=\"lotusDialogWrapper dijitDialog\" id=\"lconn_share_widget_Dialog_1\" widgetid=\"lconn_share_widget_Dialog_1\"><div class=\"\" data-dojo-attach-point=\"containerNode\"><div class=\"lotusDialogBorder\"><form method=\"POST\" class=\"lotusDialog lotusForm\"><div id=\"dialog_title_0\" class=\"lotusDialogHeader\" aria-label=\"" + label + "\"><h1 class=\"lotusHeading\">" + label + "</h1><a class=\"lotusDialogClose\" href=\"javascript:;\" title=\"Close\" role=\"button\"><img alt=\"Close\" src=\"/connections/resources/web/com.ibm.lconn.core.styles.oneui3/images/blank.gif?etag=20150401.105152\"><span class=\"lotusAltText\">X</span></a></div><div><div class=\"lotusDialogContent\">  <iframe style=\"height: " + windowY + "px; width: " + windowX + "px; border:none\" src=\"" + uri + "\"></iframe></div></div></form></div></div></div>";

    var dia = new dijit.Dialog();
    dia.setContent(dialogHtml);
    dia.show();
    var dialogWrapper = dojo.query('.lotusDialogWrapper', dia.domNode)[0];

    var lotusDialogContent = dojo.query('.lotusDialogContent', dia.domNode)[0];
    dojo.style(lotusDialogContent, "max-height", "1000px");

    var bb = dojo.position(dialogWrapper, true);
    dojo.style(dialogWrapper, "top", (-1 * bb.h) / 2 + "px");
    dojo.style(dialogWrapper, "left", (-1 * bb.w) / 2 + "px");

    var dialogClose = dojo.query('.lotusDialogWrapper .lotusDialogClose', dia.domNode)[0];
    dojo.connect(dialogClose, "onclick", dojo.hitch(function () {
        dia.hide();
        dia.destroyRecursive();
        dia = null;
    }));
}

icxtbar.util.replacePlaceHolders = function (uri, replacementMap) {
    for ( var key in replacementMap) {
        if (replacementMap.hasOwnProperty(key)) {
            if (uri.indexOf(key) >= 0) {
                uri = uri.replace(key, replacementMap[key]);
            }
        }
    }

    return uri;
};

icxtbar.util.translate = function (translateKey, replacements) {
    if (translateKey.indexOf("sidebar.") != 0) {
        translateKey = "sidebar." + translateKey;
    }
    if (icxtbar.nls && icxtbar.nls[translateKey]) {
        var translation = icxtbar.nls[translateKey];
        // if replacements given, process them
        if (replacements) {
            for (key in replacements) {
                if (translation.indexOf('{{' + key + '}}') >= 0) {
                    translation = translation.replace('{{' + key + '}}', replacements[key]);
                }
            }
        }
        return translation;
    }
    return translateKey;
};

icxtbar.util.authenticate = function () {
    if (dojo.config.isDebug) {
        console.log("icxt.ui.authenticate >");
    }

    // get closed container, add inactive class, remove click method
    var elem = icxtbar.util.getSidebarContainer(false);
    elem.className += " noauth";

    elem = icxtbar.util.getSidebarContainer(true);
    var div = document.createElement("div");
    div.id = "icxt-sidebar-login-container";

    var note = document.createElement("p");
    var noteStr = icxtbar.util.translate("login.note");
    note.innerHTML = noteStr;
    div.appendChild(note);

    // create a button
    var button = document.createElement("button");
    button.className = "lotusBtn";
    button.id = "icxt-sidebar-login-btn";
    var buttonLabel = icxtbar.util.translate("login.button.label");
    button.innerHTML = buttonLabel

    var dialogLabel = icxtbar.util.translate("login.dialog.label");
    var dialogUri = icxtbar.host + "/ic360/ui/login/oauth2.html?oauth_init=true&iframe=resize,hidefooter,hidenav";

    button.onclick = function (e) {
        e.preventDefault();
        // close sidebar container
        var elem = icxtbar.util.getSidebarContainer(true);
        elem.style.width = "0px";

        // add the iframe
        icxtbar.util.addIFrameDialog(dialogLabel, dialogUri);
        return false;
    }
    div.appendChild(button);
    elem.appendChild(div);

    icxtbar.util.toggleSidebarContainer(false, true);
}

icxtbar.util.checkAuthenticated = function (cb) {
    if (dojo.config.isDebug) {
        console.log("icxt.util.checkAuthenticated >");
    }

    // The parameters to pass to xhrGet, the url, how to handle it, and the callbacks.
    var xhrArgs = {
        url : icxtbar.host + "/ic360/ui/cors/auth-internal",
        withCredentials : true,
        load : function (data) {
            if (data == null || data.indexOf('j_security_check') > 0) {
                if (dojo.config.isDebug) {
                    console.log("icxt.util.checkAuthenticated < false - login to '" + icxtbar.host + "/ic360/ui/auth-internal' failed");
                }
                // not authenticated - might have gotten login page as response
                cb("noauth");
            } else {
                cb(null);
            }
            if (dojo.config.isDebug) {
                console.log("icxt.util.checkAuthenticated < true - login succeeded. set cookie and resolve..");
            }
        },
        error : function (data) {
            cb(data);
        }
    };

    // Call the asynchronous xhrGet
    dojo.xhrPost(xhrArgs);
};

icxtbar.util.getNls = function (cb) {
    if (dojo.config.isDebug) {
        console.log("icxt.util.getNls >");
    }

    var locale = dojo.locale;
    if (locale.length > 2) {
        locale = locale.substring(0, 2);
    }

    if (locale == null || locale === '') {
        if (dojo.config.isDebug) {
            console.log("icxt.util.getNls < no locale found, use default 'en'.");
        }
        locale = 'en';
    }

    // The parameters to pass to xhrGet, the url, how to handle it, and the callbacks.
    var xhrArgs = {
        url : icxtbar.host + "/ic360/ui/nls/cors/locale_" + locale + ".json",
        handleAs : "json",
        load : function (data) {
            if (dojo.config.isDebug) {
                console.log("icxt.util.getNls < data: '" + data + "'");
            }
            cb(null, data);
        },
        error : function (data) {
            if (dojo.config.isDebug) {
                console.log("icxt.util.getNls < error - nls error: '" + data + "'");
            }
            cb(data);
        },
        withCredentials : true
    };
    dojo.xhrGet(xhrArgs);
};
var icxtbar = icxtbar || {};
icxtbar.host = 'https://eds-consak-01.org.rettigicc.net:9443';
icxtbar.actions = icxtbar.actions || [];
icxtbar.nls = icxtbar.nls || {};

if (typeof (dojo) != "undefined") {
    require([ "dojo/domReady!" ], function () {
        try {
            icxtbar.util.loadCSSCors(icxtbar.host + "/ic360/ui/api/res/cors/icxt-sidebar.css");

            var waitFor = function (callback, elXpath, elXpathRoot, maxInter, waitTime) {
                if (!elXpathRoot) {
                    var elXpathRoot = dojo.body();
                }
                if (!maxInter) {
                    var maxInter = 10000; // number of intervals before expiring
                }
                if (!waitTime) {
                    var waitTime = 1; // 1000=1 second
                }
                if (!elXpath) {
                    return;
                }
                var waitInter = 0; // current interval
                var intId = setInterval(function () {
                    if (++waitInter < maxInter && !dojo.query(elXpath, elXpathRoot).length) {
                        return;
                    }

                    clearInterval(intId);
                    if (waitInter >= maxInter) {
                        if (dojo.config.isDebug) {
                            console.log("icxt.ui.waitFor - **** WAITFOR [" + elXpath + "] WATCH EXPIRED!!! interval " + waitInter + " (max:" + maxInter + ")");
                        }
                    } else {
                        if (dojo.config.isDebug) {
                            console.log("icxt.ui.waitFor - **** WAITFOR [" + elXpath + "] WATCH TRIPPED AT interval " + waitInter + " (max:" + maxInter + ")");
                        }
                        callback();
                    }
                }, waitTime);
            };

            waitFor(function () {
                if (dojo.config.isDebug) {
                    console.log("icxt.ui.init > initialize icxt sidebar");
                }

                if (dojo.config.isDebug) {
                    console.log("icxt.ui.init - retrieving NLS");
                }
                icxtbar.util.getNls(function (err, data) {
                    if (err) {
                        if (dojo.config.isDebug) {
                            console.log("icxt.ui.init - Error retrieving nls: '" + JSON.stringify(err) + "'");
                        }
                    }
                    if (data) {
                        if (dojo.config.isDebug) {
                            console.log("icxt.ui.init - retrieved nls data: '" + JSON.stringify(data) + "'");
                        }
                        icxtbar.nls = data;
                    }

                    if (dojo.config.isDebug) {
                        console.log("icxt.ui.init - check ICXT authentication status");
                    }
                    icxtbar.util.checkAuthenticated(function (err) {
                        if (err) {
                            if (dojo.config.isDebug) {
                                console.log("icxt.ui.init - Not authenticated! start OAuth2 Login Flow");
                            }
                            icxtbar.util.authenticate();
                            return;
                        }
                        if (dojo.config.isDebug) {
                            console.log("icxt.ui.init - authentication validated.");
                            console.log("icxt.ui.init - load config properties.");
                        }

                        // get config props
                        var parentUrl = encodeURIComponent(window.location.href);
                        try {
                            // in case the uri is encoded twice -> window.location.href returns .../wikis/home?lang=de-de#!/wiki/Random%20Wiki%20Entries
                            // -> sending it as Random%2520Wiki%2520Entries would break the code, so need to encode first, then decode again
                            parentUrl = encodeURIComponent(decodeURIComponent(window.location.href));
                        } catch (e) {}
                        // The parameters to pass to xhrGet, the url, how to handle it, and the callbacks.
                        var xhrArgs = {
                            url : icxtbar.host + "/ic360/ui/api/config/cors/props.json?actions=true&context=" + parentUrl,
                            handleAs : "json",
                            load : icxtbar.util.loadConfig,
                            error : function (error) {

                            },
                            withCredentials : true
                        };

                        // Call the asynchronous xhrGet
                        dojo.xhrGet(xhrArgs);
                    });
                });

                var d = document;
                // ICXT Sidebar html
                var sidebar = d.createElement("div");
                sidebar.id = "icxt-sidebar";
                // hide sidebar at start
                sidebar.style.display = "none";

                // ICXT Sidebar Closed
                var sidebarC = d.createElement("div");
                sidebarC.id = "icxt-sidebar-closed";
                sidebarC.onclick = function () {
                    var elem = icxtbar.util.getSidebarContainer(true);
                    elem.style.width = "400px";
                    elem.focus();
                }

                // ICXT Sidebar Open
                var sidebarO = d.createElement("div");
                sidebarO.id = "icxt-sidebar-open";
                sidebarO.tabIndex = "0";

                var icxtImg = d.createElement("img");
                icxtImg.src = icxtbar.host + "/ic360/res/client/assets/images/icons/engine-100-white.png";
                sidebarC.appendChild(icxtImg);

                sidebarO.addEventListener('focusout', function (evt) {
                    if (sidebarO.contains(evt.relatedTarget)) {
                        // focusout detected, but active node is child of sidebar
                        return;
                    }

                    var elem = icxtbar.util.getSidebarContainer(true);
                    elem.style.width = "0px";
                });

                var sidebarContent = d.createElement("div");
                sidebarContent.className = "icxt-sidebar-content";

                var sidebarOHeadline = d.createElement("h2");
                sidebarOHeadline.innerHTML = "IBM Connections Extension Toolkit";
                sidebarContent.appendChild(sidebarOHeadline);

                var sidebarOList = d.createElement("div");
                sidebarOList.id = "icxt-sidebar-actionsList";
                sidebarContent.appendChild(sidebarOList);
                sidebarO.appendChild(sidebarContent);

                sidebar.appendChild(sidebarC);
                sidebar.appendChild(sidebarO);

                d.querySelector("body").appendChild(sidebar);

                // add event listener to reload page
                window.onmessage = function (event) {
                    if (dojo.config.isDebug) {
                        console.log("icxt.event.message > got message: " + event.data);
                    }
                    try {
                        if (event && event.data && event.data.indexOf("icxtbar") < 0) {
                            // only handle icxtbar events here
                            return;
                        }
                        if (event.data === 'icxtbar.loginSuccess') {
                            if (dojo.config.isDebug) {
                                console.log("icxt.event.message - user logged in, refresh ICXT");
                            }
                            location.reload();
                        }
                    } catch (e) {
                        if (dojo.config.isDebug) {
                            console.log("icxt.event.message - caught exception when evaluating event");
                        }
                    }
                }

                function getIcxtContext() {
                    if (dojo.config.isDebug) {
                        console.log("icxt.getIcxtContext >");
                    }
                    if (!icxtbar) {
                        console.log("icxt.getIcxtContext < sidebar not available anymore");
                        return;
                    }

                    icxtbar.util.toggleSidebarContainer(false, true);
                    icxtbar.util.resetActions();

                    // get config props
                    var parentUrl = encodeURIComponent(window.location.href);
                    try {
                        // in case the uri is encoded twice -> window.location.href returns .../wikis/home?lang=de-de#!/wiki/Random%20Wiki%20Entries
                        // -> sending it as Random%2520Wiki%2520Entries would break the code, so need to encode first, then decode again
                        parentUrl = encodeURIComponent(decodeURIComponent(window.location.href));
                    } catch (e) {}
                    if (dojo.config.isDebug) {
                        console.log("icxt.getIcxtContext - evaluate icxt context for '" +parentUrl+ "'");
                    }
                    // The parameters to pass to xhrGet, the url, how to handle it, and the callbacks.
                    var xhrArgs = {
                        url : icxtbar.host + "/ic360/ui/api/config/cors/props.json?actions=true&context=" + parentUrl,
                        handleAs : "json",
                        load : icxtbar.util.loadConfig,
                        error : function (error) {

                        },
                        withCredentials : true
                    };
                    // Call the asynchronous xhrGet
                    dojo.xhrGet(xhrArgs);
                }

                window.onhashchange = getIcxtContext;

                // add scroll listener
                var scrolling = false;
                var scrollSpeed = 50;
                window.onscroll = function () {
                    scrolling = true;
                };

                setInterval(function () {
                    if (scrolling) {
                        if (sidebarO.style.display === 'none') {
                            return;
                        }

                        // check if nav disappears or appears -> need to change height for icxt sidebar
                        var nav = d.querySelector("#nav_bar_include");
                        if (nav) {
                            var opacity = nav.style.opacity;
                            if (opacity < 1 && opacity >= 0) {
                                sidebarO.style.top = Math.round(40 * opacity) + "px";
                                scrollSpeed = 1;
                                return;
                            } else if (opacity >= 1) {
                                scrollSpeed = 100;
                                sidebarO.style.top = "40px";
                            } else if (opacity < 0) {
                                sidebarO.style.top = "0px";
                            }
                        }
                        scrolling = false;
                    }
                }, scrollSpeed);

                if (dojo.config.isDebug) {
                    console.log("icxt.ui.init < sidebar initialized");
                }

            }, ".lotusContent");
        } catch (e) {
            alert("Exception occurred in ICXT.sidebar: " + e);
        }
    });
};
