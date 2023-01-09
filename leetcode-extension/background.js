let LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";
let DAILY_CODING_CHALLENGE_QUERY = `
query globalData {
  feature {
    questionTranslation
    subscription
    signUp
    discuss
    mockInterview
    contest
    store
    chinaProblemDiscuss
    socialProviders
    studentFooter
    enableChannels
    dangerZone
    enableSharedWorker
    enableRecaptchaV3
    enableDebugger
    enableDebuggerPremium
    enableAutocomplete
    enableAutocompletePremium
    enableAllQuestionsRaw
    autocompleteLanguages
    enableIndiaPricing
    enableReferralDiscount
    maxTimeTravelTicketCount
    enableStoreShippingForm
    enableCodingChallengeV2
    __typename
  }
  streakCounter {
    streakCount
    daysSkipped
    currentDayCompleted
    __typename
  }
  currentTimestamp
  userStatus {
    isSignedIn
    isAdmin
    isStaff
    isSuperuser
    isMockUser
    isTranslator
    isPremium
    isVerified
    checkedInToday
    username
    realName
    avatar
    optedIn
    requestRegion
    region
    activeSessionId
    permissions
    notificationStatus {
      lastModified
      numUnread
      __typename
    }
    completedFeatureGuides
    __typename
  }
  siteRegion
  chinaHost
  websocketUrl
  recaptchaKey
  recaptchaKeyV2
  sitewideAnnouncement
  userCountryCode
}
`;

// this function will retry for 3 times if any error occur while fetching the leetcode graphql 
let fetchDailyCodingChallenge = async () => {
  let retries = 3;
  let success = false;
  while (retries > 0 && !success) {
    try {
      // console.log(`Fetching daily coding challenge from LeetCode API.`)
      const init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
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
    console.log('Failed to call API after 3 retries');
  }
};

function leetcodeForcer() {
  let leetcodeData = fetchDailyCodingChallenge();
  leetcodeData.then((data) => {
    if (data.data.userStatus.isSignedIn) {
      if (!data.data.streakCounter.currentDayCompleted) {
        chrome.tabs.query(
          { currentWindow: true, active: true },
          function (tabs) {
            let domain = new URL(tabs[0].url);
            domain = domain.hostname;
            if (!domain.includes("leetcode")) {
              // if domain is not leetcode redirect to leetcode.com
              chrome.tabs.update({ url: "http://leetcode.com" });
            }
          }
        );
      }
    }
  });
}

// this chrome api works when someone updated the tab
chrome.tabs.onUpdated.addListener(function (tabId, tabInfo, tab) {
  if (tab.url !== undefined && tabInfo.status === "complete") {
    // console.log("I am in updatted");
    leetcodeForcer();
  }
});

//this chrome api works when tab will become activated e.g. when someone creates new tab
chrome.tabs.onActivated.addListener(function () {
  leetcodeForcer();
});
