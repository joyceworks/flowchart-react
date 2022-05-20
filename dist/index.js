function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

import { useMemo, useCallback, forwardRef, useRef, useState, useImperativeHandle } from 'react';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var _assign = function __assign() {
  _assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return _assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var immutabilityHelper = {
  exports: {}
};

(function (module, exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function stringifiable(obj) {
    // Safely stringify Object.create(null)

    /* istanbul ignore next */
    return _typeof(obj) === 'object' && !('toString' in obj) ? Object.prototype.toString.call(obj).slice(8, -1) : obj;
  }

  var isProduction = (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && process.env.NODE_ENV === 'production';

  function invariant(condition, message) {
    if (!condition) {
      /* istanbul ignore next */
      if (isProduction) {
        throw new Error('Invariant failed');
      }

      throw new Error(message());
    }
  }

  exports.invariant = invariant;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var splice = Array.prototype.splice;
  var toString = Object.prototype.toString;

  function type(obj) {
    return toString.call(obj).slice(8, -1);
  }

  var assign = Object.assign ||
  /* istanbul ignore next */
  function (target, source) {
    getAllKeys(source).forEach(function (key) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    });
    return target;
  };

  var getAllKeys = typeof Object.getOwnPropertySymbols === 'function' ? function (obj) {
    return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
  }
  /* istanbul ignore next */
  : function (obj) {
    return Object.keys(obj);
  };

  function copy(object) {
    return Array.isArray(object) ? assign(object.constructor(object.length), object) : type(object) === 'Map' ? new Map(object) : type(object) === 'Set' ? new Set(object) : object && _typeof(object) === 'object' ? assign(Object.create(Object.getPrototypeOf(object)), object)
    /* istanbul ignore next */
    : object;
  }

  var Context =
  /** @class */
  function () {
    function Context() {
      this.commands = assign({}, defaultCommands);
      this.update = this.update.bind(this); // Deprecated: update.extend, update.isEquals and update.newContext

      this.update.extend = this.extend = this.extend.bind(this);

      this.update.isEquals = function (x, y) {
        return x === y;
      };

      this.update.newContext = function () {
        return new Context().update;
      };
    }

    Object.defineProperty(Context.prototype, "isEquals", {
      get: function get() {
        return this.update.isEquals;
      },
      set: function set(value) {
        this.update.isEquals = value;
      },
      enumerable: true,
      configurable: true
    });

    Context.prototype.extend = function (directive, fn) {
      this.commands[directive] = fn;
    };

    Context.prototype.update = function (object, $spec) {
      var _this = this;

      var spec = typeof $spec === 'function' ? {
        $apply: $spec
      } : $spec;

      if (!(Array.isArray(object) && Array.isArray(spec))) {
        invariant(!Array.isArray(spec), function () {
          return "update(): You provided an invalid spec to update(). The spec may " + "not contain an array except as the value of $set, $push, $unshift, " + "$splice or any custom command allowing an array value.";
        });
      }

      invariant(_typeof(spec) === 'object' && spec !== null, function () {
        return "update(): You provided an invalid spec to update(). The spec and " + "every included key path must be plain objects containing one of the " + ("following commands: " + Object.keys(_this.commands).join(', ') + ".");
      });
      var nextObject = object;
      getAllKeys(spec).forEach(function (key) {
        if (hasOwnProperty.call(_this.commands, key)) {
          var objectWasNextObject = object === nextObject;
          nextObject = _this.commands[key](spec[key], nextObject, spec, object);

          if (objectWasNextObject && _this.isEquals(nextObject, object)) {
            nextObject = object;
          }
        } else {
          var nextValueForKey = type(object) === 'Map' ? _this.update(object.get(key), spec[key]) : _this.update(object[key], spec[key]);
          var nextObjectValue = type(nextObject) === 'Map' ? nextObject.get(key) : nextObject[key];

          if (!_this.isEquals(nextValueForKey, nextObjectValue) || typeof nextValueForKey === 'undefined' && !hasOwnProperty.call(object, key)) {
            if (nextObject === object) {
              nextObject = copy(object);
            }

            if (type(nextObject) === 'Map') {
              nextObject.set(key, nextValueForKey);
            } else {
              nextObject[key] = nextValueForKey;
            }
          }
        }
      });
      return nextObject;
    };

    return Context;
  }();

  exports.Context = Context;
  var defaultCommands = {
    $push: function $push(value, nextObject, spec) {
      invariantPushAndUnshift(nextObject, spec, '$push');
      return value.length ? nextObject.concat(value) : nextObject;
    },
    $unshift: function $unshift(value, nextObject, spec) {
      invariantPushAndUnshift(nextObject, spec, '$unshift');
      return value.length ? value.concat(nextObject) : nextObject;
    },
    $splice: function $splice(value, nextObject, spec, originalObject) {
      invariantSplices(nextObject, spec);
      value.forEach(function (args) {
        invariantSplice(args);

        if (nextObject === originalObject && args.length) {
          nextObject = copy(originalObject);
        }

        splice.apply(nextObject, args);
      });
      return nextObject;
    },
    $set: function $set(value, _nextObject, spec) {
      invariantSet(spec);
      return value;
    },
    $toggle: function $toggle(targets, nextObject) {
      invariantSpecArray(targets, '$toggle');
      var nextObjectCopy = targets.length ? copy(nextObject) : nextObject;
      targets.forEach(function (target) {
        nextObjectCopy[target] = !nextObject[target];
      });
      return nextObjectCopy;
    },
    $unset: function $unset(value, nextObject, _spec, originalObject) {
      invariantSpecArray(value, '$unset');
      value.forEach(function (key) {
        if (Object.hasOwnProperty.call(nextObject, key)) {
          if (nextObject === originalObject) {
            nextObject = copy(originalObject);
          }

          delete nextObject[key];
        }
      });
      return nextObject;
    },
    $add: function $add(values, nextObject, _spec, originalObject) {
      invariantMapOrSet(nextObject, '$add');
      invariantSpecArray(values, '$add');

      if (type(nextObject) === 'Map') {
        values.forEach(function (_a) {
          var key = _a[0],
              value = _a[1];

          if (nextObject === originalObject && nextObject.get(key) !== value) {
            nextObject = copy(originalObject);
          }

          nextObject.set(key, value);
        });
      } else {
        values.forEach(function (value) {
          if (nextObject === originalObject && !nextObject.has(value)) {
            nextObject = copy(originalObject);
          }

          nextObject.add(value);
        });
      }

      return nextObject;
    },
    $remove: function $remove(value, nextObject, _spec, originalObject) {
      invariantMapOrSet(nextObject, '$remove');
      invariantSpecArray(value, '$remove');
      value.forEach(function (key) {
        if (nextObject === originalObject && nextObject.has(key)) {
          nextObject = copy(originalObject);
        }

        nextObject["delete"](key);
      });
      return nextObject;
    },
    $merge: function $merge(value, nextObject, _spec, originalObject) {
      invariantMerge(nextObject, value);
      getAllKeys(value).forEach(function (key) {
        if (value[key] !== nextObject[key]) {
          if (nextObject === originalObject) {
            nextObject = copy(originalObject);
          }

          nextObject[key] = value[key];
        }
      });
      return nextObject;
    },
    $apply: function $apply(value, original) {
      invariantApply(value);
      return value(original);
    }
  };
  var defaultContext = new Context();
  exports.isEquals = defaultContext.update.isEquals;
  exports.extend = defaultContext.extend;
  exports["default"] = defaultContext.update; // @ts-ignore

  exports["default"]["default"] = module.exports = assign(exports["default"], exports); // invariants

  function invariantPushAndUnshift(value, spec, command) {
    invariant(Array.isArray(value), function () {
      return "update(): expected target of " + stringifiable(command) + " to be an array; got " + stringifiable(value) + ".";
    });
    invariantSpecArray(spec[command], command);
  }

  function invariantSpecArray(spec, command) {
    invariant(Array.isArray(spec), function () {
      return "update(): expected spec of " + stringifiable(command) + " to be an array; got " + stringifiable(spec) + ". " + "Did you forget to wrap your parameter in an array?";
    });
  }

  function invariantSplices(value, spec) {
    invariant(Array.isArray(value), function () {
      return "Expected $splice target to be an array; got " + stringifiable(value);
    });
    invariantSplice(spec.$splice);
  }

  function invariantSplice(value) {
    invariant(Array.isArray(value), function () {
      return "update(): expected spec of $splice to be an array of arrays; got " + stringifiable(value) + ". " + "Did you forget to wrap your parameters in an array?";
    });
  }

  function invariantApply(fn) {
    invariant(typeof fn === 'function', function () {
      return "update(): expected spec of $apply to be a function; got " + stringifiable(fn) + ".";
    });
  }

  function invariantSet(spec) {
    invariant(Object.keys(spec).length === 1, function () {
      return "Cannot have more than one key in an object with $set";
    });
  }

  function invariantMerge(target, specValue) {
    invariant(specValue && _typeof(specValue) === 'object', function () {
      return "update(): $merge expects a spec of type 'object'; got " + stringifiable(specValue);
    });
    invariant(target && _typeof(target) === 'object', function () {
      return "update(): $merge expects a target of type 'object'; got " + stringifiable(target);
    });
  }

  function invariantMapOrSet(target, command) {
    var typeOfTarget = type(target);
    invariant(typeOfTarget === 'Map' || typeOfTarget === 'Set', function () {
      return "update(): " + stringifiable(command) + " expects a target of type Set or Map; got " + stringifiable(typeOfTarget);
    });
  }
})(immutabilityHelper, immutabilityHelper.exports);

var update = /*@__PURE__*/getDefaultExportFromCjs(immutabilityHelper.exports);

function pathing(p1, p2, startPosition, endPosition) {
  var points = [];
  var start = [p1.x, p1.y];
  var end = [p2.x, p2.y];
  var centerX = start[0] + (end[0] - start[0]) / 2;
  var centerY = start[1] + (end[1] - start[1]) / 2;
  var second;

  var addVerticalCenterLine = function addVerticalCenterLine() {
    var third = [centerX, second[1]];
    var forth = [centerX, penult[1]];
    points.push(third);
    points.push(forth);
  };

  var addHorizontalCenterLine = function addHorizontalCenterLine() {
    var third = [second[0], centerY];
    var forth = [penult[0], centerY];
    points.push(third);
    points.push(forth);
  };

  var addHorizontalTopLine = function addHorizontalTopLine() {
    points.push([second[0], start[1] - 50]);
    points.push([penult[0], start[1] - 50]);
  };

  var addHorizontalBottomLine = function addHorizontalBottomLine() {
    points.push([second[0], start[1] + 50]);
    points.push([penult[0], start[1] + 50]);
  };

  var addVerticalRightLine = function addVerticalRightLine() {
    points.push([start[0] + 80, second[1]]);
    points.push([start[0] + 80, penult[1]]);
  };

  var addVerticalLeftLine = function addVerticalLeftLine() {
    points.push([start[0] - 80, second[1]]);
    points.push([start[0] - 80, penult[1]]);
  };

  var addSecondXPenultY = function addSecondXPenultY() {
    points.push([second[0], penult[1]]);
  };

  var addPenultXSecondY = function addPenultXSecondY() {
    points.push([penult[0], second[1]]);
  };

  switch (startPosition) {
    case "left":
      second = [start[0] - 20, start[1]];
      break;

    case "top":
      second = [start[0], start[1] - 20];
      break;

    case "bottom":
      second = [start[0], start[1] + 20];
      break;

    default:
      second = [start[0] + 20, start[1]];
      break;
  }

  var penult;

  switch (endPosition) {
    case "right":
      penult = [end[0] + 20, end[1]];
      break;

    case "top":
      penult = [end[0], end[1] - 20];
      break;

    case "bottom":
      penult = [end[0], end[1] + 20];
      break;

    default:
      penult = [end[0] - 20, end[1]];
      break;
  }

  points.push(start);
  points.push(second);
  startPosition = startPosition || "right";
  endPosition = endPosition || "left";
  var direction = calcDirection(p1, p2);

  if (direction.indexOf("r") > -1) {
    if (startPosition === "right" || endPosition === "left") {
      if (second[0] > centerX) {
        second[0] = centerX;
      }

      if (penult[0] < centerX) {
        penult[0] = centerX;
      }
    }
  }

  if (direction.indexOf("d") > -1) {
    if (startPosition === "bottom" || endPosition === "top") {
      if (second[1] > centerY) {
        second[1] = centerY;
      }

      if (penult[1] < centerY) {
        penult[1] = centerY;
      }
    }
  }

  if (direction.indexOf("l") > -1) {
    if (startPosition === "left" || endPosition === "right") {
      if (second[0] < centerX) {
        second[0] = centerX;
      }

      if (penult[0] > centerX) {
        penult[0] = centerX;
      }
    }
  }

  if (direction.indexOf("u") > -1) {
    if (startPosition === "top" || endPosition === "bottom") {
      if (second[1] < centerY) {
        second[1] = centerY;
      }

      if (penult[1] > centerY) {
        penult[1] = centerY;
      }
    }
  }

  switch (direction) {
    case "lu":
      {
        if (startPosition === "right") {
          switch (endPosition) {
            case "top":
            case "right":
              addSecondXPenultY();
              break;

            default:
              {
                addHorizontalCenterLine();
                break;
              }
          }
        } else if (startPosition === "bottom") {
          switch (endPosition) {
            case "top":
              addVerticalCenterLine();
              break;

            default:
              {
                addPenultXSecondY();
                break;
              }
          }
        } else if (startPosition === "top") {
          switch (endPosition) {
            case "top":
            case "right":
              addSecondXPenultY();
              break;

            default:
              {
                addHorizontalCenterLine();
                break;
              }
          }
        } else {
          // startPosition is left
          switch (endPosition) {
            case "top":
            case "right":
              addVerticalCenterLine();
              break;

            default:
              {
                addPenultXSecondY();
                break;
              }
          }
        }

        break;
      }

    case "u":
      if (startPosition === "right") {
        switch (endPosition) {
          case "right":
            {
              break;
            }

          case "top":
            {
              addSecondXPenultY();
              break;
            }

          default:
            {
              addHorizontalCenterLine();
              break;
            }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
          case "right":
            addPenultXSecondY();
            break;

          default:
            {
              addVerticalRightLine();
              break;
            }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left":
            {
              addPenultXSecondY();
              break;
            }

          case "right":
            {
              addHorizontalCenterLine();
              break;
            }

          case "top":
            addVerticalRightLine();
            break;
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "right":
            break;

          default:
            {
              points.push([second[0], penult[1]]);
              break;
            }
        }
      }

      break;

    case "ru":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left":
            {
              addVerticalCenterLine();
              break;
            }

          case "top":
            {
              addSecondXPenultY();
              break;
            }

          default:
            {
              addPenultXSecondY();
              break;
            }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "top":
            {
              addVerticalCenterLine();
              break;
            }

          default:
            {
              addPenultXSecondY();
              break;
            }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "right":
            {
              addVerticalCenterLine();
              break;
            }

          default:
            {
              addSecondXPenultY();
              break;
            }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "top":
            addSecondXPenultY();
            break;

          default:
            {
              addHorizontalCenterLine();
              break;
            }
        }
      }

      break;

    case "l":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addHorizontalTopLine();
            break;

          default:
            {
              addHorizontalBottomLine();
              break;
            }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
            {
              addHorizontalBottomLine();
              break;
            }

          case "right":
            {
              addSecondXPenultY();
              break;
            }

          case "top":
            {
              addVerticalCenterLine();
              break;
            }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left":
            {
              addHorizontalTopLine();
              break;
            }

          case "right":
            {
              addSecondXPenultY();
              break;
            }

          case "top":
            {
              break;
            }

          default:
            {
              addVerticalCenterLine();
              break;
            }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
            {
              addHorizontalTopLine();
              break;
            }

          case "right":
            {
              break;
            }

          default:
            {
              addSecondXPenultY();
              break;
            }
        }
      }

      break;

    case "r":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left":
            {
              break;
            }

          case "right":
            {
              addHorizontalTopLine();
              break;
            }

          default:
            {
              addSecondXPenultY();
              break;
            }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
            {
              addSecondXPenultY();
              break;
            }

          case "right":
            {
              addHorizontalBottomLine();
              break;
            }

          case "top":
            {
              addVerticalCenterLine();
              break;
            }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left":
            {
              addPenultXSecondY();
              break;
            }

          case "right":
            {
              addHorizontalTopLine();
              break;
            }

          case "top":
            {
              break;
            }

          default:
            {
              addVerticalCenterLine();
              break;
            }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addHorizontalTopLine();
            break;

          default:
            {
              addHorizontalBottomLine();
              break;
            }
        }
      }

      break;

    case "ld":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left":
            {
              addHorizontalCenterLine();
              break;
            }

          default:
            {
              addSecondXPenultY();
              break;
            }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
            {
              addPenultXSecondY();
              break;
            }

          case "top":
            {
              addHorizontalCenterLine();
              break;
            }

          default:
            {
              addSecondXPenultY();
              break;
            }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addPenultXSecondY();
            break;

          default:
            {
              addVerticalCenterLine();
              break;
            }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "top":
            addPenultXSecondY();
            break;

          case "right":
            {
              addVerticalCenterLine();
              break;
            }

          default:
            {
              addSecondXPenultY();
              break;
            }
        }
      }

      break;

    case "d":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left":
            {
              addHorizontalCenterLine();
              break;
            }

          case "right":
            {
              addPenultXSecondY();
              break;
            }

          case "top":
            {
              addSecondXPenultY();
              break;
            }

          default:
            {
              addVerticalRightLine();
              break;
            }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
          case "right":
            addPenultXSecondY();
            break;

          case "top":
            {
              break;
            }

          default:
            {
              addVerticalRightLine();
              break;
            }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left":
            {
              addVerticalLeftLine();
              break;
            }

          default:
            {
              addVerticalRightLine();
              break;
            }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
            {
              break;
            }

          case "right":
            {
              addHorizontalCenterLine();
              break;
            }

          case "top":
            {
              addSecondXPenultY();
              break;
            }

          default:
            {
              addVerticalLeftLine();
              break;
            }
        }
      }

      break;

    case "rd":
      {
        if (startPosition === "right" && endPosition === "left") {
          addVerticalCenterLine();
        } else if (startPosition === "right" && endPosition === "bottom") {
          addSecondXPenultY();
        } else if (startPosition === "right" && endPosition === "top" || startPosition === "right" && endPosition === "right") {
          addPenultXSecondY();
        } else if (startPosition === "bottom" && endPosition === "left") {
          addSecondXPenultY();
        } else if (startPosition === "bottom" && endPosition === "right") {
          addPenultXSecondY();
        } else if (startPosition === "bottom" && endPosition === "top") {
          addHorizontalCenterLine();
        } else if (startPosition === "bottom" && endPosition === "bottom") {
          addSecondXPenultY();
        } else if (startPosition === "top" && endPosition === "left") {
          addPenultXSecondY();
        } else if (startPosition === "top" && endPosition === "right") {
          addPenultXSecondY();
        } else if (startPosition === "top" && endPosition === "top") {
          addPenultXSecondY();
        } else if (startPosition === "top" && endPosition === "bottom") {
          addVerticalCenterLine();
        } else if (startPosition === "left" && endPosition === "left") {
          addSecondXPenultY();
        } else if (startPosition === "left" && endPosition === "right") {
          addHorizontalCenterLine();
        } else if (startPosition === "left" && endPosition === "top") {
          addHorizontalCenterLine();
        } else if (startPosition === "left" && endPosition === "bottom") {
          addSecondXPenultY();
        }

        break;
      }
  }

  points.push(penult);
  points.push(end);
  return points;
}

