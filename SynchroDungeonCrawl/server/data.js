/**
 * Coordinates: Stores X and Y. Pretty dumb, but it's packaged,
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

/**
 * Resource: A container for a unit's resource. Contains a value
 * and display information, and possibly a max.
 * amount: integer, the current value of the resource
 * displayInfo: TODO(cesium)
 * params: supports any of the following:
 *   max: number, resource maximum value, default no limit
 *   min: number, resource minimum value, default zero, null means no limit
 */
function Resource(amount, displayInfo, params) {
  this.amount = amount;
  this.displayInfo = displayInfo;
  this.params = (typeof params === "undefined") ? {} : params;
  if (typeof this.params.min === "undefined") {
    this.params.min = 0;
  }
}

/**
 * Spends (positive input) or recovers (negative input) a resource,
 * clipping the result to acceptable values.
 * amount: number, the amount by which to reduce the resource
 */
Resource.prototype.spend(amount) {
  this.amount -= amount;
  if (this.params.max && this.amount > this.params.max) {
    this.amount = this.params.max;
  } else if (this.params.min && this.amount < this.params.min) {
    this.amount = this.params.min;
  }
}

// DISPLAY INFO FUNCTIONALITY GOES HERE

export.Resource = Resource;
