function ConnexionNodeJS(demanderJoueur,
						commencerPartie){
    var connexion;

    function init(){
        console.log("HELLO");
        connexion = io.connect('http://127.0.0.1:8080');
		connexion.on('identificationJoueur', identifierJoueur);
		connexion.on('demandeJoueurs', envoyerJoueur);
		connexion.on('commencerPartie', commencerPartie);
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

    init();
}