import mongoose from "npm:mongoose@8.0.0"
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";
import { Pet } from "./types.ts";
import { PetModelType } from "./db/pet.ts";
import { ModeloPet } from "./db/pet.ts";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";


const env = await load();
const MONGO_URL=env.MONGO_URL||Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
    throw new Error("Please provide a MONGO_URL");
    Deno.exit(-1);
  } 
  await mongoose.connect(MONGO_URL);



const gqlSchema=`#graphql
type Pet{
    id:ID!
    name:String!
    breed: String!
}

type Query{
pets:[Pet!]!
pet(id:ID!): Pet!
}

type Mutation{
addPet(name: String!,breed:String!):Pet!
deletePet(id:ID!):Pet!
updatePet(id:ID!,name: String!,breed:String!):Pet!
}
`;

let pets: Pet[]=[];

const Query={
    pets: async ():Promise<Pet[]>=>{
        const mascotas = await ModeloPet.find().exec();
        const pets: Pet[] = mascotas.map((Pet)=>({
            id: Pet._id.toString(),
            name: Pet.name,
            breed: Pet.breed

        }))
        return pets;
    },

    pet:async (_:unknown,args:{id:string}): Promise<Pet> =>{
        const {id}= args;
        const mascota =  await ModeloPet.findById(id)

       if(!mascota){
        throw new GraphQLError(`No existe la mascota ${args.id}`, {
            extensions: { code: "NOT_FOUND" },
          })
       }
       const masc:Pet={
        id: mascota._id.toString(),
        name: mascota.name,
        breed: mascota.breed
       }
       return masc;
    },

}
const Mutation={

    addPet: async ( _:unknown,args:{name:string;breed:string},):Promise<Pet> =>{
        const {name,breed}=args;
        if(!await ModeloPet.findById(id)){
            throw new GraphQLError(`Ya existe la mascota ${args.id}`, {
                extensions: { code: "EXISTS" },
              })
        }
        const nuevaMascota= new ModeloPet({name,breed})
        await nuevaMascota.save();
        const miPet:Pet={
            id: nuevaMascota._id.toString(),
            name: nuevaMascota.name,
            breed: nuevaMascota.breed
           }
        return miPet;
    },

    deletePet: async (_:unknown,args:{id:string},) => {
        const {id}=args;
        const pet = await ModeloPet.findByIdAndDelete(id);
        if(!pet){
            throw new GraphQLError(`No existe esta mascota${args.id}`, {
                extensions: { code: "EXISTS" },
              })


        }else{
            console.log("Mascota eliminada");
          return;
        }

    },
    
    updatePet: (
        _:unknown,args:{id:string;name:string;breed:string},
    ):Pet =>{
        const {id,name,breed}=args;
        let pet= pets.find((p)=>p.id===id);

        if(!pet){
            throw new GraphQLError(`No existe esta mascota${args.id}`, {
                extensions: { code: "EXISTS" },
              })


        }else{
            pet.name=name;
            pet.breed=breed;
            return pet;
        }

    },
 };



 const server = new ApolloServer({
    typeDefs: gqlSchema,
    resolvers:{
        Query,
        Mutation,
    },
});

const { url } = await startStandaloneServer(server, {
    listen:{
        port:3000,
    },
});

console.log(`🚀 Server ready at ${url}`);