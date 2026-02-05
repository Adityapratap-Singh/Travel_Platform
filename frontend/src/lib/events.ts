export function connectEventSource(channels: string[]) {
  const params = new URLSearchParams();
  params.append('channels', channels.join(','));
  const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/events/stream?${params.toString()}`;
  const es = new EventSource(url);
  return es;
}
