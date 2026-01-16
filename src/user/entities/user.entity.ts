import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { hash } from '@node-rs/argon2';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  middleName?: string | null;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 254, unique: true, nullable: true })
  email?: string | null;

  @Column({ type: 'text', nullable: true })
  avatar?: string | null;

  @Column({ type: 'text' })
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  expoPushToken?: string | null;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password);
  }
}
