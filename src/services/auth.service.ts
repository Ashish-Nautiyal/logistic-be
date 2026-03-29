import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config';
import { UserAttributes, UserRole, JwtPayload, AuthResponse } from '../types';
import { emailService } from './email.service';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<AuthResponse> {
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

  async login(email: string, password: string): Promise<AuthResponse> {
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

  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = jwt.sign(
      { sub: user.id, type: 'password-reset' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send reset email:', error);
      throw new Error('Failed to send reset email. Please try again.');
    }

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token');
      }

      const user = await User.findByPk(decoded.sub);
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await user.update({ password: hashedPassword });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Invalid or expired reset token');
      }
      throw error;
    }
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
