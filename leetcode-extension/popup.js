const button = document.getElementById('myButton');
const timer = document.getElementById('countdown');
const disableMessage = document.getElementById('disable-message');
const emergencyMessage = document.getElementById('emergency-message');

function updateTimer() {
    chrome.storage.local.get("storedTime", function (items) {
         // emergency button is clicked make sure that if current time is 3 hours more than last stored time (time when someone clicked the button) 
          // then timer will start else nothing
        if (items.storedTime) {
          var lastStoredDate = new Date(items.storedTime);
          var currentTime = new Date();
          var diffTime = lastStoredDate - currentTime;
          if (diffTime <= 0) { 
            timer.style.display = 'none';
            chrome.storage.local.remove("storedTime"); // removing the stored time as now it's work is done, so if someone again open or update the tab storedTime will become undefined and this function will not do anything
          }
          else {
            var hours = Math.floor(diffTime / (60 * 60 * 1000));
            var minutes = Math.floor((diffTime % (60 * 60 * 1000)) / (60 * 1000));
            var seconds = Math.floor((diffTime % (60 * 1000)) / 1000);
            if (hours.toString().length == 1) {
              hours = "0" + hours;
            }
            if (minutes.toString().length == 1) {
              minutes = "0" + minutes;
            }
            if (seconds.toString().length == 1) {
              seconds = "0" + seconds;
            }
            timer.innerHTML = ` <b> Leetcode Forcing will again start in ${hours}:${minutes}:${seconds}</b>` ;
            timer.style.display = 'block';
          }
    }
    });
}
setInterval(updateTimer, 1000); // setInterval to show the timer for every second.

// this function will make sure that emergency button can be pressed once in a day.
chrome.storage.local.get('storedDate', function(items) {
    const lastStoredDate = items.storedDate;
    const todayDate = new Date().toDateString();
    if(lastStoredDate !== undefined && lastStoredDate === todayDate) {
        // console.log("You can press this button once in a day");
        button.disabled = true;
        disableMessage.style.display = 'block';
        emergencyMessage.style.display = 'none';
        
    }
    else if(lastStoredDate !== undefined && new Date(lastStoredDate) < new Date(todayDate)) { // if last sotred date is less than today's date that means day has been changed need to enable the emrgency button.
        button.disabled = false;
    }
});

// after clicking emergency button it will become disabled and we will store date and time for further use in local storage
button.onclick = () => {
    button.disabled = true;
    disableMessage.style.display = 'block'; // to show the message that button will remain disabled thorughout the day
    emergencyMessage.style.display = 'none'; // show disable message and hide emergency message.

    const currentDate = new Date();
    chrome.storage.local.set({storedDate: currentDate.toDateString()});

    var updatedTime = new Date(currentDate.getTime() + (3 * 60 * 60 * 1000));
    chrome.storage.local.set({storedTime: updatedTime.toString()});

}