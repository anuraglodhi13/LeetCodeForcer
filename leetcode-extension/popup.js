

// button.onclick = () => {
//     button.disabled = true;
//     timer.style.display = 'block';
//     const currentTime = new Date();
// const nextDay = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()+1);
// const remainingTime = nextDay - currentTime;
// const hours = Math.floor(remainingTime / (1000 * 60 * 60));
// const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
// const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
//     setTimeout ( () => {
//         button.disabled = false;
//     },
//     remainingTime);
//     // const currentTime = new Date();
//     // console.log(remainingTime+" ");
//     // console.log(`${hours} hours, ${minutes} minutes, ${seconds} seconds`);
//     setInterval(()=>{
//     // timer.style.display = 'block';
//     timer.innerHTML = `${hours} hours ${minutes} minutes ${seconds} seconds`;
//     // console.log('Button Activated'+sec)
// }, 1000)
// }
// // function myFunction() {
// //     console.log(btn);
// //     // btn.disabled = true;
// //     // setTimeout(()=>{
// //     //   btn.disabled = false;
// //     //   console.log('Button Activated')}, 5000)
// // }
// // let lastClickTime = 0;


// // button.addEventListener('click', function() {
// //   const currentTime = new Date();
// //   lastClickTime = currentTime;
// // });



// // setInterval(function() {
// //   const currentTime = new Date();
// //   const timeDifference = currentTime - lastClickTime;
// //   if (timeDifference > 24 * 60 * 60 * 1000) {
// //     // 24 hours have passed since the button was last clicked
// //     // Enable the button and hide the timer
// //     button.disabled = false;
// //     timer.style.display = 'none';
// //   } else {
// //     // Less than 24 hours have passed since the button was last clicked
// //     // Disable the button and show the timer
// //     button.disabled = true;
// //     timer.style.display = 'block';

// //     // Calculate the time remaining and update the timer element
// //     const timeRemaining = 24 * 60 * 60 * 1000 - timeDifference;
// //     const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
// //     const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
// //     const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
// //     timer.innerHTML = `${hours} hours ${minutes} minutes ${seconds} seconds`;
// //   }
// // },1000); // Check every minute
// let lastClickTime = 0;

// const button = document.getElementById('myButton');
// button.onclick = () => {
//   const currentTime = new Date();
//   lastClickTime = currentTime;
//   button.disabled = true;
//   timer.style.display = 'block';
// };

// const timer = document.getElementById('timer');

// setInterval(function() {
//   const currentTime = new Date();
//   const timeDifference = currentTime - lastClickTime;
//   if (timeDifference > 24 * 60 * 60 * 1000) {
//     // 24 hours have passed since the button was last clicked
//     // Enable the button and hide the timer
//     button.disabled = false;
//     timer.style.display = 'none';
//   } else {
//     // Less than 24 hours have passed since the button was last clicked
//     // Calculate the time remaining and update the timer element
//     const timeRemaining = 24 * 60 * 60 * 1000 - timeDifference;
//     const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
//     const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
//     const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
//     timer.innerHTML = `${hours} hours ${minutes} minutes ${seconds} seconds`;
//   }
// }, 1000); // Check every second

// const timer = document.getElementById('timer');

// button.onclick = () => {
//     button.disabled = true;
//     timer.style.display = 'block';

//     const data = {
//         message: 'Hello from the popup window!'
//       };
//     chrome.runtime.sendMessage(data);
 
// }

// chrome.storage.local.get('lastClickTime', function(items) {
//     console.log(items.lastClickTime); 
//     lastClickTime =(items.lastClickTime) || null;
  
//     const currentTime = new Date();
//     const timeDifference = currentTime - lastClickTime;
//     if (timeDifference > 3 * 60 * 60 * 1000) {
//       // 3 hours have passed since the button was last clicked
//       // Enable the button and hide the timer
//       button.disabled = false;
//       timer.style.display = 'none';
//     } else {
//       // Less than 3 hours have passed since the button was last clicked
//       // Disable the button and show the timer
//       button.disabled = true;
//       timer.style.display = 'block';
//     }
//   });
    // Send a request to the background script for the current button state
// chrome.runtime.sendMessage({type: 'getTimerDetails'}, function(response) {
//     const timer = document.getElementById('timer');
//     timer.style.display = response.state === 'disabled' ? 'block' : 'none';
//     timer.innerHTML = response.timer;
//   });

const button = document.getElementById('myButton');
const timer = document.getElementById('timer');
// this function will check if the button is disabled or not
// chrome.storage.local.get('buttonDisabled', function(items) {
//   button.disabled = items.buttonDisabled || false;
// });
// function hi () {
    
// }
function updateTimer() {
    chrome.storage.local.get("storedTime", function (items) {
         // emergency button is clicked make sure that if current time is 3 hours more than last stored time (time when someone clicked the button) 
          // then timer will start else nothing
        if (items.storedTime !== undefined || items.storedTime === null) {
          var lastStoredDate = new Date(items.storedTime);
          var currentTime = new Date();
          var diffTime = lastStoredDate - currentTime;
          if (diffTime <= 0) { 
            timer.style.display = 'none';
            chrome.storage.local.remove("storedTime"); // removing the stored time as now it's work is done, so if someone again open or update the tab storedTime will become undefined and this function will not do anything
          }
          else {
            const hours = Math.floor(diffTime / (60 * 60 * 1000));
            const minutes = Math.floor((diffTime % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((diffTime % (60 * 1000)) / 1000);
            timer.innerHTML = `${hours} hours ${minutes} minutes ${seconds} seconds`;
            timer.style.display = 'block';
          }
    }
    });
}
setInterval(updateTimer, 1000);

// this function will make sure that emergency button can be pressed once in a day.
chrome.storage.local.get('storedDate', function(items) {
    const lastStoredDate = items.storedDate;
    const todayDate = new Date().toDateString();
    if(lastStoredDate !== undefined && lastStoredDate === todayDate) {
        // console.log("You can press this button once in a day");
        button.disabled = true;
    }
    else if(lastStoredDate !== undefined && new Date(lastStoredDate) < new Date(todayDate)) {
        button.disabled = false;
    }
});

// after clicking emergency button it will become disabled and we will store date and time for further use in local storage
button.onclick = () => {
    button.disabled = true;

    const currentDate = new Date();
    chrome.storage.local.set({storedDate: currentDate.toDateString()});

    var updatedTime = new Date(currentDate.getTime() + (3 * 60 * 60 * 1000));
    chrome.storage.local.set({storedTime: updatedTime.toString()});

}