function calcDirection(p1, p2) {
  // Use approximatelyEquals to fix the problem of css position precision
  if (p2.x < p1.x && p2.y === p1.y) {
    return "l";
  }

  if (p2.x > p1.x && p2.y === p1.y) {
    return "r";
  }

  if (p2.x === p1.x && p2.y < p1.y) {
    return "u";
  }

  if (p2.x === p1.x && p2.y > p1.y) {
    return "d";
  }

  if (p2.x < p1.x && p2.y < p1.y) {
    return "lu";
  }

  if (p2.x > p1.x && p2.y < p1.y) {
    return "ru";
  }

  if (p2.x < p1.x && p2.y > p1.y) {
    return "ld";
  }

  return "rd";
}

function distanceOfP2P(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function distanceOfP2L(point, line) {
  var start = line[0],
      end = line[1];
  var k = (end.y - start.y || 1) / (end.x - start.x || 1);
  var b = start.y - k * start.x;
  return Math.abs(k * point.x - point.y + b) / Math.sqrt(k * k + 1);
}

function calcCorners(points) {
  var minX = points.reduce(function (prev, point) {
    return point.x < prev ? point.x : prev;
  }, Infinity);
  var maxX = points.reduce(function (prev, point) {
    return point.x > prev ? point.x : prev;
  }, 0);
  var minY = points.reduce(function (prev, point) {
    return point.y < prev ? point.y : prev;
  }, Infinity);
  var maxY = points.reduce(function (prev, point) {
    return point.y > prev ? point.y : prev;
  }, 0);
  return {
    start: {
      x: minX,
      y: minY
    },
    end: {
      x: maxX,
      y: maxY
    }
  };
}

function center(nodes, width, height) {
  var corners = calcCorners(__spreadArray(__spreadArray([], nodes, true), nodes.map(function (node) {
    return {
      x: node.x + (node.width || 120),
      y: node.y + (node.height || 60)
    };
  }), true));
  var offsetX = (width - corners.end.x - corners.start.x) / 2;
  var offsetY = (height - corners.end.y - corners.start.y) / 2;
  return update(nodes, {
    $apply: function $apply(state) {
      return state.map(function (node) {
        return _assign(_assign({}, node), {
          x: roundTo10(node.x + offsetX),
          y: roundTo10(node.y + offsetY)
        });
      });
    }
  });
}

function isIntersected(p, rect) {
  return p.x > rect.start.x && p.x < rect.end.x && p.y > rect.start.y && p.y < rect.end.y;
}

function roundTo10(number) {
  return Math.ceil(number / 10) * 10;
}

function locateConnector(node) {
  var height = node.height || 60;
  var width = node.width || 120;
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var top = {
    x: node.x + halfWidth,
    y: node.y
  };
  var left = {
    x: node.x,
    y: node.y + halfHeight
  };
  var bottom = {
    x: node.x + halfWidth,
    y: node.y + height
  };
  var right = {
    x: node.x + width,
    y: node.y + halfHeight
  };
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom
  };
}
/**
 * Get angle positions: top-left, top-right, bottom-right, bottom-left
 * @param node
 */


