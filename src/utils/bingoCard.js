function generateBingoCard(cardNumber) {
  const card = {
    number: cardNumber,
    grid: []
  };

  const ranges = [
    { min: 1, max: 15 },
    { min: 16, max: 30 },
    { min: 31, max: 45 },
    { min: 46, max: 60 },
    { min: 61, max: 75 }
  ];

  for (let col = 0; col < 5; col++) {
    const column = [];
    const { min, max } = ranges[col];
    const availableNumbers = [];
    
    for (let i = min; i <= max; i++) {
      availableNumbers.push(i);
    }

    for (let row = 0; row < 5; row++) {
      if (col === 2 && row === 2) {
        column.push('FREE');
      } else {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        column.push(availableNumbers.splice(randomIndex, 1)[0]);
      }
    }

    for (let row = 0; row < 5; row++) {
      if (!card.grid[row]) {
        card.grid[row] = [];
      }
      card.grid[row][col] = column[row];
    }
  }

  return card;
}

function generateBingoCards(quantity) {
  const cards = [];
  for (let i = 1; i <= quantity; i++) {
    cards.push(generateBingoCard(i));
  }
  return cards;
}

function checkWinningCard(card, drawnNumbers) {
  for (let row = 0; row < 5; row++) {
    let allMarked = true;
    for (let col = 0; col < 5; col++) {
      const cell = card.grid[row][col];
      if (cell !== 'FREE' && !drawnNumbers.includes(cell)) {
        allMarked = false;
        break;
      }
    }
    if (allMarked) return true;
  }

  for (let col = 0; col < 5; col++) {
    let allMarked = true;
    for (let row = 0; row < 5; row++) {
      const cell = card.grid[row][col];
      if (cell !== 'FREE' && !drawnNumbers.includes(cell)) {
        allMarked = false;
        break;
      }
    }
    if (allMarked) return true;
  }

  return false;
}

function checkFullCard(card, drawnNumbers) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = card.grid[row][col];
      if (cell !== 'FREE' && !drawnNumbers.includes(cell)) {
        return false;
      }
    }
  }
  return true;
}

function countPotentialWinners(cards, participants, drawnNumbers) {
  let count = 0;
  
  for (const participant of participants) {
    for (const cardNum of participant.cards) {
      const card = cards.find(c => c.number === cardNum);
      if (card) {
        let missingNumbers = 0;
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            const cell = card.grid[row][col];
            if (cell !== 'FREE' && !drawnNumbers.includes(cell)) {
              missingNumbers++;
            }
          }
        }
        
        if (missingNumbers === 0) {
          count++;
        }
      }
    }
  }
  
  return count;
}

module.exports = {
  generateBingoCard,
  generateBingoCards,
  checkWinningCard,
  checkFullCard,
  countPotentialWinners
};
