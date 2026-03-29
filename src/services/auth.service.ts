import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config';
import { UserAttributes, UserRole, JwtPayload } from '../types';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ user: UserAttributes; tokens: { accessToken: string; refreshToken: string } }> {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || null,
      role: data.role || 'driver',
      isActive: true,
    });

    const tokens = await this.generateTokens(user);
    
    return {
      user: user.toJSON() as UserAttributes,
      tokens,
    };
  }

  async login(email: string, password: string): Promise<{ user: UserAttributes; tokens: { accessToken: string; refreshToken: string } }> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);
    
    return {
      user: user.toJSON() as UserAttributes,
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
      const user = await User.findByPk(decoded.sub);
      
      if (!user) {
        throw new Error('User not found');
      }

      return await this.generateTokens(user);
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async getProfile(userId: string): Promise<UserAttributes> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toJSON() as UserAttributes;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }): Promise<UserAttributes> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update(data);
    return user.toJSON() as UserAttributes;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword });
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { sub: user.id, role: user.role };

    const accessToken = jwt.sign(
      payload, 
      config.jwt.secret, 
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      payload, 
      config.jwt.refreshSecret, 
      { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
