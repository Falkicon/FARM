var PARAM_KEY = "viewport";
var modern = { [PARAM_KEY]: { value: void 0, isRotated: false } };
var legacy = { viewport: "reset", viewportRotated: false };
var initialGlobals = FEATURES?.viewportStoryGlobals ? modern : legacy;
export {
  initialGlobals
};
