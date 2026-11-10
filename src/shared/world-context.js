/* Thần Giới — transitional world-state context.
 * Holds references to the live simulation state behind one DOM-free API.
 * The legacy globals remain in place during the staged migration.
 */
(function(root){
  'use strict';
  const REQUIRED=['T','O','X','RV','W','CD','BL','RD','cfg'];
  function createWorldContext(){
    let state=null,revision=0;
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
      getState(){if(!state)throw new Error('World state has not been attached');return state},
      read(key){const current=this.getState();if(!(key in current))throw new RangeError('Unknown world state field: '+key);return current[key]},
      write(key,value){const current=this.getState();if(!(key in current))throw new RangeError('Unknown world state field: '+key);current[key]=value;revision++;return revision},
      getRevision(){return revision},
      isAttached(){return state!==null}
    });
  }
  root.ThanhGioiWorldContext=createWorldContext;
})(typeof globalThis!=='undefined'?globalThis:this);
