import { useState, useEffect, useCallback, useRef } from 'react';
import './styles.css';

interface GameState {
  rocketX: number;
  rocketY: number;
  velocityX: number;
  velocityY: number;
  fuel: number;
  thrust: boolean;
  rotatingLeft: boolean;
  rotatingRight: boolean;
  angle: number;
  gameStatus: 'title' | 'playing' | 'landed' | 'crashed';
  score: number;
}

const GRAVITY = 0.015;
const THRUST_POWER = 0.04;
const ROTATION_SPEED = 3;
const FUEL_CONSUMPTION = 0.15;
const MAX_LANDING_VELOCITY = 1.5;
const MAX_LANDING_ANGLE = 15;

const initialState: GameState = {
  rocketX: 50,
  rocketY: 80,
  velocityX: 0.5,
  velocityY: 0,
  fuel: 100,
  thrust: false,
  rotatingLeft: false,
  rotatingRight: false,
  angle: 0,
  gameStatus: 'title',
  score: 0,
};

function Doge({ expression }: { expression: 'happy' | 'scared' | 'wow' }) {
  const faces = {
    happy: '◕‿◕',
    scared: '◕︿◕',
    wow: '◉o◉',
  };
  return (
    <div className="doge-face">
      <div className="doge-ears">
        <span className="ear left">▲</span>
        <span className="ear right">▲</span>
      </div>
      <div className="doge-head">
        <span className="face-text">{faces[expression]}</span>
      </div>
    </div>
  );
}

function Rocket({
  x,
  y,
  angle,
  thrust,
  crashed
}: {
  x: number;
  y: number;
  angle: number;
  thrust: boolean;
  crashed: boolean;
}) {
  const expression = crashed ? 'scared' : thrust ? 'wow' : 'happy';

  return (
    <div
      className={`rocket ${thrust ? 'thrusting' : ''} ${crashed ? 'crashed' : ''}`}
      style={{
        left: `${x}%`,
        bottom: `${y}%`,
        transform: `translateX(-50%) rotate(${angle}deg)`,
      }}
    >
      <div className="rocket-body">
        <div className="rocket-nose"></div>
        <div className="rocket-cabin">
          <Doge expression={expression} />
        </div>
        <div className="rocket-fins">
          <div className="fin left"></div>
          <div className="fin right"></div>
        </div>
        <div className="spacex-label">SpaceX</div>
      </div>
      {thrust && (
        <div className="flame-container">
          <div className="flame flame-1"></div>
          <div className="flame flame-2"></div>
          <div className="flame flame-3"></div>
        </div>
      )}
    </div>
  );
}

function Moon() {
  return (
    <div className="moon">
      <div className="landing-pad">
        <div className="pad-lights">
          <span className="light"></span>
          <span className="light"></span>
          <span className="light"></span>
        </div>
        <div className="pad-surface"></div>
      </div>
    </div>
  );
}

function Stars() {
  const stars = useRef<Array<{ x: number; y: number; size: number; delay: number }>>(
    Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }))
  );

  return (
    <div className="stars">
      {stars.current.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function HUD({ fuel, velocity, altitude, score }: { fuel: number; velocity: number; altitude: number; score: number }) {
  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">FUEL</span>
        <div className="fuel-bar">
          <div
            className="fuel-fill"
            style={{ width: `${fuel}%` }}
          />
        </div>
      </div>
      <div className="hud-item">
        <span className="hud-label">VELOCITY</span>
        <span className={`hud-value ${velocity > MAX_LANDING_VELOCITY ? 'danger' : ''}`}>
          {velocity.toFixed(1)} m/s
        </span>
      </div>
      <div className="hud-item">
        <span className="hud-label">ALTITUDE</span>
        <span className="hud-value">{altitude.toFixed(0)}m</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">SCORE</span>
        <span className="hud-value score">{score}</span>
      </div>
    </div>
  );
}

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-screen">
      <div className="title-content">
        <h1 className="game-title">
          <span className="title-doge">DOGE</span>
          <span className="title-to">TO THE</span>
          <span className="title-moon">MOON</span>
        </h1>
        <div className="title-rocket">
          <Rocket x={50} y={30} angle={-15} thrust={true} crashed={false} />
        </div>
        <p className="instructions">
          Use <kbd>↑</kbd> or <kbd>W</kbd> for thrust<br />
          Use <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> to rotate<br />
          Land gently on the moon pad!
        </p>
        <button className="start-btn" onClick={onStart}>
          LAUNCH MISSION
        </button>
        <div className="meme-text">
          <span>much space</span>
          <span>very rocket</span>
          <span>wow</span>
          <span>so moon</span>
        </div>
      </div>
    </div>
  );
}

