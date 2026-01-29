import { Inventory, InventoryRepositories } from "../repositories/inventory.repositories";

export class InventoryServices{
    constructor( private inventoryRepo: InventoryRepositories){}
 async createInventory(input: {
  name: string;
  brand_name?: string;
  bar_code?: string;
  image_url?: string;
  price: number; // numeric(12,2) in DB
  batch_no?: string;
  mfg_date?: Date;
  expiry_date?: Date;
  total_quantity: number;
  available_quantity: number;
 }){
return await this.inventoryRepo.createInventory(input);
 }

async findProductById(id: string): Promise<Inventory| null>{
    return await this.inventoryRepo.findProductById(id);
}

}