var PURE = (function () {
    'use strict';
    /*global 'define', 'exports'*/

    var  Object = ({}).constructor,
        Array = ([]).constructor,
        String = ('').constructor,
        Boolean = (true).constructor,
        Number = (4).constructor,

        isString = function (o) {
            return typeof o === 'string' || o instanceof String;
        },
        isBoolean = function (o) {
            return typeof o === 'boolean' || o instanceof Boolean;
        },
        isNumber = function (o) {
            return typeof o === 'number' || o instanceof Number;
        },
        isFunction = function (o) {
            return typeof o === 'function';
        },
        isDefined = function (o) {
            return o !== null && o !== undefined;
        },
        isUndefined = function (o) {
            return o === undefined || o === null;
        },
        isArray = function (o) {
            return o instanceof Array || Object.prototype.toString.call(o) === '[object Array]' || (isDefined(o) && isNumber(o.length) && isFunction(o.push));
        },
        isObject = function (o) {
            return o && typeof o === 'object';
        },
        typeOf = function (o) {
            if (o === null) {
                return 'null';
            }
            if (isArray(o)) {
                return 'array';
            }
            return typeof o;
        },
        mixin = function (o) {
            var len = arguments.length,
                i,
                key,
                arg;

            if (!o) {
                throw new Error('Expected at least one object as an argument.');
            }

            for (i = 1; i < len; i += 1) {
                arg = arguments[i];

                if (isDefined(arg)) {
                    for (key in arg) {
                        if (arg.hasOwnProperty(key)) {
                            o[key] = arg[key];
                        }
                    }
                }
            }

            return o;
        },
        pure = {
            isString: isString,
            isBoolean: isBoolean,
            isNumber: isNumber,
            isFunction: isFunction,
            isArray: isArray,
            isObject: isObject,
            isDefined: isDefined,
            isUndefined: isUndefined,
            typeOf: typeOf,
            // mixin(...)
            mixin: mixin,
            adheresTo: function (o, interfce) {
                var key,
                    typeofo,
                    typeofi;

                if ((isObject(o) || isFunction(o) || isArray(o)) &&
                        (isObject(interfce) || isFunction(interfce) || isArray(interfce))) {
                    for (key in interfce) {
                        if (interfce.hasOwnProperty(key)) {
                            // Property can be any type, but must exist.
                            if (interfce[key] === '*') {
                                if (o[key] === undefined) {
                                    return false;
                                }
                            } else {
                                if (typeOf(o[key]) !== typeOf(interfce[key]) &&
                                        typeOf(o[key]) !== interfce[key]) {
                                    return false;
                                }
                            }
                        }
                    }

                    return true;
                }

                typeofo = typeOf(o);
                typeofi = typeOf(interfce);

                return typeofo === typeofi;
            },
            constructor: {
                // create()
                // create(name)
                // create(members)
                // create(members, name)
                // create(base, members)
                // create(base, members, name)
                create: (function () {
                    var create = (function () {
                            var F = function () {};
                            return function (o) {
                                F.prototype = o;
                                return new F();
                            };
                        }());

                    return function (base, members, name) {
                        var prototype,
                            ctr,
                            createInstance,
                            b = base,
                            m = members,
                            n = name;

                        if (arguments.length === 0) {
                            m = {};
                            b = {};
                        } else if (arguments.length === 1) {
                            if (typeof b === 'string') {
                                n = b;
                                m = {};
                                b = {};
                            } else {
                                m = b;
                                b = {};
                            }
                        } else if (arguments.length === 2) {
                            if (isString(m)) {
                                n = m;
                                m = b;
                                b = {};
                            }
                        } else if (arguments.length === 3) {
                            n = isDefined(n) ? n.toString() : '';
                        }

                        // Set a default name if none was specified.
                        n = isString(n) && n.length ? n : 'UnnamedConstructor';

                        // If base is a function then we assume it's a constructor
                        // so we read its prototype property.
                        //
                        // NOTE: This is allowed due to many programmer's familiarity
                        // with classical models and how classical inheritence is
                        // facilitated. However, this is not the preferred approach.
                        if (isFunction(b)) {
                            b = b.prototype;
                        }

                        // Manage our prototype chain by extending the base
                        // prototype if we can, otherwise we mixin the properties from base.
                        try {
                            prototype = create(b);
                        } catch (error) {
                            if (isFunction(b.constructor) && isObject(b.constructor.prototype)) {
                                prototype = create(b.constructor.prototype);
                            } else {
                                prototype = mixin({}, b);
                            }
                        }

                        ctr = function (cpy) {
                            // Create a new instance inheriting from our prototype.
                            var o = create(ctr.prototype);

                            // Trigger the copy contructor if we received a single
                            // argument that is an instance of our constructor and
                            // the copy() method exists. Then return the object.
                            if (arguments.length === 1 &&
                                    cpy instanceof ctr &&
                                    typeof o.copy === 'function') {
                                o.copy(cpy);

                            // If we have an init() method then we call it with
                            // the arguments we received from the constructor.
                            } else if (typeof o.init === 'function') {
                                if (arguments.length) {
                                    o.init.apply(o, arguments);
                                } else {
                                    o.init();
                                }
                            }

                            return o;
                        };
                        // Saveguard our constructor code from inspection and
                        // use the constructor name.
                        ctr.toString = function () {
                            return 'function ' + n + ' () { [native code] }';
                        };
                        // Easy accessor to retrieve the constructor name.
                        // (typically used for reflection purposes)
                        ctr.getName = function () {
                            return n;
                        };

                        // Mixin all properties from members onto our prototype.
                        mixin(prototype, m);

                        // Setup references to our prototype and constructor.
                        ctr.prototype = prototype;
                        prototype.constructor = ctr;

                        return ctr;
                    };
                }())
            }
        };

	// Asynchronous modules (AMD) supported.
	if (typeof define === 'function' && typeof define.amd === 'object') {

		define(pure);

	// Nodejs/CommonJS modules supported.
	} else if (typeof exports !== 'undefined' && exports) {

		pure.mixin(exports, pure);

	// Modules are not supported.
	} else {
		return pure;
	}
}()) || PURE;