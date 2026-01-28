import { Generated } from 'kysely';

export interface UsersTable{
    id: Generated<string>;
    name: string;
    password_hash: string;
    email: string;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

export interface UserDatabase {
  users: UsersTable;
}