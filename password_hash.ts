import bcrypt from "bcrypt"

//
// const hash = async (password: string): Promise<string> => {
//     return await bcrypt.hash(password, 10)
// }

async function main() {
    const hash = await bcrypt.hash("password1234", 10);
    console.log(hash);
}

main();