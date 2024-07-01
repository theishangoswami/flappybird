import React, { useRef, useEffect, useState } from 'react';

interface Pipe {
  x: number;
  width: number;
  topHeight: number;
  bottomHeight: number;
  scored?: boolean;
}

const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let birdY = canvasSize.height / 2;
    let birdVelocity = 0;
    let pipes: Pipe[] = [];
    let frameCount = 0;

    // Adjust game parameters based on screen size
    const scaleFactor = Math.min(canvasSize.width, canvasSize.height) / 600;
    const birdSize = 40 * scaleFactor;
    const pipeWidth = 60 * scaleFactor;
    const pipeGap = 200 * scaleFactor;
    const groundHeight = 20 * scaleFactor;

    const bird = {
      x: canvasSize.width / 4,
      width: birdSize,
      height: birdSize
    };

    const drawBird = () => {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(bird.x, birdY, bird.width / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(bird.x + bird.width / 4, birdY - bird.height / 6, bird.width / 10, 0, 2 * Math.PI);
      ctx.fill();
    };

    const drawPipe = (pipe: Pipe) => {
      ctx.fillStyle = '#228B22';
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      ctx.fillRect(pipe.x, canvasSize.height - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
    };

    const drawGround = () => {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, canvasSize.height - groundHeight, canvasSize.width, groundHeight);
    };

    const updatePipes = () => {
      if (frameCount % 150 === 0) {
        const minHeight = 50 * scaleFactor;
        const maxHeight = canvasSize.height - pipeGap - minHeight - groundHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        pipes.push({
          x: canvasSize.width,
          width: pipeWidth,
          topHeight,
          bottomHeight: canvasSize.height - topHeight - pipeGap - groundHeight
        });
      }

      pipes.forEach(pipe => {
        pipe.x -= 2 * scaleFactor;
      });

      pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
    };

    const checkCollision = () => {
      const hitGround = birdY + bird.height / 2 > canvasSize.height - groundHeight;
      const hitPipe = pipes.some(pipe => 
        bird.x + bird.width / 2 > pipe.x &&
        bird.x - bird.width / 2 < pipe.x + pipe.width &&
        (birdY - bird.height / 2 < pipe.topHeight || birdY + bird.height / 2 > canvasSize.height - pipe.bottomHeight)
      );

      if (hitGround || hitPipe) {
        setGameOver(true);
      }
    };

    const updateScore = () => {
      pipes.forEach(pipe => {
        if (pipe.x + pipe.width < bird.x && !pipe.scored) {
          setScore(prevScore => prevScore + 1);
          pipe.scored = true;
        }
      });
    };

    const gameLoop = () => {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      birdVelocity += 0.4 * scaleFactor;
      birdY += birdVelocity;

      updatePipes();
      pipes.forEach(drawPipe);
      drawBird();
      drawGround();
      checkCollision();
      updateScore();

      frameCount++;

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const handleClick = () => {
      if (gameOver) {
        setGameOver(false);
        setScore(0);
        birdY = canvasSize.height / 2;
        birdVelocity = 0;
        pipes = [];
        frameCount = 0;
        gameLoop();
      } else {
        birdVelocity = -7 * scaleFactor;
      }
    };

    canvas.addEventListener('click', handleClick);
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gameOver, canvasSize]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute top-0 left-0"
      />
      <div className="absolute top-4 left-4 text-white text-3xl font-bold shadow-text">
        Score: {score}
      </div>
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center bg-gray-800 p-6 rounded-lg shadow-xl">
            <p className="text-3xl font-bold mb-2">Game Over</p>
            <p className="text-2xl mb-4">Score: {score}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setGameOver(false)}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlappyBird;