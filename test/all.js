var assert = require('assert')
  , decay = require('../decay');

/**
 * Tests basic reasonable assumptions:
 *
 * If upvotes increase, the score increases
 * If downvotes (if applicable) increases, the score decreases
 * If dates decrease, the score decreases
 * Certain instantiation parameters give a higher score than others
 */

exports['test wilsonScore'] = function () {
  var s1 = decay.wilsonScore(1)
    , s2 = decay.wilsonScore(2);

  assert.ok(s1(5, 0) > s1(4, 0), "upvotes good");
  assert.ok(s1(5, 3) < s1(5, 2), "downvotes bad");

  assert.ok(s1(10, 2), s2(10, 2), "higher confidence means lowers bounds");
  console.log('wilsonScore ok');
};


// decaying algorithms need some dates
var d1 = new Date();
var d2 = new Date();
d1.setTime(d1.getTime() - 1 * 60 * 1000); // turn back one minute
d2.setTime(d2.getTime() - 61 * 60 * 1000); // turn back one hour extra


exports['test redditHot'] = function () {
  var s = decay.redditHot();

  assert.ok(s(10, 2, d1) > s(9, 2, d1), "upvotes good");
  assert.ok(s(10, 3, d1) < s(10, 2, d1), "downvotes bad");

  assert.ok(s(5, 1, d1) < s(5, 1, new Date()), "freshmeat good");

  assert.ok(s(5, 1, d1) > s(5, 1, d2), "age causes decays");

  var h = decay.redditHot(20000); // lower number => faster decay
  assert.ok(h(5, 1, d1) < s(5, 1, d1), "faster decay => slightly lower numbers early on");
  console.log('redditHot ok');
};

exports['test hackerHot'] = function () {
  var s = decay.hackerHot();

  assert.ok(s(10, d1) > s(9, d1), "upvotes good");

  assert.ok(s(10, d1) < s(10, new Date()), "freshmeat good");

  assert.ok(s(5, d1) > s(5, d2), "age causes decays");

  var h = decay.hackerHot(3); // more gravity => faster decay
  assert.ok(h(5, d1) < s(5, d1), "more gravity => slightly lower numbers in score early on");
  console.log('hackerHot ok');
};
