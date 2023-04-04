let LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";
let LEETCODE_GRAPHQL_QUERY = `
query globalData {
  streakCounter {
    currentDayCompleted
  }
  userStatus {
    isSignedIn
    username
  }
  activeDailyCodingChallengeQuestion {
    link
  }
}
`;
let LEETCODE_ALL_PROBLEMS_QUERY = `
query userSessionProgress($username: String!) {
  matchedUser(username: $username) {
    submitStats {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }
  }
}
`;

// this function will retry for 3 times if any error occur while fetching the leetcode graphql
let getLeetCodeData = async (query, variables) => {
    let retriesLeft = 3;
    while (retriesLeft > 0) {
        try {
            const init = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({query, variables}),
            };

            const response = await fetch(LEETCODE_API_ENDPOINT, init);

            if (response.ok) {
                return response.json();
            }
        } catch (error) {
            console.error(`Error: ${error}. Retrying...`);
            retriesLeft--;
        }
    }

    console.error("Failed to call API after 3 retries.");
};

function redirect(path = "/") {
    chrome.tabs.query(
        {currentWindow: true, active: true},
        (tabs) => {
            const currURL = new URL(tabs[0].url);
            const domain = currURL.hostname;

            if (!domain.includes("leetcode") && !domainWhiteList.has(domain)) {
                chrome.tabs.update({url: `http://leetcode.com${path}`});
            }
        }
    );
}

async function checkForNewCompletion(data) {
    const problemsData = await getLeetCodeData(LEETCODE_ALL_PROBLEMS_QUERY, {username: data.userStatus.username});
    const numCompleted = problemsData.data.matchedUser.submitStats.acSubmissionNum[0].count;

    const prevNumCompleted = await chrome.storage.local.get('numCompleted');

    if (prevNumCompleted.numCompleted !== undefined && prevNumCompleted.numCompleted < numCompleted) {
        chrome.storage.local.set({
            todayDateAfterChallenegeComplete: new Date().toDateString(),
            numCompleted: numCompleted
        });
        // if today's challenge is completed save today's date and use it if user is signed out
        return;
    }
    redirect("/problemset/all/")
}

const domainWhiteList = new Set(["leetcode.com", "accounts.google.com", "extensions", "github.com"]); // this set is to whitelist the redirection for chrome://extensions and accounts.google.com
function checkForTodaysChallenge(data) {
    if (data.streakCounter.currentDayCompleted) {
        chrome.storage.local.set({todayDateAfterChallenegeComplete: new Date().toDateString()});
        // if today's challenge is completed save today's date and use it if user is signed out
        return;
    }
    redirect(data.activeDailyCodingChallengeQuestion.link);
    // if signed in and current day is not completed redirect to leetcode daily challenge problem
}

// this function will redirect to leetcode.com
function leetcodeForcer() {
    getLeetCodeData(LEETCODE_GRAPHQL_QUERY)
        .then(async (data) => {
            if (!data || !data.data) {
                throw new Error("No data received.");
            }

            data = data.data

            if (data.userStatus.isSignedIn) {
                const mode = await chrome.storage.local.get('mode');
                if (mode.mode === "daily") {
                    checkForTodaysChallenge(data);
                } else {
                    checkForNewCompletion(data);
                }
            } else { //If user is not signed in, redirect to leetcode.com for login
                redirect()
            }
        })
        .catch( // some error occurs while doing leetcode forcing catch and log in console
            error => console.error("Error while doing leetcode forcing ," + error)
        );
}

/**
 * this function will check if day has been changed or not
 *
 * @returns {Promise<boolean>} true if day has been changed else false
 */
async function isAlreadySolved() {
    let items = await chrome.storage.local.get('todayDateAfterChallenegeComplete');

    const lastSolvedDay = items.todayDateAfterChallenegeComplete;
    const todayDate = new Date();

    return (lastSolvedDay !== undefined && new Date(lastSolvedDay).getDate() === todayDate.getDate());
}

// this function will handle the emergency button functionality
async function emergencyButtonHandle() {

    if (await isAlreadySolved()) {
        return;
    }

    const items = await chrome.storage.local.get('storedTime');
    if (items.storedTime) {
        // emergency button is clicked make sure that if current time is 3 hours more than
        // last stored time (time when someone clicked the button)
        // then leetcode forcing will start; else do nothing
        const lastStoredDate = new Date(items.storedTime);
        const currentTime = new Date();
        const diffTime = lastStoredDate - currentTime;

        if (diffTime <= 0) {
            chrome.storage.local.remove("storedTime"); // removing the stored time as now it's work is done, so if someone again open or update the tab storedTime will become undefined and this function will go to leetcodeForcer()
            leetcodeForcer();
        }
    } else {
        // emergency button is not clicked yet
        leetcodeForcer();
    }
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
