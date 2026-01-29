import { Insertable, Selectable } from "kysely";
import { InventoryTable } from "../inventory.schema";
import { inventoryDB } from '../../../database';
import { TABLES } from "../../../database/table_name";

export type Inventory = Selectable<InventoryTable>;
export type NewInventory = Insertable<InventoryTable>;

export class InventoryRepositories {

    async createInventory(inventory: NewInventory): Promise<Inventory> {

        return await inventoryDB.insertInto(TABLES.INVENTORY).values(inventory).returningAll().executeTakeFirstOrThrow();
    }

    async findProductById(product_id: string): Promise<Inventory| null>{
        const data =  await inventoryDB.selectFrom(TABLES.INVENTORY).selectAll().where("product_id", "=", product_id).executeTakeFirst();
         if (!data) return null;
        return data;
    }
}