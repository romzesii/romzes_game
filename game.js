'use strict';

class Vector {
	// форматирование: после скобки перед фигурной скобкой должен быть пробел
	constructor (x = 0, y = 0){
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
	// лучше стараться не использовать конструктор с параметрами по умолчанию.
	// Если кто-то коснтруктор класса Vector вот так:
	// constructor (x = 1, y = 1){
	// то всё сломается
    constructor(pos = new Vector(), size = new Vector(1,1), speed = new Vector()) {
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
		} //не пересекается сам с собой
		// Это лучше удалить :)
		/*
		if((((actor.right > this.left) && (actor.right <= this.right)) && ((actor.top >= this.top) && (actor.top < this.bottom))) ||
				(((actor.left >= this.left)&&(actor.left < this.right)) && ((actor.bottom > this.top)&&(actor.bottom <= this.bottom))) ||
				(((actor.left >= this.left) && (actor.left < this.right)) && ((actor.top >= this.top)&&(actor.top < this.bottom))) ||
				(((actor.right > this.left)&&(actor.right <= this.right)) && ((actor.bottom > this.top)&&(actor.bottom <= this.bottom))) ||
				(((this.right > actor.left) && (this.right <= actor.right)) && ((this.top >= actor.top) && (this.top < actor.bottom))) ||
				(((this.left >= actor.left)&&(this.left < actor.right)) && ((this.bottom > actor.top)&&(this.bottom <= actor.bottom))) ||
				(((this.left >= actor.left) && (this.left < actor.right)) && ((this.top >= actor.top)&&(this.top < actor.bottom))) ||
				(((this.right > actor.left)&&(this.right <= actor.right)) && ((this.bottom > actor.top)&&(this.bottom <= actor.bottom)))){
			return true;
		}
		return false;
		*/
		// Тут можно обернуть условие и написать просто return <expr>
		// Чтобы обратить условие нужно заменить операторы сравнения на противоположные:
		// >= на <, <= на >
		// и || заменить на &&
		if (actor.top >= this.bottom || actor.bottom <= this.top || actor.left >= this.right || actor.right <= this.left) {
            return false;
        }
        return true; 
	}

}

class Level {

	constructor (grid = [], actors = []) {
		// тут лучше сделать копии массивов grid и actors, чтобы нельзя было изменить поля объекта из все
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;
		// когда у стрелочной функции один аргумент вокруг него можно не писать скобки
		this.player = this.actors.find((item) => item.type === 'player');

		// Зачем?
		if (!this.player){
			this.player = new Player();
		}
	}

	// лучше посчитать в конструкторе
	get height(){
		return this.grid.length || 0;
	}
	// лучше посчитать в конструкторе
	get width(){
		// можно передать в Math.max результат .map через опператор spread
		return this.grid.reduce((maximum, current) => Math.max(current.length), 0);
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
		// здесь не нужен else - если выполнение зайдёт в if то выполнение функции прекратится
		} else if(pos.y + size.y > this.height) {
			return 'lava';
		}
			//return this.grid[Math.floor(pos.x)][Math.floor(pos.y)]; //??? //todo obstacleAt
			for (let x = Math.floor(pos.x); x < Math.ceil(pos.x + size.x); x++) {			//floor ceil
				for (let y = Math.floor(pos.y); y < Math.ceil(pos.y + size.y); y++) {		//floor ceil
					// это дублирование логики obstacleFromSymbol
					// в grid содержатся только препятствия - проверка знаения не нужна
					if (this.grid[y][x] === 'wall') {
						return 'wall';
					} else if (this.grid[y][x] === 'lava') {
						return 'lava';
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
		// тут лучше использовать метод some
		return !this.actors.find((item) => item.type === type);
		//return false;
	}
	playerTouched(obstacle, actor) {
		// фигурные свобки лучше не опускать
		if (this.status) return;
		if (obstacle === 'lava' || obstacle === 'fireball'){
			this.status = 'lost';
		}
		if (obstacle === 'coin' && actor.type === 'coin'){
			this.removeActor(actor);
			if(this.actors.find((item) => item.type === 'coin') === undefined){
				this.status = 'won';
			}
		}
	}
}


class LevelParser {
	constructor(dict = {}) {
		// тут хорошо бы было создать копию объекта
		this.dict = dict;
	}
	actorFromSymbol(symbol) {
		// это лишняя проверка
		if (!(symbol in this.dict)){
			return undefined;
		}
		return this.dict[symbol];
	}

	obstacleFromSymbol(symbol) {
		switch(symbol){
			case 'x':
				return 'wall';
			case '!':
				return 'lava';
			// это можно убрать, функция и так вернёт undefined
			default:
				return undefined;
		}
	}
	createGrid(plan = []) {
		// это лишняя проверка
		if (plan.length === 0){
			return [];
		}
		return plan.map((item) => item.split('').map((symbol) => this.obstacleFromSymbol(symbol)));

	}
	createActors(plan = []) {
		// лишняя проверка
		if (plan.length === 0){
			return [];
		}

		//?
		// Исправьте, пожалуйтса, форматирование
		return plan.reduce((actors, row, y) => {row.split('').forEach((symbol, x) => {
			const ObjectType = this.actorFromSymbol(symbol);
			// тут можно оставить только проверку того, что ObjectType является функцией
			// вы создаёте объект 2 раза - лучше создать, сохранить в переменную, проверить её тип и вернуть,
			// если она объект класса Actor
			if (ObjectType && typeof ObjectType === 'function' && Actor.prototype.isPrototypeOf(new ObjectType())) {
			actors.push(new ObjectType(new Vector(x, y)));
		}
	});
		return actors;
	}, []);

	}
	parse(plan) {
		return new Level(this.createGrid(plan), this.createActors(plan));
	}

}

class Player extends Actor{
	// лучше не использовать конструктор Vector по-умолчанию
	constructor(pos = new Vector()) {
		super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector());
	}
	get type() {
		return 'player';
	}
}

class Fireball extends Actor{
    // лучше не использовать конструктор Vector по-умолчанию
	constructor(pos = new Vector(), speed = new Vector()) {
		super(pos, new Vector(1,1), speed);
		//this.pos = pos;
		//this.speed = speed;
		//this.size = new Vector(1,1);
	}
	get type() {
		return 'fireball';
	}
	getNextPosition(time = 1) {
		return this.pos.plus(this.speed.times(time));
	}
	handleObstacle() {
		// лучше использовать метод times
		this.speed.x *= -1;
		this.speed.y *= -1;
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
	// лучше не использовать конструктор Vector по-умолчанию
	constructor(pos = new Vector) {
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

// Схемы уровней должны загружаться из levels.json (см. задание)
const schemas = [
	[
		'   o     ',
		'         ',
		'         ',
		'       o ',
		'     !xxx',
		' @       ',
		'xxxxx!   ',
		'         '
	],
	[
		'      v  ',
		'o   =    ',
		'  v      ',
		'        o',
		'        x',
		'@   x    ',
		'x        ',
		'         '
	]
];
const actorDict = {
	'@': Player,
	'v': FireRain,
	'|': VerticalFireball,
	'=': HorizontalFireball,
	'o': Coin

};
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
	// Тут можно использовать alert вмето console.log чтобы было веселее :)
	.then(() => console.log('Вы выиграли приз!'));
