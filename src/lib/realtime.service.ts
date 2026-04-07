type Client = {
  send: (data: unknown) => void;
};

const clients = new Set<Client>();

export function addClient(client: Client) {
  clients.add(client);
}

export function removeClient(client: Client) {
  clients.delete(client);
}

export function broadcast(data: unknown) {
  clients.forEach((client) => {
    try {
      client.send(data);
    } catch {
      clients.delete(client);
    }
  });
}