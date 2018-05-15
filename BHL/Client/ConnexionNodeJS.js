function ConnexionNodeJS(demanderJoueur,
						commencerPartie,
						setMinuteur,
						setPartieTerminee,
						gererEtatJoueurs,
						demanderPosition){
    var connexion;

    function init(){
        console.log("HELLO");
        connexion = io.connect('http://127.0.0.1:8080');
		connexion.on('identificationJoueur', identifierJoueur);
		connexion.on('demandeJoueurs', envoyerJoueur);
		connexion.on('commencerPartie', commencerPartie);
		connexion.on('setMinuteur', setMinuteur);
		connexion.on('partieTerminee', setPartieTerminee);
		connexion.on('etatJoueurs', gererEtatJoueurs);
		connexion.on('demandePosition', demanderPosition);
	}
	
	function identifierJoueur(idJoueur){
		console.log("identifierJoueur()");
		demanderJoueur().id = idJoueur;
	}
	
	function envoyerJoueur(evenement){
		console.log("envoyerJoueur()");
		connexion.emit('joueurs', JSON.stringify(demanderJoueur()));
	}

	this.envoyerDeplacement = function(direction){
		connexion.emit('deplacement', JSON.stringify(direction));
	}

	this.envoyerEnCollision = function(infosCollision){
		connexion.emit('collision', JSON.stringify(infosCollision));
	}

	this.envoyerPosition = function(position){
		connexion.emit('positionJoueur', JSON.stringify(position));
	}

    init();
}