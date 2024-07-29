// Esta função é acionada ao carregar a página
window.onload = function() {
    //D efinindo_parametros ----------------------------------------------------------
    window.canvas = document.getElementById('canvas');
    window.ctx = canvas.getContext('2d');

    window.canvas.width = 1200; // largura da página
    window.canvas.height = 500; // altura da página

    window.fps = 30; // frames per second
    window.interval = 1000/fps; // 1000 milisegundos (1s) divididos em fps (30) partes
    window.lastTime = 0; // último tempo decorrido

    let deu_play = false;
    let deu_pause = false;
    let deu_reestart = false;
    let acabou = false
    // --------------------------------------------------------------------------------
    
    // Densidades dos materiais -------------------------------------------------------
    // Alumínio (Al): ~2,70 g/cm³
    // Ferro (Fe): ~7,87 g/cm³
    // Cobre (Cu): ~8,96 g/cm³
    // Chumbo (Pb): ~11,34 g/cm³
    // Prata (Ag): ~10,49 g/cm³
    // Ouro (Au): ~19,32 g/cm³

    // Quanto pixels tem em 1 cm?
    // Determine a resolução da tela em PPI. Suponha que a tela tem 96 PPI, o que é comum para muitas telas de computador.
    // Converta PPI para PPCM. Sabendo que 1 polegada equivale a 2,54 cm, você pode converter PPI para PPCM da seguinte forma:
    // PPCM = 2,54/PPI​
    // Para uma tela com 96 PPI:
    // PPCM ≈ 96/2,54 ≈ 37,8 pixels por cm

    // 1 cm = 37,8 pixels
    // 1 g = 10**(-3) kg

    //p = (19.32*(10**(-3))) / (37.8**3) // densidade do ouro em kg/pixels³
    p = 19.32*(10**(3)) // densidade do ouro em kg/m³
    // --------------------------------------------------------------------------------

    // criando esferas ----------------------------------------------------------------
    
    // esfera 1
    let m1 = 10 // massa da esfera em kg

    // v = (4/3)πr³ --> volume da esfera
    // p = m/v --> desnsidade da esfera
    // m = pv = p(4/3)πr³ --> massa da esfera
    // r = (3m/4πp)**(1/3) --> raio da esfera
    let c1r = ((3*m1)/(4*Math.PI*p))**(1/3) // raio da esfera em m
    c1r = (((3*m1)/(4*Math.PI*p))**(1/3))*100 // raio da esfera em cm
    c1r = ((((3*m1)/(4*Math.PI*p))**(1/3))*100)/10 // escala 1cm : 10cm
    c1r = (((((3*m1)/(4*Math.PI*p))**(1/3))*100)/10)*37.8 // raio da esfera em pixels 

    dist_parede1 = c1r // distancia até parede
    let c1x = 0 + c1r + dist_parede1 // coordenada x do centro da esfera
    let c1y = window.canvas.height / 2 // coordenada y do centro da esfera
    let c1v = 10; // velocidade da esfera que se atualiza
    let c1vi = c1v; // velocidade inicial que não se altera
    let c1c = 'blue' // cor da esfera
    let pode_atualizar_pos1 = true; // auxilar para permitir movimentação
    let c1_colidiu = false;
    
    // esfera 2
    let m2 = 10
    let c2r = (((((3*m2)/(4*Math.PI*p))**(1/3))*100)/10)*37.8
    dist_parede2 = c2r
    let c2x = window.canvas.width - c2r - dist_parede2
    let c2y = window.canvas.height / 2
    let c2v = -10
    let c2vi = c2v;
    let c2c = 'red'
    let pode_atualizar_pos2 = true;
    let c2_colidiu = false;
    // --------------------------------------------------------------------------------

    // Sons ---------------------------------------------------------------------------
    const som_botao = new Audio('botao.mp3');
    som_botao.volume = 0.1;
    const som_erro = new Audio('erro.mp3');
    som_erro.volume = 0.1;
    const som_colisao = new Audio('colisao.mp3');
    som_colisao.volume = 0.1;
    const som_aee = new Audio('aee.mp3');
    som_aee.volume = 0.1;
    // --------------------------------------------------------------------------------
    
    // --------------------------------------------------------------------------------
    function desenhar_esferas(){
        // esfera 1 
        ctx.beginPath();
        ctx.arc(c1x, c1y, c1r, 0, Math.PI*2, false);
        ctx.fillStyle = c1c;
        ctx.fill();
        ctx.stroke();
        // esfera 2
        ctx.beginPath();
        ctx.arc(c2x, c2y, c2r, 0, Math.PI*2, false);
        ctx.fillStyle = c2c;
        ctx.fill();
        ctx.stroke();
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    function atualizar_posicoes(){
        if(deu_play == true && deu_pause == false){
            // esfera 1
            if (pode_atualizar_pos1 == true){
                // se cheguou na parede, encosta na parede
                if ((c1x + c1v + c1r) >= window.canvas.width) {
                    c1x = window.canvas.width - c1r;
                }
                // se cheguou na parede, encosta na parede
                else if ((c1x + c1v - c1r) <= 0) {
                    c1x = 0 + c1r;
                }
                else {
                    c1x += c1v
                }
            }
            // esfera 2
            if (pode_atualizar_pos2 == true){
                if ((c2x + c2v + c2r) >= window.canvas.width) {
                    c2x = window.canvas.width - c2r;
                }
                else if ((c2x + c2v - c2r) <= 0) {
                    c2x = 0 + c2r;
                }
                else {
                    c2x += c2v
                }
            }
        }
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    function limpar_tela(){
        // limpa toda a tela para redesenhar por cima tudo atualizado
        ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    function verificar_colisao(){
        if (deu_play == true && deu_pause == false){
            // se as duas esferascolidem
            if ((c1x + c1r) >= (c2x - c2r)) {
                // calcula as velocidades novas
                // simplificando parâmetros
                a = m1
                b = m2
                c = c1v
                d = c2v
                // calculando velocidade das esferas após a colisão
                // esse cálulo é resultado do seguinte sistema de equações:
                // ax² + by² = ac² + bd² (consequência da conservação de energia cinética)
                // ax + by = ac + bd (consequência da conservação de momenbto linear)
                // onde:
                // x = v1f ---> velocidade da esfera 1 após a colisão
                // y = v2f ---> velocidade da esfera 2 após a colisão
                x = -(-a*c - b*d + b*(2*a*c - a*d + b*d)/(a + b))/a
                y = (2*a*c - a*d + b*d)/(a + b)
                c1v = x
                c2v = y
                som_colisao.play();
                c1_colidiu = true;
                c2_colidiu = true;

                // se, ao colidir, uma das esferas já estiver impossibilitade de andar
                if (pode_atualizar_pos1 == false) {
                    // a outra também não poderá andar
                    // e elas devem ficar coladas
                    c2x = c1x + c1r + c2r
                    pode_atualizar_pos2 = false;
                    deu_pause = true;                
                }
                else if (pode_atualizar_pos2 == false) {
                    c1x = c2x - c2r - c1r
                    pode_atualizar_pos1 = false;
                    deu_pause = true;                
                }
            }
            // se uma esfera chegar em alguma parede
            if ((c1x + c1r) >= window.canvas.width || (c1x - c1r) <= 0) {
                // ela não poderá andar
                pode_atualizar_pos1 = false;
            }
            if ((c2x + c2r) >= window.canvas.width || (c2x - c2r) <= 0) {
                pode_atualizar_pos2 = false;
            }
        }
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    function mostrar_informacoes(){
        // Título
        ctx.font = "50px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Colisão Elástica`,window.canvas.width/2,50);

        //Texto explicativo
        ctx.font = "20px Arial";
        ctx.fillText(`Altere os valores abaixo ANTES de dar play e veja o que acontece.`,window.canvas.width/2,90);

        // Esferas
        ctx.font = "20px Arial";
        // Esfera 1
        ctx.textAlign = "left";
        ctx.fillText(`posição inicial`,60,window.canvas.height-82);
        ctx.fillText(`m1 = ${m1} kg`,60,window.canvas.height-57);
        ctx.fillText(`v1i = ${c1vi} m/s`,60,window.canvas.height-32);
        if (c1_colidiu == false) {
            ctx.fillText(`v1f: "Veja após a Colisão"`,60,window.canvas.height-7);
        }
        else{
            ctx.fillText(`v1f ≅ ${c1v.toFixed(2)} m/s`,60,window.canvas.height-7);
        }
        // Esfera 2
        ctx.textAlign = "right";
        ctx.fillText(`posição inicial`,window.canvas.width-60,window.canvas.height-82);
        ctx.fillText(`m2 = ${m2} kg`,window.canvas.width-60,window.canvas.height-57);
        ctx.fillText(`v2i = ${c2vi} m/s`,window.canvas.width-60,window.canvas.height-32);
        if (c1_colidiu == false) {
            ctx.fillText(`v2f: "Veja após a Colisão"`,window.canvas.width-60,window.canvas.height-7);
        }
        else{
            ctx.fillText(`v2f ≅ ${c2v.toFixed(2)} m/s`,window.canvas.width-60,window.canvas.height-7);
        }
    }
    // --------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------
    function verificar_botoes(){
        //play
        document.getElementById('play').addEventListener('click', () => {
            if (acabou == true){
                som_erro.play();
                window.alert("Reinicie!");
            }
            else{
                som_botao.play();
                deu_play = true;
                deu_pause = false;
                deu_reestart = false;
            }
        });

        //pause
        document.getElementById('pause').addEventListener('click', () => {
            if (acabou == true){
                som_erro.play();
                window.alert("Reinicie!");
            }
            else{
                som_botao.play();
                deu_pause = true;
            }
        });

        //reestart
        document.getElementById('reestart').addEventListener('click', () => {
            som_botao.play();
            m1 = 10;
            c1r = (((((3*m1)/(4*Math.PI*p))**(1/3))*100)/10)*37.8;
            dist_parede1 = c1r;
            c1x = 0 + c1r + dist_parede1;
            c1v = 10;
            c1vi = c1v;
            pode_atualizar_pos1 = true;
            c1_colidiu = false;

            m2 = 10;
            c2r = (((((3*m2)/(4*Math.PI*p))**(1/3))*100)/10)*37.8;
            dist_parede2 = c2r;
            c2x = window.canvas.width - c2r - dist_parede2;
            c2v = -10;
            c2vi = c2v;
            pode_atualizar_pos2 = true;
            c2_colidiu = false;

            deu_reestart = true;
            deu_play = false;
            deu_pause = false;

            acabou = false;
        });

        // so pode mexer nos parâmetros das esferas com o jogo pausado
        // se apertar o botão, aumenta ou diminui (massa/velocidade/dist_parede)
        // massa
        document.getElementById('increment3').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (m1 >= 10 && m1 <= 980 && deu_play == false) {
                som_botao.play();
                m1 += 10;
                c1r = (((((3*m1)/(4*Math.PI*p))**(1/3))*100)/10)*37.8
                c1x = 0 + c1r + dist_parede1
            }
        });
        document.getElementById('decrement3').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (m1 >= 20 && m1 <= 990 && deu_play == false) {
                som_botao.play();
                m1 -= 10;
                c1r = (((((3*m1)/(4*Math.PI*p))**(1/3))*100)/10)*37.8
                c1x = 0 + c1r + dist_parede1
            }
        });
        document.getElementById('increment4').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (m2 >= 10 && m2 <= 980 && deu_play == false) {
                som_botao.play();
                m2 += 10;
                c2r = (((((3*m2)/(4*Math.PI*p))**(1/3))*100)/10)*37.8
                c2x = window.canvas.width - c2r - dist_parede2
            }
        });
        document.getElementById('decrement4').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (m2 >= 20 && m2 <= 990 && deu_play == false) {
                som_botao.play();
                m2 -= 10;
                c2r = (((((3*m2)/(4*Math.PI*p))**(1/3))*100)/10)*37.8
                c2x = window.canvas.width - c2r - dist_parede2
            }
        });
        // velocidade
        document.getElementById('increment1').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c1v >= 0 && c1v <= 990 && deu_play == false) {
                som_botao.play();
                c1v += 10;
                c1vi = c1v;
            }
        });
        document.getElementById('decrement1').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c1v >= 10 && c1v <= 1000 && deu_play == false) {
                som_botao.play();
                c1v -= 10;
                c1vi = c1v;
            }
        });
        document.getElementById('increment2').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c2v <= -10 && c2v >= -990 && deu_play == false) {
                som_botao.play();
                c2v += 10;
                c2vi = c2v;
            }
        });
        document.getElementById('decrement2').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c2v >= -980 && c2v <= 0 && deu_play == false) {
                som_botao.play();
                c2v -= 10;
                c2vi = c2v;
            }
        });
        // distância até parede
        document.getElementById('increment5').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c1x - c1r >= 0 && c1x + c1r <= canvas.width/2-c1r-3 && deu_play == false) {
                som_botao.play();
                dist_parede1 += c1r;
                c1x = 0 + c1r + dist_parede1;
            }
        });
        document.getElementById('decrement5').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c1x - c1r >= c1r && c1x + c1r <= canvas.width/2 && deu_play == false) {
                som_botao.play();
                dist_parede1 -= c1r;
                c1x = 0 + c1r + dist_parede1;
            }
        });
        document.getElementById('increment6').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c2x + c2r <= canvas.width-c2r && dist_parede2 <= canvas.width/2 && deu_play == false) {
                som_botao.play();
                dist_parede2 -= c2r;
                c2x = window.canvas.width - c2r - dist_parede2
            }
        });
        document.getElementById('decrement6').addEventListener('click', () => {
            if (deu_play == true) {
                som_erro.play();
                window.alert('Reinicie para poder alterar');
            }
            if (c2x - c2r >= canvas.width/2 + c2r + 3 && dist_parede2 <= canvas.width - c2r -1 && deu_play == false) {
                som_botao.play();
                dist_parede2 += c2r;
                c2x = window.canvas.width - c2r - dist_parede2
            }
        });
    }
    // --------------------------------------------------------------------------------
    
    // --------------------------------------------------------------------------------
    function verificar_acabou(){
        if (acabou == false && pode_atualizar_pos1 == false && pode_atualizar_pos2 == false) {
            acabou = true;
            som_aee.play();
        }
    }
    // --------------------------------------------------------------------------------
    
    // --------------------------------------------------------------------------------
    // obs: timestamp já é passado automaticamente pela função requestAnimationFrame
    // Ele é o tempo atual em milissegundos desde o início do tempo em que a página foi carregada
    function rodar_simulacao(timestamp){
        // se já passou mais tempo do que o tamanho de um dos 30 pedacinhos de tempo definidos acima
        if (timestamp - window.lastTime >= window.interval) {
            window.lastTime = timestamp;
            // atualiza esse tempo como o tempo atual e depois espera passar de novo
            atualizar_posicoes();
            limpar_tela();
            verificar_colisao();
            desenhar_esferas();
            mostrar_informacoes();
            verificar_acabou();
        }
        requestAnimationFrame(rodar_simulacao);
    }
    // --------------------------------------------------------------------------------

    desenhar_esferas();
    verificar_botoes();
    requestAnimationFrame(rodar_simulacao);
}