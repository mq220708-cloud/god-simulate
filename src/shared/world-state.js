/* Thần Giới — versioned world-state serialization boundary.
 * This module intentionally has no DOM, browser UI, or simulation side effects.
 * It wraps the current legacy state shape so extraction can happen incrementally.
 */
(function(root){
  'use strict';
  const FORMAT='than-gioi-world';
  const SCHEMA_VERSION=1;
  function validateState(state){
    if(!state||typeof state!=='object')throw new TypeError('World state must be an object');
    if(!Array.isArray(state.T)||!Array.isArray(state.O))throw new TypeError('World map arrays are missing');
    const size=Number(state.n);
    if(!Number.isInteger(size)||size<1||state.T.length!==size*size||state.O.length!==size*size)throw new RangeError('World map dimensions are invalid');
    if(!state.W||typeof state.W!=='object'||!Array.isArray(state.W.ks))throw new TypeError('World simulation data is invalid');
    return state;
  }
  function serialize(state){
    validateState(state);
    return {format:FORMAT,schemaVersion:SCHEMA_VERSION,savedAt:Date.now(),state};
  }
  function deserialize(payload){
    if(!payload||typeof payload!=='object')throw new TypeError('Save data is empty');
    // Existing v1.6.x saves are plain state objects; retain backward compatibility.
    const state=payload.format===FORMAT?payload.state:payload;
    if(payload.format===FORMAT&&payload.schemaVersion>SCHEMA_VERSION)throw new RangeError('Save data was created by a newer version');
    return validateState(state);
  }
  root.ThanhGioiWorldState=Object.freeze({format:FORMAT,schemaVersion:SCHEMA_VERSION,serialize,deserialize,validateState});
})(typeof globalThis!=='undefined'?globalThis:this);
