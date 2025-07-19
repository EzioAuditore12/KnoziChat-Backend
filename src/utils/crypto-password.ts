
export async function generateHashedPassword(password:string){
    const hashedPassword=await Bun.password.hash(password,{
        algorithm:"argon2id",
        memoryCost:4,
        timeCost:3
    })
    return hashedPassword
}

export async function validatePassword(inputPassword:string,storedHashedPassword:string){
    const isMatch=await Bun.password.verify(inputPassword,storedHashedPassword)
    return isMatch
}