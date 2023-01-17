let LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";
let LEETCODE_GRAPHQL_QUERY = `
query {
  streakCounter {
    currentDayCompleted
  }
  userStatus {
    isSignedIn
  }
  activeDailyCodingChallengeQuestion {
    link
  }
}
`;

// this function will retry for 3 times if any error occur while fetching the leetcode graphql
let fetchLeetcodeData = async () => {
  let retries = 3;
  let success = false;
  while (retries > 0 && !success) {
    try {
      // console.log(`Fetching daily coding challenge from LeetCode API.`)
      const init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: LEETCODE_GRAPHQL_QUERY }),
      };

      const response = await fetch(LEETCODE_API_ENDPOINT, init);
      success = true;
      return response.json();
    } catch (error) {
      console.log(`Error: ${error}. Retrying...`);
      retries--;
    }
  }

  if (!success) {
    console.log("Failed to call API after 3 retries");
  }
};

// this function will redirect to leetcode.com
function leetcodeForcer() {
  let leetcodeData = fetchLeetcodeData();
  leetcodeData.then((data) => {
    if (data !== undefined && data.data.userStatus.isSignedIn) {
      // if signed in and current day is not completed redirect to leetcode daily challenge problem
      if (!data.data.streakCounter.currentDayCompleted) {
        chrome.tabs.query(
          { currentWindow: true, active: true },
          function (tabs) {
            let domain = new URL(tabs[0].url);
            domain = domain.hostname;
            if (!domain.includes("leetcode")) {
              chrome.tabs.update({ url: "http://leetcode.com"+data.data.activeDailyCodingChallengeQuestion.link});
            }
          }
        );
      }
    }
    else if (data !== undefined && !data.data.userStatus.isSignedIn) {
      chrome.tabs.query(
        { currentWindow: true, active: true },
        function (tabs) {
          let domain = new URL(tabs[0].url);
          domain = domain.hostname;
          if (!domain.includes("leetcode")) {
            // if not signed in and domain is not leetcode redirect to leetcode.com
            chrome.tabs.update({ url: "http://leetcode.com" });
          }
        }
      );
    }
  })
  .catch( // some error occurs while doing leetcode forcing catch and log in console
    error => console.log("Error while doing leetcode forcing ,"+error)
  );;
}

// this function will handle the emergency button functionality
function emergencyButtonHandle() {
  chrome.storage.local.get("storedTime", function (items) {
    if (items.storedTime) {
      // emergency button is clicked make sure that if current time is 3 hours more than last stored time (time when someone clicked the button) 
      // then leetcode forcing will start else don't do anything
      var lastStoredDate = new Date(items.storedTime);
      var currentTime = new Date();
      var diffTime = lastStoredDate - currentTime;
      if (diffTime <= 0) {
        chrome.storage.local.remove("storedTime"); // removing the stored time as now it's work is done, so if someone again open or update the tab storedTime will become undefined and this function will go to leetcodeForcer()
        leetcodeForcer();
      }
    } else {
      // emergency button is not clicked yet
      leetcodeForcer();
    }
  });
}

// this chrome api works when someone updated the tab
chrome.tabs.onUpdated.addListener(function (tabId, tabInfo, tab) { 
   // to call only once. No need for this in onActivated as that api call once by default
  if (tab.url !== undefined && tabInfo.status === "complete") { //onUpdated renders multiple time due to iframe tags so to only do leetcode forcing once check tab status is completed or not
    emergencyButtonHandle();
  }
});

//this chrome api works when tab will become activated e.g. when someone creates new tab
chrome.tabs.onActivated.addListener(function () {
  emergencyButtonHandle();
});
