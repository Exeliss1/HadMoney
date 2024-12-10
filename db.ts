import * as fs from "fs/promises";
import {writeFileSync} from "fs";

export interface DB {
    users: Map<string, User>;
}

interface BackupObj {
    users: {
        [key: string]: User
    };
}

export interface User {
    username: string;
    hash: string;
    money: number;
    token: string;
}

export function saveDB(db: DB) {
    const obj: BackupObj = {
        users: {}
    };
    db.users.forEach((user, name) => {
        obj.users[name] = user;
    })
    writeFileSync("data.json", JSON.stringify(obj));
}

export async function loadOrInitDB(): Promise<DB> {
    const exists = await fs.exists("data.json");

    if (!exists) {
        return {
            users: new Map<string, User>(),
        }
    } else {
        const obj = JSON.parse(await fs.readFile("data.json", "utf8")) as BackupObj;
        const db = {
            users: new Map<string, User>(),
        };
        Object.keys(obj.users).forEach((name) => {
            db.users.set(name, obj.users[name]);
        })
        return db;
    }
}