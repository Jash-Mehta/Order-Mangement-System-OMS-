import { User, UsersRepositories } from "../repositories/users.repositories";

export class UserServices {
    constructor(
        private readonly userRepo: UsersRepositories = new UsersRepositories()
    ) { };
  async createUser(input: {
    name: string;
    hash_password: string;
    email: string;
  }){
     const data = await this.userRepo.createUser({
        name: input.name,
        password_hash: input.hash_password,
        email: input.email,
    })

    return {
       message: "User Created Successfully",
      user: {
        email: data.email,
        userId: data.id,
        name: data.name,
      }
    }
  };

  async loginUser(input: {
    email: string,
    hash_password: string,
  }) {
    const user = await this.userRepo.loginUser(input.email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password_hash !== input.hash_password) {
      throw new Error('Invalid password');
    }
   
    return {
      message: "User Login Successfully",
      user: {
        email: user.email,
        userId: user.id,
        name: user.name,
      }
    };
  }
}