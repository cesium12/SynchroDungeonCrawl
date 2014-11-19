var Consts = require('./consts.js');
var Data = require('./data.js');

// This will come up a lot
var Value = Data.Value;

/**
 * Battle uses its own data structure for Units internally.
 * A _BattleUnit is a map with:
 *  unit: Unit
 *  coordinates: Coordinates
 *  abilities: { UID: Ability }
 *  effects: { UID: Effect }
 */

/**
 * Battle: The whole battle. Manages units, executes piles of actions,
 * generally makes the magic happen.
 * allyStarts: [{unit: Unit, coordinates: Coordinates}]
 * enemyStarts: [{unit: Unit, coordinates: Coordinates}]
 */
 Battle = function(allyStarts, enemyStarts) {
  this.sequentialID_ = 0; // If you exceed MAXINT, you need to write shorter battles.
  this.actionQueue_ = [];

  this.allies = {}
  for (var ii = 0; ii < allyStarts.size; ii++) {
    var allyStart = allyStarts[ii];
    this.allies[ally.UID] = { 'unit': allyStart.unit, 'abilities': {}, 'effects': {},
                              'coordinates': allyStart.coordinates };
  }

  this.enemies = {}
  for (var ii = 0; ii < enemyStarts.size; ii++) {
    var enemyStart = enemyStarts[ii];
    this.enemies[enemy.UID] = { 'unit': enemyStart.unit, 'abilities': {}, 
                                'effects': {}, 
                                'coordinates': enemyStart.coordinates };
  }

  // Also, make positioning available the other way
  this.coordinates = {}
  this.forEachUnit(function(unit) {
    this.coordinates[[unit.x, unit.y]] = unit;
  }
  
  // Set up the battle

  this.forEachUnit(function(unit) {
    // We have not yet installed the abilities in the unit - unit.unit.abilities
    for (ability in unit.abilities) {
      Abilities[ability.UID].onBattleSetup(this, unit.UID, ability.PLO);
    }
    if (unit.unit.equipment) { // only applies to player units, but…
      for (ability in unit.unit.equipment.abilities) {
        Abilities[ability.UID].onBattleSetup(this, unit.unit.UID, ability.PLO);
      }
    }
    });

  this.globalEffects = {};

  // The battle is now set up. Wait, we have a trigger for that!
  this.forEachUnit(function(unit) {
    // The unit has a unit part, an ability part, an effect part...
    for (ability in unit.abilities) {
      this.enqueueActions(Abilities[ability.UID].onBattleStart(this, unit.unit.UID,
                                                               ability.PLO);
    }
    });

  this.ARC();  
}

/**
 * Executes a callback over each unit in the battle.
 * If a faction ID is provided, only that side is affected.
 * callback: f(_BattleUNit)->void, function to call on each unit.
 * factionID: Consts.ALLY_SIDE or Consts.ENEMY_SIDE.
 */
Battle.prototype.forEachUnit(callback, factionID) {
  if ((typeof factionID === "undefined") || factionID == Consts.ALLY_SIDE) { 
    for (ally in this.allies) {
      callback(ability);
    }
  }
  if ((typeof factionID === "undefined") || factionID == Consts.ENEMY_SIDE) { 
    for (enemy in this.enemies) {
      callback(ability);
    }
  }
}

/**
 * Adds Actions to the current ARC, or the next ARC if there's not one
 * currently being processed.
 * actions: [Action], the Actions to add.
 */
Battle.prototype.enqueueActions(actions) {
  for (action in actions) {
    this.actionQueue_.push(action);
  }
}

/**
 * Returns the next sequential ID suitably for use by an Action.
 * returns: number
 */
Battle.prototype.getNextSequentialID() {
  this.sequentialID_++;
  return this.sequentialID_;
}

/**
 * Returns the unit at a particular Coordinates, or null.
 * coords: Coordinates, the location to search.
 * returns: _BattleUnit or null.
 */
Battle.prototype.getUnitAt(coords) {
  if (this.coordinates[coords])
    return this.coordinates[coords];
  return null;
}

/**
 * Returns the unit associated with a particular UID, or null.
 * uid: UID, the unit to search for.
 * returns: _BattleUnit or null.
 */
Battle.prototype.getUnit(uid) {
  if (allies[uid]) return allies[uid];
  if (enemies[uid]) return enemies[uid];
  return null;
}

/**
 * Collects a list of Effects that may reply to a particular trigger.
 * ids: [UID], a list of unit UIDs to check for effects in addition to checking
 *     the global effect space.
 * validator: f(Effect, string phase)->bool, an optional function to determine
 *     which Effects apply. If null, all Effects apply.
 * phase: string, the trigger response phase. For example, 'onMove'
 * returns: [Effect]
 */
Battle.prototype.gatherEffects(ids, validator, phase) {
  ret = []
  for (effect in this.globalEffects) {
    if (!validator || validator(effect, phase)) {
      ret.push(effect);
    }
  }

  var usedIDs = {}
  for (var ii = 0; ii < ids.length; ii++) {
    var id = ids[ii];
    if (usedIDs[id]) {
      continue;
    }
    usedIDs[id] = true;
    for (effect in this.getUnit(id).effects) {
      if (!validator || validator(effect, phase)) {
        ret.push(effect);
      }
    }
  }
  return ret;
}

/**
 * Returns a named stat for a unit UID, including all effects (or just
 * those that pass a supplied filter).
 * ownerUID: UID, the unit that owns the stat.
 * statName: string, the name of the stat to search for.
 * validator: f(Effect, string phase)->bool, an optional function to determine
 *     which Effects apply. If null, all Effects apply.
 */
Battle.prototype.getStat(ownerUID, statName, validator) {
  var unit = this.getUnit(uid);
  // get raw value from unit
  var statMods = [new Value(unit.unit.stats.statName)];
  var effects = this.gatherEffects([ownerUID], validator, 'getStat');
  for (effect in effects) {
    var mod = effect.getStat(this, ownerUID, statName);
    if (mod) effects.push(mod);
  }
  return Value.foldValues(statMods);
}

/**
 * Executes the damage-dealing component of an Action, if any.
 * action: Action, the action to execute
 */
Battle.performDamage(action) {
  if (isUndefined(action.damage)) {
    return;
  }

  var modDamages = [action.damage];
  var effects = this.gatherEffects([action.sourceUnitUID, action.target],
                                   action.validator, 'onHit');
  for (effect in effects) {
    this.enqueueActions(effect.onHit(this, action));    
  }
  var effects = this.gatherEffects([action.sourceUnitUID, action.target],
                                   action.validator, 'onComputeDamage');
  for (effect in effects) {
    var mod = effect.onComputeDamage(this, action);
    if (mod) modDamages.push(mod);
  }
  var finalDamage = Value.foldValues(modDamages);
  // Now react to and deal the *final* damage
  if (finalDamage.get()) {
    var effects = this.gatherEffects([action.sourceUnitUID, action.target],
                                     action.validator, 'onDealDamage');
    for (effect in effects) {
      this.enqueueActions(effect.onDealDamage(this, action, finalDamage));
    }
    this.getUnit(action.target).unit.resources.hp.current -=
      finalDamage.get();
  }
}

/**
 * Check for and clear dead units (HP <= 0). This must be done as part of an ARC,
 * since it may enqueue Actions.
 */
Battle.prototype.checkDeath() {
  // TODO: ACTUALLY CHECK FOR DEATH
}

/**
 * Execute an Action Resolution Cycle.
 * 1. Generate Effects from all pending Actions.
 * 2. Compute but do not apply movement from all pending Actions.
 * 3. Deal damage from all pending Actions.
 * 4. Apply movement from all pending Actions.
 * 5. Check death. 
 * If any new Actions were generated by any of these steps, start over.
 */
Battle.prototype.ARC() {
  while (this.actionQueue_) {
    var simultaneityGroup = this.actionQueue_;
    var movementVectors = {};
    this.actionQueue_ = [];
    Util.shuffle(simultaneityGroup);
    // ** Effect step **
    for (var ii = 0; ii < simultaneityGroup.length; ii++) {
      var action = simultaneityGroup[ii];
      var newEffects = action.effects;
      for (var jj = 0; jj < newEffects.length; jj++) {
        var newEffect = newEffects[jj];
        if newEffect.isGlobal {
          newEffect.collide(this.globalEffects); // It can inspect the dict however it likes
          this.globalEffects[newEffect.UID] = newEffect; // ALWAYS INSTALLS - absorb when merging
        } else {
          newEffect.collide(this.getUnit(action.target).effects); // As above
          this.getUnit(action.target).effects[newEffect.UID] = newEffect;
        }
      }
    }

    // ** Movement computation step **
    for (var ii = 0; ii < simultaneityGroup.length; ii++) {
      var action = simultaneityGroup[ii];
      var vector = action.movementVector;
      if (vector) {
        if (movementVectors[action.target]) {
          movementVectors[action.target].push(vector);
        } else {
          movementVectors[action.target] = [vector];
        }
      }
    }
    // Sum vectors
    for (key in movementVectors) {
      movementVectors[key] = Util.foldMovement(movementVectors[key]);
    }

    // ** Damage step **

    for (var ii = 0; ii < simultaneityGroup.length; ii++) {
      var action = simultaneityGroup[ii];
      if (action.damage) {
        this.performDamage(action);
    }

   // ** Death step **
   this.checkDeath();

   // ** Movement application step **
    // TODO: Do movement with effects and bouncing and stuff
  }
}

exports.Battle = Battle;