const menu = document.getElementById('menu');
const teamSelection = document.getElementById('teamSelection');
const trainerName = document.getElementById('trainerName');
const teamScreen = document.getElementById('teamScreen');
const tacticsMenu = document.getElementById('tacticsMenu');
const matchScreen = document.getElementById('matchScreen');

let intervaloJogo = null;
let tempo = 0;
let golsTime1 = 0;
let golsAdversario = 0;
let taticas = 'equilibrada';
let jogoEmAndamento = false;

let selectedTeam = '';
let trainer = '';
let elenco = {};

const elencoFlamengo = {
    titulares: ['Rossi', 'Varela', 'Fabrício Bruno', 'Léo Pereira', 'Ayrton Lucas', 'Pulgar', 'Gerson', 'De la Cruz', 'Arrascaeta', 'Bruno Henrique', 'Pedro'],
    reservas: ['Matheus Cunha', 'Wesley', 'David Luiz', 'Viña', 'Allan', 'Victor Hugo', 'Luiz Araújo', 'Gabigol', 'Everton Cebolinha']
};

const elencoPalmeiras = {
    titulares: ['Weverton', 'Mayke', 'Gustavo Gómez', 'Murilo', 'Piquerez', 'Zé Rafael', 'Richard Ríos', 'Raphael Veiga', 'Dudu', 'Breno Lopes', 'Endrick'],
    reservas: ['Marcelo Lomba', 'Luan', 'Garcia', 'Fabinho', 'Jailson', 'Luis Guilherme', 'Rony', 'López', 'Jhon Jhon']
};

// Navegação
const startGameBtn = document.getElementById('startGame');
startGameBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    teamSelection.style.display = 'block';
});

const teamButtons = document.querySelectorAll('.team');
teamButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedTeam = btn.textContent.toLowerCase();
        elenco = selectedTeam === 'flamengo' ? elencoFlamengo : elencoPalmeiras;
        teamSelection.style.display = 'none';
        trainerName.style.display = 'block';
    });
});

document.getElementById('backToMenu').addEventListener('click', () => {
    teamSelection.style.display = 'none';
    menu.style.display = 'block';
});

document.getElementById('backToTeams').addEventListener('click', () => {
    trainerName.style.display = 'none';
    teamSelection.style.display = 'block';
});

document.getElementById('backToName').addEventListener('click', () => {
    teamScreen.style.display = 'none';
    trainerName.style.display = 'block';
});

const confirmNameBtn = document.getElementById('confirmName');
confirmNameBtn.addEventListener('click', () => {
    trainer = document.getElementById('nameInput').value;
    if (trainer.trim() === '') {
        alert('Por favor, digite seu nome!');
        return;
    }
    trainerName.style.display = 'none';
    teamScreen.style.display = 'block';
    showPlayers();
});

function showPlayers() {
    const elencoDiv = document.getElementById('playersList');
    elencoDiv.innerHTML = '';

    const tituloTitulares = document.createElement('h3');
    tituloTitulares.textContent = 'Titulares';
    elencoDiv.appendChild(tituloTitulares);

    const titularesList = document.createElement('ul');
    elenco.titulares.forEach((jogador, index) => {
        const li = document.createElement('li');
        li.textContent = jogador + ' ';
        const btnTrocar = document.createElement('button');
        btnTrocar.textContent = 'Trocar';
        btnTrocar.addEventListener('click', () => trocarJogador(index));
        li.appendChild(btnTrocar);
        titularesList.appendChild(li);
    });
    elencoDiv.appendChild(titularesList);

    const tituloReservas = document.createElement('h3');
    tituloReservas.textContent = 'Reservas';
    elencoDiv.appendChild(tituloReservas);

    const reservasList = document.createElement('ul');
    elenco.reservas.forEach(jogador => {
        const li = document.createElement('li');
        li.textContent = jogador;
        reservasList.appendChild(li);
    });
    elencoDiv.appendChild(reservasList);

    const btnTatica = document.createElement('button');
    btnTatica.textContent = 'Jogar';
    btnTatica.addEventListener('click', () => {
        teamScreen.style.display = 'none';
        tacticsMenu.style.display = 'block';
        carregarTaticas();
    });
    elencoDiv.appendChild(btnTatica);
}

function trocarJogador(indexTitular) {
    const reservaIndex = 0; // Exemplo fixo
    const titularSai = elenco.titulares[indexTitular];
    const reservaEntra = elenco.reservas[reservaIndex];

    elenco.titulares[indexTitular] = reservaEntra;
    elenco.reservas[reservaIndex] = titularSai;

    showPlayers();
}

