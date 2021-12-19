let sites = {
        "www.instagram.com": 0,
        "www.youtube.com" : 0,
        "twitter.com" : 0,
        "www.facebook.com": 0,
        "www.tiktok.com": 0,
};
let lastSite = "";
chrome.action.enable()

chrome.tabs.onUpdated.addListener(
    // inject when tab is updated
    (tabId, changeInfo, tab)=> {
        console.log(tab.status);
        if (tab.status == "complete"){
            if (tab.url == ""){
                return
            } else {
                url = new URL(tab.url);
            }
            if (url.host in sites){
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["stopwatch.js"]
                }, ()=>{
                    // we must have set up the port once we reach this callback
                    chrome.tabs.sendMessage(tab.id, {command: "start", elapsed: sites[url.host]});
                });
            }
            lastSite = tab.id;
        }
    }
  )
/*
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        sites[message.site]= message.elapsed;
        console.log("closing", message.site);
    }
);
*/

chrome.tabs.onActivated.addListener(
    (activeInfo) =>{
        chrome.tabs.get(activeInfo.tabId, 
            (tab)=> {
                // should already be injected here
                if (lastSite){
                    chrome.tabs.get(lastSite, async (lasttab)=>{
                        url = new URL(lasttab.url);
                        if (url.host in sites){
                            chrome.tabs.sendMessage(lasttab.id, {command:"stop"}, (res)=>{
                                sites[url.host] = res.elapsed;
                            });
                            console.log(url, lastSite, "done message");
                        }
                    });
                }
                if (tab.url == ""){
                    return;
                } else {
                    url = new URL(tab.url);
                }
                if (url.host in sites){
                    chrome.tabs.sendMessage(tab.id, {command: "start", elapsed: sites[url.host]});
                }
                lastSite = tab.id;
            }
        );
    }
)
