import { AuthHelper, CommonError, DynamoDB } from '../../common/helpers';
import { User } from '../../src/entities';
import { AuthenticationServices } from '../../src/services';

describe('Authentication Services Unittest', () => {
  const authService = new AuthenticationServices();

  // Fake data
  const user: User = {
    id: '1',
    username: 'Dummy',
    email: 'dev@dummy.com',
    password: '$2a$10$7ceVdSIZ1jHv7TsBawd49OWg0Kx0KRrydFNSowE4eCVNZKAwshCAO',
  };
  const token = 'dummy_token';

  describe('Login Test Cases', () => {
    // Mock Data
    beforeAll(() => {
      jest.spyOn(AuthHelper, 'generateJWT').mockReturnValue(token);
      jest.spyOn(AuthHelper, 'verifyJWT').mockReturnValue({
        user: { id: '1' },
      });
    });

    it('Successfully', async () => {
      jest.spyOn(DynamoDB, 'query').mockResolvedValue([user]);
      jest.spyOn(DynamoDB, 'save').mockResolvedValue(user);

      const input = {
        email: 'dev@dummy.com',
        password: '123456',
      };
      const expected = {
        ...user,
        accessToken: token,
        refreshToken: token,
        password: undefined,
      };

      await expect(authService.authenticate(input)).resolves.toEqual(expected);
    });

    it('Email is not exist', async () => {
      jest.spyOn(DynamoDB, 'query').mockResolvedValue([]);
      const input = {
        email: 'dev@dummy.com',
        password: '123456',
      };
      const expected = CommonError.UNAUTHORIZED();
      await expect(authService.authenticate(input)).rejects.toThrow(expected);
    });

    it('Password is wrong', async () => {
      jest.spyOn(DynamoDB, 'query').mockResolvedValue([user]);
      const input = {
        email: 'dev@dummy.com',
        password: 'wrong_password',
      };
      const expected = CommonError.UNAUTHORIZED();
      await expect(authService.authenticate(input)).rejects.toThrow(expected);
    });
  });
});
