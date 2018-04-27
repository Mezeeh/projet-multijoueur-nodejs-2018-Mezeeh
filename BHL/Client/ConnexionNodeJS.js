function ConnexionNodeJS(callback){
    var connexion;

    function init(){
        console.log("HELLO");
        connexion = io.connect('http://127.0.0.1:8080');
		connexion.on('demandeNomsJoueurs', envoyerNomJoueur);
    }
	
	function envoyerNomJoueur(evenement){
		console.log("envoyerNomJoueur()");
		connexion.emit('nomsJoueurs', callback());
	}

    init();
}