import VisualDebugger from './VisualDebugger';
import WritingDirection from './WritingDirection';
import measureLayout, { getBoundingClientRect } from './measureLayout';
import { debounce, DebouncedFunc, difference, findKey, throttle } from './utils';

const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';
const KEY_ENTER = 'enter';

export type Direction = 'up' | 'down' | 'left' | 'right';

type DistanceCalculationMethod = 'center' | 'edges' | 'corners';

type DistanceCalculationFunction = (
  refCorners: Corners,
  siblingCorners: Corners,
  isVerticalDirection: boolean,
  distanceCalculationMethod: DistanceCalculationMethod
) => number;

const DEFAULT_KEY_MAP = {
  [DIRECTION_LEFT]: [37, 'ArrowLeft'],
  [DIRECTION_UP]: [38, 'ArrowUp'],
  [DIRECTION_RIGHT]: [39, 'ArrowRight'],
  [DIRECTION_DOWN]: [40, 'ArrowDown'],
  [KEY_ENTER]: [13, 'Enter']
};

export const ROOT_FOCUS_KEY = 'SN:ROOT';

const ADJACENT_SLICE_THRESHOLD = 0.2;

/**
 * Adjacent slice is 5 times more important than diagonal
 */
const ADJACENT_SLICE_WEIGHT = 5;
const DIAGONAL_SLICE_WEIGHT = 1;

/**
 * Main coordinate distance is 5 times more important
 */
const MAIN_COORDINATE_WEIGHT = 5;

const AUTO_RESTORE_FOCUS_DELAY = 300;

const DEBUG_FN_COLORS = ['#0FF', '#FF0', '#F0F'];

const THROTTLE_OPTIONS = {
  leading: true,
  trailing: false
};

export interface FocusableComponentLayout {
  left: number;
  top: number;
  readonly right: number;
  readonly bottom: number;
  width: number;
  height: number;
  x: number;
  y: number;
  node: HTMLElement;
}

interface FocusableComponent {
  focusKey: string;
  node: HTMLElement;
  parentFocusKey: string;
  onEnterPress: (details?: KeyPressDetails) => void;
  onEnterRelease: () => void;
  onBoundaryHit: (boundaryDirection: Direction) => void;
  onArrowPress: (direction: string, details: KeyPressDetails) => boolean;
  onArrowRelease: (direction: string) => void;
  onFocus: (layout: FocusableComponentLayout, details: FocusDetails) => void;
  onBlur: (layout: FocusableComponentLayout, details: FocusDetails) => void;
  onUpdateFocus: (focused: boolean) => void;
  onUpdateHasFocusedChild: (hasFocusedChild: boolean) => void;
  saveLastFocusedChild: boolean;
  trackChildren: boolean;
  preferredChildFocusKey?: string;
  focusable: boolean;
  isFocusBoundary: boolean;
  focusBoundaryDirections?: Direction[];
  autoRestoreFocus: boolean;
  forceFocus: boolean;
  lastFocusedChildKey?: string;
  layout?: FocusableComponentLayout;
  layoutUpdated?: boolean;
}

interface FocusableComponentUpdatePayload {
  node: HTMLElement;
  preferredChildFocusKey?: string;
  focusable: boolean;
  isFocusBoundary: boolean;
  focusBoundaryDirections?: Direction[];
  onEnterPress: (details?: KeyPressDetails) => void;
  onEnterRelease: () => void;
  onBoundaryHit: (direction: Direction) => void;
  onArrowPress: (direction: string, details: KeyPressDetails) => boolean;
  onArrowRelease: (direction: string) => void;
  onFocus: (layout: FocusableComponentLayout, details: FocusDetails) => void;
  onBlur: (layout: FocusableComponentLayout, details: FocusDetails) => void;
}

interface FocusableComponentRemovePayload {
  focusKey: string;
}

interface CornerCoordinates {
  x: number;
  y: number;
}

interface Corners {
  a: CornerCoordinates;
  b: CornerCoordinates;
}

export type PressedKeys = { [index: string]: number };

/**
 * Extra details about pressed keys passed on the key events
 */
export interface KeyPressDetails {
  pressedKeys: PressedKeys;
}

/**
 * Extra details passed from outside to be bounced back on other callbacks
 */
export interface FocusDetails {
  event?: Event;
  nativeEvent?: Event;
  [key: string]: any;
}

export type BackwardsCompatibleKeyMap = {
  [index in Direction]?: string | number | (number | string)[];
};

export type KeyMap = { [index in Direction]?: (string | number)[] };

const getChildClosestToOrigin = (
  children: FocusableComponent[],
  writingDirection: WritingDirection
) => {
  const comparator = writingDirection === WritingDirection.LTR
    ? (a: FocusableComponent, b: FocusableComponent) =>
      (Math.abs(a.layout.left) + Math.abs(a.layout.top)) -
      (Math.abs(b.layout.left) + Math.abs(b.layout.top))
    : (a: FocusableComponent, b: FocusableComponent) =>
      (Math.abs(window.innerWidth - a.layout.right) + Math.abs(a.layout.top)) -
      (Math.abs(window.innerWidth - b.layout.right) + Math.abs(b.layout.top));

  const childrenClosestToOrigin = children.sort(comparator);

  return childrenClosestToOrigin[0]
};

/**
 * Takes either a BackwardsCompatibleKeyMap and transforms it into a the new KeyMap format
 * to ensure backwards compatibility.
 */
const normalizeKeyMap = (keyMap: BackwardsCompatibleKeyMap) => {
  const newKeyMap: KeyMap = {};

  Object.entries(keyMap).forEach(([key, value]) => {
    newKeyMap[key as Direction] = Array.isArray(value) ? value : [value];
  });

  return newKeyMap;
};


class SpatialNavigationService {
  private focusableComponents: { [index: string]: FocusableComponent };

  private visualDebugger: VisualDebugger;

  /**
   * Focus key of the currently focused element
   */
  private focusKey: string;

  private shouldFocusDOMNode: boolean;

  private shouldUseNativeEvents: boolean;

  /**
   * This collection contains focus keys of the elements that are having a child focused
   * Might be handy for styling of certain parent components if their child is focused.
   */
  private parentsHavingFocusedChild: string[];

  /**
   * When shouldFocusDOMNode is true, this prop specifies the focus options that should be passed to the element being focused.
   */
  private domNodeFocusOptions: FocusOptions;

