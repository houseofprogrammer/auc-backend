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

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'item_id' })
  itemId: number;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({
    name: 'bid_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  bidTime: Date;

  @ManyToOne(() => Users, (user) => user.bids)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Items, (item) => item.bids)
  @JoinColumn({ name: 'item_id' })
  item: Items;
}
