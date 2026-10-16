
const botaoIniciar = document.getElementById("botaoIniciar");
const telaInicio = document.getElementById("inicio");
const telaJogo = document.getElementById("jogo");
const telaCanvas = document.getElementById("telaJogo");
const pontuacaoHTML = document.getElementById("pontuacao");
const vidasHTML = document.getElementById("vidas");

const ctx = telaCanvas.getContext("2d");

const LARGURA = 800;
const ALTURA = 360;
const CHAO = 275;

let fase = 1;
let estado = "inicio";
let pontos = 0;
let vidas = 3;
let invulneravelAte = 0;
let mensagemAtual = "";
let mensagemAte = 0;

const teclas = {
    esquerda: false,
    direita: false
};

const jogador = {
    x: 45,
    y: CHAO,
    largura: 24,
    altura: 45,
    velocidade: 4,
    velocidadeY: 0,
    pulando: false
};

// Fase 1: os cinco corações originais.
let coracoes = [];
let obstaculos = [];
let lembrancas = [];

function prepararFase1() {
    fase = 1;
    pontos = 0;
    vidas = 3;

    jogador.x = 45;
    jogador.y = CHAO;
    jogador.velocidadeY = 0;
    jogador.pulando = false;

    coracoes = [
        { x: 145, y: 245, coletado: false },
        { x: 265, y: 205, coletado: false },
        { x: 385, y: 245, coletado: false },
        { x: 525, y: 205, coletado: false },
        { x: 665, y: 245, coletado: false }
    ];

    obstaculos = [
        { x: 205, y: 295, largura: 25, altura: 25 },
        { x: 335, y: 295, largura: 28, altura: 25 },
        { x: 465, y: 295, largura: 25, altura: 25 },
        { x: 605, y: 295, largura: 30, altura: 25 }
    ];

    lembrancas = [];
    atualizarInformacoes();
}

// Fase 2: cada estrela desbloqueia uma mensagem.
function prepararFase2() {
    fase = 2;
    pontos = 0;
    vidas = 3;

    jogador.x = 45;
    jogador.y = CHAO;
    jogador.velocidadeY = 0;
    jogador.pulando = false;

    coracoes = [];

    lembrancas = [
        {
            x: 145,
            y: 245,
            coletado: false,
            mensagem: "Quatro meses de nos..."
        },
        {
            x: 300,
            y: 205,
            coletado: false,
            mensagem: "E tanta coisa boa por viver!"
        },
        {
            x: 465,
            y: 245,
            coletado: false,
            mensagem: "Meu mo favorito. Sem concorrencia!"
        },
        {
            x: 635,
            y: 205,
            coletado: false,
            mensagem: "Proxima fase: continuar juntinhos!"
        }
    ];

    obstaculos = [
        { x: 220, y: 295, largura: 28, altura: 25 },
        { x: 385, y: 295, largura: 28, altura: 25 },
        { x: 550, y: 295, largura: 28, altura: 25 }
    ];

    atualizarInformacoes();
}

function atualizarInformacoes() {
    pontuacaoHTML.textContent = pontos;
    vidasHTML.textContent = "♥ ".repeat(vidas).trim() || "0";
}

botaoIniciar.addEventListener("click", function () {
    telaInicio.classList.add("escondido");
    telaJogo.classList.remove("escondido");

    prepararFase1();
    estado = "jogando";
});

