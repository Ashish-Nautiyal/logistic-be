import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { DriverAttributes } from '../types';
import User from './User';
import Vehicle from './Vehicle';

type DriverCreationAttributes = Optional<DriverAttributes, 'id' | 'vehicleId' | 'currentLocation' | 'createdAt' | 'updatedAt'>;

class Driver extends Model<DriverAttributes, DriverCreationAttributes> implements DriverAttributes {
  public id!: string;
  public userId!: string;
  public licenseNumber!: string;
  public vehicleId!: string | null;
  public isAvailable!: boolean;
  public currentLocation!: { lat: number; lng: number } | null;
  public companyId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
  public readonly vehicle?: Vehicle;
}

Driver.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'vehicles',
        key: 'id',
      },
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    currentLocation: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Driver',
    tableName: 'drivers',
    underscored: true,
  }
);

Driver.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Driver, { foreignKey: 'userId', as: 'driverProfile' });

Driver.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Vehicle.hasOne(Driver, { foreignKey: 'vehicleId', as: 'assignedDriver' });

export default Driver;
