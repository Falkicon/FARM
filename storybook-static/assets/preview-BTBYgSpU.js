import { d as dedent } from "./index-DntBg4sS.js";
const { useEffect, useMemo } = __STORYBOOK_MODULE_PREVIEW_API__;
const { global } = __STORYBOOK_MODULE_GLOBAL__;
const { logger } = __STORYBOOK_MODULE_CLIENT_LOGGER__;
var PARAM_KEY = "backgrounds";
var DEFAULT_BACKGROUNDS = { light: { name: "light", value: "#F8F8F8" }, dark: { name: "\
dark", value: "#333" } };
var { document, window } = global;
var isReduceMotionEnabled = () => !!window?.matchMedia("(prefers-reduced-motion:\
 reduce)")?.matches;
var clearStyles = (selector) => {
  (Array.isArray(selector) ? selector : [selector]).forEach(clearStyle);
};
var clearStyle = (selector) => {
  let element = document.getElementById(selector);
  element && element.parentElement?.removeChild(element);
};
var addGridStyle = (selector, css) => {
  let existingStyle = document.getElementById(selector);
  if (existingStyle) existingStyle.innerHTML !== css && (existingStyle.innerHTML =
  css);
  else {
    let style = document.createElement("style");
    style.setAttribute("id", selector), style.innerHTML = css, document.head.appendChild(
    style);
  }
};
var addBackgroundStyle = (selector, css, storyId) => {
  let existingStyle = document.getElementById(selector);
  if (existingStyle) existingStyle.innerHTML !== css && (existingStyle.innerHTML =
  css);
  else {
    let style = document.createElement("style");
    style.setAttribute("id", selector), style.innerHTML = css;
    let gridStyleSelector = `addon-backgrounds-grid${storyId ? `-docs-${storyId}` :
    ""}`, existingGridStyle = document.getElementById(gridStyleSelector);
    existingGridStyle ? existingGridStyle.parentElement?.insertBefore(style, existingGridStyle) :
    document.head.appendChild(style);
  }
};
var defaultGrid = { cellSize: 100, cellAmount: 10, opacity: 0.8 };
var BG_SELECTOR_BASE = "addon-backgrounds";
var GRID_SELECTOR_BASE = "addon-backgrounds-grid";
var transitionStyle = isReduceMotionEnabled() ? "" : "transition: background-col\
or 0.3s;";
var withBackgroundAndGrid = (StoryFn, context) => {
  let { globals, parameters: parameters2, viewMode, id } = context, { options = DEFAULT_BACKGROUNDS,
  disable, grid = defaultGrid } = parameters2[PARAM_KEY] || {}, data = globals[PARAM_KEY] ||
  {}, backgroundName = data.value, item = backgroundName ? options[backgroundName] :
  void 0, value = item?.value || "transparent", showGrid = data.grid || false, shownBackground = !!item &&
  !disable, backgroundSelector = viewMode === "docs" ? `#anchor--${id} .docs-sto\
ry` : ".sb-show-main", gridSelector = viewMode === "docs" ? `#anchor--${id} .doc\
s-story` : ".sb-show-main", isLayoutPadded = parameters2.layout === void 0 || parameters2.
  layout === "padded", defaultOffset = viewMode === "docs" ? 20 : isLayoutPadded ?
  16 : 0, { cellAmount, cellSize, opacity, offsetX = defaultOffset, offsetY = defaultOffset } = grid,
  backgroundSelectorId = viewMode === "docs" ? `${BG_SELECTOR_BASE}-docs-${id}` :
  `${BG_SELECTOR_BASE}-color`, backgroundTarget = viewMode === "docs" ? id : null;
  useEffect(() => {
    let backgroundStyles = `
    ${backgroundSelector} {
      background: ${value} !important;
      ${transitionStyle}
      }`;
    if (!shownBackground) {
      clearStyles(backgroundSelectorId);
      return;
    }
    addBackgroundStyle(backgroundSelectorId, backgroundStyles, backgroundTarget);
  }, [backgroundSelector, backgroundSelectorId, backgroundTarget, shownBackground,
  value]);
  let gridSelectorId = viewMode === "docs" ? `${GRID_SELECTOR_BASE}-docs-${id}` :
  `${GRID_SELECTOR_BASE}`;
  return useEffect(() => {
    if (!showGrid) {
      clearStyles(gridSelectorId);
      return;
    }
    let gridSize = [`${cellSize * cellAmount}px ${cellSize * cellAmount}px`, `${cellSize *
    cellAmount}px ${cellSize * cellAmount}px`, `${cellSize}px ${cellSize}px`, `${cellSize}\
px ${cellSize}px`].join(", "), gridStyles = `
        ${gridSelector} {
          background-size: ${gridSize} !important;
          background-position: ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}\
px, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px !important;
          background-blend-mode: difference !important;
          background-image: linear-gradient(rgba(130, 130, 130, ${opacity}) 1px,\
 transparent 1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${opacity}) 1px, transpare\
nt 1px),
           linear-gradient(rgba(130, 130, 130, ${opacity / 2}) 1px, transparent \
1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${opacity / 2}) 1px, trans\
parent 1px) !important;
        }
      `;
    addGridStyle(gridSelectorId, gridStyles);
  }, [cellAmount, cellSize, gridSelector, gridSelectorId, showGrid, offsetX, offsetY,
  opacity]), StoryFn();
};
var getBackgroundColorByName = (currentSelectedValue, backgrounds = [], defaultName) => {
  if (currentSelectedValue === "transparent") return "transparent";
  if (backgrounds.find((background) => background.value === currentSelectedValue) ||
  currentSelectedValue) return currentSelectedValue;
  let defaultBackground = backgrounds.find((background) => background.name === defaultName);
  if (defaultBackground) return defaultBackground.value;
  if (defaultName) {
    let availableColors = backgrounds.map((background) => background.name).join(
    ", ");
    logger.warn(dedent`
        Backgrounds Addon: could not find the default color "${defaultName}".
        These are the available colors for your story based on your configuration:
        ${availableColors}.
      `);
  }
  return "transparent";
};
var withBackground = (StoryFn, context) => {
  let { globals, parameters: parameters2 } = context, globalsBackgroundColor = globals[PARAM_KEY]?.
  value, backgroundsConfig = parameters2[PARAM_KEY], selectedBackgroundColor = useMemo(
  () => backgroundsConfig.disable ? "transparent" : getBackgroundColorByName(globalsBackgroundColor,
  backgroundsConfig.values, backgroundsConfig.default), [backgroundsConfig, globalsBackgroundColor]),
  isActive = useMemo(() => selectedBackgroundColor && selectedBackgroundColor !==
  "transparent", [selectedBackgroundColor]), selector = context.viewMode === "do\
cs" ? `#anchor--${context.id} .docs-story` : ".sb-show-main", backgroundStyles = useMemo(
  () => `
      ${selector} {
        background: ${selectedBackgroundColor} !important;
        ${isReduceMotionEnabled() ? "" : "transition: background-color 0.3s;"}
      }
    `, [selectedBackgroundColor, selector]);
  return useEffect(() => {
    let selectorId = context.viewMode === "docs" ? `addon-backgrounds-docs-${context.
    id}` : "addon-backgrounds-color";
    if (!isActive) {
      clearStyles(selectorId);
      return;
    }
    addBackgroundStyle(selectorId, backgroundStyles, context.viewMode === "docs" ?
    context.id : null);
  }, [isActive, backgroundStyles, context]), StoryFn();
};
var withGrid = (StoryFn, context) => {
  let { globals, parameters: parameters2 } = context, gridParameters = parameters2[PARAM_KEY].
  grid, isActive = globals[PARAM_KEY]?.grid === true && gridParameters.disable !==
  true, { cellAmount, cellSize, opacity } = gridParameters, isInDocs = context.viewMode ===
  "docs", defaultOffset = parameters2.layout === void 0 || parameters2.layout ===
  "padded" ? 16 : 0, offsetX = gridParameters.offsetX ?? (isInDocs ? 20 : defaultOffset),
  offsetY = gridParameters.offsetY ?? (isInDocs ? 20 : defaultOffset), gridStyles = useMemo(
  () => {
    let selector = context.viewMode === "docs" ? `#anchor--${context.id} .docs-s\
tory` : ".sb-show-main", backgroundSize = [`${cellSize * cellAmount}px ${cellSize *
    cellAmount}px`, `${cellSize * cellAmount}px ${cellSize * cellAmount}px`, `${cellSize}\
px ${cellSize}px`, `${cellSize}px ${cellSize}px`].join(", ");
    return `
      ${selector} {
        background-size: ${backgroundSize} !important;
        background-position: ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}p\
x, ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY}px !important;
        background-blend-mode: difference !important;
        background-image: linear-gradient(rgba(130, 130, 130, ${opacity}) 1px, t\
ransparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${opacity}) 1px, transparent\
 1px),
         linear-gradient(rgba(130, 130, 130, ${opacity / 2}) 1px, transparent 1p\
x),
         linear-gradient(90deg, rgba(130, 130, 130, ${opacity / 2}) 1px, transpa\
rent 1px) !important;
      }
    `;
  }, [cellSize]);
  return useEffect(() => {
    let selectorId = context.viewMode === "docs" ? `addon-backgrounds-grid-docs-${context.
    id}` : "addon-backgrounds-grid";
    if (!isActive) {
      clearStyles(selectorId);
      return;
    }
    addGridStyle(selectorId, gridStyles);
  }, [isActive, gridStyles, context]), StoryFn();
};
var decorators = FEATURES?.backgroundsStoryGlobals ? [withBackgroundAndGrid] : [
withGrid, withBackground];
var parameters = { [PARAM_KEY]: { grid: { cellSize: 20, opacity: 0.5, cellAmount: 5 },
disable: false, ...!FEATURES?.backgroundsStoryGlobals && { values: Object.values(
DEFAULT_BACKGROUNDS) } } };
var modern = { [PARAM_KEY]: { value: void 0, grid: false } };
var initialGlobals = FEATURES?.backgroundsStoryGlobals ? modern : { [PARAM_KEY]: null };
export {
  decorators,
  initialGlobals,
  parameters
};
