import bcrypt from 'bcrypt'

class BcryptUtils {
  async GeneratePassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  async ValidatePassword(enteredPassword: string, savedHash: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, savedHash)
  }
}

export default new BcryptUtils()
