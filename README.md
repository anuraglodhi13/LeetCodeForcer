# LeetCodeExtension
Occasionally, we all make a commitment to solve at least one problem daily on Leetcode. However, in today's fast-paced and distracting world, it can be challenging to stick to this commitment despite having made it multiple times.

To motivate you to tackle the daily Leetcode challenge, we have developed this extension. Instead of sending reminders, it will automatically redirect you to Leetcode until you have completed the problem of the day.

What is the function of this extension?

1. After installing, if you browse anything on chrome and you have not solved the problem for a day it will redirect to that. Basically, it's virtual implementation of the principles outlined in book 'Eat That Frog'.
2. In case of an urgent need to browse, the extension includes an emergency button that can be used once per day to temporarily disable the redirection to Leetcode for a period of 3 hours.

**Code Use**

1. ```"host_permissions": ["https://*/"]```

    The host permission is required of pattern https:// becuase we are hitting the graphql end point of leetcode in background of this extension otherwise we will face the cors error which may run the extension in unexpected manner.

2. `chrome.tabs.onUpdated.addListener(function (tabId, tabInfo, tab) { 
  if (tab.url !== undefined && tabInfo.status==="complete") { 
    emergencyButtonHandle();
  }
});`

   In the background script of a Chrome extension, the emergencyButtonHandle function is called in both the chrome.runtime.onUpdated and chrome.runtime.onActivated APIs. However, an if condition is used in the onUpdated listener to only call the function if certain conditions are met. 

    ```Reason for that is the chrome.onUpdated event in a Chrome extension can fire multiple times due to iFrame tags because the iFrame tags can cause the extension to be reloaded. An iFrame (short for inline frame) is an HTML element that allows a webpage to embed another webpage within itself. When an iFrame is loaded, it can cause the parent page and any extensions that are running on that page to also be reloaded, which can cause the chrome.onUpdated event to fire again. So to handle this behaviour we are using the if condition in onUpdated chrome api```


