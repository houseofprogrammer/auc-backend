import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Items } from './items.entity';

@Entity()
export class Bids {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  itemId: number;

  @Column()
  bidAmount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bidTime: Date;

  @ManyToOne(() => Users, (user) => user.bids)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Items, (item) => item.bids)
  @JoinColumn({ name: 'item_id' })
  item: Items;
}
