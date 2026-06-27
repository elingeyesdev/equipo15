import { io, Socket } from 'socket.io-client';
import { getActiveSocketUrl } from './failover';

class SocketManager {
  private socket: Socket | null = null;
  private subscribers = 0;
  private connecting = false;

  async getSocket(getToken: () => Promise<string>): Promise<Socket> {
    this.subscribers++;
    if (this.socket) {
      return this.socket;
    }

    if (!this.connecting) {
      this.connecting = true;
      try {
        const token = await getToken();
        if (!this.socket) {
          this.socket = io(getActiveSocketUrl(), {
            reconnection: true,
            reconnectionDelay: 1000,
            auth: { token },
          });
        }
      } finally {
        this.connecting = false;
      }
    } else {
      while (this.connecting) {
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    return this.socket!;
  }

  release() {
    this.subscribers--;
    if (this.subscribers <= 0 && this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscribers = 0;
    }
  }
}

export const socketManager = new SocketManager();