  private enabled: boolean;

  /**
   * Used in the React Native environment
   * In this mode, the library works as a "read-only" helper to sync focused
   * states for the components when they are focused by the native focus engine
   */
  private nativeMode: boolean;

  /**
   * Throttling delay for key presses in milliseconds
   */
  private throttle: number;

  /**
   * Enables/disables throttling feature
   */
  private throttleKeypresses: boolean;

  /**
   * Storing pressed keys counter by the eventType
   */
  private pressedKeys: PressedKeys;

  /**
   * Flag used to block key events from this service
   */
  private paused: boolean;

  /**
   * Enables/disables getBoundingClientRect
   */
  private useGetBoundingClientRect: boolean;

  private keyDownEventListener: (event: KeyboardEvent) => void;

  private keyDownEventListenerThrottled: DebouncedFunc<
    (event: KeyboardEvent) => void
  >;

  private keyUpEventListener: (event: KeyboardEvent) => void;

  private keyMap: KeyMap;

  private debug: boolean;

  private logIndex: number;

  private setFocusDebounced: DebouncedFunc<any>;

  private writingDirection: WritingDirection;

  private distanceCalculationMethod: DistanceCalculationMethod;

  private customDistanceCalculationFunction?: DistanceCalculationFunction;

  /**
   * Used to determine the coordinate that will be used to filter items that are over the "edge"
   */
  static getCutoffCoordinate(
    isVertical: boolean,
    isIncremental: boolean,
    isSibling: boolean,
    layout: FocusableComponentLayout,
    writingDirection: WritingDirection
  ) {
    const itemStart = isVertical
      ? layout.top
      : writingDirection === WritingDirection.LTR
        ? layout.left
        : layout.right;

    const itemEnd = isVertical
      ? layout.bottom
      : writingDirection === WritingDirection.LTR
        ? layout.right
        : layout.left;

    return isIncremental
      ? isSibling
        ? itemStart
        : itemEnd
      : isSibling
        ? itemEnd
        : itemStart;
  }

  /**
   * Returns two corners (a and b) coordinates that are used as a reference points
   * Where "a" is always leftmost and topmost corner, and "b" is rightmost bottommost corner
   */
  static getRefCorners(
    direction: string,
    isSibling: boolean,
    layout: FocusableComponentLayout
  ) {
    const result = {
      a: {
        x: 0,
        y: 0
      },
      b: {
        x: 0,
        y: 0
      }
    };

    switch (direction) {
      case DIRECTION_UP: {
        const y = isSibling ? layout.bottom : layout.top;

        result.a = {
          x: layout.left,
          y
        };

        result.b = {
          x: layout.right,
          y
        };

        break;
      }

      case DIRECTION_DOWN: {
        const y = isSibling ? layout.top : layout.bottom;

        result.a = {
          x: layout.left,
          y
        };

        result.b = {
          x: layout.right,
          y
        };

        break;
      }

      case DIRECTION_LEFT: {
        const x = isSibling ? layout.right : layout.left;

        result.a = {
          x,
          y: layout.top
        };

        result.b = {
          x,
          y: layout.bottom
        };

        break;
      }

      case DIRECTION_RIGHT: {
        const x = isSibling ? layout.left : layout.right;

        result.a = {
          x,
          y: layout.top
        };

        result.b = {
          x,
          y: layout.bottom
        };

        break;
      }

      default:
        break;
    }

    return result;
  }

  /**
   * Calculates if the sibling node is intersecting enough with the ref node by the secondary coordinate
   */
  static isAdjacentSlice(
    refCorners: Corners,
    siblingCorners: Corners,
    isVerticalDirection: boolean
  ) {
    const { a: refA, b: refB } = refCorners;
    const { a: siblingA, b: siblingB } = siblingCorners;
    const coordinate = isVerticalDirection ? 'x' : 'y';

    const refCoordinateA = refA[coordinate];
    const refCoordinateB = refB[coordinate];
    const siblingCoordinateA = siblingA[coordinate];
    const siblingCoordinateB = siblingB[coordinate];

    const thresholdDistance =
      (refCoordinateB - refCoordinateA) * ADJACENT_SLICE_THRESHOLD;

    const intersectionLength = Math.max(
      0,
      Math.min(refCoordinateB, siblingCoordinateB) -
      Math.max(refCoordinateA, siblingCoordinateA)
    );

    return intersectionLength >= thresholdDistance;
  }

  static getPrimaryAxisDistance(
    refCorners: Corners,
    siblingCorners: Corners,
    isVerticalDirection: boolean
  ) {
    const { a: refA } = refCorners;
    const { a: siblingA } = siblingCorners;
    const coordinate = isVerticalDirection ? 'y' : 'x';

    return Math.abs(siblingA[coordinate] - refA[coordinate]);
  }

  static getSecondaryAxisDistance(
    refCorners: Corners,
    siblingCorners: Corners,
    isVerticalDirection: boolean,
    distanceCalculationMethod: DistanceCalculationMethod,
    customDistanceCalculationFunction?: DistanceCalculationFunction
  ) {
    if (customDistanceCalculationFunction) {
      return customDistanceCalculationFunction(
        refCorners,
        siblingCorners,
        isVerticalDirection,
        distanceCalculationMethod
      );
    }

    const { a: refA, b: refB } = refCorners;
    const { a: siblingA, b: siblingB } = siblingCorners;
    const coordinate = isVerticalDirection ? 'x' : 'y';

    const refCoordinateA = refA[coordinate];
    const refCoordinateB = refB[coordinate];
    const siblingCoordinateA = siblingA[coordinate];
    const siblingCoordinateB = siblingB[coordinate];

    if (distanceCalculationMethod === 'center') {
      const refCoordinateCenter = (refCoordinateA + refCoordinateB) / 2;
      const siblingCoordinateCenter =
        (siblingCoordinateA + siblingCoordinateB) / 2;
      return Math.abs(refCoordinateCenter - siblingCoordinateCenter);
    }
    if (distanceCalculationMethod === 'edges') {
      // 1. Find the minimum and maximum coordinates for both ref and sibling
      const refCoordinateEdgeMin = Math.min(refCoordinateA, refCoordinateB);
      const siblingCoordinateEdgeMin = Math.min(
        siblingCoordinateA,
        siblingCoordinateB
      );
      const refCoordinateEdgeMax = Math.max(refCoordinateA, refCoordinateB);
      const siblingCoordinateEdgeMax = Math.max(
        siblingCoordinateA,
        siblingCoordinateB
      );

      // 2. Calculate the distances between the closest edges
      const minEdgeDistance = Math.abs(
        refCoordinateEdgeMin - siblingCoordinateEdgeMin
      );
      const maxEdgeDistance = Math.abs(
        refCoordinateEdgeMax - siblingCoordinateEdgeMax
      );

      // 3. Return the smallest distance between the edges
      return Math.min(minEdgeDistance, maxEdgeDistance);
    }

    // Default to corners
    const distancesToCompare = [
      Math.abs(siblingCoordinateA - refCoordinateA),
      Math.abs(siblingCoordinateA - refCoordinateB),
      Math.abs(siblingCoordinateB - refCoordinateA),
      Math.abs(siblingCoordinateB - refCoordinateB)
    ];
    return Math.min(...distancesToCompare);
  }

