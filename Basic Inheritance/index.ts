

class Duck{
    swim(): string{
        console.log("I know swimming");
        return '';
    }
};

class MallardDuck extends Duck{

};

class Bird{
    fly(): void{
        console.log("I can fly");
    }
}
class Penguine extends Bird{
    fly(): void{
        console.log("I cannot fly.")
    }
}

let mD = new MallardDuck();
mD.swim();

let bird = new Bird();
let penguine = new Penguine();
bird.fly();
penguine.fly();

interface Iduck{
    swim():void;
    fly():void;
    sound():void;
}

class WoodenDuck implements Iduck{
    swim():void{
        console.log("I can swim");
    };
    fly():void{
        console.log("I cannot fly");
    };
    sound():void{
        console.log("I cannot make sound");
    };
}

let wd = new WoodenDuck();
wd.fly();
wd.sound();
wd.swim();