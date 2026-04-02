import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IdeasService } from './ideas.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class IdeasGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private closedChallenges = new Set<string>();

  constructor(private readonly ideasService: IdeasService) {}

  afterInit() {
    setInterval(() => {
      this.server.emit('timer:sync', { serverTime: Date.now() });
    }, 10000);
  }

  private isChallengeActive(challengeId?: string): boolean {
    if (!challengeId) return true;
    return !this.closedChallenges.has(challengeId);
  }

  @SubscribeMessage('idea:like')
  async handleLike(@MessageBody() data: any) {
    const ideaId = typeof data === 'string' ? data : data.ideaId;
    const challengeId = data?.challengeId;

    if (!this.isChallengeActive(challengeId)) return;

    const updated = await this.ideasService.addLike(ideaId);
    if (updated) {
      this.server.emit('idea:updated', {
        id: updated._id,
        likesCount: updated.likesCount,
        commentsCount: updated.commentsCount,
      });
    }
  }

  @SubscribeMessage('idea:comment')
  async handleComment(@MessageBody() data: any) {
    const ideaId = typeof data === 'string' ? data : data.ideaId;
    const challengeId = data?.challengeId;

    if (!this.isChallengeActive(challengeId)) return;

    const updated = await this.ideasService.addComment(ideaId);
    if (updated) {
      this.server.emit('idea:updated', {
        id: updated._id,
        likesCount: updated.likesCount,
        commentsCount: updated.commentsCount,
      });
    }
  }

  emitChallengeClose(challengeId: string) {
    this.closedChallenges.add(challengeId);
    this.server.emit('challenge:close', { challengeId });
  }
}
