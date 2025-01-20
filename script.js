// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
  });
}

// Online/Offline Status Management
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const offlineMessage = document.getElementById('offline-message');
  if (navigator.onLine) {
    offlineMessage.style.display = 'none';
  } else {
    offlineMessage.style.display = 'block';
  }
}

// Installation Management
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installBtn.style.display = 'none';
    }
    deferredPrompt = null;
  }
});

// Share Functionality
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Tic Tac Toe Game',
        text: 'Check out this awesome Tic Tac Toe game!',
        url: window.location.href
      });
    } catch (err) {
      console.log('Share failed:', err);
    }
  }
});

// Game State Management
function saveGameState() {
  const gameState = {
    board: liveBoard,
    playerIcon: playerIcon,
    cpuIcon: cpuIcon
  };
  localStorage.setItem('tictactoe_state', JSON.stringify(gameState));
}

function loadGameState() {
  const savedState = localStorage.getItem('tictactoe_state');
  if (savedState) {
    const gameState = JSON.parse(savedState);
    liveBoard = gameState.board;
    playerIcon = gameState.playerIcon;
    cpuIcon = gameState.cpuIcon;
    renderBoard(liveBoard);
  }
}

// Game Variables
var cpuIcon = 'X';
var playerIcon = 'O';
var AIMove;
var liveBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// UI Functions
function renderBoard(board) {
  board.forEach(function(el, i) {
    var squareId = '#' + i.toString();
    if (el === -1) {
      $(squareId).text(playerIcon);
    } else if (el === 1) {
      $(squareId).text(cpuIcon);
    } else {
      $(squareId).text('');
    }
  });

  $('.square:contains(X)').addClass('x-marker');
  $('.square:contains(O)').addClass('o-marker');

  // Save state after rendering
  saveGameState();
}

function animateWinLine() {
  var idxOfArray = winningLines.map(function(winLines) {
    return winLines.map(function(winLine) {
      return liveBoard[winLine];
    }).reduce(function(prev, cur) {
      return prev + cur;
    });
  });
  var squaresToAnimate = winningLines[idxOfArray.indexOf(Math.abs(3))];

  squaresToAnimate.forEach(function(el) {
    $('#' + el).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
  });
}

// Modal Functions
function chooseMarker() {
  $('.modal-container').css('display', 'block');
  $('.choose-modal').addClass('animated bounceInUp');

  $('.button-area span').click(function() {
    var marker = $(this).text();
    playerIcon = (marker === 'X' ? 'X' : 'O');
    cpuIcon = (marker === 'X' ? 'O' : 'X');

    $('.choose-modal').addClass('animated bounceOutDown');
    setTimeout(function() {
      $('.modal-container').css('display', 'none');
      $('.choose-modal').css('display','none');
      startNewGame();
    }, 700);

    $('.button-area span').off();
  });
}

function endGameMessage(){
  var result = checkVictory(liveBoard);
  $('.end-game-modal h3').text(result === 'win' ? 'You Lost' : "It's a draw");

  $('.modal-container').css('display', 'block');
  $('.end-game-modal').css('display','block')
      .removeClass('animated bounceOutDown')
      .addClass('animated bounceInUp');

  $('.button-area span').click(function() {
    $('.end-game-modal')
        .removeClass('animated bounceInUp')
        .addClass('animated bounceOutDown');

    setTimeout(function() {
      $('.modal-container').css('display', 'none');
      startNewGame();
    }, 700);

    $('.button-area span').off();
  });
}

// Gameplay Functions
function startNewGame() {
  liveBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  $('.square').text("").removeClass('o-marker x-marker');
  renderBoard(liveBoard);
  playerTakeTurn();
}

function playerTakeTurn() {
  $('.square:empty').hover(function() {
    $(this).text(playerIcon).css('cursor', 'pointer');
  }, function() {
    $(this).text('');
  });

  $('.square:empty').click(function() {
    $(this).css('cursor', 'default');
    liveBoard[parseInt($(this).attr('id'))] = -1;
    renderBoard(liveBoard);

    if (checkVictory(liveBoard)) {
      setTimeout(endGameMessage, (checkVictory(liveBoard) === 'win') ? 700 : 100);
    } else {
      setTimeout(aiTakeTurn, 100);
    }
    $('.square').off();
  });
}

function aiTakeTurn() {
  miniMax(liveBoard, 'aiPlayer');
  liveBoard[AIMove] = 1;
  renderBoard(liveBoard);
  if (checkVictory(liveBoard)) {
    animateWinLine();
    setTimeout(endGameMessage, checkVictory(liveBoard) === 'win' ? 700 : 100);
  } else {
    playerTakeTurn();
  }
}

// Utility Functions
function checkVictory(board) {
  var squaresInPlay = board.reduce(function(prev, cur) {
    return Math.abs(prev) + Math.abs(cur);
  });

  var outcome = winningLines.map(function(winLines) {
    return winLines.map(function(winLine) {
      return board[winLine];
    }).reduce(function(prev, cur) {
      return prev + cur;
    });
  }).filter(function(winLineTotal) {
    return Math.abs(winLineTotal) === 3;
  });

  if (outcome[0] === 3) {
    return 'win';
  } else if (outcome[0] === -3) {
    return 'lose';
  } else if (squaresInPlay === 9) {
    return 'draw';
  } else {
    return false;
  }
}

function availableMoves(board) {
  return board.map(function(el, i) {
    if (!el) {
      return i;
    }
  }).filter(function(e) {
    return (typeof e !== "undefined");
  });
}

// AI Function
function miniMax(state, player) {
  var rv = checkVictory(state);
  if (rv === 'win') {
    return 10;
  }
  if (rv === 'lose') {
    return -10;
  }
  if (rv === 'draw') {
    return 0;
  }

  var moves = [];
  var scores = [];
  availableMoves(state).forEach(function(square) {
    state[square] = (player === 'aiPlayer') ? 1 : -1;
    scores.push(miniMax(state, (player === 'aiPlayer') ? 'opponent' : 'aiPlayer'));
    moves.push(square);
    state[square] = 0;
  });
  
  if (player === 'aiPlayer') {
    AIMove = moves[scores.indexOf(Math.max.apply(Math, scores))];
    return Math.max.apply(Math, scores);
  } else {
    AIMove = moves[scores.indexOf(Math.min.apply(Math, scores))];
    return Math.min.apply(Math, scores);
  }
}

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
  loadGameState();
  if (liveBoard.every(cell => cell === 0)) {
    chooseMarker();
  }
});