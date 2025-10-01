const adminClients = new Set();
const studentClients = new Set();

function setupSseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders && res.flushHeaders();
  res.write(': connected\n\n');
}

function addAdminClient(res) {
  setupSseHeaders(res);
  adminClients.add(res);
  return () => {
    adminClients.delete(res);
    try { res.end(); } catch (_) {}
  };
}

function addStudentClient(res) {
  setupSseHeaders(res);
  studentClients.add(res);
  return () => {
    studentClients.delete(res);
    try { res.end(); } catch (_) {}
  };
}

function broadcastAdmin(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of adminClients) {
    try { client.write(payload); } catch (_) {
      adminClients.delete(client);
      try { client.end(); } catch (_) {}
    }
  }
}

function broadcastStudent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of studentClients) {
    try { client.write(payload); } catch (_) {
      studentClients.delete(client);
      try { client.end(); } catch (_) {}
    }
  }
}

function heartbeat() {
  for (const client of adminClients) {
    try { client.write(': heartbeat\n\n'); } catch (_) {}
  }
  for (const client of studentClients) {
    try { client.write(': heartbeat\n\n'); } catch (_) {}
  }
}

module.exports = {
  addAdminClient,
  addStudentClient,
  broadcastAdmin,
  broadcastStudent,
  heartbeat
};


