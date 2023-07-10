import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class Items {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column('int', { name: 'starting_price' })
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
}
