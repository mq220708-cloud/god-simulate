(function(root){
  'use strict';
  function createSimulationEffects(){
    const listeners=new Set();
    return Object.freeze({
      subscribe(listener){
        if(typeof listener!=='function')throw new TypeError('An effect listener is required');
        listeners.add(listener);
        return ()=>listeners.delete(listener);
      },
      emit(effect){
        if(!effect||typeof effect!=='object'||typeof effect.type!=='string')throw new TypeError('A typed simulation effect is required');
        for(const listener of Array.from(listeners))listener(effect);
      },
      listenerCount(){return listeners.size}
    });
  }
  root.ThanhGioiSimulationEffects=createSimulationEffects();
})(typeof globalThis!=='undefined'?globalThis:this);
