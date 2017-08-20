'use strict';

class Vector {

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

	constructor (pos = new Vector(), size = new Vector(1,1), speed = new Vector()){
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
		if (actor.top >= this.bottom || actor.bottom <= this.top || actor.left >= this.right || actor.right <= this.left) {
            return false;
        }
        return true; 
	}

}

class Level {

	constructor (grid = [], actors = []){
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;

		this.player = this.actors.find((item) => item.type === 'player');

		//this.width = this.grid.reduce((maximum, current) => Math.max(current.length), 0) || 0;
	}

	get height(){
		return this.grid.length;
	}
	get width(){
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
		} else if(pos.y + size.y > this.height) {
			return 'lava';
		} else {
			return this.grid[Math.floor(pos.x)][Math.floor(pos.y)]; //???
		}
	}
	removeActor(actor) {
		let actorIndex = this.actors.indexOf(actor);

		if(actorIndex !== -1) {
			this.actors.splice(actorIndex, 1);
		}
	}
	noMoreActors(type) {
		return !this.actors.find((item) => item.type === type);
		//return false;
	}
	playerTouched(obstacle, actor) {
		if (this.status) return;
		if (obstacle === 'lava' || obstacle === 'fireball'){
			this.status = 'lost';
			return;
		}
		if (obstacle === 'coin' && actor.type === 'coin'){
			this.removeActor(actor);
			if(this.actors.find(item => item.type === 'coin') === undefined){
				this.status = 'won';
				return;
			}
		}

	}
}
