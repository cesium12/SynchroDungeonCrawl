/**
 * Fan out a callback to each 
 * bat: Battle, the current battle.
 * targetSquares: [Coordinate], the area to check for units
 * callback: f(key), a function to be called on each UID found. This will generally
 *    enqueue an Action involving that unit.
 * ignoreFaction: Consts.ENEMY_SIDE or Consts.ALLY_SIDE, a faction to which
 *    this action should *not* apply.
 */
exports.ForEachUnitInArea = function(bat, targetSquares, callback, ignoreFaction) {
  for (var ii = 0; ii < targetSquares.length; ii++) {
    var square = squares[ii];
    var unit = bat.getUnitAt(square);
    if (unit && (isUndefined(ignoreFaction) || 
                 unit.unit.faction != ignoreFaction)) {
      callback(unit.unit.UID);
    }
  }
}