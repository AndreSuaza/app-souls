
import bcryptjs from "bcryptjs";

interface SeedUser {
    email: string;
    password: string;
    name: string;
    nickname: string;
    role: 'admin' | 'player'
}

interface SeedData {
    users: SeedUser[];
}

export const initialData: SeedData = {
    users: [
        {
            email: 'test@gmai.com',
            name: 'Test 1',
            nickname: 'T1',
            password:  bcryptjs.hashSync('123456'),
            role: 'admin'
        },
        {
            email: 'test2@gmai.com',
            name: 'Test 2',
            nickname: 'T2',
            password:  bcryptjs.hashSync('123456'),
            role: 'player'
        },
    ]
}