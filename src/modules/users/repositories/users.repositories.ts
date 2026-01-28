import { Insertable, Selectable } from 'kysely';
import { userDB } from '../../../database';
import { UsersTable } from '../users.schema';


export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;

export class UsersRepositories{
   
   async createUser(user: NewUser): Promise<User> { 
  
    
    return await userDB.insertInto('users').values(user).returningAll()
      .executeTakeFirstOrThrow();
   }

   async loginUser(email: string): Promise<User | null> {
    const user = await userDB
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return user ?? null;
  }
}