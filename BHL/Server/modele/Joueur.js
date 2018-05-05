Joueur = function(nom, id)
{
	this.nom = nom;
	this.id = id;
	
	var points = 0;
	var role;

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