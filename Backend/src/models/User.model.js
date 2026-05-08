import { Schema, Types, model } from "mongoose";

const collection = "users"
const schema = new Schema ({
    email: { type:String, require:true, unique: true, index: true },
    password: { type:String, require:true },
    role: { type:String, default: "USER", index: true },
    photo: { type:String, require:false },
    age: { type:Number, require:false },
    name: { type:String, require:true },
    phoneNumber: { type:String, require:false },
},{
    timestamps: true
})

const User = model( collection, schema)
export default User