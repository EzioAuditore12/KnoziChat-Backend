import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { hash } from '@node-rs/argon2';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 50, nullable: true })
  middleName?: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
  })
  phoneNumber?: string | null;

  @Column({ name: 'email', type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ name: 'avatar', type: 'text', nullable: true })
  avatar?: string | null;

  @Column({ name: 'password', type: 'text' })
  password: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'expo_push_token', type: 'text', nullable: true })
  expoPushToken?: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeNullableFields() {
    this.middleName ??= null;
    this.phoneNumber ??= null;
    this.avatar ??= null;
    this.expoPushToken ??= null;
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password);
  }
}
