const decay = require('..');
const test = require('bandage');

/**
 * Tests basic reasonable assumptions:
 *
 * If upvotes increase, the score increases
 * If downvotes (if applicable) increases, the score decreases
 * If dates decrease, the score decreases
 * Certain instantiation parameters give a higher score than others
 */

test('wilsonScore', function *(t) {
  const s1 = decay.wilsonScore(1)
      , s2 = decay.wilsonScore(2)
      , s3 = decay.wilsonScore();

  t.ok(s1(5, 0) > s1(4, 0), 'upvotes good');
  t.ok(s1(5, 3) < s1(5, 2), 'downvotes bad');

  t.ok(s1(10, 2) > s2(10, 2), 'higher confidence means lowers bounds');

  t.equal(s3(0, 0), 0, 'no votes gives a zero');
  t.ok(s3(0, 100000) > 0, 'scores always > 0 (even if all downvotes)');
  t.ok(s3(1000000, 0) < 1, 'and always less than 1');
});


// decaying algorithms need some dates
const d1 = new Date();
const d2 = new Date();
d1.setTime(d1.getTime() - 1 * 60 * 1000); // turn back one minute
d2.setTime(d2.getTime() - 61 * 60 * 1000); // turn back one hour extra

test('redditHot', function *(t) {
  const hot = decay.redditHot();

  t.ok(hot(10, 2, d1) > hot(9, 2, d1), 'upvotes good');
  t.ok(hot(10, 3, d1) < hot(10, 2, d1), 'downvotes bad');

  t.ok(hot(5, 1, d1) < hot(5, 1, new Date()), 'fresher post good');

  t.ok(hot(5, 1, d1) > hot(5, 1, d2), 'age causes decay');

  t.ok(hot(5, 2, d1) > hot(1, 5, d2), 'sign sanity');

  const hotLow = decay.redditHot(20000); // lower number => faster decay
  t.ok(hotLow(5, 1, d1) < hot(5, 1, d1), 'faster decay => slightly lower numbers early on');
});

test('hackerHot', function *(t) {
  const hhot = decay.hackerHot();

  t.ok(hhot(10, d1) > hhot(9, d1), 'upvotes good');
  t.ok(hhot(10, d1) < hhot(10, new Date()), 'fresher post good');
  t.ok(hhot(5, d1) > hhot(5, d2), 'age causes decay');

  var hhothigh = decay.hackerHot(3); // more gravity => faster decay
  t.ok(hhothigh(5, d1), hhot(5, d1), 'more gravity => slightly lower numbers in score early on');
});
