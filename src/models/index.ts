import sequelize from '../config/database';
import User from './User';
import Vehicle from './Vehicle';
import Driver from './Driver';
import Order from './Order';

export const initializeModels = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};

export {
  User,
  Vehicle,
  Driver,
  Order,
  sequelize,
};
