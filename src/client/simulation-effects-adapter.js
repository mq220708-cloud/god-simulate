/* Thần Giới — browser-side adapter for simulation effects.
 * The shared simulation emits data-only events; this module routes them to
 * injected presentation callbacks without importing DOM or game globals.
 */
(function(root){
  'use strict';
  function createSimulationEffectsAdapter(options){
    if(!options||!options.effects||typeof options.effects.subscribe!=='function')throw new TypeError('A simulation effects bus is required');
    const handlers=options.handlers||{};
    const supported=['notification','ideology-choice-required','roleplay-game-over'];
    const off=options.effects.subscribe(effect=>{
      if(!effect||!supported.includes(effect.type))return;
      const handler=handlers[effect.type];
      if(typeof handler==='function')handler(effect);
    });
    let disposed=false;
    return Object.freeze({
      dispose(){
        if(disposed)return;
        disposed=true;
        if(typeof off==='function')off();
      },
      isDisposed(){return disposed}
    });
  }
  root.ThanhGioiSimulationEffectsAdapter=createSimulationEffectsAdapter;
})(typeof globalThis!=='undefined'?globalThis:this);
