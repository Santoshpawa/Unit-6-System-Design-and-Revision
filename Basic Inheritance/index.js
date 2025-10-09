var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Duck = /** @class */ (function () {
    function Duck() {
    }
    Duck.prototype.swim = function () {
        console.log("I know swimming");
        return '';
    };
    return Duck;
}());
;
var MallardDuck = /** @class */ (function (_super) {
    __extends(MallardDuck, _super);
    function MallardDuck() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MallardDuck;
}(Duck));
;
var Bird = /** @class */ (function () {
    function Bird() {
    }
    Bird.prototype.fly = function () {
        console.log("I can fly");
    };
    return Bird;
}());
var Penguine = /** @class */ (function (_super) {
    __extends(Penguine, _super);
    function Penguine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Penguine.prototype.fly = function () {
        console.log("I cannot fly.");
    };
    return Penguine;
}(Bird));
var mD = new MallardDuck();
mD.swim();
var bird = new Bird();
var penguine = new Penguine();
bird.fly();
penguine.fly();
var WoodenDuck = /** @class */ (function () {
    function WoodenDuck() {
    }
    WoodenDuck.prototype.swim = function () {
        console.log("I can swim");
    };
    ;
    WoodenDuck.prototype.fly = function () {
        console.log("I cannot fly");
    };
    ;
    WoodenDuck.prototype.sound = function () {
        console.log("I cannot make sound");
    };
    ;
    return WoodenDuck;
}());
var wd = new WoodenDuck();
wd.fly();
wd.sound();
wd.swim();