function carregarTaticas() {
    const selectTatica = document.getElementById('tacticSelect');
    selectTatica.value = taticas;

    const selectTitular = document.getElementById('selectTitular');
    const selectReserva = document.getElementById('selectReserva');

    selectTitular.innerHTML = '';
    elenco.titulares.forEach((j, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = j;
        selectTitular.appendChild(option);
    });

    selectReserva.innerHTML = '';
    elenco.reservas.forEach((j, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = j;
        selectReserva.appendChild(option);
    });
}

document.getElementById('swapPlayers').addEventListener('click', () => {
    const indexTitular = parseInt(document.getElementById('selectTitular').value);
    const indexReserva = parseInt(document.getElementById('selectReserva').value);
    if (isNaN(indexTitular) || isNaN(indexReserva)) return;

    const titularSai = elenco.titulares[indexTitular];
    const reservaEntra = elenco.reservas[indexReserva];

    elenco.titulares[indexTitular] = reservaEntra;
    elenco.reservas[indexReserva] = titularSai;

    const mensagem = `Substituição manual: Saiu ${titularSai}, Entrou ${reservaEntra}`;
    alert(mensagem);
    adicionarDestaque(mensagem);
    carregarTaticas();
});

document.getElementById('confirmTactic').addEventListener('click', () => {
    taticas = document.getElementById('tacticSelect').value;
    tacticsMenu.style.display = 'none';
    matchScreen.style.display = 'block';

    if (!jogoEmAndamento) {
        jogarPartida();
    }
});

document.getElementById('botaoTaticaDuranteJogo').addEventListener('click', () => {
    matchScreen.style.display = 'none';
    tacticsMenu.style.display = 'block';
    carregarTaticas();
});

function jogarPartida() {
    const matchInfo = document.getElementById('matchInfo');
    const timerDisplay = document.getElementById('timer');
    const scoreboard = document.getElementById('scoreboard');

    const adversarios = ['Corinthians', 'São Paulo', 'Grêmio', 'Bahia', 'Vasco'];
    const jogadoresAdversario = ['Carlos', 'Felipe', 'André', 'Lucas', 'João', 'Paulo', 'Rafael', 'Bruno', 'Diego', 'Matheus', 'Thiago'];

    let time1 = selectedTeam.charAt(0).toUpperCase() + selectedTeam.slice(1);

    if (!jogoEmAndamento) {
        const adversario = adversarios[Math.floor(Math.random() * adversarios.length)];
        matchInfo.dataset.adversario = adversario;
        matchInfo.textContent = `${time1} x ${adversario}`;

        tempo = 0;
        golsTime1 = 0;
        golsAdversario = 0;

        document.getElementById("highlightList").innerHTML = "";
        document.getElementById("highlightBox").style.display = "none";

        jogoEmAndamento = true;
    } else {
        const adversario = matchInfo.dataset.adversario;
        matchInfo.textContent = `${time1} x ${adversario}`;
    }

    matchScreen.style.display = 'block';

    clearInterval(intervaloJogo);
    intervaloJogo = setInterval(() => {
        tempo++;
        timerDisplay.textContent = `Tempo: ${tempo}'`;

        let chance = taticas === 'ofensiva' ? 0.08 : taticas === 'defensiva' ? 0.03 : 0.05;

        if (Math.random() < chance) {
            golsTime1++;
            simularGol();
        }

        if (Math.random() < 0.05) {
            golsAdversario++;
            const autor = jogadoresAdversario[Math.floor(Math.random() * jogadoresAdversario.length)];
            adicionarDestaque(`Gol do adversário! ${autor}`);
        }

        scoreboard.textContent = `${golsTime1} x ${golsAdversario}`;

        // REMOVIDO: substituição automática aos 30 minutos
        // if (tempo === 30) substituirJogador();

        if (tempo >= 90) {
            clearInterval(intervaloJogo);
            jogoEmAndamento = false;
            setTimeout(() => {
                alert(`Fim de jogo!\nPlacar final: ${time1} ${golsTime1} x ${golsAdversario} ${matchInfo.dataset.adversario}`);
                matchScreen.style.display = 'none';
                teamScreen.style.display = 'block';
            }, 500);
        }
    }, 500);
}

function simularGol() {
    const jogadorGol = elenco.titulares[Math.floor(Math.random() * elenco.titulares.length)];
    let assistente;
    do {
        assistente = elenco.titulares[Math.floor(Math.random() * elenco.titulares.length)];
    } while (assistente === jogadorGol);

    adicionarDestaque(`Gol de ${jogadorGol} (Assistência de ${assistente})`);
}

function adicionarDestaque(texto) {
    const highlightBox = document.getElementById("highlightBox");
    const highlightList = document.getElementById("highlightList");

    const item = document.createElement("li");
    item.textContent = texto;

    highlightList.appendChild(item);
    highlightBox.style.display = "block";
}
