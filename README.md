# decay
[![npm status](http://img.shields.io/npm/v/decay.svg)](https://www.npmjs.org/package/decay)
[![build status](https://secure.travis-ci.org/clux/decay.svg)](http://travis-ci.org/clux/decay)
[![dependency status](https://david-dm.org/clux/decay.svg)](https://david-dm.org/clux/decay)
[![coverage status](http://img.shields.io/coveralls/clux/decay.svg)](https://coveralls.io/r/clux/decay)

This library houses 3 popularity estimating algorithms employed by bigger news sites used to sort for best content:

  1. `wilsonScore` - Reddit's _best_ comment scoring system
  2. `redditHot` - Reddit's _hot_ post scoring system for news posts
  3. `hackerHot` - Hackernews' scoring system

![Wilson score equation](https://github.com/clux/decay/raw/master/rating-equation.png)

Algorithms may cause scores to *decay* based on distance to post time.

## 1. Decaying algorithms
Algorithms that are designed to decay based on time needs continual recomputation of scores. An example of doing so would be keeping track of, and periodically computing the score(s) required in a node process on a set of suitable candidates:

```js
var decay = require('decay')
  , hotScore = decay.redditHot();

setInterval(function () {
  candidates = []; // perhaps get recent posts saved in db here
  candidates.forEach(function (c) {
    c.score = hotScore(c.upVotes, c.dnVotes, c.date);
    // save so that next GET /entry/ gets an updated ordering
    save(c);
  });  
}, 1000 * 60 * 5); // run every 5 minutes, say
```

## 2. Non-decaying algorithms
Algorithms that produce a time agnostic popularity score is typically good for comments. For best results, simply recompute the score at every new vote:

```js
var decay = require('decay')
  , wilsonScore = decay.wilsonScore();

// assume req.entry is the item being voted on
app.post('/entry/upvote', middleWare, function (req, res) {
  // call wilsonScore with ups, downs, post_date to recompute
  req.entry.score = wilsonScore(req.entry.upVotes + 1, req.entry.dnVotes, req.entry.postDate);

  // save new score in database so that new pageviews sort 
  save(req.entry);
});
```

## Usage
Decay exports 3 scoring function factories.

Two of these algorithms decay with time, and the other is based purely on statistical popularity.

```js
// 1. zero decay
var wilsonScore = decay.wilsonScore(zScore);
var score = wilsonScore(upVotes, downVotes);

// 2. decays
var redditHotScore = decay.redditHot(halflife);
var score = redditHotScore(upVotes, downVotes, date);

// 3. decays
var hackerHotScore = decay.hackerHot(gravity);
var score = hackerHotScore(upVotes, date);
```

## Parameter Explanation
### 1. Wilson Score
AKA Reddit's *[Best](http://blog.reddit.com/2009/10/reddits-new-comment-sorting-system.html)* comment sorting system.

Statistically, it is the lower bound of the [Wilson Score interval](http://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval) at the alpha level based on supplied Z score.

The optional `zScore` parameter can be passed as to the exported `wilsonScore` factory.
The Z score is a statistical value which roughly means how many standard deviations of safety you want, so it maps directly onto the confidence level of the Wilson Score interval.

It will default to `z=1.96` if left out, representing a `95%` confidence level in the lower bound. Otherwise, values through `1.0` (69%), to `3.3` (99.9%) good alternatives.

### 2. Reddit Hot Sort
Based on the difference between ups/downs, and decays with time. Causes hive mind effects in large crowds.

An optional _halflife_ parameter can be passed to the exported `redditHot` factory.
The half-life defaults to 45000 [s]. For info on the effects on this parameter read the original [blog post](http://amix.dk/blog/post/19588) about it.

### 3. HackerNews Hot Sort
Based on simply the amount of upvotes, and decays with time. Prone to advertising abuse.

An optional `gravity` parameter (defaulting to `1.8`) can be passed to the exported `hackerHot` factory. For info on the effects of this parameter read the original [blog post](http://amix.dk/blog/post/19574) about it.

## Installation

```bash
$ npm install decay
```

## License
MIT-Licensed. See LICENSE file for details.
