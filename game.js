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

	constructor (){}
}