// Controles do personagem e das telas de transição.
function apertarTecla(evento, pressionada) {
    const tecla = evento.key.toLowerCase();

    if (
        ["arrowleft", "arrowright", "arrowup", " ", "w", "a", "d"].includes(tecla)
    ) {
        evento.preventDefault();
    }

    if (estado === "transicao" && pressionada) {
        if (tecla === "enter" || tecla === " ") {
            prepararFase2();
            estado = "jogando";
        }
        return;
    }

    if (estado === "final" && pressionada) {
        if (tecla === "enter" || tecla === " ") {
            estado = "inicio";
            telaJogo.classList.add("escondido");
            telaInicio.classList.remove("escondido");
            botaoIniciar.textContent = "Jogar novamente ♥";
        }
        return;
    }

    if (estado === "derrota" && pressionada) {
        if (tecla === "enter" || tecla === " ") {
            prepararFase1();
            estado = "jogando";
        }
        return;
    }

    if (tecla === "arrowleft" || tecla === "a") {
        teclas.esquerda = pressionada;
    }

    if (tecla === "arrowright" || tecla === "d") {
        teclas.direita = pressionada;
    }

    if (
        pressionada &&
        ["arrowup", "w", " "].includes(tecla) &&
        !jogador.pulando &&
        estado === "jogando"
    ) {
        jogador.velocidadeY = -11;
        jogador.pulando = true;
    }
}

document.addEventListener("keydown", evento => {
    apertarTecla(evento, true);
});

document.addEventListener("keyup", evento => {
    apertarTecla(evento, false);
});

function colidiu(a, b) {
    return (
        a.x < b.x + b.largura &&
        a.x + a.largura > b.x &&
        a.y < b.y + b.altura &&
        a.y + a.altura > b.y
    );
}

function mostrarMensagem(texto) {
    mensagemAtual = texto;
    mensagemAte = Date.now() + 2200;
}

function perderVida() {
    if (Date.now() < invulneravelAte || estado !== "jogando") {
        return;
    }

    vidas--;
    invulneravelAte = Date.now() + 1200;
    jogador.x = Math.max(0, jogador.x - 35);

    atualizarInformacoes();

    if (vidas <= 0) {
        estado = "derrota";
    }
}

function atualizar() {
    if (estado !== "jogando") return;

    if (teclas.esquerda) jogador.x -= jogador.velocidade;
    if (teclas.direita) jogador.x += jogador.velocidade;

    jogador.x = Math.max(
        0,
        Math.min(LARGURA - jogador.largura, jogador.x)
    );

    jogador.y += jogador.velocidadeY;
    jogador.velocidadeY += 0.55;

    if (jogador.y >= CHAO) {
        jogador.y = CHAO;
        jogador.velocidadeY = 0;
        jogador.pulando = false;
    }

    // Coletar os corações da primeira fase.
    coracoes.forEach(coracao => {
        if (coracao.coletado) return;

        const item = {
            x: coracao.x - 2,
            y: coracao.y,
            largura: 22,
            altura: 20
        };

        if (colidiu(jogador, item)) {
            coracao.coletado = true;
            pontos++;
            atualizarInformacoes();
            mostrarMensagem("Um coracao conquistado! ♥");
        }
    });

    // Coletar as estrelas com mensagens da segunda fase.
    lembrancas.forEach(lembranca => {
        if (lembranca.coletado) return;

        const item = {
            x: lembranca.x - 2,
            y: lembranca.y,
            largura: 22,
            altura: 22
        };

        if (colidiu(jogador, item)) {
            lembranca.coletado = true;
            pontos++;
            atualizarInformacoes();
            mostrarMensagem(lembranca.mensagem);
        }
    });

    obstaculos.forEach(obstaculo => {
        if (colidiu(jogador, obstaculo)) {
            perderVida();
        }
    });

    if (estado !== "jogando") return;

    if (jogador.x >= 770) {
        if (fase === 1 && pontos === coracoes.length) {
            estado = "transicao";
        } else if (fase === 2 && pontos === lembrancas.length) {
            estado = "final";
        }
    }
}

