const clients = new Map();

function subscribe(res, channels = []) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const id = Date.now() + Math.random();
  res.write(`event: ping\ndata: "connected"\n\n`);

  channels.forEach((ch) => {
    if (!clients.has(ch)) clients.set(ch, new Map());
    clients.get(ch).set(id, res);
  });

  const keepalive = setInterval(() => {
    try { res.write(`event: ping\ndata: "${Date.now()}"\n\n`); } catch {}
  }, 25000);

  const cleanup = () => {
    clearInterval(keepalive);
    channels.forEach((ch) => {
      const map = clients.get(ch);
      if (map) {
        map.delete(id);
        if (map.size === 0) clients.delete(ch);
      }
    });
    try { res.end(); } catch {}
  };

  reqOnClose(res, cleanup);
}

function reqOnClose(res, cb) {
  res.on('close', cb);
  res.on('finish', cb);
  res.on('error', cb);
}

function broadcast(channel, eventName, data) {
  const map = clients.get(channel);
  if (!map) return;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  for (const [, res] of map) {
    try {
      res.write(`event: ${eventName}\ndata: ${payload}\n\n`);
    } catch {}
  }
}

module.exports = { subscribe, broadcast };
