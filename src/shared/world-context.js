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
      getKingdoms(){return requireState().W.ks},
      getLivingKingdoms(){return requireState().W.ks.filter(kingdom=>kingdom&&kingdom.alive)},
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