function desenharCenario() {
    ctx.fillStyle = fase === 1 ? "#222342" : "#302044";
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    // Estrelas no céu.
    ctx.fillStyle = "#ffc0d8";

    [
        [70, 45], [180, 90], [320, 35],
        [470, 75], [650, 40], [730, 115],
        [390, 105], [550, 125], [250, 65]
    ].forEach(([x, y]) => {
        ctx.fillRect(x, y, 4, 4);
    });

    // Lua pixelada.
    ctx.fillStyle = "#fff2b2";
    ctx.fillRect(700, 40, 20, 20);

    ctx.fillStyle = fase === 1 ? "#222342" : "#302044";
    ctx.fillRect(708, 34, 18, 18);

    // Chão.
    ctx.fillStyle = fase === 1 ? "#77518e" : "#805080";
    ctx.fillRect(0, 320, LARGURA, 40);

    ctx.fillStyle = "#ff78ad";
    ctx.fillRect(0, 320, LARGURA, 5);

    ctx.fillStyle = "#a88bff";
    ctx.fillRect(100, 338, 14, 4);
    ctx.fillRect(410, 330, 10, 4);
    ctx.fillRect(710, 342, 16, 4);

    // Placa de saída.
    ctx.fillStyle = "#ff78ad";
    ctx.fillRect(760, 260, 5, 60);
    ctx.fillStyle = "#492944";
    ctx.fillRect(765, 260, 30, 20);
    ctx.fillStyle = "#fff2f7";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("FIM", 780, 273);
}

function desenharCoracao(x, y) {
    ctx.fillStyle = "#ff4f91";
    ctx.fillRect(x + 2, y, 6, 6);
    ctx.fillRect(x + 12, y, 6, 6);
    ctx.fillRect(x - 2, y + 5, 22, 6);
    ctx.fillRect(x + 2, y + 10, 14, 5);
    ctx.fillRect(x + 6, y + 15, 6, 4);

    ctx.fillStyle = "#ffc0d8";
    ctx.fillRect(x + 3, y + 2, 3, 3);
}

function desenharEstrela(x, y) {
    ctx.fillStyle = "#ffe58a";
    ctx.fillRect(x + 7, y, 6, 20);
    ctx.fillRect(x, y + 7, 20, 6);
    ctx.fillRect(x + 3, y + 3, 14, 14);

    ctx.fillStyle = "#fff7d0";
    ctx.fillRect(x + 7, y + 5, 4, 5);
}

function desenharObstaculo(obstaculo) {
    const { x, y, largura, altura } = obstaculo;

    ctx.fillStyle = "#492944";
    ctx.fillRect(x, y, largura, altura);

    ctx.fillStyle = "#ff78ad";
    ctx.fillRect(x, y, largura, 4);
    ctx.fillRect(x, y, 4, altura);
    ctx.fillRect(x + largura - 4, y, 4, altura);

    ctx.fillStyle = "#ffc0d8";

    for (let i = 0; i < largura - 5; i += 10) {
        ctx.fillRect(x + i + 4, y + 8, 4, 5);
    }
}

function desenharJogador() {
    const x = Math.round(jogador.x);
    const y = Math.round(jogador.y);

    if (
        Date.now() < invulneravelAte &&
        Math.floor(Date.now() / 100) % 2 === 0
    ) {
        return;
    }

    // Cabelo preto e liso.
    ctx.fillStyle = "#17131a";
    ctx.fillRect(x + 2, y, 20, 6);
    ctx.fillRect(x, y + 3, 5, 9);
    ctx.fillRect(x + 19, y + 3, 4, 7);

    // Rosto.
    ctx.fillStyle = "#75442f";
    ctx.fillRect(x + 2, y + 5, 20, 17);
    ctx.fillRect(x, y + 11, 3, 5);
    ctx.fillRect(x + 21, y + 11, 3, 5);

    // Óculos quadrados.
    ctx.fillStyle = "#111015";
    ctx.fillRect(x + 3, y + 9, 8, 7);
    ctx.fillRect(x + 13, y + 9, 8, 7);
    ctx.fillRect(x + 10, y + 11, 4, 2);

    ctx.fillStyle = "#dce8ee";
    ctx.fillRect(x + 5, y + 11, 4, 3);
    ctx.fillRect(x + 15, y + 11, 4, 3);

    ctx.fillStyle = "#17131a";
    ctx.fillRect(x + 7, y + 12, 2, 2);
    ctx.fillRect(x + 16, y + 12, 2, 2);

    // Pescoço e camiseta branca.
    ctx.fillStyle = "#75442f";
    ctx.fillRect(x + 9, y + 21, 6, 4);

    ctx.fillStyle = "#f6f2f0";
    ctx.fillRect(x + 3, y + 24, 18, 13);

    ctx.fillStyle = "#ff78ad";
    ctx.fillRect(x + 10, y + 28, 4, 4);

    // Braços.
    ctx.fillStyle = "#75442f";
    ctx.fillRect(x, y + 25, 4, 10);
    ctx.fillRect(x + 20, y + 25, 4, 10);

    // Calça preta e tênis.
    ctx.fillStyle = "#17131a";
    ctx.fillRect(x + 4, y + 37, 7, 6);
    ctx.fillRect(x + 14, y + 37, 7, 6);

    ctx.fillStyle = "#f6f2f0";
    ctx.fillRect(x + 3, y + 43, 9, 2);
    ctx.fillRect(x + 13, y + 43, 9, 2);
}

