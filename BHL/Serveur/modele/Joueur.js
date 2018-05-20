Joueur = function(nom, id)
{
	// recoit seulement le nom et lid de base parce que le reste est decide apres la creation de lobjet
	this.nom = nom;
	this.id = id;
	
	this.points = 0;
	var role;

	var positionDepart = {
		x : 0,
		y : 0
	}

	var etat;

	this.positionX;
	this.positionY;

	this.getEtat = function(etat){
		return this.etat;
	}

	this.setEtat = function(etat){
		this.etat = etat;
	}

	this.getRole = function(){
		return this.role;
	}

	this.setRole = function(role){
		this.role = role;
	}

	this.getPoints = function(){
		return this.points;
	}

	this.setPoints = function(points){
		this.points = points;
	}
}
module.exports = Joueur;