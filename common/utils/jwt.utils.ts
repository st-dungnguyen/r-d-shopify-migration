import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { CommonError } from '../helpers/error.helpers';

export namespace JwtUtils {
  const allowCharacters = {
    uppers: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    lowers: 'qwertyuiopasdfghjklzxcvbnm',
    numbers: '1234567890',
    symbols: '!@#$%^&*',
  };

  const getRandomCharFromString = (str: string) => str.charAt(Math.floor(Math.random() * str.length));

  export const generatePassword = (length = 8) => {
    let pwd = '';
    pwd += getRandomCharFromString(allowCharacters.uppers);
    pwd += getRandomCharFromString(allowCharacters.lowers);
    pwd += getRandomCharFromString(allowCharacters.numbers);
    pwd += getRandomCharFromString(allowCharacters.symbols);
    for (let i = pwd.length; i < length; i++) {
      pwd += getRandomCharFromString(Object.values(allowCharacters).join(''));
    }
    return pwd;
  };

  export const generateJWT = (payload: any, secret: string, expired: string = '1h'): string => {
    return sign({ ...payload }, secret, { expiresIn: expired });
  };

  export const verifyJWT = (token: string, secret: string): string | JwtPayload => {
    try {
      const data = verify(token, secret);
      return data;
    } catch (err) {
      console.log('Verify JWT Error: ', err);
      throw CommonError.UNAUTHORIZED();
    }
  };
}
