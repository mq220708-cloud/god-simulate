/* Thần Giới — simulation execution boundary.
 * This module is deliberately DOM-free. The legacy simulation callback is
 * injected by the browser host until domain state/effects are fully extracted.
 */
(function(root){
  'use strict';
  function createSimulationEngine(simulateTick){
    if(typeof simulateTick!=='function')throw new TypeError('A simulation tick callback is required');
    let ticking=false,tickCount=0;
    return Object.freeze({
      tick(){
        if(ticking)throw new Error('Re-entrant simulation tick rejected');
        ticking=true;
        try{
          const result=simulateTick();
          tickCount++;
          return result;
        }finally{ticking=false}
      },
      getTickCount(){return tickCount},
      isTicking(){return ticking}
    });
  }
  root.ThanhGioiSimulation=createSimulationEngine;
})(typeof globalThis!=='undefined'?globalThis:this);
