Joueur = function(nom, id)
{
	this.nom = nom;
	this.id = id;
	
	var points = 0;
	var role;

	this.getRole = function(role){
		return this.role;
	}

	this.setRole = function(role){
		this.role = role;
	}
}
module.exports = Joueur;