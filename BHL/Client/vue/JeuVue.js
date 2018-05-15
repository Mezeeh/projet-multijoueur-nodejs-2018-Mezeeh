JeuVue = function(joueur)
{
	var corps;
	
	function initialiser()
	{
		corps = document.getElementsByTagName("body")[0];
	}

	this.afficher = function()
	{
        corps.innerHTML = JeuVue.pageJeuHTML;
        
	}

	this.raffraichirHUD = function(variable){
            document.getElementById("hudNomJ1").innerHTML = variable.j1Nom;
            document.getElementById("hudNomJ2").innerHTML = variable.j2Nom;
			
			var date = new Date(null);
			date.setSeconds(variable.temps);
			var temps = date.toISOString().substr(14, 5);
			document.getElementById("hudTemps").innerHTML = temps;
            
            document.getElementById("hudPointsJ1").innerHTML = variable.j1Pointage;
            document.getElementById("hudPointsJ2").innerHTML = variable.j2Pointage;
	}
	
	initialiser();
	
}

JeuVue.pageJeuHTML = document.getElementById("page-jeu").innerHTML;











