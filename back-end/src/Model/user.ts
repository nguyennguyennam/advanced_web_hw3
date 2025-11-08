/*
    This file declares the user model, using typeorm
    The user model includes The following fields:
    - id: number (primary key)
    - username: string
    - email: string, required, unique
    - password: string, required
    - createdAt: Date, default to current date
*/

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: "users"})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({unique:true})
  email: string;

  @Column()
  password: string;

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;
}
