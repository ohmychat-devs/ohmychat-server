import { User } from "../models";
import { faker } from "@faker-js/faker";
import fs from "fs";

export const createAndSaveUser = async () => {
    const user = new User({
        id: faker.string.uuid(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        avatar: faker.image.avatar()
    });

    await user.save();

    fs.writeFileSync('userId.txt', user.id);
    
    console.log("Utilisateur créé avec succès. ID sauvegardé dans userId.txt");
}