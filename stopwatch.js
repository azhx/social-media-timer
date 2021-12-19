
function msToTime(s) {
    return new Date(s).toISOString().substr(11,12);
}

const colors = ["rgb(255,69,58,0.6)", "rgb(255,159,10,0.6)", "rgb(255,214,10,0.6)", 
                "rgb(48,209,88,0.6)", "rgb(102,212,207,0.6)", "rgb(10,132,255,0.6)",
                "rgb(94,92,230,0.6)", "rgb(191,90,242,0.6)"]

var Stopwatch = function(elem){
    var flashtimes = 0;
    var flashbkg = 0;
    var offset, interval;
    var clock = 0;
    var maincolor = colors[Math.floor(Math.random()*8)];
    var stopwatch
    fetch(chrome.runtime.getURL('/stopwatch.html')).then(r => r.text()).then(html => {
        elem.insertAdjacentHTML('afterbegin', html);
        elem.insertAdjacentHTML('beforeend', 
        `<style>#stopwatch{background-color:${maincolor};} #stopwatch:hover{color: rgba(230, 239, 247, 0.205); background-color: transparent;} </style>`);
        // not using innerHTML as it would break js event listeners of the page
        stopwatch = document.getElementById("stopwatch");
        stopwatch.addEventListener("click", (e)=>{
            let elements = document.elementsFromPoint(e.clientX, e.clientY);
            elements[1].click()
        })
        reset()
      });


    function start(elapsed = 0) {
        console.log("message recieved", interval);
        if (!interval) {
            if (clock == 0){
                offset = Date.now() - elapsed;
            } else {
                offset = Date.now();
            }
            interval = setInterval(update, 113);
        }
    }
    
    function stop() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        return clock;
    }
    
    function reset() {
        clock = 0;
        render();
    }
    
    function update() {
        clock += delta();
        render();
    }
    
    function delta() {
        var now = Date.now(),
        d = now - offset;
    
        offset = now;
        return d;
    }
    
    function render(){
        var hms = msToTime(clock);
        var ms = Number(hms.substr(9, 3));
        var secs = Number(hms.substr(6, 2));
        var mins = Number(hms.substr(3,2));
        var hours = Number(hms.substr(0,2));
        if (flashtimes){
            if (flashtimes % 2 == 0){
                stopwatch.style.color = "white";
            } else {
                stopwatch.style.color = "black";   
            }
            flashtimes -= 1;
        }
        if (flashbkg){
            if (flashbkg % 10 > 5){
                stopwatch.style.backgroundColor = "rgb(0, 0, 0, 0)";
            } else {
                stopwatch.style.backgroundColor = maincolor;
            }
            flashbkg -= 1;
        }
        stopwatch.innerHTML = hms;
        if (mins > 0 && mins %5 == 0 && secs == 0 && ms <= 200){
            flashtimes = Math.min((hours+1)*10*mins, 100);
        }
        if (mins > 0 && mins %15 == 0 && secs == 0 && ms <= 200){
            flashbkg = Math.min((hours +1)*10*mins, 100);
        }
    }
    this.start = start;
    this.stop = stop;
    this.reset = reset;
}

var exists;
if (!exists){
    exists = true;
    var stopwatch = new Stopwatch(document.body);
    /*window.addEventListener("unload", ()=>{
        clock = stopwatch.stop();
        url = new URL(window.location.href);
        chrome.runtime.sendMessage({elapsed:clock, site: url.host});    
        console.log("window closing");     
    })*/
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if (request.command === "start"){
              stopwatch.start(request.elapsed);
          } else if (request.command === "stop"){
              console.log("stop request received")
              clock = stopwatch.stop();
              sendResponse({elapsed: clock});
          } else if (request.command === "reset"){
              stopwatch.reset();
          } else {
                console.log("invalid message");
          }
        }
    );
}