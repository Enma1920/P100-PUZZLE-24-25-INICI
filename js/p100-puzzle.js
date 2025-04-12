//Variables globales
var widthImagen = 0;
var heightImagen = 0;
var columnaPeca = null;
var filaPeca = null;
var numFilesImagen = null;
var numColumnesImagen = null;
var ampladaPecaImagen = null;
var alcadaPecaImagen = null;

// comença el programa
$(document).ready(function(){
    $(".menu").show();
    $(".juego").hide();
    $("#felicitacionModal").modal({show: false});

    //Esdeveniments de l'usuari
    //Menú inicial
    /**TASCA *****************************
    * Addicional.- codi del menú que permet escollir imatges i/o el número de peces**/

    var audioMusica = $("#audioMusica")[0];
    var botoMusica = $("#btnMusica");
    var musicaOn = false;
    audioMusica.style.display = "none"; // ocultar audio al principi

    // Parar musica de fons 
    botoMusica.on("click",function(){
        // Quan la música esta ON 
        if(musicaOn){  
            // pausem la música
            audioMusica.pause();
            document.getElementById("btnMusica").textContent = "Música On";
            document.getElementById("audioMusica").style.display = "none";
            musicaOn = false;
        }
        // Quan la música esta OFF
        else{
            // Reproduim la música
            audioMusica.play();
            document.getElementById("btnMusica").textContent = "Música Off";
            document.getElementById("audioMusica").style.display = "block";
            musicaOn = true;
        }
    });
            
    /*****************************************************************/
    
      
   
    //Comença el joc
    $("#jugar").on("click",function(){

        //Recogemos los inputs
        var nomImatge = $("input[type='radio']:checked").val();
        var numFiles = parseInt($("#inputFiles").val());
        var numColumnes = parseInt($("#inputColumnes").val());
        var imagen = $("#p-"+nomImatge);

        //TODO: corregir problema por el cual recoge el ancho y alto de la imagen pequeña y no original
        widthImagen = imagen[0].naturalWidth;   //Obtenemos el width de la imagen y la guardamos
        heightImagen = imagen[0].naturalHeight; //Obtenemos el heigth de la imagen y la guardamos

        numFilesImagen = numFiles;          //Obtenemos el numero de filas y lo guardamos
        numColumnesImagen = numColumnes;    //Obtenemos el numero de columnas y lo guardamos

        let srcImagen = imagen.attr("src"); //Obtenemos la extensión de la imagen y la guardamos
        var extImatge = "." + srcImagen.split('.').pop().split(/\#|\?/)[0].toLowerCase();

        //Ocultamos el menú y mostramos el juego
        $(".menu").hide();
        $(".juego").show();
        
        creaPuzzle(nomImatge, extImatge, numFiles, numColumnes);
        $(".peca")
        .mousedown(function(){
            zIndexPeca = $(this).css("z-index");
            $(this).css("z-index",100);
        })
        .mouseup(function(){
            /**
            * PosicionaPeca calcula la posició correcte i 
            * revisa si la distànca entre la posició actual
            * i la posició correcte és inferior a una 
            * distància determinada
            */           
            posicionaPeca($(this), ampladaPeca, alcadaPeca);
            /**
            * puzzleResolt revisa si totes les peces
            * estan a la seva posició correcte i 
            * En cas afirmatiu, mostra la felicitació
            */ 
            if(puzzleResolt(ampladaPeca, alcadaPeca, numFiles, numColumnes)){
                /**TASCA *****************************
                * 6.- Codi que mostra la felicitació si puzzleResolt = true
                * És valora alguna animació o efecte
                */
               let textoFelicitacion = $("#animacionTexto");
               textoFelicitacion.text("Felicitats!!!🧩 Has pogut resoldre el puzzle🎉"); 
               $("#felicitacionModal").modal("show");
               animacionTexto("animacionTexto", textoFelicitacion);
               
            }
        });

    });    
    $("#resolPuzzle").on("click",function(){
        /**
        * Si l'usuari fa clic, totes les peces
        * es posicionen a la seva posició correta
        * resolent el puzle
        */ 
        resolPuzzle();
    });

    $("#nouPuzzle").on("click",function(){
         //Ocultamos el juego y mostramos el menu
         $(".menu").show();
         $(".juego").hide();
    });    

   
});

/**
* Calcula les mides de les peces en funció de la mida de la imatge
* i del nombre de files i columnes
* Estableix les mides dels contenidors
*/
function creaPuzzle(nomImatge, extImatge, numFiles, numColumnes){
    ampladaPeca = Math.floor(widthImagen/numColumnes);
    alcadaPeca = Math.floor(heightImagen/numFiles);

    $("#peces-puzzle").html(crearPeces(numFiles, numColumnes));
    $(".peca").css({
        "width" : ampladaPeca+"px",
        "height" : alcadaPeca+"px",
    });   
    
    setImatgePosicioPeces(numFiles, numColumnes, ampladaPeca, alcadaPeca, nomImatge, extImatge);
   
	$("#marc-puzzle").css("width", (ampladaPeca*numColumnes)+"px");
	$("#marc-puzzle").css("height",( alcadaPeca*numFiles   )+"px");
    $("#marc-puzzle").css("box-sizing", "content-box");
    $("#solucio").css("width", (ampladaPeca*numColumnes)+"px");
    $("#solucio").css("height",( alcadaPeca*numFiles   )+"px");
    $("#solucio").css("background-image","url(imatges/"+nomImatge+ extImatge+")");

    $(".peca").draggable();
}

/**
* Crea codi HTML per representar les peces
* amb un sistema d'identificació f0c0, f0c1,...fxcy
*
* @return text (divs html per cada peça)
*/
function crearPeces(numFiles, numColumnes){
    var htmlPeces = "";
    for (let fila=0; fila<numFiles; fila++){
        for (let columna=0; columna<numColumnes; columna++){
                htmlPeces +="<div id='f"+fila+"c"+columna+"' class='peca'></div>"; 

            }
        htmlPeces+="\n";
    }   
    return htmlPeces;
}

/**
* Estableix els backgroud de la peça, ajustada a la imatge i 
* a la posició correcte de la peça
* Estableix una posició aleatoria (left, top) per a cada peça. Barreja.
*
*/
function setImatgePosicioPeces(numFiles, numColumnes, ampladaPeca, alcadaPeca, nomImatge, extImatge){
    $(".peca").css("background-image","url(imatges/"+nomImatge+ extImatge+")");
    for (let fila=0; fila<numFiles; fila++){
        for (let columna=0; columna<numColumnes; columna++){
            $("#f"+fila+"c"+columna).css("background-position", (-(columna)*ampladaPeca)+"px "+(-(fila)*alcadaPeca)+"px");   
            $("#f"+fila+"c"+columna).css("left", Math.floor(Math.random()*((numColumnes-1)*ampladaPeca))+"px ");
            $("#f"+fila+"c"+columna).css("top", Math.floor(Math.random()*((numFiles-1)*alcadaPeca))+"px ");
            
        }        
   }   

}


/**
* PosicionaPeca calcula la posició correcte i 
* revisa si la distància entre la posició actual
* i la posició correcte és inferior a una 
* distància determinada, utilitzant la funció distanciaDosPunts.
* Si aquesta avaluació és positiva, mou la peça a la posició correcte
*
* @para peca (peça que l'usuari ha alliberat amb el ratolí)
*  
*/   

function posicionaPeca(peca, ampladaPeca, alcadaPeca){
   
    let posicioPeca = peca.position();
    /**TASCA *****************************
    * 1.- Identifica la peça pel seu id (fxcy) i en calcula la
    * seva posició correcte  (posicioPecaCorrecte) 
    * 
    *  
    */
    let idPeca = peca.attr("id");
    let columna = parseInt(idPeca.charAt(3)); // COLUMNA: EIX X. f1c2 --> 2 // CORREGIMOS ERROR QUE ESTABA MAL ESCRITO EL charAt
    let fila = parseInt(idPeca.charAt(1)); // FILA: EIX Y. f1c2 --> 1 // CORREGIMOS ERROR QUE ESTABA MAL ESCRITO EL charAt

    //Añadimos la filas y columnas en variables globales para luego usarlas.
    columnaPeca = columna;
    filaPeca = fila;

    let posicioPecaCorrecte = {
        left: columna * ampladaPeca, // eix X
        top: fila * alcadaPeca   // eix Y
    }
    if (distanciaDosPunts(posicioPeca, posicioPecaCorrecte)<10){      
        /**TASCA *****************************
        * 2.- Si la distancia és dins del marge determinat
        * mou la peça a la seva posició correcta
        *
        *  La peça ja no és podrà tornar a moure
        *  
        */ 
       posicioPeca = posicioPecaCorrecte;
       peca.css({
        left: posicioPecaCorrecte.left + "px",
        top: posicioPecaCorrecte.top + "px"
       })
       peca.draggable("disable"); // ja no es pot moure la peça
       peca.css("z-index", 1); // envia la peça al fons quan ja està col·locada

       /*TASCA 2.- Si la distancia és dins del marge determinat mou la peça a la seva posició correcta. La peça ja no és podrà tornar a moure */
        // peca.css("left", posicioPecaCorrecte.left + "px");
        // peca.css("top", posicioPecaCorrecte.top + "px");

        // peca.draggable("disable");
        // peca.css("z-index", 1); // envia la peça al fons quan ja està col·locada
    }

}

/**
* Posa totes les peces al seu lloc correcte
*
* @para 
* @return 
*/
function resolPuzzle(){
    /**TASCA *****************************
    * 4.- Posiciona totes les peces a la 
    * seva posició correcte, resolent el puzle
    *  
    */ 

    let numFiles = numFilesImagen;
    let numColumnes = numColumnesImagen;

    for (let fila=0; fila < numFiles; fila++){
        for (let columna=0; columna < numColumnes; columna++){
            let idPeca = "#f" + fila + "c" + columna;
            let posicioPecaAResoldre = $(idPeca).position();

            let posicioPecaCorrecte = {
                left: columna * ampladaPeca, // eix X
                top: fila * alcadaPeca   // eix Y
                }

            if(distanciaDosPunts(posicioPecaAResoldre, posicioPecaCorrecte) != 0){
                $(idPeca).css({
                    left: posicioPecaCorrecte.left + "px",
                    top: posicioPecaCorrecte.top + "px"
                });
            }
        }
    }
}

/**
* Revisa si totes les peces son al seu lloc
*
* @return bool (true si totes les peces son al seu lloc)
*/
function puzzleResolt(ampladaPeca, alcadaPeca, numFiles, numColumnes){
    /**TASCA *****************************
    * 5.- Revisa totes les peces i les seves posicions actuals i compara
    * aquestes poscions amb les posicions correctes que haurien de tenir
    * En cas que totes les peces siguin a la seva posició 
    * correcte, retorna cert
    *  
    */ 
   let resolt = true;

    for (let fila=0; fila<numFiles; fila++){
        for (let columna=0; columna<numColumnes; columna++){
            let peca = "#f"+fila+"c"+columna;
            let posicioPeca = $(peca).position();

            let posicioPecaCorrecte = {
                left: columna * ampladaPeca, // eix X
                top: fila * alcadaPeca   // eix Y
                }

            if(distanciaDosPunts(posicioPeca, posicioPecaCorrecte) > 1){
                resolt = false;
                break;
            }
        }

        // Si ya se detectó que no está resuelto, salimos del bucle exterior también
        if (!resolt) break;
    }

    return resolt;
}


/**
* Calcula la distància entre dos punts
*
* @para puntA, puntB 
* coordenada superior esquerra de la peca (pA) i de la seva posició correcte (pB)
* @return Distancia entre els dos punts en un pla cartesià
*/
function distanciaDosPunts(puntA, puntB){
   /**TASCA *****************************
    * 3.- Reviseu la fórmula de càlcul de distància entre dos punts
    * a la lliçó 5: Col·lisions  dels apunts
    *  
    */ 
   // revisar si los puntos tienen x, y declarados
    return Math.sqrt(Math.pow(puntB.left - puntA.left, 2) + Math.pow(puntB.top - puntA.top, 2));
}

// animacion texto de carta de felicitacion, letra por letra
function animacionTexto(idTexto, texto){
        let idText = $("#"+`${idTexto}`);
        let contenidoTexto = Array.from(texto.text()); // convertim en array de caracters
        let longTexto = texto.text().length;
        let textoAnimado = "";
        for (let i = 0; i < longTexto; i++) {
            ((index) => {
                setTimeout(() => {
                    if(contenidoTexto[i] == undefined){
                        return;
                    }
                    textoAnimado += contenidoTexto[i]; // afegir lletra per lletra
                    idText.html(textoAnimado); // actualitzar el text
                }, 100 * index); // temps per cada carcter
            })(i);
        }

}