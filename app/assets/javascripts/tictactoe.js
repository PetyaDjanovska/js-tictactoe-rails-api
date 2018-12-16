// Code your JavaScript / jQuery solution here

$(function() {
    attachListeners();
})

const WIN_COMBINATIONS = [
    [0,1,2], // Top row
    [3,4,5], // Middle row
    [6,7,8], // Bottom row
    [0,3,6], // left column
    [1,4,7], // middle column
    [2,5,8], // right column
    [0,4,8], // left diagonal
    [2,4,6]  // right diagonal
    ]

var turn = 0;
var game = 0;
var board = [];
var previousClicked = false;

function player () {
    if (turn % 2 === 0) {
        return "X";
    } else {
        return "O";
    }
}

function updateState (position) {
    position.innerHTML = player();
}

function setMessage (string) {
    $('div#message').html(string);
}

function populateBoard () {
    $('td').text((index, sq) => board[index] = sq);
}

function checkWinner() {
    var winner = false;
    populateBoard();

    WIN_COMBINATIONS.forEach (function(combination) {
        if(board[combination[0]] === board[combination[1]] && board[combination[1]] === board[combination[2]] && board[combination[0]] !== '') {
            setMessage(`Player ${board[combination[0]]} Won!`);
            winner = true;
        }
    }) 
     
    return winner;
}

function doTurn (position) {
    updateState(position);
    turn++;
    if (checkWinner()) {
        saveGame();
        clearGame();
        return;
    } 
    if (turn === 9) {
        setMessage("Tie game.");
        saveGame();
        clearGame();
    }
}

function attachListeners () {
    $('td').click(function() {
        if (!checkWinner() && turn != 9 && this.innerHTML === ""){
            doTurn(this);
        }
    });

    $('#clear').click(function() {
        clearGame();
    });

    $('#save').click(function() {
        saveGame();
    })

    $('#previous').click(function() {
        showPrevious();
    })
}

function clearGame() {
    resetBoard();
    turn = 0;
    game = 0;
}

function resetBoard() {
    $('td').empty();
}

function saveGame() {
    populateBoard();
    var gamedata = {state: board}
    if (game){
      $.ajax({type: 'patch', url: `/games/${game}`, data: gamedata})
    } else {
      $.post('/games', gamedata, function(current){
        game = current.data.id
        getLink(current.data);
        console.log('Hit the new game line');
        console.log(typeof game);
        console.log(current);
        console.log(current.data.attributes.state);
        console.log(game);
      })
    }
}

function getLink(game) {
    $('#games').append(`<button id="gameid-${game.id}" onclick="loadGame(${game.id})">${game.id}</button>`);
}

function loadGame(gameid){
    $.get(`/games/${gameid}`, function(current){
        game = current.data.id
        var board = current.data.attributes.state
        turn = board.join('').length
        i = 0
        board.forEach((b) => {$('td')[i].innerHTML = b, i++})
    });
}

function showPrevious() {
    $.get(`/games`, function(games) {
        if(games.data){
            games.data.forEach(getLink);
        }
    });
}

