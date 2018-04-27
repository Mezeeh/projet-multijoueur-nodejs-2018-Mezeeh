var http = require('http');
var io = require('socket.io');

var nbJoueurs;

function init(){
    nbJoueurs = 0;

    var server = http.createServer(function (requete, reponse){

    }).listen(8080);

    var priseEntreeSortie = io.listen(server);
    priseEntreeSortie.on('connection', gererConnexion);
}

function gererConnexion(connexion){
    nbJoueurs++;
    if(nbJoueurs >= 2) console.log("DEUX PERSONNES !!!");
}

init();