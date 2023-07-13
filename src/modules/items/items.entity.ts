import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Users } from '../users/users.entity';
import { Bids } from '../bids/bids.entity';

@Entity()
export class Items {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column({ name: 'starting_price', type: 'float', default: 0 })
  startingPrice: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'completed'],
    default: 'draft',
  })
  status: 'draft' | 'published' | 'completed';

  @ManyToOne(() => Users, (user) => user.items)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;

  @OneToMany(() => Bids, (bid) => bid.item)
  bids: Bids[];

  @Column('int', { name: 'time_window' })
  timeWindow: number;

  @CreateDateColumn({ name: 'end_bid_time' })
  endBidtime: Date;

  @Column('int', { name: 'winner_user_id' })
  winnerUserId: number;
}
