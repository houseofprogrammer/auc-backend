import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Items } from './items.entity';
import { Wallets } from './wallets.entity';
import { Bids } from './bids.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @BeforeInsert()
  async hashPasword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => Items, (item) => item.user)
  items: Items[];

  @OneToOne(() => Wallets, (wallet) => wallet.user)
  wallet: Wallets;

  @OneToMany(() => Bids, (bid) => bid.user)
  bids: Bids[];
}
