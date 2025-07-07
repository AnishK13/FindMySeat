import React from 'react';

// Layout grid based on the provided image (1 = seat, 0 = empty)
const layout = [
    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,1,0,0,0,1,0,0,0,1,1,1,1,1,1,1],
    [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0]
  ];
  

const SeatMap = ({ seats, onSeatSelect, selectedSeatId }) => {
  // Map seat positions to seat objects
  const seatMap = {};
  seats.forEach(seat => {
    seatMap[`${seat.position.row},${seat.position.col}`] = seat;
  });

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-6">
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-green-400 border border-green-700 inline-block"></span> Available</div>
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-red-400 border border-red-700 inline-block"></span> Booked</div>
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-blue-400 border border-blue-700 inline-block"></span> Selected</div>
      </div>
      <div className="bg-gray-100 p-6 rounded-xl shadow-lg border border-gray-300">
        {layout.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => {
              if (cell === 0) {
                return <div key={colIdx} className="w-8 h-8 m-1"></div>;
              }
              const seat = seatMap[`${rowIdx},${colIdx}`];
              const isSelected = seat && selectedSeatId === seat.seatId;
              return (
                <button
                  key={colIdx}
                  className={`w-8 h-8 m-1 rounded border transition-all
                    ${seat?.status === 'available' ?
                      (isSelected ? 'bg-blue-400 border-blue-700 hover:bg-blue-500' : 'bg-green-400 border-green-700 hover:bg-green-500') :
                      'bg-red-400 border-red-700 cursor-not-allowed'}
                  `}
                  disabled={!seat || seat.status !== 'available'}
                  onClick={() => seat && seat.status === 'available' && onSeatSelect(seat.seatId)}
                  title={seat ? seat.seatId : ''}
                >
                  {seat ? seat.seatId.replace('S', '') : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap; 