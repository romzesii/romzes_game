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

		//??? не пересекается сам с собой
		//??? Объект не пересекается с объектом расположенным очень далеко
		//??? Объект не пересекается с объектом со смежными границами
		//??? Объект не пересекается с объектом расположенным в той же точке, но имеющим отрицательный вектор размера
		//??? Объект пересекается с объектом, который полностью содержится в нём
		//??? Объект пересекается с объектом, который частично содержится в нём
	}

}

class Level {

	constructor (){}
}
