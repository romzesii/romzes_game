'use strict';

class Vector {
	// форматирование: после скобки перед фигурной скобкой должен быть пробел //ok
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if (!(vector instanceof Vector)){
			throw new Error ('Разрешен только тип Vector');
		}
		return new Vector(vector.x + this.x, vector.y + this.y);	
	}

	times(n) {
		return new Vector(n * this.x, n * this.y);
	}

}

class Actor {
	// лучше стараться не использовать конструктор с параметрами по умолчанию. //ok

    constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)) {
		if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)){
			throw new Error('расположение не является объектом Vector');
		}
		this.pos = pos;
		this.size = size;
		this.speed = speed;
	}

	get type(){
		return 'actor';
	}

	act() {

	}

	get left(){
		return this.pos.x;
	}
	get right(){
		return this.pos.x + this.size.x;
	}
	get top(){
		return this.pos.y;
	}
	get bottom(){
		return this.pos.y + this.size.y;
	}

	isIntersect(actor){
		if (!(actor instanceof Actor)){
			throw new Error('actor не является типом Actor');
		}

			if (actor.right < actor.left && actor.bottom < actor.top){
				return false;
			}

		if (actor === this){
			return false;
		}

		return (actor.top < this.bottom && actor.bottom > this.top && actor.left < this.right && actor.right > this.left)

	}

}

class Level {

	constructor (grid = [], actors = []) {
		// тут лучше сделать копии массивов grid и actors, чтобы нельзя было изменить поля объекта из все //ok
		this.grid = grid.slice();
		this.actors = actors.slice();
		this.status = null;
		this.finishDelay = 1;
		// когда у стрелочной функции один аргумент вокруг него можно не писать скобки //ok
		this.player = this.actors.find(item => item.type === 'player');

		this.height = this.grid.length || 0;

		this.width = Math.max(0, ...this.grid.map(current => current.length));
		// можно передать в Math.max результат .map через опператор spread //ok
	}

	isFinished() {
		return this.status !== null && this.finishDelay < 0;
	}
	actorAt(actor) {
		if (!(actor instanceof Actor)){
			throw new Error('В метод actorAt нужно передать объект типа Actor!');
		}
		return this.actors.find((item) => item.isIntersect(actor));
	}
	obstacleAt(pos, size) {
		if(!(pos instanceof Vector) || !(size instanceof Vector)){
			throw new Error('Позиция и размер должны быть аргументами типа Vector!');
		}
		if (pos.x < 0 || pos.y < 0 || pos.x + size.x  > this.width){
			return 'wall';

		}
		if(pos.y + size.y > this.height) {
			return 'lava';
		}

			for (let x = Math.floor(pos.x); x < Math.ceil(pos.x + size.x); x++) {			//floor ceil
				for (let y = Math.floor(pos.y); y < Math.ceil(pos.y + size.y); y++) {		//floor ceil
					// это дублирование логики obstacleFromSymbol
					// в grid содержатся только препятствия - проверка знаения не нужна //ok
					if (this.grid[y][x]) {
						return this.grid[y][x];
					}
				}
			}
	}
	removeActor(actor) {
		let actorIndex = this.actors.indexOf(actor);

		if(actorIndex !== -1) {
			this.actors.splice(actorIndex, 1);
		}
	}
	noMoreActors(type) {
		// тут лучше использовать метод some //ok
		return !this.actors.some((item) => item.type === type);
	}
	playerTouched(obstacle, actor) {
		// фигурные свобки лучше не опускать //ok
		if (this.status) {
			return;
		}
		if (obstacle === 'lava' || obstacle === 'fireball'){
			this.status = 'lost';
		}
		if (obstacle === 'coin' && actor.type === 'coin'){
			this.removeActor(actor);
			if(this.noMoreActors('coin')){
				this.status = 'won';
			}
		}
	}
}


class LevelParser {
	constructor(dict = {}) {
		// тут хорошо бы было создать копию объекта
		this.dict = Object.assign({}, dict);
	}
	actorFromSymbol(symbol) {
		return this.dict[symbol];
	}

	obstacleFromSymbol(symbol) {
		switch(symbol){
			case 'x':
				return 'wall';
			case '!':
				return 'lava';
		}
	}
	createGrid(plan = []) {

		return plan.map((item) => item.split('').map((symbol) => this.obstacleFromSymbol(symbol)));

	}
	createActors(plan = []) {
		const actors = [];

		for(let y = 0; y < plan.length; y++) {
			for(let x = 0; x < plan[y].length; x++) {
				const ObjectType = this.actorFromSymbol(plan[y][x]);
				if (typeof ObjectType === 'function') {
					const actor = new ObjectType(new Vector(x, y));
					if (actor instanceof Actor) {
						actors.push(actor);
					}
				}
			}
		}
		return actors;
	}
	parse(plan) {
		return new Level(this.createGrid(plan), this.createActors(plan));
	}

}

class Player extends Actor{
	// лучше не использовать конструктор Vector по-умолчанию //ok
	constructor(pos = new Vector(0,0)) {
		super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0,0));
	}
	get type() {
		return 'player';
	}
}

class Fireball extends Actor{
    // лучше не использовать конструктор Vector по-умолчанию //ok
	constructor(pos = new Vector(0,0), speed = new Vector(0,0)) {
		super(pos, new Vector(1,1), speed);

	}
	get type() {
		return 'fireball';
	}
	getNextPosition(time = 1) {
		return this.pos.plus(this.speed.times(time));
	}
	handleObstacle() {
		// лучше использовать метод times //ok
		this.speed = this.speed.times(-1);
	}
	act(time, level) {
		const nextPos = this.getNextPosition(time);
		if (level.obstacleAt(nextPos, this.size)){
			this.handleObstacle();
		} else {
			this.pos = nextPos;
		}
	}
}

class HorizontalFireball extends Fireball {
	constructor(pos) {
		super(pos, new Vector(2,0));
	}
}

class VerticalFireball extends Fireball {
	constructor(pos) {
		super(pos,new Vector(0,2))
	}
}
class FireRain extends Fireball {
	constructor(pos) {
		super(pos, new Vector(0,3));
		this.start = pos;
	}
	handleObstacle() {
		this.pos = this.start;
	}
}

class Coin extends Actor{
	// лучше не использовать конструктор Vector по-умолчанию //ok
	constructor(pos = new Vector(0,0)) {
		super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random() * 2 * Math.PI;
	}
	get type() {
		return 'coin';
	}
	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}
	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist);
	}
	getNextPosition(time = 1) {
		this.updateSpring(time);
		return this.pos.plus(this.getSpringVector());
	}
	act(time) {
		this.pos = this.getNextPosition(time);
	}
}


const actorDict = {
	'@': Player,
	'v': FireRain,
	'|': VerticalFireball,
	'=': HorizontalFireball,
	'o': Coin

};
const parser = new LevelParser(actorDict);

loadLevels()
	.then(JSON.parse)
	.then(schemas => runGame(schemas, parser, DOMDisplay))
	.then(() => alert('Вы выиграли приз!'));
