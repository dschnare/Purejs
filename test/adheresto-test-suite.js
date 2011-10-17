var window;
window = window || {};

var name = (function(pure, unit) {
    unit.makeTestSuite("AdheresTo Test Suite", {
        wildCardAdheresToTest: function() {
            unit.expect("object to adhereTo {age: '*'}.", pure.adheresTo({age: 23}, {age: "*"}));
            unit.expect("object to adhereTo {age: '*'}.", pure.adheresTo({age: undefined}, {age: "*"}));
            unit.expect("object to adhereTo {age: '*'}.", pure.adheresTo({age: null}, {age: "*"}));
            unit.expect("object to adhereTo {age: '*'}.", pure.adheresTo({age: {}}, {age: "*"}));
            unit.dontExpect("object to adhereTo {age: '*'}.", pure.adheresTo({}, {age: "*"}));
        },
        adherenceTest: function() {
            unit.expect("object to adhereTo Object.prototype.", pure.adheresTo({}, Object.prototype));
            unit.expect("object to adhereTo {name: 'string', age: 'number'}.", pure.adheresTo({name: "Darren", age: 29}, {name: "string", age: "number"}));
        }
    }).run();
}(window.pure, window.unit));