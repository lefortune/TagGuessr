# TagGuessr

TW: anime

An interactive web game about tags and animesque images. 

Players are shown an image from the Danbooru imageboard and must guess the tags associated with it. The more tags a player gets right, the higher their score, up to 1000 possible points. The image resets daily at midnight, along with your score for the day. Share your results with others!

The game is designed to be fun, competitive, and a way to explore the world of detailed image metadata used in booru-style image boards. While these sites are popular for their detailed tagging systems (and certain other reasons), they can be hard to navigate or appreciate unless you're familiar with how tags work. This game demystifies that tagging culture by turning it into a fun guessing game. Regardless if you care about imageboards, the game is a test of your media knowledge and recognition of everyday objects and concepts. Great for both casual fans and metadata nerds!

## Tools

HTML5, CSS3, TailwindCSS, JavaScript, Node.js, Vite, React. Pulls from Danbooru REST API.

## Features

- *Image Fetching:* Randomly pulls images from the API. Resets daily at midnight

- *Guide:* Collapsible element with helpful information for players that may be lost or unfamiliar

- *Tag Submission + Matching:* Players type tag guesses, the app checks them against the actual tag list

- *Scoring System:* Tags have different values by post; all tags combined sum up to 1000 pts

- *Tag Filtering:* Using general-rated images with ≥10 score. No NSFW

- *Hints:* Autofills the guess input field with a correct tag, at the cost of points

- *Results:* Minimalist pop-up with copyable results of the day and time of next reset

- *Score Tracking:* Local-stored historical data, such as highscores

- *Styling, UI, UX:* Responsive UI with a clean layout and keyboard-focused UX