function locateAngle(node) {
  var width = node.width || 120;
  var height = node.height || 60;
  return [{
    x: node.x,
    y: node.y
  }, {
    x: node.x + width,
    y: node.y
  }, {
    x: node.x + width,
    y: node.y + height
  }, {
    x: node.x,
    y: node.y + height
  }];
}

function calcIntersectedConnections(internalNodes, internalConnections, rect) {
  var result = [];

  var _loop_1 = function _loop_1(internalConnection) {
    var srcNodeData = internalNodes.find(function (item) {
      return item.id === internalConnection.source.id;
    });
    var destNodeData = internalNodes.find(function (item) {
      return item.id === internalConnection.destination.id;
    });
    var points = pathing(locateConnector(srcNodeData)[internalConnection.source.position], locateConnector(destNodeData)[internalConnection.destination.position], internalConnection.source.position, internalConnection.destination.position);

    if (points.some(function (point) {
      return isIntersected({
        x: point[0],
        y: point[1]
      }, rect);
    })) {
      result.push(internalConnection);
    }
  };

  for (var _i = 0, internalConnections_1 = internalConnections; _i < internalConnections_1.length; _i++) {
    var internalConnection = internalConnections_1[_i];

    _loop_1(internalConnection);
  }

  return result;
}

function calcIntersectedNodes(internalNodes, edge) {
  var tempCurrentNodes = [];
  internalNodes.forEach(function (item) {
    if (locateAngle(item).some(function (point) {
      return isIntersected(point, edge);
    })) {
      tempCurrentNodes.push(item);
    }
  });
  return tempCurrentNodes;
}

