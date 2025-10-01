const { broadcastStudent } = require('../sse');

function broadcastSeatDelta(delta) {
  // delta: { seatId, status }
  broadcastStudent({ type: 'seat-delta', delta });
}

module.exports = { broadcastSeatDelta };


