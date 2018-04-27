var http = require('http');
var io = require('socket.io');

var nbJoueurs;
var listeConnexion = [];

function init(){
    nbJoueurs = 0;

    var server = http.createServer(function (requete, reponse){

    }).listen(8080);

    var priseEntreeSortie = io.listen(server);
    priseEntreeSortie.on('connection', gererConnexion);
}

function gererConnexion(connexion){
    nbJoueurs++;
	
	listeConnexion[nbJoueurs] = connexion;

    if(nbJoueurs == 2){
		console.log("DEUX PERSONNES !!!");
		
		for(idConnexion in listeConnexion){
			listeConnexion[idConnexion].emit('demandeNomsJoueurs', true);
			listeConnexion[idConnexion].on('nomsJoueurs', gererNomsJoueurs);
		}
	} 
}

function gererNomsJoueurs(nom){
	console.log("Nom = " + nom);
}

init();