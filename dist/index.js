!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e(require("react"));else if("function"==typeof define&&define.amd)define(["react"],e);else{var o="object"==typeof exports?e(require("react")):e(t.react);for(var n in o)("object"==typeof exports?exports:t)[n]=o[n]}}(this,(function(t){return function(){"use strict";var e={654:function(t,e,o){var n,s=this&&this.__assign||function(){return s=Object.assign||function(t){for(var e,o=1,n=arguments.length;o<n;o++)for(var s in e=arguments[o])Object.prototype.hasOwnProperty.call(e,s)&&(t[s]=e[s]);return t},s.apply(this,arguments)},i=this&&this.__createBinding||(Object.create?function(t,e,o,n){void 0===n&&(n=o);var s=Object.getOwnPropertyDescriptor(e,o);s&&!("get"in s?!e.__esModule:s.writable||s.configurable)||(s={enumerable:!0,get:function(){return e[o]}}),Object.defineProperty(t,n,s)}:function(t,e,o,n){void 0===n&&(n=o),t[n]=e[o]}),r=this&&this.__setModuleDefault||(Object.create?function(t,e){Object.defineProperty(t,"default",{enumerable:!0,value:e})}:function(t,e){t.default=e}),a=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var o in t)"default"!==o&&Object.prototype.hasOwnProperty.call(t,o)&&i(e,t,o);return r(e,t),e},u=this&&this.__spreadArray||function(t,e,o){if(o||2===arguments.length)for(var n,s=0,i=e.length;s<i;s++)!n&&s in e||(n||(n=Array.prototype.slice.call(e,0,s)),n[s]=e[s]);return t.concat(n||Array.prototype.slice.call(e))},c=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.updateRtl=e.doesFocusableExist=e.getCurrentFocusKey=e.updateAllLayouts=e.resume=e.pause=e.navigateByDirection=e.setFocus=e.setKeyMap=e.destroy=e.setThrottle=e.init=e.SpatialNavigation=e.ROOT_FOCUS_KEY=void 0;var l=c(o(35)),d=c(o(119)),h=a(o(964)),f=o(593),p="left",y="right",v="up",g="down",b="enter",F=((n={}).left=[37,"ArrowLeft"],n.up=[38,"ArrowUp"],n.right=[39,"ArrowRight"],n.down=[40,"ArrowDown"],n.enter=[13,"Enter"],n);e.ROOT_FOCUS_KEY="SN:ROOT";var C=["#0FF","#FF0","#F0F"],m={leading:!0,trailing:!1},K=function(){function t(){this.focusableComponents={},this.focusKey=null,this.parentsHavingFocusedChild=[],this.domNodeFocusOptions={},this.enabled=!1,this.nativeMode=!1,this.throttle=0,this.throttleKeypresses=!1,this.useGetBoundingClientRect=!1,this.shouldFocusDOMNode=!1,this.shouldUseNativeEvents=!1,this.writingDirection=d.default.LTR,this.pressedKeys={},this.paused=!1,this.keyDownEventListener=null,this.keyUpEventListener=null,this.keyMap=F,this.pause=this.pause.bind(this),this.resume=this.resume.bind(this),this.setFocus=this.setFocus.bind(this),this.updateAllLayouts=this.updateAllLayouts.bind(this),this.navigateByDirection=this.navigateByDirection.bind(this),this.init=this.init.bind(this),this.setThrottle=this.setThrottle.bind(this),this.destroy=this.destroy.bind(this),this.setKeyMap=this.setKeyMap.bind(this),this.getCurrentFocusKey=this.getCurrentFocusKey.bind(this),this.doesFocusableExist=this.doesFocusableExist.bind(this),this.updateRtl=this.updateRtl.bind(this),this.setFocusDebounced=(0,f.debounce)(this.setFocus,300,{leading:!1,trailing:!0}),this.debug=!1,this.visualDebugger=null,this.logIndex=0,this.distanceCalculationMethod="corners"}return t.getCutoffCoordinate=function(t,e,o,n,s){var i=t?n.top:s===d.default.LTR?n.left:n.right,r=t?n.bottom:s===d.default.LTR?n.right:n.left;return e?o?i:r:o?r:i},t.getRefCorners=function(t,e,o){var n={a:{x:0,y:0},b:{x:0,y:0}};switch(t){case v:var s=e?o.bottom:o.top;n.a={x:o.left,y:s},n.b={x:o.right,y:s};break;case g:s=e?o.top:o.bottom,n.a={x:o.left,y:s},n.b={x:o.right,y:s};break;case p:var i=e?o.right:o.left;n.a={x:i,y:o.top},n.b={x:i,y:o.bottom};break;case y:i=e?o.left:o.right,n.a={x:i,y:o.top},n.b={x:i,y:o.bottom}}return n},t.isAdjacentSlice=function(t,e,o){var n=t.a,s=t.b,i=e.a,r=e.b,a=o?"x":"y",u=n[a],c=s[a],l=i[a],d=r[a],h=.2*(c-u);return Math.max(0,Math.min(c,d)-Math.max(u,l))>=h},t.getPrimaryAxisDistance=function(t,e,o){var n=t.a,s=e.a,i=o?"y":"x";return Math.abs(s[i]-n[i])},t.getSecondaryAxisDistance=function(t,e,o,n,s){if(s)return s(t,e,o,n);var i=t.a,r=t.b,a=e.a,u=e.b,c=o?"x":"y",l=i[c],d=r[c],h=a[c],f=u[c];if("center"===n){var p=(l+d)/2,y=(h+f)/2;return Math.abs(p-y)}if("edges"===n){var v=Math.min(l,d),g=Math.min(h,f),b=Math.max(l,d),F=Math.max(h,f),C=Math.abs(v-g),m=Math.abs(b-F);return Math.min(C,m)}var K=[Math.abs(h-l),Math.abs(h-d),Math.abs(f-l),Math.abs(f-d)];return Math.min.apply(Math,K)},t.prototype.sortSiblingsByPriority=function(e,o,n,s){var i=this,r=n===g||n===v,a=t.getRefCorners(n,!1,o);return e.sort((function(e,o){var u=t.getRefCorners(n,!0,e.layout),c=t.getRefCorners(n,!0,o.layout),l=t.isAdjacentSlice(a,u,r),d=t.isAdjacentSlice(a,c,r),h=l?t.getPrimaryAxisDistance:t.getSecondaryAxisDistance,f=d?t.getPrimaryAxisDistance:t.getSecondaryAxisDistance,p=l?t.getSecondaryAxisDistance:t.getPrimaryAxisDistance,y=d?t.getSecondaryAxisDistance:t.getPrimaryAxisDistance,v=h(a,u,r,i.distanceCalculationMethod,i.customDistanceCalculationFunction),g=f(a,c,r,i.distanceCalculationMethod,i.customDistanceCalculationFunction),b=p(a,u,r,i.distanceCalculationMethod,i.customDistanceCalculationFunction),F=5*v+b,C=(F+1)/(l?5:1),m=(5*g+y(a,c,r,i.distanceCalculationMethod,i.customDistanceCalculationFunction)+1)/(d?5:1);return i.log("smartNavigate","distance (primary, secondary, total weighted) for ".concat(e.focusKey," relative to ").concat(s," is"),v,b,F),i.log("smartNavigate","priority for ".concat(e.focusKey," relative to ").concat(s," is"),C),i.visualDebugger&&(i.visualDebugger.drawPoint(u.a.x,u.a.y,"yellow",6),i.visualDebugger.drawPoint(u.b.x,u.b.y,"yellow",6)),C-m}))},t.prototype.init=function(t){var e=this,o=void 0===t?{}:t,n=o.debug,s=void 0!==n&&n,i=o.visualDebug,r=void 0!==i&&i,a=o.nativeMode,u=void 0!==a&&a,c=o.throttle,h=void 0===c?0:c,f=o.throttleKeypresses,p=void 0!==f&&f,y=o.useGetBoundingClientRect,v=void 0!==y&&y,g=o.shouldFocusDOMNode,b=void 0!==g&&g,F=o.domNodeFocusOptions,C=void 0===F?{}:F,m=o.shouldUseNativeEvents,K=void 0!==m&&m,w=o.rtl,x=void 0!==w&&w,D=o.distanceCalculationMethod,E=void 0===D?"corners":D,M=o.customDistanceCalculationFunction,R=void 0===M?void 0:M;if(!this.enabled&&(this.domNodeFocusOptions=C,this.enabled=!0,this.nativeMode=u,this.throttleKeypresses=p,this.useGetBoundingClientRect=v,this.shouldFocusDOMNode=b&&!u,this.shouldUseNativeEvents=K,this.writingDirection=x?d.default.RTL:d.default.LTR,this.distanceCalculationMethod=E,this.customDistanceCalculationFunction=R,this.debug=s,!this.nativeMode&&(Number.isInteger(h)&&h>0&&(this.throttle=h),this.bindEventHandlers(),r))){this.visualDebugger=new l.default(this.writingDirection);var L=function(){requestAnimationFrame((function(){e.visualDebugger.clearLayouts(),Object.keys(e.focusableComponents).forEach((function(t){var o=e.focusableComponents[t];e.visualDebugger.drawLayout(o.layout,t,o.parentFocusKey)})),L()}))};L()}},t.prototype.setThrottle=function(t){var e=void 0===t?{}:t,o=e.throttle,n=void 0===o?0:o,s=e.throttleKeypresses,i=void 0!==s&&s;this.throttleKeypresses=i,this.nativeMode||(this.unbindEventHandlers(),Number.isInteger(n)&&(this.throttle=n),this.bindEventHandlers())},t.prototype.destroy=function(){this.enabled&&(this.enabled=!1,this.nativeMode=!1,this.throttle=0,this.throttleKeypresses=!1,this.focusKey=null,this.parentsHavingFocusedChild=[],this.focusableComponents={},this.paused=!1,this.keyMap=F,this.unbindEventHandlers())},t.prototype.getEventType=function(t){return(0,f.findKey)(this.getKeyMap(),(function(e){return e.includes(t)}))},t.getKeyCode=function(t){return t.keyCode||t.code||t.key},t.prototype.bindEventHandlers=function(){var e=this;"undefined"!=typeof window&&window.addEventListener&&(this.keyDownEventListener=function(o){if(!0!==e.paused){e.debug&&(e.logIndex+=1);var n=t.getKeyCode(o),s=e.getEventType(n);if(s){e.pressedKeys[s]=e.pressedKeys[s]?e.pressedKeys[s]+1:1,e.shouldUseNativeEvents||(o.preventDefault(),o.stopPropagation());var i={pressedKeys:e.pressedKeys};if(s===b&&e.focusKey)e.onEnterPress(i);else{var r=!1===e.onArrowPress(s,i);if(e.visualDebugger&&e.visualDebugger.clear(),r)e.log("keyDownEventListener","default navigation prevented");else{var a=(0,f.findKey)(e.getKeyMap(),(function(t){return t.includes(n)}));e.smartNavigate(a,null,{event:o})}}}}},this.throttle&&(this.keyDownEventListenerThrottled=(0,f.throttle)(this.keyDownEventListener.bind(this),this.throttle,m)),this.keyUpEventListener=function(o){var n=t.getKeyCode(o),s=e.getEventType(n);delete e.pressedKeys[s],e.throttle&&!e.throttleKeypresses&&e.keyDownEventListenerThrottled.cancel(),s===b&&e.focusKey&&e.onEnterRelease(),!e.focusKey||s!==p&&s!==y&&s!==v&&s!==g||e.onArrowRelease(s)},window.addEventListener("keyup",this.keyUpEventListener),window.addEventListener("keydown",this.throttle?this.keyDownEventListenerThrottled:this.keyDownEventListener))},t.prototype.unbindEventHandlers=function(){if("undefined"!=typeof window&&window.removeEventListener){window.removeEventListener("keyup",this.keyUpEventListener),this.keyUpEventListener=null;var t=this.throttle?this.keyDownEventListenerThrottled:this.keyDownEventListener;window.removeEventListener("keydown",t),this.keyDownEventListener=null}},t.prototype.onEnterPress=function(t){var e=this.focusableComponents[this.focusKey];e?e.focusable?e.onEnterPress&&e.onEnterPress(t):this.log("onEnterPress","componentNotFocusable"):this.log("onEnterPress","noComponent")},t.prototype.onEnterRelease=function(){var t=this.focusableComponents[this.focusKey];t?t.focusable?t.onEnterRelease&&t.onEnterRelease():this.log("onEnterRelease","componentNotFocusable"):this.log("onEnterRelease","noComponent")},t.prototype.onArrowPress=function(t,e){var o=this.focusableComponents[this.focusKey];if(o)return o&&o.onArrowPress&&o.onArrowPress(t,e);this.log("onArrowPress","noComponent")},t.prototype.onArrowRelease=function(t){var e=this.focusableComponents[this.focusKey];e?e.focusable?e.onArrowRelease&&e.onArrowRelease(t):this.log("onArrowRelease","componentNotFocusable"):this.log("onArrowRelease","noComponent")},t.prototype.navigateByDirection=function(t,e){if(!0!==this.paused&&this.enabled&&!this.nativeMode){var o=[g,v,p,y];o.includes(t)?(this.log("navigateByDirection","direction",t),this.smartNavigate(t,null,e)):this.log("navigateByDirection","Invalid direction. You passed: `".concat(t,"`, but you can use only these: "),o)}},t.prototype.smartNavigate=function(e,o,n){var s=this;if(!this.nativeMode){var i=e===g||e===v,r=e===g||(this.writingDirection===d.default.LTR?e===y:e===p);this.log("smartNavigate","direction",e),this.log("smartNavigate","fromParentFocusKey",o),this.log("smartNavigate","this.focusKey",this.focusKey),o||Object.values(this.focusableComponents).forEach((function(t){t.layoutUpdated=!1}));var a=this.focusableComponents[o||this.focusKey];if(o||a){if(this.log("smartNavigate","currentComponent",a?a.focusKey:void 0,a?a.node:void 0,a),a){this.updateLayout(a.focusKey);var u=a.parentFocusKey,c=a.focusKey,l=a.layout,h=t.getCutoffCoordinate(i,r,!1,l,this.writingDirection),f=Object.values(this.focusableComponents).filter((function(e){if(e.parentFocusKey===u&&e.focusable){s.updateLayout(e.focusKey);var o=t.getCutoffCoordinate(i,r,!0,e.layout,s.writingDirection);return i||s.writingDirection===d.default.LTR?r?o>=h:o<=h:r?o<=h:o>=h}return!1}));if(this.debug&&(this.log("smartNavigate","currentCutoffCoordinate",h),this.log("smartNavigate","siblings","".concat(f.length," elements:"),f.map((function(t){return t.focusKey})).join(", "),f.map((function(t){return t.node})),f.map((function(t){return t})))),this.visualDebugger){var b=t.getRefCorners(e,!1,l);this.visualDebugger.drawPoint(b.a.x,b.a.y),this.visualDebugger.drawPoint(b.b.x,b.b.y)}var F=this.sortSiblingsByPriority(f,l,e,c)[0];if(this.log("smartNavigate","nextComponent",F?F.focusKey:void 0,F?F.node:void 0,F),F)this.setFocus(F.focusKey,n);else{var C=this.focusableComponents[u],m=(null==C?void 0:C.isFocusBoundary)?C.focusBoundaryDirections||[e]:[];C&&m.includes(e)?(a.onBoundaryHit(e),C.onBoundaryHit(e)):this.smartNavigate(e,u,n)}}}else this.setFocus(this.getForcedFocusKey())}},t.prototype.saveLastFocusedChildKey=function(t,e){t&&(this.log("saveLastFocusedChildKey","".concat(t.focusKey," lastFocusedChildKey set"),e),t.lastFocusedChildKey=e)},t.prototype.log=function(t,e){for(var o=[],n=2;n<arguments.length;n++)o[n-2]=arguments[n];this.debug&&console.log.apply(console,u(["%c".concat(t,"%c").concat(e),"background: ".concat(C[this.logIndex%C.length],"; color: black; padding: 1px 5px;"),"background: #333; color: #BADA55; padding: 1px 5px;"],o,!1))},t.prototype.getCurrentFocusKey=function(){return this.focusKey},t.prototype.getForcedFocusKey=function(){var t,o=Object.values(this.focusableComponents).filter((function(t){return t.focusable&&t.forceFocus}));return null===(t=this.sortSiblingsByPriority(o,{x:0,y:0,width:0,height:0,left:0,top:0,right:0,bottom:0,node:null},"down",e.ROOT_FOCUS_KEY)[0])||void 0===t?void 0:t.focusKey},t.prototype.getNextFocusKey=function(t){var e=this,o=this.focusableComponents[t];if(!o||this.nativeMode)return t;var n=Object.values(this.focusableComponents).filter((function(e){return e.parentFocusKey===t&&e.focusable}));if(n.length>0){var s=o.lastFocusedChildKey,i=o.preferredChildFocusKey;if(this.log("getNextFocusKey","lastFocusedChildKey is",s),this.log("getNextFocusKey","preferredChildFocusKey is",i),s&&o.saveLastFocusedChild&&this.isParticipatingFocusableComponent(s))return this.log("getNextFocusKey","lastFocusedChildKey will be focused",s),this.getNextFocusKey(s);if(i&&this.isParticipatingFocusableComponent(i))return this.log("getNextFocusKey","preferredChildFocusKey will be focused",i),this.getNextFocusKey(i);n.forEach((function(t){return e.updateLayout(t.focusKey)}));var r=function(t,e){var o=e===d.default.LTR?function(t,e){return Math.abs(t.layout.left)+Math.abs(t.layout.top)-(Math.abs(e.layout.left)+Math.abs(e.layout.top))}:function(t,e){return Math.abs(window.innerWidth-t.layout.right)+Math.abs(t.layout.top)-(Math.abs(window.innerWidth-e.layout.right)+Math.abs(e.layout.top))};return t.sort(o)[0]}(n,this.writingDirection).focusKey;return this.log("getNextFocusKey","childKey will be focused",r),this.getNextFocusKey(r)}return this.log("getNextFocusKey","targetFocusKey",t),t},t.prototype.addFocusable=function(t){var e=t.focusKey,o=t.node,n=t.parentFocusKey,s=t.onEnterPress,i=t.onEnterRelease,r=t.onBoundaryHit,a=t.onArrowPress,u=t.onArrowRelease,c=t.onFocus,l=t.onBlur,d=t.saveLastFocusedChild,h=t.trackChildren,f=t.onUpdateFocus,p=t.onUpdateHasFocusedChild,y=t.preferredChildFocusKey,v=t.autoRestoreFocus,g=t.forceFocus,b=t.focusable,F=t.isFocusBoundary,C=t.focusBoundaryDirections;if(this.focusableComponents[e]={focusKey:e,node:o,parentFocusKey:n,onEnterPress:s,onEnterRelease:i,onBoundaryHit:r,onArrowPress:a,onArrowRelease:u,onFocus:c,onBlur:l,onUpdateFocus:f,onUpdateHasFocusedChild:p,saveLastFocusedChild:d,trackChildren:h,preferredChildFocusKey:y,focusable:b,isFocusBoundary:F,focusBoundaryDirections:C,autoRestoreFocus:v,forceFocus:g,lastFocusedChildKey:null,layout:{x:0,y:0,width:0,height:0,left:0,top:0,right:0,bottom:0,node:o},layoutUpdated:!1},o||console.warn('Component added without a node reference. This will result in its coordinates being empty and may cause lost focus. Check the "ref" passed to "useFocusable": ',this.focusableComponents[e]),!this.nativeMode){this.updateLayout(e),this.log("addFocusable","Component added: ",this.focusableComponents[e]),e===this.focusKey&&this.setFocus(y||e);for(var m=this.focusableComponents[this.focusKey];m;){if(m.parentFocusKey===e){this.updateParentsHasFocusedChild(this.focusKey,{}),this.updateParentsLastFocusedChild(this.focusKey);break}m=this.focusableComponents[m.parentFocusKey]}}},t.prototype.removeFocusable=function(t){var e=t.focusKey,o=this.focusableComponents[e];if(o){var n=o.parentFocusKey;(0,o.onUpdateFocus)(!1),this.log("removeFocusable","Component removed: ",o),delete this.focusableComponents[e];var s=this.parentsHavingFocusedChild.includes(e);this.parentsHavingFocusedChild=this.parentsHavingFocusedChild.filter((function(t){return t!==e}));var i=this.focusableComponents[n],r=e===this.focusKey;if(i&&i.lastFocusedChildKey===e&&(i.lastFocusedChildKey=null),this.nativeMode)return;(r||s)&&i&&i.autoRestoreFocus&&(this.log("removeFocusable","Component removed: ",r?"Leaf component":"Container component","Auto restoring focus to: ",n),this.setFocusDebounced(n))}},t.prototype.getNodeLayoutByFocusKey=function(t){var e=this.focusableComponents[t];return e?(this.updateLayout(e.focusKey),e.layout):null},t.prototype.setCurrentFocusedKey=function(t,e){var o,n,s,i;if(this.isFocusableComponent(this.focusKey)&&t!==this.focusKey){var r=this.focusableComponents[this.focusKey];r.onUpdateFocus(!1),r.onBlur(this.getNodeLayoutByFocusKey(this.focusKey),e),null===(n=null===(o=r.node)||void 0===o?void 0:o.removeAttribute)||void 0===n||n.call(o,"data-focused"),this.log("setCurrentFocusedKey","onBlur",r)}if(this.focusKey=t,this.isFocusableComponent(this.focusKey)){var a=this.focusableComponents[this.focusKey];this.shouldFocusDOMNode&&a.node&&a.node.focus(this.domNodeFocusOptions),null===(i=null===(s=a.node)||void 0===s?void 0:s.setAttribute)||void 0===i||i.call(s,"data-focused","true"),a.onUpdateFocus(!0),a.onFocus(this.getNodeLayoutByFocusKey(this.focusKey),e),this.log("setCurrentFocusedKey","onFocus",a)}},t.prototype.updateParentsHasFocusedChild=function(t,e){for(var o=this,n=[],s=this.focusableComponents[t];s;){var i=s.parentFocusKey,r=this.focusableComponents[i];if(r){var a=r.focusKey;n.push(a)}s=r}var u=(0,f.difference)(this.parentsHavingFocusedChild,n),c=(0,f.difference)(n,this.parentsHavingFocusedChild);u.forEach((function(t){var n=o.focusableComponents[t];n&&n.trackChildren&&n.onUpdateHasFocusedChild(!1),o.onIntermediateNodeBecameBlurred(t,e)})),c.forEach((function(t){var n=o.focusableComponents[t];n&&n.trackChildren&&n.onUpdateHasFocusedChild(!0),o.onIntermediateNodeBecameFocused(t,e)})),this.parentsHavingFocusedChild=n},t.prototype.updateParentsLastFocusedChild=function(t){for(var e=this.focusableComponents[t];e;){var o=e.parentFocusKey,n=this.focusableComponents[o];n&&this.saveLastFocusedChildKey(n,e.focusKey),e=n}},t.prototype.getKeyMap=function(){return this.keyMap},t.prototype.setKeyMap=function(t){this.keyMap=s(s({},this.getKeyMap()),function(t){var e={};return Object.entries(t).forEach((function(t){var o=t[0],n=t[1];e[o]=Array.isArray(n)?n:[n]})),e}(t))},t.prototype.isFocusableComponent=function(t){return!!this.focusableComponents[t]},t.prototype.isParticipatingFocusableComponent=function(t){return this.isFocusableComponent(t)&&this.focusableComponents[t].focusable},t.prototype.onIntermediateNodeBecameFocused=function(t,e){this.isParticipatingFocusableComponent(t)&&this.focusableComponents[t].onFocus(this.getNodeLayoutByFocusKey(t),e)},t.prototype.onIntermediateNodeBecameBlurred=function(t,e){this.isParticipatingFocusableComponent(t)&&this.focusableComponents[t].onBlur(this.getNodeLayoutByFocusKey(t),e)},t.prototype.pause=function(){this.paused=!0},t.prototype.resume=function(){this.paused=!1},t.prototype.setFocus=function(t,o){if(void 0===o&&(o={}),this.setFocusDebounced.cancel(),this.enabled){this.log("setFocus","focusKey",t),t&&t!==e.ROOT_FOCUS_KEY||(t=this.getForcedFocusKey());var n=this.getNextFocusKey(t);this.log("setFocus","newFocusKey",n),this.setCurrentFocusedKey(n,o),this.updateParentsHasFocusedChild(n,o),this.updateParentsLastFocusedChild(n)}},t.prototype.updateAllLayouts=function(){var t=this;this.enabled&&!this.nativeMode&&Object.keys(this.focusableComponents).forEach((function(e){t.updateLayout(e)}))},t.prototype.updateLayout=function(t){var e=this.focusableComponents[t];if(e&&!this.nativeMode&&!e.layoutUpdated){var o=e.node,n=this.useGetBoundingClientRect?(0,h.getBoundingClientRect)(o):(0,h.default)(o);e.layout=s(s({},n),{node:o})}},t.prototype.updateFocusable=function(t,e){var o=e.node,n=e.preferredChildFocusKey,s=e.focusable,i=e.isFocusBoundary,r=e.focusBoundaryDirections,a=e.onEnterPress,u=e.onEnterRelease,c=e.onBoundaryHit,l=e.onArrowPress,d=e.onFocus,h=e.onBlur;if(!this.nativeMode){var f=this.focusableComponents[t];f&&(f.preferredChildFocusKey=n,f.focusable=s,f.isFocusBoundary=i,f.focusBoundaryDirections=r,f.onEnterPress=a,f.onEnterRelease=u,f.onBoundaryHit=c,f.onArrowPress=l,f.onFocus=d,f.onBlur=h,o&&(f.node=o))}},t.prototype.isNativeMode=function(){return this.nativeMode},t.prototype.doesFocusableExist=function(t){return!!this.focusableComponents[t]},t.prototype.updateRtl=function(t){this.writingDirection=t?d.default.RTL:d.default.LTR},t}();e.SpatialNavigation=new K,e.init=e.SpatialNavigation.init,e.setThrottle=e.SpatialNavigation.setThrottle,e.destroy=e.SpatialNavigation.destroy,e.setKeyMap=e.SpatialNavigation.setKeyMap,e.setFocus=e.SpatialNavigation.setFocus,e.navigateByDirection=e.SpatialNavigation.navigateByDirection,e.pause=e.SpatialNavigation.pause,e.resume=e.SpatialNavigation.resume,e.updateAllLayouts=e.SpatialNavigation.updateAllLayouts,e.getCurrentFocusKey=e.SpatialNavigation.getCurrentFocusKey,e.doesFocusableExist=e.SpatialNavigation.doesFocusableExist,e.updateRtl=e.SpatialNavigation.updateRtl},35:function(t,e,o){var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var s=n(o(119)),i="undefined"!=typeof window&&window.document,r=i?window.innerWidth:0,a=i?window.innerHeight:0,u=function(){function t(e){i&&(this.debugCtx=t.createCanvas("sn-debug","1010",e),this.layoutsCtx=t.createCanvas("sn-layouts","1000",e),this.writingDirection=e)}return t.createCanvas=function(t,e,o){var n=document.querySelector("#".concat(t))||document.createElement("canvas");n.setAttribute("id",t),n.setAttribute("dir",o===s.default.LTR?"ltr":"rtl");var i=n.getContext("2d");return n.style.zIndex=e,n.style.position="fixed",n.style.top="0",n.style.left="0",document.body.appendChild(n),n.width=r,n.height=a,i},t.prototype.clear=function(){i&&this.debugCtx.clearRect(0,0,r,a)},t.prototype.clearLayouts=function(){i&&this.layoutsCtx.clearRect(0,0,r,a)},t.prototype.drawLayout=function(t,e,o){if(i){this.layoutsCtx.strokeStyle="green",this.layoutsCtx.strokeRect(t.left,t.top,t.width,t.height),this.layoutsCtx.font="8px monospace",this.layoutsCtx.fillStyle="red";var n=this.writingDirection===s.default.LTR?"left":"right",r=t[n];this.layoutsCtx.fillText(e,r,t.top+10),this.layoutsCtx.fillText(o,r,t.top+25),this.layoutsCtx.fillText("".concat(n,": ").concat(r),r,t.top+40),this.layoutsCtx.fillText("top: ".concat(t.top),r,t.top+55)}},t.prototype.drawPoint=function(t,e,o,n){void 0===o&&(o="blue"),void 0===n&&(n=10),i&&(this.debugCtx.strokeStyle=o,this.debugCtx.lineWidth=3,this.debugCtx.strokeRect(t-n/2,e-n/2,n,n))},t}();e.default=u},119:function(t,e){var o;Object.defineProperty(e,"__esModule",{value:!0}),function(t){t[t.LTR=0]="LTR",t[t.RTL=1]="RTL"}(o||(o={})),e.default=o},607:function(t,e,o){var n=this&&this.__createBinding||(Object.create?function(t,e,o,n){void 0===n&&(n=o);var s=Object.getOwnPropertyDescriptor(e,o);s&&!("get"in s?!e.__esModule:s.writable||s.configurable)||(s={enumerable:!0,get:function(){return e[o]}}),Object.defineProperty(t,n,s)}:function(t,e,o,n){void 0===n&&(n=o),t[n]=e[o]}),s=this&&this.__exportStar||function(t,e){for(var o in t)"default"===o||Object.prototype.hasOwnProperty.call(e,o)||n(e,t,o)};Object.defineProperty(e,"__esModule",{value:!0}),s(o(79),e),s(o(445),e),s(o(654),e)},964:function(t,e){Object.defineProperty(e,"__esModule",{value:!0}),e.getBoundingClientRect=void 0;var o=function(t){for(var e=t.offsetParent,o=t.offsetHeight,n=t.offsetWidth,s=t.offsetLeft,i=t.offsetTop;e&&1===e.nodeType;)s+=e.offsetLeft-e.scrollLeft,i+=e.offsetTop-e.scrollTop,e=e.offsetParent;return{height:o,left:s,top:i,width:n}};e.default=function(t){var e=t&&t.parentElement;if(t&&e){var n=o(e),s=o(t),i=s.height,r=s.left,a=s.top,u=s.width;return{x:r-n.left,y:a-n.top,width:u,height:i,left:r,top:a,get right(){return this.left+this.width},get bottom(){return this.top+this.height}}}return{x:0,y:0,width:0,height:0,left:0,top:0,right:0,bottom:0}},e.getBoundingClientRect=function(t){if(t&&t.getBoundingClientRect){var e=t.getBoundingClientRect();return{x:e.x,y:e.y,width:e.width,height:e.height,left:e.left,top:e.top,get right(){return this.left+this.width},get bottom(){return this.top+this.height}}}return{x:0,y:0,width:0,height:0,left:0,top:0,right:0,bottom:0}}},445:function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.useFocusContext=e.FocusContext=void 0;var n=o(156),s=o(654);e.FocusContext=(0,n.createContext)(s.ROOT_FOCUS_KEY),e.FocusContext.displayName="FocusContext",e.useFocusContext=function(){return(0,n.useContext)(e.FocusContext)}},79:function(t,e,o){Object.defineProperty(e,"__esModule",{value:!0}),e.useFocusable=void 0;var n=o(156),s=o(654),i=o(445),r=o(593);e.useFocusable=function(t){var e=void 0===t?{}:t,o=e.focusable,a=void 0===o||o,u=e.saveLastFocusedChild,c=void 0===u||u,l=e.trackChildren,d=void 0!==l&&l,h=e.autoRestoreFocus,f=void 0===h||h,p=e.forceFocus,y=void 0!==p&&p,v=e.isFocusBoundary,g=void 0!==v&&v,b=e.focusBoundaryDirections,F=e.focusKey,C=e.preferredChildFocusKey,m=e.onEnterPress,K=void 0===m?r.noop:m,w=e.onEnterRelease,x=void 0===w?r.noop:w,D=e.onBoundaryHit,E=void 0===D?r.noop:D,M=e.onArrowPress,R=void 0===M?function(){return!0}:M,L=e.onArrowRelease,N=void 0===L?r.noop:L,P=e.onFocus,B=void 0===P?r.noop:P,A=e.onBlur,O=void 0===A?r.noop:A,_=e.extraProps,k=(0,n.useCallback)((function(t){K(_,t)}),[K,_]),T=(0,n.useCallback)((function(){x(_)}),[x,_]),S=(0,n.useCallback)((function(t){E(t,_)}),[_,E]),j=(0,n.useCallback)((function(t,e){return R(t,_,e)}),[_,R]),H=(0,n.useCallback)((function(t){N(t,_)}),[N,_]),U=(0,n.useCallback)((function(t,e){B(t,_,e)}),[_,B]),I=(0,n.useCallback)((function(t,e){O(t,_,e)}),[_,O]),q=(0,n.useRef)(null),Y=(0,n.useState)(!1),W=Y[0],G=Y[1],z=(0,n.useState)(!1),J=z[0],Q=z[1],V=(0,i.useFocusContext)(),X=(0,n.useMemo)((function(){return F||(0,r.uniqueId)("sn:focusable-item-")}),[F]),Z=(0,n.useCallback)((function(t){void 0===t&&(t={}),s.SpatialNavigation.setFocus(X,t)}),[X]);return(0,n.useEffect)((function(){var t=q.current;return s.SpatialNavigation.addFocusable({focusKey:X,node:t,parentFocusKey:V,preferredChildFocusKey:C,onEnterPress:k,onEnterRelease:T,onBoundaryHit:S,onArrowPress:j,onArrowRelease:H,onFocus:U,onBlur:I,onUpdateFocus:function(t){return void 0===t&&(t=!1),G(t)},onUpdateHasFocusedChild:function(t){return void 0===t&&(t=!1),Q(t)},saveLastFocusedChild:c,trackChildren:d,isFocusBoundary:g,focusBoundaryDirections:b,autoRestoreFocus:f,forceFocus:y,focusable:a}),function(){s.SpatialNavigation.removeFocusable({focusKey:X})}}),[]),(0,n.useEffect)((function(){var t=q.current;s.SpatialNavigation.updateFocusable(X,{node:t,preferredChildFocusKey:C,focusable:a,isFocusBoundary:g,focusBoundaryDirections:b,onEnterPress:k,onEnterRelease:T,onBoundaryHit:S,onArrowPress:j,onArrowRelease:H,onFocus:U,onBlur:I})}),[X,C,a,g,b,k,T,S,j,H,U,I]),{ref:q,focusSelf:Z,focused:W,hasFocusedChild:J,focusKey:X}}},593:function(t,e){var o=this&&this.__spreadArray||function(t,e,o){if(o||2===arguments.length)for(var n,s=0,i=e.length;s<i;s++)!n&&s in e||(n||(n=Array.prototype.slice.call(e,0,s)),n[s]=e[s]);return t.concat(n||Array.prototype.slice.call(e))};Object.defineProperty(e,"__esModule",{value:!0}),e.shuffle=e.uniqueId=e.noop=e.throttle=e.debounce=e.difference=e.findKey=void 0,e.findKey=function(t,e){return void 0===e&&(e=function(t){return!!t}),Object.keys(t).find((function(o){return e(t[o],o,t)}))},e.difference=function(t){for(var e=[],o=1;o<arguments.length;o++)e[o-1]=arguments[o];var n=new Set(e.flat());return t.filter((function(t){return!n.has(t)}))},e.noop=function(){};var n=0;e.uniqueId=function(t){return void 0===t&&(t=""),n+=1,"".concat(t).concat(n)},e.shuffle=function(t){for(var e,n=o([],t,!0),s=n.length-1;s>0;s-=1){var i=Math.floor(Math.random()*(s+1));e=[n[i],n[s]],n[s]=e[0],n[i]=e[1]}return n},e.debounce=function(t,e,o){var n=null,s=null,i=function(e){t.apply(void 0,e)},r=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];s=t;var a=o||{},u=a.leading,c=void 0!==u&&u,l=a.trailing,d=void 0===l||l;c&&!n&&i(t),n&&clearTimeout(n),n=setTimeout((function(){d&&s&&i(s),n=null}),e)};return r.cancel=function(){n&&clearTimeout(n),n=null},r},e.throttle=function(t,e,o){var n=void 0===o?{}:o,s=n.leading,i=void 0===s||s,r=n.trailing,a=void 0===r||r,u=null,c=0,l=null,d=function(e){t.apply(void 0,e),c=Date.now()},h=function(){for(var t=[],o=0;o<arguments.length;o++)t[o]=arguments[o];l=t;var n=Date.now(),s=n-c,r=e-s;r<=0?i&&d(t):a&&!u&&(u=setTimeout((function(){l&&d(l),u=null}),r))};return h.cancel=function(){u&&(clearTimeout(u),u=null),c=0},h}},156:function(e){e.exports=t}},o={};return function t(n){var s=o[n];if(void 0!==s)return s.exports;var i=o[n]={exports:{}};return e[n].call(i.exports,i,i.exports,t),i.exports}(607)}()}));
//# sourceMappingURL=index.js.map