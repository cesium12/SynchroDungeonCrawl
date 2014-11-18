/**
 * Action: The unit of execution in a battle. May do one or more of 
 * adding Effects to the battle, moving Units, or causing damage.
 * battle: Battle, the current battle
 * sourceUnitUID: key, the UID of the unit responsible for this Action
 * target: either key or [Coordinates], the affected area
 * causeSequentialUID: integer, the parent Action of this Action
 * keywords: {string: arbitrary}, any additional user or mechanics data
 * params: configuration parameters for the action
 * Params supports any of the following:
 *   effects: [Effect], effects to be added to the battle or units therein
 *   movementVector: [Coordinates], a displacement to create. Must target a UID.
 *   damage: Value, the damage to inflict. Must target a UID.
 *   validator: f(Effect, string)->bool, a function that returns whether or not a
 *     given Effect should be applied for a given trigger phase.
 */
 
function Action(battle, sourceUnitUID, target, causeSequentialID,
                keywords, params) {
  this.sequentialUID = bat.getNextSequentialID();
  this.sourceUnitUID = sourceUnitUID;
  this.target = target;
  this.causeSequentialUID = causeSequentialUID;
  this.keywords = (typeof keywords === "undefined") ? {} : keywords;                
}

module.exports = Action;