  /**
   * Inspired by: https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS_for_TV/TV_remote_control_navigation#Algorithm_design
   * Ref Corners are the 2 corners of the current component in the direction of navigation
   * They are used as a base to measure adjacent slices
   */
  sortSiblingsByPriority(
    siblings: FocusableComponent[],
    currentLayout: FocusableComponentLayout,
    direction: string,
    focusKey: string
  ) {
    const isVerticalDirection =
      direction === DIRECTION_DOWN || direction === DIRECTION_UP;

    const refCorners = SpatialNavigationService.getRefCorners(
      direction,
      false,
      currentLayout
    );

    return siblings.sort((a, b) => {
      const siblingCornersA = SpatialNavigationService.getRefCorners(
        direction,
        true,
        a.layout
      );
      const siblingCornersB = SpatialNavigationService.getRefCorners(
        direction,
        true,
        b.layout
      );

      const isAdjacentSliceA = SpatialNavigationService.isAdjacentSlice(
        refCorners,
        siblingCornersA,
        isVerticalDirection
      );
      const isAdjacentSliceB = SpatialNavigationService.isAdjacentSlice(
        refCorners,
        siblingCornersB,
        isVerticalDirection
      );

      const primaryAxisFunctionA = isAdjacentSliceA
        ? SpatialNavigationService.getPrimaryAxisDistance
        : SpatialNavigationService.getSecondaryAxisDistance;
      const primaryAxisFunctionB = isAdjacentSliceB
        ? SpatialNavigationService.getPrimaryAxisDistance
        : SpatialNavigationService.getSecondaryAxisDistance;

      const secondaryAxisFunctionA = isAdjacentSliceA
        ? SpatialNavigationService.getSecondaryAxisDistance
        : SpatialNavigationService.getPrimaryAxisDistance;
      const secondaryAxisFunctionB = isAdjacentSliceB
        ? SpatialNavigationService.getSecondaryAxisDistance
        : SpatialNavigationService.getPrimaryAxisDistance;

      const primaryAxisDistanceA = primaryAxisFunctionA(
        refCorners,
        siblingCornersA,
        isVerticalDirection,
        this.distanceCalculationMethod,
        this.customDistanceCalculationFunction
      );
      const primaryAxisDistanceB = primaryAxisFunctionB(
        refCorners,
        siblingCornersB,
        isVerticalDirection,
        this.distanceCalculationMethod,
        this.customDistanceCalculationFunction
      );

      const secondaryAxisDistanceA = secondaryAxisFunctionA(
        refCorners,
        siblingCornersA,
        isVerticalDirection,
        this.distanceCalculationMethod,
        this.customDistanceCalculationFunction
      );
      const secondaryAxisDistanceB = secondaryAxisFunctionB(
        refCorners,
        siblingCornersB,
        isVerticalDirection,
        this.distanceCalculationMethod,
        this.customDistanceCalculationFunction
      );

      /**
       * The higher this value is, the less prioritised the candidate is
       */
      const totalDistancePointsA =
        primaryAxisDistanceA * MAIN_COORDINATE_WEIGHT + secondaryAxisDistanceA;
      const totalDistancePointsB =
        primaryAxisDistanceB * MAIN_COORDINATE_WEIGHT + secondaryAxisDistanceB;

      /**
       * + 1 here is in case of distance is zero, but we still want to apply Adjacent priority weight
       */
      const priorityA =
        (totalDistancePointsA + 1) /
        (isAdjacentSliceA ? ADJACENT_SLICE_WEIGHT : DIAGONAL_SLICE_WEIGHT);
      const priorityB =
        (totalDistancePointsB + 1) /
        (isAdjacentSliceB ? ADJACENT_SLICE_WEIGHT : DIAGONAL_SLICE_WEIGHT);

      this.log(
        'smartNavigate',
        `distance (primary, secondary, total weighted) for ${a.focusKey} relative to ${focusKey} is`,
        primaryAxisDistanceA,
        secondaryAxisDistanceA,
        totalDistancePointsA
      );

      this.log(
        'smartNavigate',
        `priority for ${a.focusKey} relative to ${focusKey} is`,
        priorityA
      );

      if (this.visualDebugger) {
        this.visualDebugger.drawPoint(
          siblingCornersA.a.x,
          siblingCornersA.a.y,
          'yellow',
          6
        );
        this.visualDebugger.drawPoint(
          siblingCornersA.b.x,
          siblingCornersA.b.y,
          'yellow',
          6
        );
      }

      return priorityA - priorityB;
    });
  }

