# TagGuesser: Degen Edition

**TW: anime**

An interactive web challenge game involving anime-style images and descriptive tags. Players are shown an image from the Danbooru imageboard and must guess the tags associated with it. The more tags a player gets right, the higher their score. More points are awarded the rarer or more obscure the correct tag is.

Imageboard/database sites like Danbooru are popular for their detailed image metadata tagging systems (and certain other reasons), but they can be hard to navigate or appreciate unless you're familiar with how tags work; this game demystifies tagging by turning it into a guessing game. 

Whether or not such nerd folly interests you, this game is a fun knowledge check on your knowledge of media, vocabulary, and real-world objects. Overall, a fun challenge for both casual fans and metadata nerds.

## Features + Tools: 
Image Fetching: JavaScript (Fetch API), Danbooru REST API

Tag Submission + Matching: JavaScript (string matching), optional fuzzy logic (e.g. Fuse.js), Danbooru API's tag list

Scoring System: JavaScript

Tag Filtering: JavaScript (blacklist array)

Tutorial + UI: HTML/CSS, React, JavaScript, possibly a simple modal library like Micromodal

Leaderboard / High Score Tracking: React, Database (MongoDB) and subsequent calls

Styling + UX: HTML5, CSS + animations, React

## Timeline:

4/22 Tue: Rough design with Figma

4/24 Thu: Begin backend - making the actual game

4/27 Sun: Begin frontend - cool visuals and transitions

5/1 Thu: Bug fixes and final touches
