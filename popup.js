let turnOff = document.getElementById("turnOff");

let isOff = false;

// When the button is clicked, inject setPageBackgroundColor into current page
turnOff.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (isOff){
      isOff = false;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: undolol,
      });
    } else {
      isOff = true;
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: lol,
      });
    }
  });
  
  // this is hilarious that I can just do this
  function lol() {
    stopwatch = document.getElementById("stopwatch");
    if (stopwatch){
      stopwatch.style.zIndex = -1;
    }
  }

  function undolol(){
    stopwatch = document.getElementById("stopwatch");
    if (stopwatch){
      stopwatch.style.zIndex = 9999;
    }
  }