/**
 * Geometry
 */
 
exports.BATTLE_MAX_X = 4;
exports.BATTLE_MIN_Y = -5;
exports.BATTLE_MAX_Y = 5;
exports.BATTLE_STEP = 2;

exports.BATTLE_WIDTH = (BATTLE_MAX_X - BATTLE_MIN_X) / BATTLE_STEP + 1;
exports.BATTLE_DEPTH = (BATTLE_MAX_Y - BATTLE_MIN_Y) / BATTLE_STEP + 1;
exports.BATTLE_SIDE_DEPTH = BATTLE_DEPTH / 2;

exports.ENEMY_SIDE = 1;
exports.ALLY_SIDE = -1;