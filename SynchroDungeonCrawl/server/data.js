/**
 * Coordinate: Stores X and Y. Pretty dumb, but it's packaged,
 * which is the right way to think about it.
 */
function Coordinates(x, y) {
  this.x = x;
  this.y = y;
}

Coordinates.prototype.toString = function() {
  return String(this.x) + "," + String(this.y);
}

exports.Coordinates = Coordinates;

/**
 * Value: Stores an additive and multiplicative part of a value,
 * allowing you to do order-independent calculations. You can get()
 * the final value.
 */

function Value(add, mul) {
  this.add = (typeof add === "undefined") ? 0 : add;
  this.mul = (typeof mul === "undefined") ? 1 : mul;
}

Value.prototype.get = function() {
  return this.add * this.mul;
}

/** 
 * Combine several values, adding the additive parts and multiplying the
 * multiplicative parts, and return a new Value.
 * values: [Value]
 * returns: Value
 */
Value.foldValues = function(values) {
  var add = 0, mul = 1;
  for (value in values) {
    add += value.add;
    mul *= value.mul;
  }
  return new Value(add, mul);
}

exports.Value = Value;