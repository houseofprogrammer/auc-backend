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
export class Wallets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @ManyToOne(() => Users, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
