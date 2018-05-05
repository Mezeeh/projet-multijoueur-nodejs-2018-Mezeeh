(function (){
    // Vues de linterface (ceux affichees)
    var accueilVue;
    var attenteVue;
	var jeuVue;
	var finVue;
    var vueActive = null;

    var joueur;
    
    function initialiser(){
        window.addEventListener("hashchange", interpreterEvenementsLocation);
        joueur = new Joueur();
        
		accueilVue = new AccueilVue(joueur);
        attenteVue = new AttenteVue();
		jeuVue = new JeuVue(joueur);
        finVue = new FinVue(joueur);

        accueilVue.afficher();
    }
	
	function initialiserConnexion(){
		connexion = new ConnexionNodeJS(demanderJoueur, commencerPartie);
	}

	function initialiserJeu(){

	}
	
	function demanderJoueur(){
		return joueur;
	}

	function commencerPartie(evenement){
		console.log("La partie va commencer");
		window.location = "#jeu";
	}

    function interpreterEvenementsLocation(evenement){
		//hash est la partie suivant le # dans l'url
		var intructionNavigation = window.location.hash;
		if(!intructionNavigation || intructionNavigation.match(/^#$/) || intructionNavigation.match(/^#accueil$/)) {
			accueilVue.afficher();	
			vueActive = accueilVue;
		}
		else if(intructionNavigation.match(/^#attente$/)){
            console.log("En attente du second joueur...");
			attenteVue.afficher();
			initialiserConnexion();
            vueActive = attenteVue;
		}
		else if(intructionNavigation.match(/^#jeu$/)){
			jeuVue.afficher();
			initialiserJeu();
			vueActive = jeuVue;
		}
		else if(intructionNavigation.match(/^#gagnant$/)){
            finVue.afficher("gagne");
			vueActive = finVue;
		}
		else if(intructionNavigation.match(/^#perdant$/)){
			finVue.afficher("perdu");
			vueActive = finVue;
		}
    }
    
    initialiser();
})();