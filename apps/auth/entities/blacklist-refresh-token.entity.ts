import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'blacklist_refresh_token' })
export class BlackListedRefreshToken {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'expired_at', type: 'timestamp' })
  expiredAt: Date;
}