  constructor() {
    /**
     * Storage for all focusable components
     */
    this.focusableComponents = {};

    /**
     * Storing current focused key
     */
    this.focusKey = null;

    /**
     * This collection contains focus keys of the elements that are having a child focused
     * Might be handy for styling of certain parent components if their child is focused.
     */
    this.parentsHavingFocusedChild = [];

    this.domNodeFocusOptions = {};
    this.enabled = false;
    this.nativeMode = false;
    this.throttle = 0;
    this.throttleKeypresses = false;
    this.useGetBoundingClientRect = false;
    this.shouldFocusDOMNode = false;
    this.shouldUseNativeEvents = false;
    this.writingDirection = WritingDirection.LTR;

    this.pressedKeys = {};

    /**
     * Flag used to block key events from this service
     * @type {boolean}
     */
    this.paused = false;

    this.keyDownEventListener = null;
    this.keyUpEventListener = null;
    this.keyMap = DEFAULT_KEY_MAP;

    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.setFocus = this.setFocus.bind(this);
    this.updateAllLayouts = this.updateAllLayouts.bind(this);
    this.navigateByDirection = this.navigateByDirection.bind(this);
    this.init = this.init.bind(this);
    this.setThrottle = this.setThrottle.bind(this);
    this.destroy = this.destroy.bind(this);
    this.setKeyMap = this.setKeyMap.bind(this);
    this.getCurrentFocusKey = this.getCurrentFocusKey.bind(this);
    this.doesFocusableExist = this.doesFocusableExist.bind(this);
    this.updateRtl = this.updateRtl.bind(this);

    this.setFocusDebounced = debounce(this.setFocus, AUTO_RESTORE_FOCUS_DELAY, {
      leading: false,
      trailing: true
    });

    this.debug = false;
    this.visualDebugger = null;

    this.logIndex = 0;

    this.distanceCalculationMethod = 'corners';
  }

  init({
    debug = false,
    visualDebug = false,
    nativeMode = false,
    throttle: throttleParam = 0,
    throttleKeypresses = false,
    useGetBoundingClientRect = false,
    shouldFocusDOMNode = false,
    domNodeFocusOptions = {},
    shouldUseNativeEvents = false,
    rtl = false,
    distanceCalculationMethod = 'corners' as DistanceCalculationMethod,
    customDistanceCalculationFunction = undefined as DistanceCalculationFunction
  } = {}) {
    if (!this.enabled) {
      this.domNodeFocusOptions = domNodeFocusOptions;
      this.enabled = true;
      this.nativeMode = nativeMode;
      this.throttleKeypresses = throttleKeypresses;
      this.useGetBoundingClientRect = useGetBoundingClientRect;
      this.shouldFocusDOMNode = shouldFocusDOMNode && !nativeMode;
      this.shouldUseNativeEvents = shouldUseNativeEvents;
      this.writingDirection = rtl ? WritingDirection.RTL : WritingDirection.LTR;
      this.distanceCalculationMethod = distanceCalculationMethod;
      this.customDistanceCalculationFunction =
        customDistanceCalculationFunction;

      this.debug = debug;

      if (!this.nativeMode) {
        if (Number.isInteger(throttleParam) && throttleParam > 0) {
          this.throttle = throttleParam;
        }
        this.bindEventHandlers();
        if (visualDebug) {
          this.visualDebugger = new VisualDebugger(this.writingDirection);
          const draw = () => {
            requestAnimationFrame(() => {
              this.visualDebugger.clearLayouts();
              Object.keys(this.focusableComponents).forEach((focusKey) => {
                const component = this.focusableComponents[focusKey];
                this.visualDebugger.drawLayout(
                  component.layout,
                  focusKey,
                  component.parentFocusKey
                );
              });
              draw();
            });
          };

          draw();
        }
      }
    }
  }

  setThrottle({
    throttle: throttleParam = 0,
    throttleKeypresses = false
  } = {}) {
    this.throttleKeypresses = throttleKeypresses;

    if (!this.nativeMode) {
      this.unbindEventHandlers();
      if (Number.isInteger(throttleParam)) {
        this.throttle = throttleParam;
      }
      this.bindEventHandlers();
    }
  }

  destroy() {
    if (this.enabled) {
      this.enabled = false;
      this.nativeMode = false;
      this.throttle = 0;
      this.throttleKeypresses = false;
      this.focusKey = null;
      this.parentsHavingFocusedChild = [];
      this.focusableComponents = {};
      this.paused = false;
      this.keyMap = DEFAULT_KEY_MAP;

      this.unbindEventHandlers();
    }
  }

  getEventType(keyCode: number | string) {
    return findKey(this.getKeyMap(), (codeList) => codeList.includes(keyCode));
  }

  static getKeyCode(event: KeyboardEvent) {
    return event.keyCode || event.code || event.key;
  }

  bindEventHandlers() {
    // We check both because the React Native remote debugger implements window, but not window.addEventListener.
    if (typeof window !== 'undefined' && window.addEventListener) {
      this.keyDownEventListener = (event: KeyboardEvent) => {
        if (this.paused === true) {
          return;
        }

        if (this.debug) {
          this.logIndex += 1;
        }

        const keyCode = SpatialNavigationService.getKeyCode(event);
        const eventType = this.getEventType(keyCode);

        if (!eventType) {
          return;
        }

        this.pressedKeys[eventType] = this.pressedKeys[eventType]
          ? this.pressedKeys[eventType] + 1
          : 1;

        if (!this.shouldUseNativeEvents) {
          event.preventDefault();
          event.stopPropagation();
        }

        const keysDetails = {
          pressedKeys: this.pressedKeys
        };

        if (eventType === KEY_ENTER && this.focusKey) {
          this.onEnterPress(keysDetails);

          return;
        }

        const preventDefaultNavigation =
          this.onArrowPress(eventType, keysDetails) === false;

        if (this.visualDebugger) {
          this.visualDebugger.clear();
        }

        if (preventDefaultNavigation) {
          this.log('keyDownEventListener', 'default navigation prevented');
        } else {
          const direction = findKey(this.getKeyMap(), (codeList) =>
            codeList.includes(keyCode)
          );

          this.smartNavigate(direction as Direction, null, { event });
        }
      };

      // Apply throttle only if the option we got is > 0 to avoid limiting the listener to every animation frame
      if (this.throttle) {
        this.keyDownEventListenerThrottled = throttle(
          this.keyDownEventListener.bind(this),
          this.throttle,
          THROTTLE_OPTIONS
        );
      }

      // When throttling then make sure to only throttle key down and cancel any queued functions in case of key up
      this.keyUpEventListener = (event: KeyboardEvent) => {
        const keyCode = SpatialNavigationService.getKeyCode(event);
        const eventType = this.getEventType(keyCode);

        delete this.pressedKeys[eventType];

        if (this.throttle && !this.throttleKeypresses) {
          this.keyDownEventListenerThrottled.cancel();
        }

        if (eventType === KEY_ENTER && this.focusKey) {
          this.onEnterRelease();
        }

        if (this.focusKey && (
          eventType === DIRECTION_LEFT ||
          eventType === DIRECTION_RIGHT ||
          eventType === DIRECTION_UP ||
          eventType === DIRECTION_DOWN)) {
          this.onArrowRelease(eventType)
        }
      };

      window.addEventListener('keyup', this.keyUpEventListener);
      window.addEventListener(
        'keydown',
        this.throttle
          ? this.keyDownEventListenerThrottled
          : this.keyDownEventListener
      );
    }
  }

