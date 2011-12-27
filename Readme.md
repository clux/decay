# Decay

Decay is a collection of common sorting algorithms employed by bigger news sites to sort for best content using votes and post date.
To use effectively, continuously compute the score(s) required in a node process / setTimeout function on a set of suitable candidates.

````javascript
var decay = require('decay')
  , scoreFn = decay.redditHot();

setTimeout(function () {
  // loop through redis set of suitable candidates here
  candidates.forEach(function (c) {
    c.score = scoreFn(c.upVotes, c.dnVotes, c.date);
  });
  // save set
}, 1000 * 60 * 15); // run every 15 minutes
````

## Usage

Decay currently houses 3 algorithms, and each is instantiated through an exported factory for speed and brevity.
This section will outline how to use them.


### Wilson Score
AKA Reddit's *[Best](http://blog.reddit.com/2009/10/reddits-new-comment-sorting-system.html)* comment sorting system.
Submission-time-agnostic.

#### Instantiation
The score function is created by calling `wilsonScore` optionally specifying a global zScore.
The zScore represents the statistical confidence of the Wilson Score interval.

Leave it blank and you will get `z=1.44` representing an `85%` confidence level.
Otherwise, values through `1.0` (69%), `1.96` (95%), up to `3.3` (99.9%) could be worth experimenting with.

````javascript
var scoreFn = decay.wilsonScore(zScore);
````

#### Usage
Call it with simply the amount of upvotes and downvotes.
````javascript
var score = scoreFn(upVotes, downVotes);
````


### Reddit Hot Sort
Relies on dates and the difference between ups/downs.
Causes hive mind effects in large crowds.

#### Instantiation
Create the score function by calling `redditHot` with an optional decay parameter.
For info on the effects on this parameter read the original [blog post](http://amix.dk/blog/post/19588) about it.

````javascript
var scoreFn = decay.redditHot(decay);
````

#### Usage
Call it with the amounts of up and down votes + a Date instance representing the post/publish date of the item.

````javascript
var score = scoreFn(upVotes, downVotes, date);
````


### HackerNews Hot Sort
Relies only on upvotes and submission time.
Downvote-agnostic.

#### Instantiation
Create the score function by calling `hackerHot` with an optional gravity parameter (default `1.8`).
For info on the effects of this parameter read the original [blog post](http://amix.dk/blog/post/19574) about it.

````javascript
var scoreFn = decay.hackerHot(decay);
````

#### Usage
Call it with the amounts of upvotes/likes + a Date instance representing the post/publish date of the item.

````javascript
var score = scoreFn(upVotes, date);
````

## Installation

````bash
$ npm install decay
````

## Running tests
Install development dependencies

````bash
$ npm install
````

Run the tests

````bash
$ npm test
````

## License
MIT-Licensed. See LICENSE file for details.
