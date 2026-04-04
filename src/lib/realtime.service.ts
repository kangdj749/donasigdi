type Client = {
  send: (data: string) => void;
};

const clients = new Set<Client>();

export function addClient(client: Client) {
  clients.add(client);
}

export function removeClient(client: Client) {
  clients.delete(client);
}

export function broadcast(data: unknown) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  clients.forEach((client) => {
    try {
      client.send(payload);
    } catch {
      clients.delete(client);
    }
  });
}