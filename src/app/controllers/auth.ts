import { decryptPassword, encryptPassword } from "../../server/utils/session"
import User from "../models/user"

export default class AuthController {
    static signup(name: string, email: string, password: string): Partial<User> | void {
        if(!name) { return }
        if(!email) { return }
        if(!password) { return }

        if(User.findByEmail(email)) {
            return
        }

        password = encryptPassword(password)
        const id = User.create({
            email, password, name
        })

        if(!id) { return }

        const user = User.findOne(id)
        if(!user) { return }

        return user
    }

    static login(email: string, password: string): Partial<User> | void {
        if(!email) { return }
        if(!password) { return }


        const user = User.findByEmail(email)
        if(!user) { return }

        if(decryptPassword(user.password) !== password) {
            return
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name
        }
    }
}