import { decryptPassword, encryptPassword } from "../../server/utils/session"
import User from "../models/user"

export default class AuthController {
    static signup(name: string, email: string, password: string): Partial<User> | string {
        if(!name) { return "Name is required" }
        if(!email) { return "Email is required" }
        if(!password) { return "Password is required" }

        if(User.findByEmail(email)) {
            return "User already exists"
        }

        password = encryptPassword(password)
        const id = User.create({
            email, password, name
        })

        if(!id) { return "Failed to create user" }

        const user = User.findOne(id)
        if(!user) { return "User not found" }

        return user
    }

    static login(email: string, password: string): Partial<User> | string {
        if(!email) { return "Email is required" }
        if(!password) { return "Password is required" }


        const user = User.findByEmail(email)
        if(!user) { return "User does not exist" }

        if(decryptPassword(user.password) !== password) {
            return "Invalid password"
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name
        }
    }
}