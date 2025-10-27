const { createCanvas } = require('canvas');

function generateCardImage(card, drawnNumbers = []) {
  const cellSize = 80;
  const padding = 10;
  const headerHeight = 60;
  const canvasWidth = cellSize * 5 + padding * 2;
  const canvasHeight = cellSize * 5 + padding * 2 + headerHeight;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2C2F33';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#7289DA';
  ctx.fillRect(0, 0, canvasWidth, headerHeight);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B I N G O', canvasWidth / 2, headerHeight / 2);

  const letters = ['B', 'I', 'N', 'G', 'O'];
  
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) {
      const x = padding + col * cellSize;
      const y = padding + headerHeight + row * cellSize;
      const cell = card.grid[row][col];
      
      const isMarked = cell === 'FREE' || (typeof cell === 'number' && drawnNumbers.includes(cell));
      
      ctx.fillStyle = isMarked ? '#43B581' : '#40444B';
      ctx.fillRect(x, y, cellSize - 2, cellSize - 2);

      ctx.strokeStyle = '#2C2F33';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = cell === 'FREE' ? 'bold 18px Arial' : 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cell.toString(), x + cellSize / 2, y + cellSize / 2);
    }
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Cartela #${card.number}`, canvasWidth - padding, canvasHeight - 5);

  return canvas.toBuffer();
}

module.exports = {
  generateCardImage
};
