# Decay [![Build Status](https://secure.travis-ci.org/clux/decay.png)](http://travis-ci.org/clux/decay) [![Dependency Status](https://david-dm.org/clux/decay.png)](https://david-dm.org/clux/decay)

Decay is a collection of common sorting / popularity estimation algorithms employed by bigger news sites to sort for best content using votes and often also post date.

## Zero Decay
To compute static scores with zero decay (good for comments), use a non-decaying algorithm from the Usage section, by simply recomputing the score at each new vote:

```js
var decay = require('decay')
  , scoreFn = decay.wilsonsScore();

// assume req.entry is the item being voted on
app.post('/entry/upvote', middleWare, function (req, res) {
  // call the scoreFn with ups, downs, post_date to recompute
  req.entry.score = scoreFn(req.entry.upVotes + 1, req.entry.dnVotes, req.entry.postDate);

  // save new score in database so that new pageviews sort based on the new score
  req.entry.save();
});
```

Note that this works best for more static components of a page. News should decay properly.

## True Decay
To truly decay, we need to use one of the algorithms that recompute scores based on post date.
Effective use of these involve continuously computing the score(s) required in a node process on a set of suitable candidates:

```js
var decay = require('decay')
  , scoreFn = decay.redditHot();

setTimeout(function () {
  var candidates = []; // get set of suitable candidates here - perhaps via stored recent || popular items in redis
  candidates.forEach(function (c) {
    c.score = scoreFn(c.upVotes, c.dnVotes, c.date);
  });
  // save set here so that next database call gets an updated ordering
  save(candidates);
}, 1000 * 60 * 15); // run every 15 minutes
```


# Usage

Decay currently houses 3 algorithms, and each is instantiated through an exported factory for speed and brevity. This section will outline how to use them.

Two of these algorithms decay with time, and the other is based purely on statistical popularity.


## Wilson Score
AKA Reddit's *[Best](http://blog.reddit.com/2009/10/reddits-new-comment-sorting-system.html)* comment sorting system.

Statistically, it is the lower bound of the [Wilson Score interval](http://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval) at the alpha level based on supplied Z score.

This is submission-time-agnostic, i.e. it does *not* decay.

### Instantiation
The score function is created by calling `wilsonScore` optionally specifying a global `zScore`.
The `zScore` is a statistical value which roughly means how many standard deviations of safety you want, so it maps directly onto the confidence level of the Wilson Score interval.

It will default to `z=1.96` if left out, representing a `95%` confidence level in the lower bound. Otherwise, values through `1.0` (69%), to `3.3` (99.9%) good alternatives.

```js
var scoreFn = decay.wilsonScore(zScore);
```

### Usage
Call it with simply the amount of upvotes and downvotes.

```js
var score = scoreFn(upVotes, downVotes);
```



## Reddit Hot Sort
Based on the difference between ups/downs, and decays with time. Causes hive mind effects in large crowds.

### Instantiation
Create the score function by calling `redditHot` with an ~_halflife_ parameter in seconds (default 45000s). For info on the effects on this parameter read the original [blog post](http://amix.dk/blog/post/19588) about it.

```js
var scoreFn = decay.redditHot(halflife);
```

### Usage
Call scoreFn with the amounts of up and down votes + a Date instance representing the post/publish date of the item.

```js
var score = scoreFn(upVotes, downVotes, date);
```

## HackerNews Hot Sort
Based on simply the amount of upvotes, and decays with time. Prone to advertising abuse.

### Instantiation
Create the score function by calling `hackerHot` with an optional gravity parameter (default `1.8`). For info on the effects of this parameter read the original [blog post](http://amix.dk/blog/post/19574) about it.

```js
var scoreFn = decay.hackerHot(decay);
```

### Usage
Call scoreFn with the amounts of upvotes/likes + a Date instance representing the post/publish date of the item.

```js
var score = scoreFn(upVotes, date);
```

## Installation

```bash
$ npm install decay
```

## Running tests
Install development dependencies

```bash
$ npm install
```

Run the tests

```bash
$ npm test
```

## License
MIT-Licensed. See LICENSE file for details.
