import { Insertable, Selectable } from 'kysely';
import { userDB } from '../../../database';
import { UsersTable } from '../users.schema';
import { TABLES } from '../../../database/table_name';


export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;

export class UsersRepositories{
   
   async createUser(user: NewUser): Promise<User> { 
  
    
    return await userDB.insertInto(TABLES.USERS).values(user).returningAll()
      .executeTakeFirstOrThrow();
   }

   async loginUser(email: string): Promise<User | null> {
    const user = await userDB
      .selectFrom(TABLES.USERS)
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return user ?? null;
  }

  async getAllUsers(): Promise<User[]>{ 
    return await userDB.selectFrom(TABLES.USERS).selectAll().execute();
  }
}