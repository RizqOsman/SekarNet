import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "sekar-net-secret-key";

interface ConnectedUser {
  userId: number;
  role: string;
  ws: WebSocket;
}

interface NotificationMessage {
  type: 'notification' | 'installation_update' | 'payment_update' | 'support_update' | 'broadcast' | 'pong' | 'connection_established';
  data: any;
  targetUserId?: number;
  targetRole?: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection');

      // Extract token from query string or headers
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userKey = `${decoded.id}-${decoded.role}`;
        
        this.connectedUsers.set(userKey, {
          userId: decoded.id,
          role: decoded.role,
          ws
        });

        console.log(`User ${decoded.username} (${decoded.role}) connected`);

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection_established',
          data: {
            userId: decoded.id,
            role: decoded.role,
            message: 'Connected to SEKAR NET real-time updates'
          }
        }));

        // Handle incoming messages
        ws.on('message', (message) => {
          try {
            const parsedMessage = JSON.parse(message.toString());
            this.handleMessage(parsedMessage, decoded);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });

        // Handle disconnection
        ws.on('close', () => {
          this.connectedUsers.delete(userKey);
          console.log(`User ${decoded.username} disconnected`);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.connectedUsers.delete(userKey);
        });

      } catch (error) {
        console.error('Invalid token:', error);
        ws.close(1008, 'Invalid token');
      }
    });
  }

  private handleMessage(message: any, user: any) {
    switch (message.type) {
      case 'ping':
        this.sendToUser(user.id, user.role, {
          type: 'pong',
          data: { timestamp: Date.now() }
        });
        break;

      case 'join_room':
        // Handle room joining for specific features
        console.log(`User ${user.id} joined room: ${message.room}`);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Send message to specific user
  public sendToUser(userId: number, role: string, message: NotificationMessage) {
    const userKey = `${userId}-${role}`;
    const user = this.connectedUsers.get(userKey);
    
    if (user && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  }

  // Send message to all users with specific role
  public sendToRole(role: string, message: NotificationMessage) {
    this.connectedUsers.forEach((user, key) => {
      if (user.role === role && user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(message));
      }
    });
  }

  // Send message to all connected users
  public broadcast(message: NotificationMessage) {
    this.connectedUsers.forEach((user) => {
      if (user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(JSON.stringify(message));
      }
    });
  }

  // Send installation update to customer
  public sendInstallationUpdate(userId: number, installationData: any) {
    this.sendToUser(userId, 'customer', {
      type: 'installation_update',
      data: installationData
    });
  }

  // Send payment update to customer
  public sendPaymentUpdate(userId: number, paymentData: any) {
    this.sendToUser(userId, 'customer', {
      type: 'payment_update',
      data: paymentData
    });
  }

  // Send support ticket update
  public sendSupportUpdate(userId: number, ticketData: any) {
    this.sendToUser(userId, 'customer', {
      type: 'support_update',
      data: ticketData
    });
  }

  // Send notification to specific user
  public sendNotification(userId: number, notificationData: any) {
    this.sendToUser(userId, 'customer', {
      type: 'notification',
      data: notificationData
    });
  }

  // Send broadcast message to all users or specific role
  public sendBroadcast(message: string, targetRole?: string) {
    const broadcastMessage: NotificationMessage = {
      type: 'broadcast',
      data: {
        message,
        timestamp: new Date().toISOString()
      },
      targetRole
    };

    if (targetRole) {
      this.sendToRole(targetRole, broadcastMessage);
    } else {
      this.broadcast(broadcastMessage);
    }
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  public getConnectedUsersByRole(role: string): number {
    let count = 0;
    this.connectedUsers.forEach((user) => {
      if (user.role === role) count++;
    });
    return count;
  }
}

export default WebSocketManager; 