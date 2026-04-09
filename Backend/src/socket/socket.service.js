const { getIo } = require('./socketHandler');

const emitToDoctor = ({ doctorId = '', event = '', data = null }) => {
  if (!doctorId || !event || !data) return;
  // debugger;

  getIo().of('/kiosk').to(`doctor:${doctorId}`).emit(event, data);
};

const emitToKiosk = ({ kioskId = '', event = '', data = null }) => {
  if (!kioskId || !event || !data) return;

  getIo().of('/kiosk').to(`kiosk:${kioskId}`).emit(event, data);
};

module.exports = {
  emitToDoctor,
  emitToKiosk,
};
