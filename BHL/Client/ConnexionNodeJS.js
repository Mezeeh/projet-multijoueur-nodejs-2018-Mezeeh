function ConnexionNodeJS(demanderJoueur,
						commencerPartie,
						setMinuteur,
						setPartieTerminee,
						gererEtatJoueurs,
						demanderPosition,
						changerRole,
						setProlongation){ // des callbacks qui sont dans le main
    var connexion;

	// genre de constructeur qui est appeler quand lobjet est cree
	// se connect avec socketio au serveur et ajoute les events listener
	// tout les events listeneers sont a la meme place pour faciliter la comprehension et la lecture
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
		connexion.on('changementRole', changerRole)
		connexion.on('prolongation', setProlongation);
	}
	
	// donne lid unique recu du serveur au joueur
	function identifierJoueur(idJoueur){
		console.log("identifierJoueur()");
		demanderJoueur().id = idJoueur;
	}
	
	// envoie lobjet joueur client au complet au serveur
	function envoyerJoueur(evenement){
		console.log("envoyerJoueur()");
		connexion.emit('joueurs', JSON.stringify(demanderJoueur()));
	}

	// envoie letat (droite, gauche, haut gauche, inactif, etc.)
	this.envoyerDeplacement = function(direction){
		connexion.emit('deplacement', JSON.stringify(direction));
	}

	// sert a dire au serveur que selon le client il ya collision
	this.envoyerEnCollision = function(infosCollision){
		connexion.emit('collision', JSON.stringify(infosCollision));
	}

	// envoie la position du joueur et non de ladversaire pour verifier sil ya vraimebt collision
	this.envoyerPosition = function(position){
		console.log("envoyerPosition()");
		connexion.emit('positionJoueur', JSON.stringify(position));
	}

    init();
}