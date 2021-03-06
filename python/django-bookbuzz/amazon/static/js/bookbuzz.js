/*
 * Copyright (c) 2011 ActiveState Software Inc.
 * See the file LICENSE.txt for licensing information.
 */

var payloadPatterns = /([@#])([A-Za-z]\w\w+)/;
var isCharPattern = /\w$/;
var tweetDump = null;
var tweetDumpList = null;

function initSidebar() {
    tweetDump = document.getElementById("tweetDump");
    tweetDumpList = document.getElementById("tweetDump-list");
}

        
var h = function(s) {
  return s;
  //return s.replace(/\&/g, "&amp;").replace(/</g, "&lt;")
};

var processPayload = function(hParts, text) {
  var parts = text.split(payloadPatterns);
  var i = 0, term, len = parts.length, part;
  var skipPart = false;
  while (i < len - 1) {
    part = parts[i];
    if (skipPart) {
      hParts.push(part);
      skipPart = !isCharPattern.test(part);
    } else if (part == "@") {
      term = parts[i + 1];
      hParts.push('<a href="https://twitter.com/#!/');
      hParts.push(term);
      hParts.push('">@');
      hParts.push(term);
      hParts.push('</a>');
      skipPart = true;
      i += 1;
    } else if (part == "#") {
      term = parts[i + 1];
      hParts.push('<a href="https://twitter.com/#!/search/%23');
      hParts.push(term);
      hParts.push('">#');
      hParts.push(term);
      hParts.push('</a>');
      skipPart = true;
      i += 1;
    } else {
      hParts.push(part);
    }
    i += 1;
  }
  if (i == len - 1) {
    hParts.push(parts[i]);
  }
};

// Now setup the json tweet stuff
var getTweetCallback = function(json) {
  var outlet = document.getElementById("temp");
  var results = json;//jQuery.parseJSON(json);
  var numTweets = results.length;
  tweetDump.style.display = "block";
  while (tweetDumpList.firstChild) {
    tweetDumpList.removeChild(tweetDumpList.firstChild);
  }
  insertTweets(results, 0, numTweets);
};

function insertTweets(results, i, numTweets) {
    if (i >= numTweets) return;
    var result = results[i];
    var stuff, listitem;
    var hParts = [];
    hParts.push('<div class="tweetContainer">');
    var twitterLink = "http://twitter.com/" + result.name;
    if (result.img) {
      hParts.push('<div class="tweetUserImageContainer">');
      hParts.push('<a href="');
      hParts.push(twitterLink);
      hParts.push('"><img src="');
      hParts.push(result.img);
      hParts.push('" border="0"></a></div>\n');
    }
    hParts.push('<div class="tweetContentsContainer">');
    hParts.push('<div class="tweetUserNameContainer">');
    hParts.push('<a href="http://twitter.com/');
    hParts.push(result.name);
    hParts.push('">');
    hParts.push(result.name);
    hParts.push('</a>');
    hParts.push('</div>'); // tweetUserNameContainer
    hParts.push('<div class="tweetPayloadContainer">');
    processPayload(hParts, result.text);
    hParts.push('</div>'); // tweetPayloadContainer
    hParts.push('</div>'); // tweetContentsContainer
    hParts.push('</div>'); // tweetContainer
    if (i < numTweets - 1) {
      hParts.push("<hr >");
    }
    stuff = hParts.join("\n");
    listitem = document.createElement("li");
    listitem.innerHTML = stuff;
    tweetDumpList.appendChild(listitem);
    setTimeout(insertTweets, 50, results, i + 1, numTweets);
    // yellow fade would be nice here....
}
getTweets = function(row, col) {
  jQuery.getJSON("/bookbuzz/getTweets/",
            { asin:bookAsins[col], isoDate:isoDates[row] },
            getTweetCallback);
};
