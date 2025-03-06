"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  winningSquare: boolean;
}

interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (squares: (string | null)[]) => void;
  winningLine: number[] | null;
}

function Square({ value, onSquareClick, winningSquare }: SquareProps) {
  return (
    <Button 
      className={`
        square w-20 h-20 md:w-24 md:h-24 text-3xl md:text-4xl font-bold m-1 
        transition-all duration-200 hover:bg-opacity-90 hover:scale-105
        ${value === 'X' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
        ${value === 'O' ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''} 
        ${!value ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
        ${winningSquare ? 'animate-pulse ring-4 ring-yellow-400 dark:ring-yellow-500' : ''}
      `} 
      onClick={onSquareClick}
      disabled={value !== null}
    >
      {value}
    </Button>
  );
}

function Board({ xIsNext, squares, onPlay, winningLine }: BoardProps) {
  function handleClick(i: number) {
    if (i < 0 || i >= squares.length) {
      console.log("Invalid index:", i);
      return;
    }
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (squares.every(square => square !== null)) {
    status = "Game ended in a draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const isWinningSquare = (i: number): boolean => {
    return winningLine?.includes(i) ?? false;
  };
  

  return (
    <Card className="board max-w-md w-full shadow-lg border-2 dark:border-slate-700">
      <CardHeader className="bg-slate-100 dark:bg-slate-800 rounded-t-lg">
        <CardTitle className="status text-2xl font-bold text-center">
          {status}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-6 bg-white dark:bg-slate-900">
        <div className="board-grid">
          <div className="board-row flex">
            {squares.slice(0, 3).map((square, index) => (
              <Square 
                key={index} 
                value={square} 
                onSquareClick={() => handleClick(index)}
                winningSquare={isWinningSquare(index)}
              />
            ))}
          </div>
          <div className="board-row flex">
            {squares.slice(3, 6).map((square, index) => (
              <Square 
                key={index + 3} 
                value={square} 
                onSquareClick={() => handleClick(index + 3)}
                winningSquare={isWinningSquare(index + 3)}
              />
            ))}
          </div>
          <div className="board-row flex">
            {squares.slice(6, 9).map((square, index) => (
              <Square 
                key={index + 6} 
                value={square} 
                onSquareClick={() => handleClick(index + 6)}
                winningSquare={isWinningSquare(index + 6)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Game() {
  const [history, setHistory] = useState<Array<Array<string | null>>>([Array(9).fill(null) as Array<string | null>]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const currentSquares: Array<string | null> = history[currentMove] ?? Array(9).fill(null) as Array<string | null>;

  useEffect(() => {
    const result = calculateWinnerWithLine(currentSquares);
    setWinningLine(result ? result.line : null);
  }, [currentSquares]);

  function handlePlay(nextSquares: Array<string | null>) {
    const nextHistory: Array<Array<string | null>> = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((_, move) => {
    const isCurrentMove = move === currentMove;
    const description = move > 0 ? `Move #${move}` : 'Game start';
    
    return (
      <li key={move} className="mt-2">
        <Button 
          variant={isCurrentMove ? "default" : "outline"} 
          onClick={() => jumpTo(move)} 
          className={`w-full transition-all ${isCurrentMove ? 'font-bold' : ''}`}
        >
          {description}
        </Button>
      </li>
    );
  });

  return (
    <div className="min-h-screen bg-indigo-100 dark:bg-indigo-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-800 dark:text-indigo-200">Tic-Tac-Toe</h1>
      
      <div className="game flex flex-col md:flex-row justify-center items-start gap-8 w-full max-w-4xl">
        <div className="game-board flex-1 flex justify-center">
          <Board 
            xIsNext={xIsNext} 
            squares={currentSquares} 
            onPlay={handlePlay}
            winningLine={winningLine}
          />
        </div>
        
        <Card className="game-info mt-6 md:mt-0 w-full md:w-64 shadow-lg border-2 dark:border-slate-700">
          <CardHeader className="bg-slate-100 dark:bg-slate-800 rounded-t-lg">
            <CardTitle className="text-xl font-bold">Game History</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white dark:bg-slate-900">
            <ol className="space-y-2">{moves}</ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function calculateWinner(squares: Array<string | null>): string | null {
  const result = calculateWinnerWithLine(squares);
  return result ? result.winner : null;
}

function calculateWinnerWithLine(squares: Array<string | null>): { winner: string, line: number[] } | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ] as const;

  for (const line of lines) {
    const [a, b, c] = line;
    
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: [a, b, c]
      };
    }
  }

  return null;
}