function EndScreen({
  status,
  score,
  onRestart
}: {
  status: 'landed' | 'crashed';
  score: number;
  onRestart: () => void;
}) {
  const isLanded = status === 'landed';

  return (
    <div className={`end-screen ${isLanded ? 'success' : 'failure'}`}>
      <div className="end-content">
        {isLanded ? (
          <>
            <h2 className="end-title success">MOON LANDING!</h2>
            <div className="celebration">
              <span className="emoji">🌙</span>
              <span className="emoji">🚀</span>
              <span className="emoji">🐕</span>
            </div>
            <p className="end-message">Much success! Very astronaut! Wow!</p>
            <p className="final-score">SCORE: {score}</p>
          </>
        ) : (
          <>
            <h2 className="end-title failure">CRASH!</h2>
            <div className="explosion">💥</div>
            <p className="end-message">Such crash! Much explosion! Very oops!</p>
          </>
        )}
        <button className="restart-btn" onClick={onRestart}>
          {isLanded ? 'LAUNCH AGAIN' : 'TRY AGAIN'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [game, setGame] = useState<GameState>(initialState);
  const keysPressed = useRef<Set<string>>(new Set());

  const startGame = useCallback(() => {
    setGame({
      ...initialState,
      gameStatus: 'playing',
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.key.toLowerCase());
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (game.gameStatus !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGame((prev) => {
        const keys = keysPressed.current;
        const thrust = (keys.has('arrowup') || keys.has('w') || keys.has(' ')) && prev.fuel > 0;
        const rotatingLeft = keys.has('arrowleft') || keys.has('a');
        const rotatingRight = keys.has('arrowright') || keys.has('d');

        let newAngle = prev.angle;
        if (rotatingLeft) newAngle -= ROTATION_SPEED;
        if (rotatingRight) newAngle += ROTATION_SPEED;
        newAngle = Math.max(-90, Math.min(90, newAngle));

        let newVelocityX = prev.velocityX;
        let newVelocityY = prev.velocityY - GRAVITY;

        if (thrust) {
          const angleRad = (newAngle * Math.PI) / 180;
          newVelocityX -= Math.sin(angleRad) * THRUST_POWER;
          newVelocityY += Math.cos(angleRad) * THRUST_POWER;
        }

        let newX = prev.rocketX + newVelocityX;
        let newY = prev.rocketY + newVelocityY;
        let newFuel = thrust ? prev.fuel - FUEL_CONSUMPTION : prev.fuel;

        // Wrap around horizontally
        if (newX < 0) newX = 100;
        if (newX > 100) newX = 0;

        // Check ceiling
        if (newY > 95) {
          newY = 95;
          newVelocityY = -Math.abs(newVelocityY) * 0.5;
        }

        // Check landing/crash
        const landingPadLeft = 40;
        const landingPadRight = 60;
        const velocity = Math.sqrt(newVelocityX ** 2 + newVelocityY ** 2);

        if (newY <= 12) {
          const onPad = newX >= landingPadLeft && newX <= landingPadRight;
          const softLanding = velocity <= MAX_LANDING_VELOCITY;
          const straightAngle = Math.abs(newAngle) <= MAX_LANDING_ANGLE;

          if (onPad && softLanding && straightAngle) {
            const fuelBonus = Math.floor(prev.fuel * 10);
            const velocityBonus = Math.floor((MAX_LANDING_VELOCITY - velocity) * 100);
            const angleBonus = Math.floor((MAX_LANDING_ANGLE - Math.abs(newAngle)) * 5);
            return {
              ...prev,
              rocketY: 12,
              velocityX: 0,
              velocityY: 0,
              gameStatus: 'landed',
              score: 1000 + fuelBonus + velocityBonus + angleBonus,
            };
          } else {
            return {
              ...prev,
              rocketY: newY,
              gameStatus: 'crashed',
            };
          }
        }

        return {
          ...prev,
          rocketX: newX,
          rocketY: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY,
          fuel: Math.max(0, newFuel),
          thrust,
          rotatingLeft,
          rotatingRight,
          angle: newAngle,
        };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [game.gameStatus]);

  const velocity = Math.sqrt(game.velocityX ** 2 + game.velocityY ** 2);

  return (
    <div className="game-container">
      <div className="scanlines"></div>
      <Stars />

      {game.gameStatus === 'title' && (
        <TitleScreen onStart={startGame} />
      )}

      {game.gameStatus === 'playing' && (
        <>
          <HUD
            fuel={game.fuel}
            velocity={velocity}
            altitude={(game.rocketY - 12) * 10}
            score={game.score}
          />
          <Moon />
          <Rocket
            x={game.rocketX}
            y={game.rocketY}
            angle={game.angle}
            thrust={game.thrust}
            crashed={false}
          />
        </>
      )}

      {(game.gameStatus === 'landed' || game.gameStatus === 'crashed') && (
        <>
          <Moon />
          <Rocket
            x={game.rocketX}
            y={game.rocketY}
            angle={game.angle}
            thrust={false}
            crashed={game.gameStatus === 'crashed'}
          />
          <EndScreen
            status={game.gameStatus}
            score={game.score}
            onRestart={startGame}
          />
        </>
      )}

      <footer className="footer">
        Requested by @cryptob4fiat · Built by @clonkbot
      </footer>
    </div>
  );
}
