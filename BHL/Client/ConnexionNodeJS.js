function ConnexionNodeJS(){
    var connexion;

    function init(){
        console.log("HELLO");
        connexion = io.connect('http://127.0.0.1:8080');
    }

    init();
}