/* Thần Giới — transitional world-state context.
 * Holds references to the live simulation state behind one DOM-free API.
 * The legacy globals remain in place during the staged migration.
 */
(function(root){
  'use strict';
  const REQUIRED=['T','O','X','RV','W','CD','BL','RD','cfg'];
  function createWorldContext(){
    let state=null,revision=0;
    function requireState(){if(!state)throw new Error('World state has not been attached');return state}
    function validate(next){
      if(!next||typeof next!=='object')throw new TypeError('A world state object is required');
      for(const key of REQUIRED)if(!(key in next))throw new TypeError('World state is missing '+key);
      if(!next.W||typeof next.W!=='object'||!Array.isArray(next.W.ks))throw new TypeError('World metadata is invalid');
      const n=Number(next.n);
      if(!Number.isInteger(n)||n<1||!next.T||!next.O||next.T.length!==n*n||next.O.length!==n*n)throw new RangeError('World map dimensions are invalid');
      return next;
    }
    return Object.freeze({
      attach(next){state=validate(next);revision++;return revision},
      getState(){return requireState()},
      read(key){const current=requireState();if(!(key in current))throw new RangeError('Unknown world state field: '+key);return current[key]},
      getKingdom(id){const index=Number(id)-1;if(!Number.isInteger(index)||index<0)return undefined;return requireState().W.ks[index]},
      setKingdomStat(id,field,value){const kingdom=this.getKingdom(id),amount=Number(value);if(!kingdom)throw new RangeError('Kingdom does not exist');if(typeof field!=='string'||!Object.prototype.hasOwnProperty.call(kingdom,field)||typeof kingdom[field]!=='number')throw new TypeError('Kingdom field must be an existing numeric stat');if(!Number.isFinite(amount))throw new TypeError('Kingdom stat must be finite');kingdom[field]=amount;revision++;return amount},
      setEconomyStat(id,field,value){const kingdom=this.getKingdom(id),economy=kingdom&&kingdom.econ,amount=Number(value),newFields=['monthlyIncome','monthlyExpense','monthlyNet'];if(!kingdom)throw new RangeError('Kingdom does not exist');if(!economy||typeof economy!=='object'||Array.isArray(economy))throw new TypeError('Kingdom economy is not initialized');if(typeof field!=='string'||!(Object.prototype.hasOwnProperty.call(economy,field)&&typeof economy[field]==='number')&& !newFields.includes(field))throw new TypeError('Economy field must be a supported numeric stat');if(!Number.isFinite(amount))throw new TypeError('Economy stat must be finite');economy[field]=amount;revision++;return amount},
      getKingdoms(){return requireState().W.ks},
      getLivingKingdoms(){return requireState().W.ks.filter(kingdom=>kingdom&&kingdom.alive)},
      getTerrain(index){const current=requireState(),i=Number(index);return Number.isInteger(i)&&i>=0&&i<current.n*current.n?Number(current.T[i])||0:0},
      getTerrainVariant(index){const current=requireState(),i=Number(index);return Number.isInteger(i)&&i>=0&&i<current.n*current.n?Number(current.X[i])||0:0},
      hasRiver(index){const current=requireState(),i=Number(index);return Number.isInteger(i)&&i>=0&&i<current.n*current.n?!!current.RV[i]:false},
      setTerrain(index,terrain,variant,river){const current=requireState(),i=Number(index),type=Number(terrain),v=variant===undefined?0:Number(variant),r=river===undefined?0:Number(river);if(!Number.isInteger(i)||i<0||i>=current.n*current.n)throw new RangeError('Terrain tile index is out of range');if(!Number.isInteger(type)||type<0||type>6)throw new TypeError('Terrain type must be an integer from 0 to 6');if(!Number.isInteger(v)||v<0||v>255||!(r===0||r===1||r===false||r===true))throw new TypeError('Terrain variant or river flag is invalid');current.T[i]=type;current.X[i]=v;current.RV[i]=r?1:0;if(type<2)current.O[i]=0;revision++;return {terrain:type,variant:v,river:!!r}},
      getOwner(index){const current=requireState(),i=Number(index);if(!Number.isInteger(i)||i<0||i>=current.n*current.n)return 0;return Number(current.O[i])||0},
      getBuildings(){return requireState().BL},
      addBuilding(building){const current=requireState();if(!building||typeof building!=='object'||!Number.isInteger(Number(building.i))||Number(building.i)<0||Number(building.i)>=current.n*current.n||typeof building.t!=='string')throw new TypeError('A valid building record is required');current.BL.push(building);revision++;return building},
      removeBuilding(building){const current=requireState(),index=current.BL.indexOf(building);if(index<0)return false;current.BL.splice(index,1);revision++;return true},
      removeBuildingsAt(index){const current=requireState(),i=Number(index);if(!Number.isInteger(i)||i<0||i>=current.n*current.n)throw new RangeError('Building tile index is out of range');const before=current.BL.length;current.BL=current.BL.filter(building=>building.i!==i);const removed=before-current.BL.length;if(removed)revision++;return removed},
      replaceBuildings(buildings){const current=requireState();if(!Array.isArray(buildings))throw new TypeError('Buildings must be an array');for(const building of buildings)if(!building||typeof building!=='object'||!Number.isInteger(Number(building.i))||Number(building.i)<0||Number(building.i)>=current.n*current.n||typeof building.t!=='string')throw new TypeError('A valid building record is required');current.BL=buildings;revision++;return current.BL},
      setOwner(index,kingdomId){const current=requireState(),i=Number(index),owner=Number(kingdomId);if(!Number.isInteger(i)||i<0||i>=current.n*current.n)throw new RangeError('Owner tile index is out of range');if(!Number.isInteger(owner)||owner<0)throw new TypeError('Kingdom owner must be a non-negative integer');current.O[i]=owner;revision++;return owner},
      getResource(index){const current=requireState(),i=Number(index);if(!Number.isInteger(i)||i<0||i>=current.n*current.n)return 0;return Number(current.W.oil?.[i])||0},
      setResource(index,value){const current=requireState(),i=Number(index),amount=Number(value);if(!Number.isInteger(i)||i<0||i>=current.n*current.n)throw new RangeError('Resource tile index is out of range');if(!Number.isFinite(amount))throw new TypeError('Resource amount must be finite');if(!Array.isArray(current.W.oil)&&!ArrayBuffer.isView(current.W.oil))current.W.oil=new Array(current.n*current.n).fill(0);current.W.oil[i]=amount;revision++;return amount},
      adjustResource(index,delta){const amount=Number(delta);if(!Number.isFinite(amount))throw new TypeError('Resource adjustment must be finite');return this.setResource(index,this.getResource(index)+amount)},
      write(key,value){const current=requireState();if(!(key in current))throw new RangeError('Unknown world state field: '+key);current[key]=value;revision++;return revision},
      getRevision(){return revision},
      isAttached(){return state!==null}
    });
  }
  root.ThanhGioiWorldContext=createWorldContext;
})(typeof globalThis!=='undefined'?globalThis:this);
