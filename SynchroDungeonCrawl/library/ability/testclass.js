// Require something here? If I know this directory is going to get
// crawled, do something else entirely? Should I provide lists of args
// suitable for a .call? Can we have a processor pick this apart, knowing
// everything that isn't name/uid/keywords is an override? Should Action
// be rewritten?

// Ugh, we need Util available here too. This is a headache.

exports.ShoopDaWhoop = {
  name: 'Shoop da Whoop',
  uid: 'TEST_CLASS__SHOOP_DA_WHOOP',
  keywords: {'spell': true},
  
  getTargetSquares: function(bat, ownerUID, PLO) {
    return Util.Targeting.Vertical(6, bat.getLocation(ownerUID));
  },
  
  getTargetArea: function(bat, ownerUID, targetSquare) {
    // Target your entire range. Piercing!
    return Util.Targeting.Vertical(6, bat.getLocation(ownerUID));
  },
  
  createActions: function(bat, ownerUID, PLO, targetSquares) {
    var int = bat.getStatWithEffects(ownerUID, 'int');
    var dam = new Value(10 + 2 * int.get());
    Util.Action.ForEachUnitInArea(bat, targetSquares, function(unit) {
        bat.enqueueActions(new Action(bat, 
                           ownerUID, unit, Abil.ShoopDaWhoop.UID, 
                           {energy: true}, {damage: dam});
      }, bat.getUnit(ownerUID).unit.faction);
    }
  }
}
