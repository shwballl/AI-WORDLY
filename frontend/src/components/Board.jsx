import React, { useState, useEffect } from 'react';

const getColor = (char, index, word) => {
  if (char === word[index]) return 'bg-green-500';
  if (word.includes(char)) return 'bg-yellow-500';
  return 'bg-gray-500';
};

export default function Board() {
  const [wordLength, setWordLength] = useState(0);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const maxAttempts = 6;

  const fetchWord = async () => {
    const res = await fetch('http://127.0.0.1:8000/generate_word', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ length: wordLength }),
    });
    const word = await res.text();
    setTargetWord(word.toLowerCase().slice(1, word.length - 1));
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
  };

  useEffect(() => {
    fetchWord();
  }, []);

  const handleKeyPress = (e) => {
    if (gameStatus !== 'playing') return;

    if (e.key === 'Enter' && currentGuess.length === targetWord.length) {
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setGameStatus('won');
      } else if (newGuesses.length >= maxAttempts) {
        setGameStatus('lost');
      }
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < targetWord.length) {
      setCurrentGuess((prev) => prev + e.key.toLowerCase());
    } else if (e.key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  return (
    <div className="flex flex-col items-center p-6 gap-6 min-h-screen bg-gray-100 text-center">
      

      <div className="text-lg font-semibold">Attempts: {guesses.length} / {maxAttempts}</div>

      <div className="space-y-2">
        {guesses.map((guess, idx) => (
          <div key={idx} className="flex gap-1 animate-fade-in">
            {guess.split('').map((char, i) => (
              <div
                key={i}
                className={`w-10 h-10 flex items-center justify-center text-white text-lg font-bold rounded transition-all duration-300 ${getColor(char, i, targetWord)}`}
              >
                {char}
              </div>
            ))}
          </div>
        ))}

        {gameStatus === 'playing' && targetWord && (
          <div className="flex gap-1 animate-fade-in">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 border rounded flex items-center justify-center text-lg font-bold bg-white"
              >
                {currentGuess[i] || ''}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="mr-2 font-medium">Word Length:</label>
        <input
          type="number"
          value={wordLength}
          min={1}
          max={30}
          onChange={(e) => setWordLength(Number(e.target.value))}
          className="p-2 border rounded"
        />
        <button
          onClick={fetchWord}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Word
        </button>
      </div>

      {gameStatus === 'won' && (
        <div className="text-green-600 text-xl font-bold animate-bounce mt-4">
          🎉 Congratulations! You guessed the word! Generate the new one and try one more!
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="text-red-600 text-xl font-bold mt-4 animate-fade-in">
          💀 Game Over! The word was: <span className="font-mono">{targetWord}</span> Generate the new one and try one more!
        </div>
      )}
    </div>
  );
}