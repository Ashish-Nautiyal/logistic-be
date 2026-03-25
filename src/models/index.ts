import sequelize from '../config/database';
import User from './User';
import Client from './Client';
import Vehicle from './Vehicle';
import Driver from './Driver';
import Order from './Order';
import Dispatch from './Dispatch';

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
  Client,
  Vehicle,
  Driver,
  Order,
  Dispatch,
  sequelize,
};
