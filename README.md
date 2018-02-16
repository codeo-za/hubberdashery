# hubberdashery
Some enhancements for GitHub

### using
Either DIY:
- check out the code
- `npm install`
- `npm run build-tampermonkey`
- copy the built artifact `dist/tampermonkey.js` into your own Tampermonkey script

Advantages:
- you get to have a looky at what's going on
  - and abort if you disapprove!
- you retain complete control over the script and when it updates

Disadvantages:
- you have to manually update

or use the hosted built artifact by creating the following Tampermonkey script:

```javascript
// ==UserScript==
// @name         hubberdashery from raw.githubusercontent.com
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/*
// @grant        none
// @require      https://raw.githubusercontent.com/codeo-za/hubberdashery/master/dist/tampermonkey.js
// ==/UserScript==
```

Advantages
- updates are automatic
  - but bear in mind that raw.githubusercontent.com implements caching, so updates may take up to 5 minutes to propagate

Disadvantages
- you get updates whether or not you've vetted them


### dev-testing
I suggest installing `TamperMonkey` and enabling access to local files via extension preferences. Then use the following template, swapping out the `@require` path for your local copy:

```javascript
// ==UserScript==
// @name         hubberdashery local
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/*
// @grant        none
// @require      file://C:/code/hubberdashery/dist/tampermonkey.js
// ==/UserScript==
```