function createConnection(sourceId, sourcePosition, destinationId, destinationPosition) {
  return {
    source: {
      id: sourceId,
      position: sourcePosition
    },
    destination: {
      id: destinationId,
      position: destinationPosition
    },
    id: +new Date(),
    type: "success"
  };
}

function calcGuidelines(node, nodes) {
  var guidelines = [];
  var points = locateAngle(node);

  for (var i = 0; i < points.length; i++) {
    var srcAnglePoint = {
      x: roundTo10(points[i].x),
      y: roundTo10(points[i].y)
    };
    var lines = void 0;
    var directions = void 0;

    switch (i) {
      case 0:
        {
          lines = [[{
            x: srcAnglePoint.x,
            y: 0
          }, srcAnglePoint], [{
            x: 0,
            y: srcAnglePoint.y
          }, srcAnglePoint]];
          directions = ["lu", "u", "l"];
          break;
        }

      case 1:
        {
          lines = [[{
            x: srcAnglePoint.x,
            y: 0
          }, srcAnglePoint], // todo: replace 10000 with the width of svg
          [{
            x: 10000,
            y: srcAnglePoint.y
          }, srcAnglePoint]];
          directions = ["ru", "u", "r"];
          break;
        }

      case 2:
        {
          lines = [[{
            x: srcAnglePoint.x,
            y: 10000
          }, srcAnglePoint], [{
            x: 10000,
            y: srcAnglePoint.y
          }, srcAnglePoint]];
          directions = ["r", "rd", "d"];
          break;
        }

      default:
        {
          lines = [[{
            x: srcAnglePoint.x,
            y: 10000
          }, srcAnglePoint], [{
            x: 0,
            y: srcAnglePoint.y
          }, srcAnglePoint]];
          directions = ["l", "ld", "d"];
          break;
        }
    }

    for (var _i = 0, _a = nodes.filter(function (internalNode) {
      return internalNode.id !== node.id;
    }); _i < _a.length; _i++) {
      var destination = _a[_i];
      var line = null;

      for (var _b = 0, _c = locateAngle(destination); _b < _c.length; _b++) {
        var destPoint = _c[_b];
        var direction = calcDirection(srcAnglePoint, destPoint);

        if (directions.indexOf(direction) > -1 && (distanceOfP2L(destPoint, lines[0]) < 5 || distanceOfP2L(destPoint, lines[1]) < 5)) {
          if (line === null || distanceOfP2P(destPoint, srcAnglePoint) < distanceOfP2P(line[0], line[1])) {
            line = [destPoint, srcAnglePoint];
          }
        }
      }

      if (line) {
        guidelines.push(line);
      }
    }
  }

  return guidelines;
}

var OperationNode = function OperationNode(_a) {
  var data = _a.data,
      _b = _a.isSelected,
      isSelected = _b === void 0 ? false : _b;
  var borderColor = isSelected ? "#666666" : "#bbbbbb";
  var text = typeof data.title === "function" && data.title() || data.title;
  var halfWidth = (data.width || 120) / 2;
  var halfHeight = (data.height || 60) / 2;
  return /*#__PURE__*/jsxs(Fragment, {
    children: [/*#__PURE__*/jsx("rect", {
      width: data.width || 120,
      height: data.height || 60,
      fill: "white",
      x: data.x,
      y: data.y,
      strokeWidth: 1,
      stroke: borderColor
    }), /*#__PURE__*/jsx("text", {
      x: data.x + halfWidth,
      y: data.y + halfHeight + 5,
      textAnchor: "middle",
      children: text
    })]
  });
};

var StartEndNode = function StartEndNode(_a) {
  var data = _a.data,
      _b = _a.isSelected,
      isSelected = _b === void 0 ? false : _b;
  var borderColor = isSelected ? "#666666" : "#bbbbbb";
  var text = typeof data.title === "function" && data.title() || data.title;
  var halfWidth = (data.width || 120) / 2;
  var halfHeight = (data.height || 60) / 2;
  return /*#__PURE__*/jsxs(Fragment, {
    children: [/*#__PURE__*/jsx("ellipse", {
      cx: data.x + halfWidth,
      cy: data.y + halfHeight,
      rx: halfWidth,
      ry: halfHeight,
      fill: "white",
      strokeWidth: 1,
      stroke: borderColor
    }), /*#__PURE__*/jsx("text", {
      x: data.x + halfWidth,
      y: data.y + halfHeight + 5,
      textAnchor: "middle",
      children: text
    })]
  });
};

function G(props) {
  return /*#__PURE__*/jsx("g", _objectSpread({
    className: "g " + (props.className || "")
  }, props));
}

function Circle(props) {
  var style = useMemo(function () {
    if (!props.isConnecting) {
      return {};
    }

    return {
      opacity: 1
    };
  }, [props.isConnecting]);
  return /*#__PURE__*/jsx("circle", _objectSpread({
    className: "circle",
    style: Object.assign(style, props.style)
  }, props));
}

var Node = function Node(_a) {
  var data = _a.data,
      isSelected = _a.isSelected,
      isConnecting = _a.isConnecting,
      onDoubleClick = _a.onDoubleClick,
      onMouseDown = _a.onMouseDown,
      onConnectorMouseDown = _a.onConnectorMouseDown,
      readonly = _a.readonly;
  var position = useMemo(function () {
    return locateConnector(data);
  }, [data]);
  return /*#__PURE__*/jsx(Fragment, {
    children: /*#__PURE__*/jsxs(G, {
      onDoubleClick: onDoubleClick,
      onMouseDown: onMouseDown,
      children: [data.type !== "start" && data.type !== "end" ? /*#__PURE__*/jsx(OperationNode, {
        data: data,
        isSelected: isSelected
      }) : /*#__PURE__*/jsx(StartEndNode, {
        data: data,
        isSelected: isSelected
      }), !readonly && Object.keys(position).map(function (key) {
        return /*#__PURE__*/jsx(Circle, {
          isConnecting: isConnecting,
          cx: position[key].x,
          cy: position[key].y,
          r: 4,
          onMouseDown: function onMouseDown(event) {
            event.stopPropagation();
            onConnectorMouseDown(key);
          }
        }, key);
      })]
    })
  });
};

