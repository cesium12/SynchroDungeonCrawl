var Consts = require('../consts');
var Data = require('../data');

/** 
 * Return +/-1, indicating the y increment towards the enemy.
 * origin: a Coordinates
 * returns: +/-1
 */
exports.Orient = function(origin) {
  return origin.y > 0 ? -1 : 1;
}

/** 
 * Returns a vertical line pointed towards the enemy, e.g. (3, o) ->
 *    x
 *    x
 *    x
 *    o
 * depth: integer, the maximum length of the line
 * origin: Coordinate, the source of the line
 * returns: [Coordinates], all affected squares
 */
exports.Vertical = function(depth, origin) {
  var ret = [];
  for (var i = 1; i <= depth; ++i) {
    var y = origin.y + Consts.BATTLE_STEP * Orient(origin.y) * i;
    if (abs(y) > Consts.BATTLE_MAX_Y)
      break;
    ret.push(new Data.Coordinates(origin.x, y));
  }
  return ret;
}