function desenharPainel(titulo, linhas) {
    ctx.fillStyle = "rgba(23, 17, 31, 0.94)";
    ctx.fillRect(70, 65, 660, 230);

    ctx.strokeStyle = "#ff78ad";
    ctx.lineWidth = 3;
    ctx.strokeRect(70, 65, 660, 230);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ff78ad";
    ctx.font = "bold 24px monospace";
    ctx.fillText(titulo, 400, 105);

    ctx.fillStyle = "#fff2f7";
    ctx.font = "16px monospace";

    linhas.forEach((linha, indice) => {
        ctx.fillText(linha, 400, 150 + indice * 30);
    });
}

function desenhar() {
    desenharCenario();

    coracoes.forEach(coracao => {
        if (!coracao.coletado) {
            desenharCoracao(coracao.x, coracao.y);
        }
    });

    lembrancas.forEach(lembranca => {
        if (!lembranca.coletado) {
            desenharEstrela(lembranca.x, lembranca.y);
        }
    });

    obstaculos.forEach(desenharObstaculo);
    desenharJogador();

    // Identificação da fase.
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff2f7";
    ctx.font = "14px monospace";
    ctx.fillText(
        fase === 1 ? "FASE 1: O COMECO" : "FASE 2: NOSSAS LEMBRANCAS",
        15,
        25
    );

    // Mensagens temporárias ao pegar itens.
    if (Date.now() < mensagemAte && estado === "jogando") {
        ctx.fillStyle = "rgba(23, 17, 31, 0.90)";
        ctx.fillRect(70, 45, 660, 38);

        ctx.fillStyle = "#ffc0d8";
        ctx.font = "16px monospace";
        ctx.textAlign = "center";
        ctx.fillText(mensagemAtual, 400, 69);
    }

    if (estado === "transicao") {
        desenharPainel("FASE 1 CONCLUIDA! ♥", [
            "Boa, mo! Voce passou no teste do amor.",
            "Mas ainda existem lembrancas para desbloquear...",
            "Prepare-se para a proxima fase!",
            "Pressione ENTER ou ESPACO para continuar"
        ]);
    }

    if (estado === "final") {
        desenharPainel("FELIZ 4 MESES, MO! ♥", [
            "Missao concluida com sucesso!",
            "Quatro meses de nos e muitas fases pela frente.",
            "Voce e meu player favorito!",
            "Te escolheria de novo, em todas as fases.",
            "ENTER ou ESPACO para jogar novamente"
        ]);
    }

    if (estado === "derrota") {
        desenharPainel("GAME OVER! KKK", [
            "Ate o amor tem obstaculos, mo!",
            "Respira, tenta de novo e nao desiste.",
            "Pressione ENTER ou ESPACO para recomecar"
        ]);
    }
}

function quadro() {
    atualizar();
    desenhar();
    requestAnimationFrame(quadro);
}

prepararFase1();
quadro();