var defaultConnectionColors = {
  success: "#52c41a",
  fail: "red"
};
var selectedConnectionColors = {
  success: "#12640a",
  fail: "darkred"
};

function Connection(_a) {
  var data = _a.data,
      nodes = _a.nodes,
      isSelected = _a.isSelected,
      onMouseDown = _a.onMouseDown,
      _onDoubleClick = _a.onDoubleClick;
  var getNodeConnectorOffset = useCallback(function (nodeId, connectorPosition) {
    var node = nodes.filter(function (item) {
      return item.id === nodeId;
    })[0];
    return locateConnector(node)[connectorPosition];
  }, [nodes]);
  var points = pathing(getNodeConnectorOffset(data.source.id, data.source.position), getNodeConnectorOffset(data.destination.id, data.destination.position), data.source.position, data.destination.position);
  var colors = useMemo(function () {
    return isSelected ? selectedConnectionColors : defaultConnectionColors;
  }, [isSelected]);
  return /*#__PURE__*/jsx("g", {
    children: points.map(function (point, i) {
      if (i > points.length - 2) {
        return /*#__PURE__*/jsx(Fragment, {});
      }

      var source = points[i];
      var destination = points[i + 1];
      var isLast = i === points.length - 2;
      var color = colors[data.type];
      var id = "arrow".concat(color.replace("#", ""));
      return /*#__PURE__*/jsxs(Fragment, {
        children: [/*#__PURE__*/jsx("path", {
          stroke: colors[data.type],
          strokeWidth: 1,
          fill: "none",
          d: "M ".concat(source[0], " ").concat(source[1], " L ").concat(destination[0], " ").concat(destination[1]),
          markerEnd: isLast ? "url(#".concat(id, ")") : undefined
        }), isLast && /*#__PURE__*/jsx("marker", {
          id: id,
          markerUnits: "strokeWidth",
          viewBox: "0 0 12 12",
          refX: 9,
          refY: 6,
          markerWidth: 12,
          markerHeight: 12,
          orient: "auto",
          children: /*#__PURE__*/jsx("path", {
            d: "M2,2 L10,6 L2,10 L6,6 L2,2",
            fill: color
          })
        }), /*#__PURE__*/jsx("path", {
          onMouseDown: onMouseDown,
          onDoubleClick: function onDoubleClick(event) {
            event.stopPropagation();
            _onDoubleClick === null || _onDoubleClick === void 0 ? void 0 : _onDoubleClick(event);
          },
          stroke: "transparent",
          strokeWidth: 5,
          fill: "none",
          d: "M ".concat(source[0], " ").concat(source[1], " L ").concat(destination[0], " ").concat(destination[1])
        })]
      });
    })
  });
}

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".flowchart-zoom {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}\n.flowchart-container {\n  position: relative;\n}\n.flowchart-container text {\n  moz-user-select: -moz-none;\n  -moz-user-select: none;\n  -o-user-select: none;\n  -khtml-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.flowchart-content {\n  height: 100%;\n  width: 100%;\n  display: inline-flex;\n}\n.flowchart-toolbar {\n  width: 48px;\n  height: 100%;\n  border-left: 1px solid #dfdfdf;\n  border-top: 1px solid #dfdfdf;\n  border-bottom: 1px solid #dfdfdf;\n}\n.flowchart-toolbar-item {\n  width: 48px;\n  height: 24px;\n}\n.flowchart-creation-item {\n  pointer-events: none;\n  position: absolute;\n}\n.flowchart-svg {\n  height: 100%;\n  width: 100%;\n  border: 1px solid #dfdfdf;\n  background-color: #f3f3f3;\n}\n.circle {\n  fill: white;\n  stroke-width: 1px;\n  stroke: #bbbbbb;\n  cursor: crosshair;\n  opacity: 0;\n}\n.circle:hover {\n  opacity: 1;\n}\n.g:hover .circle {\n  opacity: 1;\n}";
styleInject(css_248z);
var newNode = {
  id: 0,
  title: "New Item",
  type: "start",
  x: 0,
  y: 0
};
var templateNode = {
  id: 0,
  title: "",
  type: "start",
  x: 8,
  y: 8,
  width: 32,
  height: 16
};
var iconAlign = /*#__PURE__*/jsx("svg", {
  viewBox: "64 64 896 896",
  focusable: "false",
  "data-icon": "align-center",
  width: "1em",
  height: "1em",
  fill: "currentColor",
  "aria-hidden": "true",
  children: /*#__PURE__*/jsx("path", {
    d: "M264 230h496c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H264c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm496 424c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H264c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496zm144 140H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0-424H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"
  })
});
var iconZoomOut = /*#__PURE__*/jsxs("svg", {
  viewBox: "64 64 896 896",
  focusable: "false",
  "data-icon": "plus",
  width: "1em",
  height: "1em",
  fill: "currentColor",
  "aria-hidden": "true",
  children: [/*#__PURE__*/jsx("defs", {
    children: /*#__PURE__*/jsx("style", {})
  }), /*#__PURE__*/jsx("path", {
    d: "M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"
  }), /*#__PURE__*/jsx("path", {
    d: "M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"
  })]
});
var iconZoomIn = /*#__PURE__*/jsx("svg", {
  viewBox: "64 64 896 896",
  focusable: "false",
  "data-icon": "minus",
  width: "1em",
  height: "1em",
  fill: "currentColor",
  "aria-hidden": "true",
  children: /*#__PURE__*/jsx("path", {
    d: "M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
  })
});

function GuideLine(_a) {
  var line = _a.line;
  return /*#__PURE__*/jsx("g", {
    children: /*#__PURE__*/jsx("line", {
      strokeDasharray: "3 3",
      stroke: "#666666",
      strokeWidth: 1,
      fill: "none",
      x1: line[0].x,
      y1: line[0].y,
      x2: line[1].x,
      y2: line[1].y
    })
  });
}

function Marker(_a) {
  var id = _a.id,
      color = _a.color;
  return /*#__PURE__*/jsx("marker", {
    id: id,
    markerUnits: "strokeWidth",
    viewBox: "0 0 12 12",
    refX: 9,
    refY: 6,
    markerWidth: 12,
    markerHeight: 12,
    orient: "auto",
    children: /*#__PURE__*/jsx("path", {
      d: "M2,2 L10,6 L2,10 L6,6 L2,2",
      fill: color
    })
  });
}

function PendingConnection(_a) {
  var points = _a.points;
  return /*#__PURE__*/jsx("g", {
    children: points.map(function (point, i) {
      if (i > points.length - 2) {
        return /*#__PURE__*/jsx(Fragment, {});
      }

      var source = points[i];
      var destination = points[i + 1];
      var isLast = i === points.length - 2;
      var color = defaultConnectionColors.success;
      var id = "arrow".concat(color.replace("#", ""));
      return /*#__PURE__*/jsxs(Fragment, {
        children: [/*#__PURE__*/jsx("path", {
          stroke: defaultConnectionColors.success,
          strokeWidth: 1,
          fill: "none",
          d: "M ".concat(source[0], " ").concat(source[1], " L ").concat(destination[0], " ").concat(destination[1]),
          markerEnd: isLast ? "url(#".concat(id, ")") : undefined
        }), isLast && /*#__PURE__*/jsx(Marker, {
          id: id,
          color: color
        }), /*#__PURE__*/jsx("path", {
          stroke: "transparent",
          strokeWidth: 5,
          fill: "none",
          d: "M ".concat(source.join(" "), " L ").concat(destination.join(" "))
        })]
      });
    })
  });
}