  unbindEventHandlers() {
    // We check both because the React Native remote debugger implements window, but not window.removeEventListener.
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('keyup', this.keyUpEventListener);
      this.keyUpEventListener = null;

      const listener = this.throttle
        ? this.keyDownEventListenerThrottled
        : this.keyDownEventListener;

      window.removeEventListener('keydown', listener);
      this.keyDownEventListener = null;
    }
  }

  onEnterPress(keysDetails: KeyPressDetails) {
    const component = this.focusableComponents[this.focusKey];

    /* Guard against last-focused component being unmounted at time of onEnterPress (e.g due to UI fading out) */
    if (!component) {
      this.log('onEnterPress', 'noComponent');

      return;
    }

    /* Suppress onEnterPress if the last-focused item happens to lose its 'focused' status. */
    if (!component.focusable) {
      this.log('onEnterPress', 'componentNotFocusable');

      return;
    }

    if (component.onEnterPress) {
      component.onEnterPress(keysDetails);
    }
  }

  onEnterRelease() {
    const component = this.focusableComponents[this.focusKey];

    /* Guard against last-focused component being unmounted at time of onEnterRelease (e.g due to UI fading out) */
    if (!component) {
      this.log('onEnterRelease', 'noComponent');

      return;
    }

    /* Suppress onEnterRelease if the last-focused item happens to lose its 'focused' status. */
    if (!component.focusable) {
      this.log('onEnterRelease', 'componentNotFocusable');

      return;
    }

    if (component.onEnterRelease) {
      component.onEnterRelease();
    }
  }

  onArrowPress(direction: string, keysDetails: KeyPressDetails) {
    const component = this.focusableComponents[this.focusKey];

    /* Guard against last-focused component being unmounted at time of onArrowPress (e.g due to UI fading out) */
    if (!component) {
      this.log('onArrowPress', 'noComponent');

      return undefined;
    }

    /* It's okay to navigate AWAY from an item that has lost its 'focused' status, so we don't inspect
     * component.focusable. */

    return (
      component &&
      component.onArrowPress &&
      component.onArrowPress(direction, keysDetails)
    );
  }

  onArrowRelease(direction: string) {
    const component = this.focusableComponents[this.focusKey];

    /* Guard against last-focused component being unmounted at time of onArrowRelease (e.g due to UI fading out) */
    if (!component) {
      this.log('onArrowRelease', 'noComponent');

      return;
    }

    /* Suppress onArrowRelease if the last-focused item happens to lose its 'focused' status. */
    if (!component.focusable) {
      this.log('onArrowRelease', 'componentNotFocusable');

      return;
    }

    if (component.onArrowRelease) {
      component.onArrowRelease(direction);
    }
  }

  /**
   * Move focus by direction, if you can't use buttons or focusing by key.
   *
   * @example
   * navigateByDirection('right') // The focus is moved to right
   */
  navigateByDirection(direction: Direction, focusDetails: FocusDetails) {
    if (this.paused === true || !this.enabled || this.nativeMode) {
      return;
    }

    const validDirections: Direction[] = [
      DIRECTION_DOWN,
      DIRECTION_UP,
      DIRECTION_LEFT,
      DIRECTION_RIGHT
    ];

    if (validDirections.includes(direction)) {
      this.log('navigateByDirection', 'direction', direction);
      this.smartNavigate(direction, null, focusDetails);
    } else {
      this.log(
        'navigateByDirection',
        `Invalid direction. You passed: \`${direction}\`, but you can use only these: `,
        validDirections
      );
    }
  }

  /**
   * This function navigates between siblings OR goes up by the Tree
   * Based on the Direction
   */
  smartNavigate(
    direction: Direction,
    fromParentFocusKey: string,
    focusDetails: FocusDetails
  ) {
    if (this.nativeMode) {
      return;
    }

    const isVerticalDirection =
      direction === DIRECTION_DOWN || direction === DIRECTION_UP;
    const isIncrementalDirection =
      direction === DIRECTION_DOWN ||
      (this.writingDirection === WritingDirection.LTR
        ? direction === DIRECTION_RIGHT
        : direction === DIRECTION_LEFT);

    this.log('smartNavigate', 'direction', direction);
    this.log('smartNavigate', 'fromParentFocusKey', fromParentFocusKey);
    this.log('smartNavigate', 'this.focusKey', this.focusKey);

    if (!fromParentFocusKey) {
      Object.values(this.focusableComponents).forEach((component) => {
        // eslint-disable-next-line no-param-reassign
        component.layoutUpdated = false;
      });
    }

    const currentComponent =
      this.focusableComponents[fromParentFocusKey || this.focusKey];

    /**
     * When there's no currently focused component, an attempt is made, to force focus one of
     * the Focusable Containers, that have "forceFocus" flag enabled.
     */
    if (!fromParentFocusKey && !currentComponent) {
      this.setFocus(this.getForcedFocusKey());
      return;
    }

    this.log(
      'smartNavigate',
      'currentComponent',
      currentComponent ? currentComponent.focusKey : undefined,
      currentComponent ? currentComponent.node : undefined,
      currentComponent
    );

    if (currentComponent) {
      this.updateLayout(currentComponent.focusKey);
      const { parentFocusKey, focusKey, layout } = currentComponent;

      const currentCutoffCoordinate =
        SpatialNavigationService.getCutoffCoordinate(
          isVerticalDirection,
          isIncrementalDirection,
          false,
          layout,
          this.writingDirection
        );

      /**
       * Get only the siblings with the coords on the way of our moving direction
       */
      const siblings = Object.values(this.focusableComponents).filter((component) => {
        if (
          component.parentFocusKey === parentFocusKey &&
          component.focusable
        ) {
          this.updateLayout(component.focusKey);
          const siblingCutoffCoordinate =
            SpatialNavigationService.getCutoffCoordinate(
              isVerticalDirection,
              isIncrementalDirection,
              true,
              component.layout,
              this.writingDirection
            );

          return isVerticalDirection
            ? isIncrementalDirection
              ? siblingCutoffCoordinate >= currentCutoffCoordinate // vertical next
              : siblingCutoffCoordinate <= currentCutoffCoordinate // vertical previous
            : this.writingDirection === WritingDirection.LTR
            ? isIncrementalDirection
              ? siblingCutoffCoordinate >= currentCutoffCoordinate // horizontal LTR next
              : siblingCutoffCoordinate <= currentCutoffCoordinate // horizontal LTR previous
            : isIncrementalDirection
            ? siblingCutoffCoordinate <= currentCutoffCoordinate // horizontal RTL next
            : siblingCutoffCoordinate >= currentCutoffCoordinate; // horizontal RTL previous
        }

        return false;
      });

      if (this.debug) {
        this.log(
          'smartNavigate',
          'currentCutoffCoordinate',
          currentCutoffCoordinate
        );
        this.log(
          'smartNavigate',
          'siblings',
          `${siblings.length} elements:`,
          siblings.map((sibling) => sibling.focusKey).join(', '),
          siblings.map((sibling) => sibling.node),
          siblings.map((sibling) => sibling)
        );
      }

      if (this.visualDebugger) {
        const refCorners = SpatialNavigationService.getRefCorners(
          direction,
          false,
          layout
        );

        this.visualDebugger.drawPoint(refCorners.a.x, refCorners.a.y);
        this.visualDebugger.drawPoint(refCorners.b.x, refCorners.b.y);
      }

      const sortedSiblings = this.sortSiblingsByPriority(
        siblings,
        layout,
        direction,
        focusKey
      );

      const nextComponent = sortedSiblings[0];

      this.log(
        'smartNavigate',
        'nextComponent',
        nextComponent ? nextComponent.focusKey : undefined,
        nextComponent ? nextComponent.node : undefined,
        nextComponent
      );

      if (nextComponent) {
        this.setFocus(nextComponent.focusKey, focusDetails);
      } else {
        const parentComponent = this.focusableComponents[parentFocusKey];

        const focusBoundaryDirections = parentComponent?.isFocusBoundary
          ? parentComponent.focusBoundaryDirections || [direction]
          : [];

        if (!parentComponent || !focusBoundaryDirections.includes(direction)) {
          this.smartNavigate(direction, parentFocusKey, focusDetails);
        } else {
          currentComponent.onBoundaryHit(direction);
          parentComponent.onBoundaryHit(direction);
        }
      }
    }
  }

  saveLastFocusedChildKey(component: FocusableComponent, focusKey: string) {
    if (component) {
      this.log(
        'saveLastFocusedChildKey',
        `${component.focusKey} lastFocusedChildKey set`,
        focusKey
      );

      // eslint-disable-next-line no-param-reassign
      component.lastFocusedChildKey = focusKey;
    }
  }

  log(functionName: string, debugString: string, ...rest: any[]) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(
        `%c${functionName}%c${debugString}`,
        `background: ${DEBUG_FN_COLORS[this.logIndex % DEBUG_FN_COLORS.length]
        }; color: black; padding: 1px 5px;`,
        'background: #333; color: #BADA55; padding: 1px 5px;',
        ...rest
      );
    }
  }

  /**
   * Returns the current focus key
   */
  getCurrentFocusKey(): string {
    return this.focusKey;
  }

  /**
   * Returns the focus key to which focus can be forced if there are force-focusable components.
   * A component closest to the top left viewport corner (0,0) is returned.
   */
  getForcedFocusKey(): string | undefined {
    const forceFocusableComponents = Object.values(this.focusableComponents).filter(
      (component) => component.focusable && component.forceFocus
    );

    /**
     * Searching of the top level component that is closest to the top left viewport corner (0,0).
     * To achieve meaningful and coherent results, 'down' direction is forced.
     */
    const sortedForceFocusableComponents = this.sortSiblingsByPriority(
      forceFocusableComponents,
      {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        node: null
      },
      'down',
      ROOT_FOCUS_KEY
    );

    return sortedForceFocusableComponents[0]?.focusKey;
  }

  /**
   * This function tries to determine the next component to Focus
   * It's either the target node OR the one down by the Tree if node has children components
   * Based on "targetFocusKey" which means the "intended component to focus"
   */
  getNextFocusKey(targetFocusKey: string): string {
    const targetComponent = this.focusableComponents[targetFocusKey];

    /**
     * Security check, if component doesn't exist, stay on the same focusKey
     */
    if (!targetComponent || this.nativeMode) {
      return targetFocusKey;
    }

    const children = Object.values(this.focusableComponents).filter((component) =>
      component.parentFocusKey === targetFocusKey && component.focusable
    );

    if (children.length > 0) {
      const { lastFocusedChildKey, preferredChildFocusKey } = targetComponent;

      this.log(
        'getNextFocusKey',
        'lastFocusedChildKey is',
        lastFocusedChildKey
      );
      this.log(
        'getNextFocusKey',
        'preferredChildFocusKey is',
        preferredChildFocusKey
      );

      /**
       * First of all trying to focus last focused child
       */
      if (
        lastFocusedChildKey &&
        targetComponent.saveLastFocusedChild &&
        this.isParticipatingFocusableComponent(lastFocusedChildKey)
      ) {
        this.log(
          'getNextFocusKey',
          'lastFocusedChildKey will be focused',
          lastFocusedChildKey
        );

        return this.getNextFocusKey(lastFocusedChildKey);
      }

      /**
       * If there is no lastFocusedChild, trying to focus the preferred focused key
       */
      if (
        preferredChildFocusKey &&
        this.isParticipatingFocusableComponent(preferredChildFocusKey)
      ) {
        this.log(
          'getNextFocusKey',
          'preferredChildFocusKey will be focused',
          preferredChildFocusKey
        );

        return this.getNextFocusKey(preferredChildFocusKey);
      }

      /**
       * Otherwise, trying to focus something by coordinates
       */
      children.forEach((component) => this.updateLayout(component.focusKey));
      const { focusKey: childKey } = getChildClosestToOrigin(
        children,
        this.writingDirection
      );

      this.log('getNextFocusKey', 'childKey will be focused', childKey);

      return this.getNextFocusKey(childKey);
    }

    /**
     * If no children, just return targetFocusKey back
     */
    this.log('getNextFocusKey', 'targetFocusKey', targetFocusKey);

    return targetFocusKey;
  }

  addFocusable({
    focusKey,
    node,
    parentFocusKey,
    onEnterPress,
    onEnterRelease,
    onBoundaryHit,
    onArrowPress,
    onArrowRelease,
    onFocus,
    onBlur,
    saveLastFocusedChild,
    trackChildren,
    onUpdateFocus,
    onUpdateHasFocusedChild,
    preferredChildFocusKey,
    autoRestoreFocus,
    forceFocus,
    focusable,
    isFocusBoundary,
    focusBoundaryDirections
  }: FocusableComponent) {
    this.focusableComponents[focusKey] = {
      focusKey,
      node,
      parentFocusKey,
      onEnterPress,
      onEnterRelease,
      onBoundaryHit,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      onUpdateFocus,
      onUpdateHasFocusedChild,
      saveLastFocusedChild,
      trackChildren,
      preferredChildFocusKey,
      focusable,
      isFocusBoundary,
      focusBoundaryDirections,
      autoRestoreFocus,
      forceFocus,
      lastFocusedChildKey: null,
      layout: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,

        /**
         * Node ref is also duplicated in layout to be reported in onFocus callback
         */
        node
      },
      layoutUpdated: false
    };

    if (!node) {
      // eslint-disable-next-line no-console
      console.warn(
        'Component added without a node reference. This will result in its coordinates being empty and may cause lost focus. Check the "ref" passed to "useFocusable": ',
        this.focusableComponents[focusKey]
      );
    }

    if (this.nativeMode) {
      return;
    }

    this.updateLayout(focusKey);

    this.log(
      'addFocusable',
      'Component added: ',
      this.focusableComponents[focusKey]
    );

    /**
     * If for some reason this component was already focused before it was added, call the update
     */
    if (focusKey === this.focusKey) {
      this.setFocus(preferredChildFocusKey || focusKey);
    }

    /**
     * Parent nodes are created after children, and child may focus itself.
     * If so, it's required to check if parent lies on a path to focused child.
     */
    let currentComponent = this.focusableComponents[this.focusKey];
    while (currentComponent) {
      if (currentComponent.parentFocusKey === focusKey) {
        this.updateParentsHasFocusedChild(this.focusKey, {});
        this.updateParentsLastFocusedChild(this.focusKey);
        break;
      }
      currentComponent =
        this.focusableComponents[currentComponent.parentFocusKey];
    }
  }

  removeFocusable({ focusKey }: FocusableComponentRemovePayload) {
    const componentToRemove = this.focusableComponents[focusKey];

    if (componentToRemove) {
      const { parentFocusKey, onUpdateFocus } = componentToRemove;

      onUpdateFocus(false);

      this.log('removeFocusable', 'Component removed: ', componentToRemove);

      delete this.focusableComponents[focusKey];

      const hadFocusedChild = this.parentsHavingFocusedChild.includes(focusKey);
      this.parentsHavingFocusedChild = this.parentsHavingFocusedChild.filter(
        (parentWithFocusedChild) => parentWithFocusedChild !== focusKey
      );

      const parentComponent = this.focusableComponents[parentFocusKey];
      const isFocused = focusKey === this.focusKey;

      /**
       * If the component was stored as lastFocusedChild, clear lastFocusedChildKey from parent
       */
      if (parentComponent && parentComponent.lastFocusedChildKey === focusKey) {
        parentComponent.lastFocusedChildKey = null;
      }

      if (this.nativeMode) {
        return;
      }

      /**
       * If the component was also focused at this time, OR had focused child, focus its parent -> it will focus another child
       * Normally the order of components unmount is children -> parents, but sometimes parent can be removed before the child
       * So we need to check not only for the current Leaf component focus state, but also if it was a Parent that had focused child
       */
      if (
        (isFocused || hadFocusedChild) &&
        parentComponent &&
        parentComponent.autoRestoreFocus
      ) {
        this.log(
          'removeFocusable',
          'Component removed: ',
          isFocused ? 'Leaf component' : 'Container component',
          'Auto restoring focus to: ',
          parentFocusKey
        );

        /**
         * Focusing parent with a slight delay
         * This is to avoid multiple focus restorations if multiple children getting unmounted in one render cycle
         */
        this.setFocusDebounced(parentFocusKey);
      }
    }
  }

  getNodeLayoutByFocusKey(focusKey: string) {
    const component = this.focusableComponents[focusKey];

    if (component) {
      this.updateLayout(component.focusKey);

      return component.layout;
    }

    return null;
  }

  setCurrentFocusedKey(newFocusKey: string, focusDetails: FocusDetails) {
    if (
      this.isFocusableComponent(this.focusKey) &&
      newFocusKey !== this.focusKey
    ) {
      const oldComponent = this.focusableComponents[this.focusKey];
      oldComponent.onUpdateFocus(false);
      oldComponent.onBlur(
        this.getNodeLayoutByFocusKey(this.focusKey),
        focusDetails
      );

      oldComponent.node?.removeAttribute?.('data-focused');

      this.log('setCurrentFocusedKey', 'onBlur', oldComponent);
    }

    this.focusKey = newFocusKey;

    if (this.isFocusableComponent(this.focusKey)) {
      const newComponent = this.focusableComponents[this.focusKey];

      if (this.shouldFocusDOMNode && newComponent.node) {
        newComponent.node.focus(this.domNodeFocusOptions);
      }

      newComponent.node?.setAttribute?.('data-focused', 'true');

      newComponent.onUpdateFocus(true);
      newComponent.onFocus(
        this.getNodeLayoutByFocusKey(this.focusKey),
        focusDetails
      );

      this.log('setCurrentFocusedKey', 'onFocus', newComponent);
    }
  }

  updateParentsHasFocusedChild(focusKey: string, focusDetails: FocusDetails) {
    const parents = [];

    let currentComponent = this.focusableComponents[focusKey];

    /**
     * Recursively iterate the tree up and find all the parents' focus keys
     */
    while (currentComponent) {
      const { parentFocusKey } = currentComponent;

      const parentComponent = this.focusableComponents[parentFocusKey];

      if (parentComponent) {
        const { focusKey: currentParentFocusKey } = parentComponent;

        parents.push(currentParentFocusKey);
      }

      currentComponent = parentComponent;
    }

    const parentsToRemoveFlag = difference(
      this.parentsHavingFocusedChild,
      parents
    );
    const parentsToAddFlag = difference(
      parents,
      this.parentsHavingFocusedChild
    );

    parentsToRemoveFlag.forEach((parentFocusKey) => {
      const parentComponent = this.focusableComponents[parentFocusKey];

      if (parentComponent && parentComponent.trackChildren) {
        parentComponent.onUpdateHasFocusedChild(false);
      }
      this.onIntermediateNodeBecameBlurred(parentFocusKey, focusDetails);
    });

    parentsToAddFlag.forEach((parentFocusKey) => {
      const parentComponent = this.focusableComponents[parentFocusKey];

      if (parentComponent && parentComponent.trackChildren) {
        parentComponent.onUpdateHasFocusedChild(true);
      }
      this.onIntermediateNodeBecameFocused(parentFocusKey, focusDetails);
    });

    this.parentsHavingFocusedChild = parents;
  }

  updateParentsLastFocusedChild(focusKey: string) {
    let currentComponent = this.focusableComponents[focusKey];

    /**
     * Recursively iterate the tree up and update all the parent's lastFocusedChild
     */
    while (currentComponent) {
      const { parentFocusKey } = currentComponent;

      const parentComponent = this.focusableComponents[parentFocusKey];

      if (parentComponent) {
        this.saveLastFocusedChildKey(
          parentComponent,
          currentComponent.focusKey
        );
      }

      currentComponent = parentComponent;
    }
  }

  getKeyMap() {
    return this.keyMap;
  }

  setKeyMap(keyMap: BackwardsCompatibleKeyMap) {
    this.keyMap = {
      ...this.getKeyMap(),
      ...normalizeKeyMap(keyMap)
    };
  }

  isFocusableComponent(focusKey: string) {
    return !!this.focusableComponents[focusKey];
  }

  /**
   * Checks whether the focusableComponent is actually participating in spatial navigation (in other words, is a
   * 'focusable' focusableComponent). Seems less confusing than calling it isFocusableFocusableComponent()
   */
  isParticipatingFocusableComponent(focusKey: string) {
    return (
      this.isFocusableComponent(focusKey) &&
      this.focusableComponents[focusKey].focusable
    );
  }

  onIntermediateNodeBecameFocused(
    focusKey: string,
    focusDetails: FocusDetails
  ) {
    if (this.isParticipatingFocusableComponent(focusKey)) {
      this.focusableComponents[focusKey].onFocus(
        this.getNodeLayoutByFocusKey(focusKey),
        focusDetails
      );
    }
  }

  onIntermediateNodeBecameBlurred(
    focusKey: string,
    focusDetails: FocusDetails
  ) {
    if (this.isParticipatingFocusableComponent(focusKey)) {
      this.focusableComponents[focusKey].onBlur(
        this.getNodeLayoutByFocusKey(focusKey),
        focusDetails
      );
    }
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  setFocus(focusKey: string, focusDetails: FocusDetails = {}) {
    // Cancel any pending auto-restore focus calls if we are setting focus manually
    this.setFocusDebounced.cancel();

    if (!this.enabled) {
      return;
    }

    this.log('setFocus', 'focusKey', focusKey);

    /**
     * When focusKey is not provided or is equal to `ROOT_FOCUS_KEY`, an attempt is made,
     * to force focus one of the Focusable Containers, that have "forceFocus" flag enabled.
     * A component closest to the top left viewport corner (0,0) is force-focused.
     */
    if (!focusKey || focusKey === ROOT_FOCUS_KEY) {
      // eslint-disable-next-line no-param-reassign
      focusKey = this.getForcedFocusKey();
    }

    const newFocusKey = this.getNextFocusKey(focusKey);

    this.log('setFocus', 'newFocusKey', newFocusKey);

    this.setCurrentFocusedKey(newFocusKey, focusDetails);
    this.updateParentsHasFocusedChild(newFocusKey, focusDetails);
    this.updateParentsLastFocusedChild(newFocusKey);
  }

  updateAllLayouts() {
    if (!this.enabled || this.nativeMode) {
      return;
    }

    Object.keys(this.focusableComponents).forEach((focusKey) => {
      this.updateLayout(focusKey);
    });
  }

  updateLayout(focusKey: string) {
    const component = this.focusableComponents[focusKey];

    if (!component || this.nativeMode || component.layoutUpdated) {
      return;
    }

    const { node } = component;

    const layout = this.useGetBoundingClientRect
      ? getBoundingClientRect(node)
      : measureLayout(node);

    component.layout = {
      ...layout,
      node
    };
  }

  updateFocusable(
    focusKey: string,
    {
      node,
      preferredChildFocusKey,
      focusable,
      isFocusBoundary,
      focusBoundaryDirections,
      onEnterPress,
      onEnterRelease,
      onBoundaryHit,
      onArrowPress,
      onFocus,
      onBlur
    }: FocusableComponentUpdatePayload
  ) {
    if (this.nativeMode) {
      return;
    }

    const component = this.focusableComponents[focusKey];

    if (component) {
      component.preferredChildFocusKey = preferredChildFocusKey;
      component.focusable = focusable;
      component.isFocusBoundary = isFocusBoundary;
      component.focusBoundaryDirections = focusBoundaryDirections;
      component.onEnterPress = onEnterPress;
      component.onEnterRelease = onEnterRelease;
      component.onBoundaryHit = onBoundaryHit
      component.onArrowPress = onArrowPress;
      component.onFocus = onFocus;
      component.onBlur = onBlur;

      if (node) {
        component.node = node;
      }
    }
  }

  isNativeMode() {
    return this.nativeMode;
  }

  doesFocusableExist(focusKey: string) {
    return !!this.focusableComponents[focusKey];
  }

  /**
   * This function updates the writing direction
   * @param rtl whether the writing direction is right-to-left
   */
  updateRtl(rtl: boolean) {
    this.writingDirection = rtl ? WritingDirection.RTL : WritingDirection.LTR;
  }
}

/**
 * Export singleton
 */
export const SpatialNavigation = new SpatialNavigationService();

export const {
  init,
  setThrottle,
  destroy,
  setKeyMap,
  setFocus,
  navigateByDirection,
  pause,
  resume,
  updateAllLayouts,
  getCurrentFocusKey,
  doesFocusableExist,
  updateRtl
} = SpatialNavigation;
