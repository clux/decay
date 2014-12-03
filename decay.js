// decaying

/**
 * Reddit's hot sort
 * (popularized by reddit's news ranking)
 * http://amix.dk/blog/post/19588
 * Corrected for decay errors in post
 */
exports.redditHot = function (decay) {
  if (decay == null) {
    decay = 45000;
  }
  return function (ups, downs, date) {
    var s = ups - downs
      , order = Math.log(Math.max(Math.abs(s), 1)) / Math.LN10
      , secAge = (Date.now() - date.getTime()) / 1000;
    return order - secAge / decay;
  };
};

/**
 * Hackernews' hot sort
 * http://amix.dk/blog/post/19574
 */
exports.hackerHot = function (gravity) {
  if (gravity == null) {
    gravity = 1.8;
  }
  return function (votes, itemDate) {
    var hourAge = (Date.now() - itemDate.getTime()) / (1000 * 3600);
    return (votes - 1) / Math.pow(hourAge + 2, gravity);
  };
};

// non-decaying

/**
 * Wilson score interval sort
 * (popularized by reddit's best comment system)
 * http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
 */
exports.wilsonScore = function (z) {
  if (z == null) {
    // z represents the statistical confidence
    // z = 1.0 => ~69%, 1.96 => ~95% (default)
    z = 1.96;
  }

  return function (ups, downs) {
    var n = ups + downs;
    if (n === 0) {
      return 0;
    }

    var p = ups / n
      , zzfn = z*z / (4*n);
    return (p + 2*zzfn - z*Math.sqrt((zzfn / n + p*(1 - p))/n)) / (1 + 4*zzfn);
  };
};
