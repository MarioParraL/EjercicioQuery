import mongoose from "npm:mongoose@8.0.0";
import { Pet } from "../types.ts";

const Schema = mongoose.Schema;

const petSchema = new Schema(
    {
        name: { type:String, required: true},
        breed: { type: String, required: true},
    },
    { timestamps: true}
);

export type PetModelType = mongoose.Document & Omit<Pet, "id">;
//export default mongoose.model<PetModelType>("Pet", petSchema);

//lo que te devuelve la BD es un petModelType no un pet: hay que transformar despues
// pet = {
    // id_ pM._:id.toString(),
    // name: pM.name,
    // breed: pM.breed
// }

export const ModeloPet = mongoose.model<PetModelType>("Pet", petSchema);