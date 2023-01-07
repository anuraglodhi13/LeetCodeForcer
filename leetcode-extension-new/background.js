let LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql'
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
`

let fetchDailyCodingChallenge = async () => {
    // console.log(`Fetching daily coding challenge from LeetCode API.`)
    const init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
    }
  
    const response = await fetch(LEETCODE_API_ENDPOINT, init);
    return response.json();
  }
  

function leetcodeForcer() {
        let leetcodeData = fetchDailyCodingChallenge();
        leetcodeData.then(data => {
       if(data.data.userStatus.isSignedIn) {
           if(!data.data.streakCounter.currentDayCompleted) {
               chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
                   let domain = (new URL(tabs[0].url));
                   domain = domain.hostname;
                   console.log(domain);  
                       if(!domain.includes('leetcode')) { // if domain is not leetcode redirect to leetcode.com
                           chrome.tabs.update({url: 'http://leetcode.com'});
                           }
                   });
           }
       }

    });
    };

// this chrome api works when someone updated the tab
chrome.tabs.onUpdated.addListener(function (tabId, tabInfo, tab) {
    if (tab.url !== undefined && tabInfo.status === "complete" ) {
        console.log("I am in updatted");
        leetcodeForcer();
    }
});

// this chrome api works on active tab
chrome.tabs.onActivated.addListener(function (tabId, tabInfo, tab) {
    console.log("I am in activated");
    leetcodeForcer();
});