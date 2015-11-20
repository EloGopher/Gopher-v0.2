console.log("hello from devtools");
chrome.devtools.panels.create("Gopher",
                              "gopher.png",
                              "panel.html",
                              function(panel) { console.log("hello from callback"); });