var Flowchart = /*#__PURE__*/forwardRef(function (_a, ref) {
  var nodes = _a.nodes,
      connections = _a.connections,
      _b = _a.readonly,
      readonly = _b === void 0 ? false : _b,
      onNodeDoubleClick = _a.onNodeDoubleClick,
      onConnDoubleClick = _a.onConnectionDoubleClick,
      onDoubleClick = _a.onDoubleClick,
      onChange = _a.onChange,
      onMouseUp = _a.onMouseUp,
      style = _a.style,
      _c = _a.defaultNodeSize,
      defaultNodeSize = _c === void 0 ? {
    width: 120,
    height: 60
  } : _c,
      showToolbar = _a.showToolbar;
  var svgRef = useRef(null);
  var containerRef = useRef(null);

  var _d = useState([]),
      selectedNodeIds = _d[0],
      setSelectedNodeIds = _d[1];

  var _e = useState([]),
      selectedConnIds = _e[0],
      setSelectedConnIds = _e[1];

  var _f = useState(),
      selectingInfo = _f[0],
      setSelectingInfo = _f[1];

  var _g = useState(),
      connectingInfo = _g[0],
      setConnectingInfo = _g[1];

  var _h = useState(),
      movingInfo = _h[0],
      setMovingInfo = _h[1];

  var _j = useState(),
      creatingInfo = _j[0],
      setCreatingInfo = _j[1];

  var _k = useState(1),
      zoom = _k[0],
      setZoom = _k[1];

  var internalCenter = useCallback(function () {
    if (!svgRef.current) {
      return;
    }

    onChange === null || onChange === void 0 ? void 0 : onChange(center(nodes, svgRef.current.clientWidth, svgRef.current.clientHeight), connections);
  }, [connections, nodes, onChange]);
  var zoomIn = useCallback(function () {
    setZoom(function (prevState) {
      var number = Number((prevState - 0.1).toFixed(1));
      return number < 0.6 ? 0.6 : number;
    });
  }, []);
  var zoomOut = useCallback(function () {
    setZoom(function (prevState) {
      var number = Number((prevState + 0.1).toFixed(1));
      return number > 1 ? 1 : number;
    });
  }, []);

  var _l = useState({
    x: 0,
    y: 0
  }),
      offsetOfCursorToSVG = _l[0],
      setOffsetOfCursorToSVG = _l[1];

  var handleWheel = useCallback(function (event) {
    event.stopPropagation();
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      if (event.deltaY > 0 && zoom === 0.1) {
        return;
      }

      setZoom(function (prev) {
        var number = Number((prev - event.deltaY / 100 / 10).toFixed(1));
        return number < 0.6 ? 0.6 : number > 1 ? 1 : number;
      });
    }
  }, [zoom]);
  var handleSVGDoubleClick = useCallback(function (event) {
    return onDoubleClick === null || onDoubleClick === void 0 ? void 0 : onDoubleClick(event, zoom);
  }, [onDoubleClick, zoom]);
  var handleSVGMouseDown = useCallback(function (event) {
    if (event.ctrlKey || event.metaKey || event.target.tagName !== "svg") {
      // ignore propagation
      return;
    }

    if (event.nativeEvent.which !== 1) {
      return;
    }

    var point = {
      x: event.nativeEvent.offsetX / zoom,
      y: event.nativeEvent.offsetY / zoom
    };
    setSelectingInfo({
      start: point,
      end: point
    });
    setSelectedNodeIds([]);
    setSelectedConnIds([]);
  }, [zoom]);
  var moveTo = useCallback(function (nodes, id, x, y) {
    var _a;

    var index = nodes.findIndex(function (internalNode) {
      return internalNode.id === id;
    });
    return update(nodes, (_a = {}, _a[index] = {
      x: {
        $set: x
      },
      y: {
        $set: y
      }
    }, _a));
  }, []);
  var move = useCallback(function (nodeIds, x, y) {
    var _a;

    if (readonly) {
      return;
    }

    var indexes = nodeIds.map(function (currentNode) {
      return nodes.findIndex(function (internalNode) {
        return internalNode.id === currentNode;
      });
    });
    var tempState = nodes;

    for (var _i = 0, indexes_1 = indexes; _i < indexes_1.length; _i++) {
      var index = indexes_1[_i];
      tempState = update(tempState, (_a = {}, _a[index] = {
        x: {
          $apply: function $apply(prev) {
            return prev + x;
          }
        },
        y: {
          $apply: function $apply(prev) {
            return prev + y;
          }
        }
      }, _a));
    }

    onChange === null || onChange === void 0 ? void 0 : onChange(tempState, connections);
  }, [connections, nodes, onChange, readonly]);
  var handleSVGMouseMove = useCallback(function (event) {
    var newOffsetOfCursorToSVG = {
      x: event.nativeEvent.offsetX / zoom,
      y: event.nativeEvent.offsetY / zoom
    };
    setOffsetOfCursorToSVG(newOffsetOfCursorToSVG);

    if (selectingInfo) {
      setSelectingInfo(function (prevState) {
        return {
          start: prevState.start,
          end: newOffsetOfCursorToSVG
        };
      });
      var edge = calcCorners([selectingInfo.start, newOffsetOfCursorToSVG]);
      setSelectedNodeIds(calcIntersectedNodes(nodes, edge).map(function (item) {
        return item.id;
      }));
      setSelectedConnIds(calcIntersectedConnections(nodes, connections, edge).map(function (item) {
        return item.id;
      }));
    } else if (movingInfo) {
      var currentNodes = nodes;

      for (var i = 0; i < movingInfo.targetIds.length; i++) {
        var t = movingInfo.targetIds[i];
        var delta = movingInfo.deltas[i];
        currentNodes = moveTo(currentNodes, t, newOffsetOfCursorToSVG.x - delta.x, newOffsetOfCursorToSVG.y - delta.y);
      }

      onChange === null || onChange === void 0 ? void 0 : onChange(currentNodes, connections);
      setMovingInfo(function (prevState) {
        return _assign(_assign({}, prevState), {
          moved: true
        });
      });
    }
  }, [zoom, selectingInfo, movingInfo, nodes, connections, onChange, moveTo]);
  var moveSelected = useCallback(function (x, y) {
    move(selectedNodeIds, x, y);
  }, [move, selectedNodeIds]);
  var remove = useCallback(function () {
    if (readonly) return; // Splice arguments of selected connections

    var list1 = selectedConnIds.map(function (currentConn) {
      return [connections.findIndex(function (interConn) {
        return interConn.id === currentConn;
      }), 1];
    }); // Splice arguments of connections of selected nodes

    var list2 = selectedNodeIds.map(function (item) {
      return connections.filter(function (interConn) {
        return interConn.source.id === item || interConn.destination.id === item;
      });
    }).flat().map(function (currentConn) {
      return [connections.findIndex(function (interConn) {
        return interConn.id === currentConn.id;
      }), 1];
    });
    var restConnections = update(connections, {
      $splice: __spreadArray(__spreadArray([], list1, true), list2, true).sort(function (a, b) {
        return b[0] - a[0];
      })
    });
    var restNodes = update(nodes, {
      $splice: selectedNodeIds.map(function (currNode) {
        return [nodes.findIndex(function (interNode) {
          return interNode.id === currNode;
        }), 1];
      }).sort(function (a, b) {
        return b[0] - a[0];
      })
    });
    onChange === null || onChange === void 0 ? void 0 : onChange(restNodes, restConnections);
  }, [readonly, selectedConnIds, selectedNodeIds, connections, nodes, onChange]);
  var handleSVGKeyDown = useCallback(function (event) {
    switch (event.keyCode) {
      case 37:
        moveSelected(-10, 0);
        break;

      case 38:
        moveSelected(0, -10);
        break;

      case 39:
        moveSelected(10, 0);
        break;

      case 40:
        moveSelected(0, 10);
        break;

      case 27:
        setSelectedNodeIds([]);
        setSelectedConnIds([]);
        break;

      case 65:
        if ((event.ctrlKey || event.metaKey) && document.activeElement === document.getElementById("chart")) {
          setSelectedNodeIds([]);
          setSelectedConnIds([]);
          setSelectedNodeIds(nodes.map(function (item) {
            return item.id;
          }));
          setSelectedConnIds(__spreadArray([], selectedConnIds, true));
        }

        break;

      case 46:
      case 8:
        remove();
        break;
    }
  }, [moveSelected, remove, nodes, selectedConnIds]);
  var handleSVGMouseUp = useCallback(function (event) {
    setSelectingInfo(undefined);
    setConnectingInfo(undefined);
    setMovingInfo(undefined); // Align dragging node

    if (movingInfo) {
      var result = nodes;

      var _loop_1 = function _loop_1(t) {
        var _c;

        result = update(result, (_c = {}, _c[result.findIndex(function (item) {
          return item.id === t;
        })] = {
          x: {
            $apply: roundTo10
          },
          y: {
            $apply: roundTo10
          }
        }, _c));
      };

      for (var _i = 0, _a = movingInfo.targetIds; _i < _a.length; _i++) {
        var t = _a[_i];

        _loop_1(t);
      }

      onChange === null || onChange === void 0 ? void 0 : onChange(result, connections);
    } // Connect nodes


    if (connectingInfo) {
      var node = null;
      var position = null;

      for (var _b = 0, nodes_1 = nodes; _b < nodes_1.length; _b++) {
        var internalNode = nodes_1[_b];
        var locations = locateConnector(internalNode);

        for (var prop in locations) {
          var entry = locations[prop];

          if (distanceOfP2P(entry, offsetOfCursorToSVG) < 6) {
            node = internalNode;
            position = prop;
          }
        }
      }

      if (!node || !position) {
        return;
      }

      if (connectingInfo.source.id === node.id) {
        // Node can not connect to itself
        return;
      }

      var newConnection = createConnection(connectingInfo.source.id, connectingInfo.sourcePosition, node.id, position);
      onChange === null || onChange === void 0 ? void 0 : onChange(nodes, __spreadArray(__spreadArray([], connections, true), [newConnection], false));
      onMouseUp === null || onMouseUp === void 0 ? void 0 : onMouseUp(event, zoom);
    }

    if (creatingInfo) {
      var nativeEvent = event.nativeEvent;
      var point = {
        x: roundTo10(nativeEvent.offsetX - defaultNodeSize.width / 2) / zoom,
        y: roundTo10(nativeEvent.offsetY - defaultNodeSize.height / 2) / zoom,
        id: +new Date(),
        title: "New Item"
      };

      if (creatingInfo.type === "start") {
        onChange === null || onChange === void 0 ? void 0 : onChange(__spreadArray(__spreadArray([], nodes, true), [_assign({
          type: "start"
        }, point)], false), connections);
      } else if (creatingInfo.type === "end") {
        onChange === null || onChange === void 0 ? void 0 : onChange(__spreadArray(__spreadArray([], nodes, true), [_assign({
          type: "end"
        }, point)], false), connections);
      } else {
        onChange === null || onChange === void 0 ? void 0 : onChange(__spreadArray(__spreadArray([], nodes, true), [_assign({
          type: "operation"
        }, point)], false), connections);
      }
    }
  }, [movingInfo, connectingInfo, creatingInfo, nodes, onChange, connections, onMouseUp, zoom, offsetOfCursorToSVG, defaultNodeSize.width, defaultNodeSize.height]);
  /**
   * Points of connecting line
   */

  var points = useMemo(function () {
    var points = [];

    if (connectingInfo) {
      var endPosition = null;

      for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
        var internalNode = nodes_2[_i];
        var locations = locateConnector(internalNode);

        for (var prop in locations) {
          var entry = locations[prop];

          if (distanceOfP2P(entry, offsetOfCursorToSVG) < 6) {
            endPosition = prop;
          }
        }
      }

      points = pathing(locateConnector(connectingInfo.source)[connectingInfo.sourcePosition], offsetOfCursorToSVG, connectingInfo.sourcePosition, endPosition);
    }

    return points;
  }, [nodes, connectingInfo, offsetOfCursorToSVG]);
  var guidelines = useMemo(function () {
    var guidelines = [];

    if (movingInfo) {
      var _loop_2 = function _loop_2(source) {
        guidelines.push.apply(guidelines, calcGuidelines(nodes.find(function (item) {
          return item.id === source;
        }), nodes));
      };

      for (var _i = 0, _a = movingInfo.targetIds; _i < _a.length; _i++) {
        var source = _a[_i];

        _loop_2(source);
      }
    } else if (creatingInfo) {
      guidelines.push.apply(guidelines, calcGuidelines({
        id: +new Date(),
        x: offsetOfCursorToSVG.x - defaultNodeSize.width / 2,
        y: offsetOfCursorToSVG.y - defaultNodeSize.height / 2
      }, nodes));
    }

    return guidelines;
  }, [movingInfo, creatingInfo, nodes, offsetOfCursorToSVG.x, offsetOfCursorToSVG.y, defaultNodeSize.width, defaultNodeSize.height]);
  useImperativeHandle(ref, function () {
    return {
      getData: function getData() {
        return {
          nodes: nodes,
          connections: connections
        };
      }
    };
  });
  var selectionAreaCorners = useMemo(function () {
    return selectingInfo ? calcCorners([selectingInfo.start, selectingInfo.end]) : undefined;
  }, [selectingInfo]);
  var zoomStyle = useMemo(function () {
    return {
      zoom: zoom
    };
  }, [zoom]);
  var nodeElements = useMemo(function () {
    return nodes === null || nodes === void 0 ? void 0 : nodes.map(function (node) {
      node.width = node.width || defaultNodeSize.width;
      node.height = node.height || defaultNodeSize.height;
      return /*#__PURE__*/jsx(Node, {
        readonly: readonly,
        isSelected: selectedNodeIds.some(function (item) {
          return item === node.id;
        }),
        isConnecting: !!connectingInfo,
        data: node,
        onDoubleClick: function onDoubleClick(event) {
          event.stopPropagation();

          if (readonly) {
            return;
          }

          onNodeDoubleClick === null || onNodeDoubleClick === void 0 ? void 0 : onNodeDoubleClick(node);
        },
        onMouseDown: function onMouseDown(event) {
          if (event.ctrlKey || event.metaKey) {
            var index = selectedNodeIds.findIndex(function (item) {
              return item === node.id;
            });

            if (index === -1) {
              setSelectedNodeIds(__spreadArray(__spreadArray([], selectedNodeIds, true), [node.id], false));
            } else {
              setSelectedNodeIds(update(selectedNodeIds, {
                $splice: [[index, 1]]
              }));
            }
          } else {
            var tempCurrentNodes = selectedNodeIds;

            if (!selectedNodeIds.some(function (id) {
              return id === node.id;
            })) {
              tempCurrentNodes = [node.id];
              setSelectedNodeIds(tempCurrentNodes);
            }

            setSelectedConnIds([]);

            if (readonly) {
              return;
            }

            setMovingInfo({
              targetIds: tempCurrentNodes,
              deltas: tempCurrentNodes.map(function (tempCurrentNode) {
                var find = nodes.find(function (item) {
                  return item.id === tempCurrentNode;
                });
                return {
                  x: offsetOfCursorToSVG.x - find.x,
                  y: offsetOfCursorToSVG.y - find.y
                };
              })
            });
          }
        },
        onConnectorMouseDown: function onConnectorMouseDown(position) {
          if (node.type === "end") {
            return;
          }

          setConnectingInfo({
            source: node,
            sourcePosition: position
          });
        }
      }, node.id);
    });
  }, [nodes, defaultNodeSize.width, defaultNodeSize.height, readonly, selectedNodeIds, connectingInfo, onNodeDoubleClick, offsetOfCursorToSVG.x, offsetOfCursorToSVG.y]);
  var connectionElements = useMemo(function () {
    return connections === null || connections === void 0 ? void 0 : connections.map(function (conn) {
      return /*#__PURE__*/jsx(Connection, {
        isSelected: selectedConnIds.some(function (item) {
          return conn.id === item;
        }),
        onDoubleClick: function onDoubleClick() {
          return onConnDoubleClick === null || onConnDoubleClick === void 0 ? void 0 : onConnDoubleClick(conn);
        },
        onMouseDown: function onMouseDown(event) {
          if (event.ctrlKey || event.metaKey) {
            var i_1 = selectedConnIds.findIndex(function (item) {
              return item === conn.id;
            });

            if (i_1 === -1) {
              setSelectedConnIds(function (prevState) {
                return __spreadArray(__spreadArray([], prevState, true), [conn.id], false);
              });
            } else {
              setSelectedConnIds(function (prev) {
                return update(prev, {
                  $splice: [[i_1, 1]]
                });
              });
            }
          } else {
            setSelectedNodeIds([]);
            setSelectedConnIds([conn.id]);
          }
        },
        data: conn,
        nodes: nodes
      }, conn.id);
    });
  }, [connections, selectedConnIds, nodes, onConnDoubleClick]);
  var handleToolbarMouseDown = useCallback(function (type, event) {
    var rect = containerRef.current.getBoundingClientRect();
    setCreatingInfo({
      type: type,
      x: event.clientX - rect.x - defaultNodeSize.width * zoom / 2,
      y: event.clientY - rect.y - defaultNodeSize.height * zoom / 2
    });
  }, [defaultNodeSize.height, defaultNodeSize.width, zoom]);
  var handleContainerMouseUp = useCallback(function () {
    setCreatingInfo(undefined);
  }, []);
  var handleContainerMouseMove = useCallback(function (event) {
    if (!event || !creatingInfo) {
      return;
    }

    var rect = containerRef.current.getBoundingClientRect();
    setCreatingInfo(_assign(_assign({}, creatingInfo), {
      x: event.clientX - rect.x - defaultNodeSize.width * zoom / 2,
      y: event.clientY - rect.y - defaultNodeSize.height * zoom / 2
    }));
  }, [defaultNodeSize.height, defaultNodeSize.width, creatingInfo, zoom]); // TODO: disable right click
  // TODO: resize
  // TODO: tailwindcss

  return /*#__PURE__*/jsx(Fragment, {
    children: /*#__PURE__*/jsxs("div", {
      style: style,
      ref: containerRef,
      className: "flowchart-container",
      onMouseUp: handleContainerMouseUp,
      onMouseMove: handleContainerMouseMove,
      children: [/*#__PURE__*/jsxs("div", {
        className: "flowchart-zoom",
        children: [/*#__PURE__*/jsx("button", {
          style: {
            border: "none",
            backgroundColor: "transparent"
          },
          onClick: zoomIn,
          children: iconZoomIn
        }), /*#__PURE__*/jsxs("span", {
          style: {
            display: "inline-block",
            width: 40,
            textAlign: "center"
          },
          children: [zoom * 100, "%"]
        }), /*#__PURE__*/jsx("button", {
          style: {
            border: "none",
            backgroundColor: "transparent"
          },
          onClick: zoomOut,
          children: iconZoomOut
        }), !readonly && /*#__PURE__*/jsx("button", {
          style: {
            border: "none",
            backgroundColor: "transparent"
          },
          onClick: internalCenter,
          children: iconAlign
        })]
      }), /*#__PURE__*/jsxs("div", {
        className: "flowchart-content",
        children: [readonly || showToolbar === false ? /*#__PURE__*/jsx(Fragment, {}) : /*#__PURE__*/jsxs("div", {
          className: "flowchart-toolbar",
          children: [/*#__PURE__*/jsx("div", {
            onMouseDown: function onMouseDown(event) {
              return handleToolbarMouseDown("start", event);
            },
            children: /*#__PURE__*/jsx("svg", {
              className: "flowchart-toolbar-item",
              children: /*#__PURE__*/jsx(StartEndNode, {
                data: templateNode
              })
            })
          }), /*#__PURE__*/jsx("div", {
            onMouseDown: function onMouseDown(event) {
              return handleToolbarMouseDown("operation", event);
            },
            children: /*#__PURE__*/jsx("svg", {
              className: "flowchart-toolbar-item",
              children: /*#__PURE__*/jsx(OperationNode, {
                data: templateNode
              })
            })
          })]
        }), /*#__PURE__*/jsxs("svg", {
          ref: svgRef,
          className: "flowchart-svg",
          style: zoomStyle,
          id: "chart",
          tabIndex: 0,
          onKeyDown: handleSVGKeyDown,
          onWheel: handleWheel,
          onDoubleClick: handleSVGDoubleClick,
          onMouseUp: handleSVGMouseUp,
          onMouseDown: handleSVGMouseDown,
          onMouseMove: handleSVGMouseMove,
          children: [nodeElements, connectionElements, selectionAreaCorners && /*#__PURE__*/jsx("rect", {
            stroke: "lightblue",
            fill: "lightblue",
            fillOpacity: 0.8,
            x: selectionAreaCorners.start.x,
            y: selectionAreaCorners.start.y,
            width: selectionAreaCorners.end.x - selectionAreaCorners.start.x,
            height: selectionAreaCorners.end.y - selectionAreaCorners.start.y
          }), /*#__PURE__*/jsx(PendingConnection, {
            points: points
          }), guidelines.map(function (guideline, index) {
            return /*#__PURE__*/jsx(GuideLine, {
              line: guideline
            }, index);
          })]
        })]
      }), creatingInfo ? /*#__PURE__*/jsx("div", {
        className: "flowchart-creation-item",
        style: {
          left: creatingInfo.x,
          top: creatingInfo.y,
          width: defaultNodeSize.width * zoom,
          height: defaultNodeSize.height * zoom
        },
        children: /*#__PURE__*/jsx("svg", {
          style: zoomStyle,
          children: creatingInfo.type === "start" ? /*#__PURE__*/jsx(StartEndNode, {
            data: newNode
          }) : /*#__PURE__*/jsx(OperationNode, {
            data: newNode
          })
        })
      }) : /*#__PURE__*/jsx(Fragment, {})]
    })
  });
});
export { Flowchart as default };
