import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { VehicleAttributes, VehicleType, VehicleStatus } from '../types';

type VehicleCreationAttributes = Optional<VehicleAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public id!: string;
  public plateNumber!: string;
  public vehicleType!: VehicleType;
  public capacity!: number;
  public status!: VehicleStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    plateNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    vehicleType: {
      type: DataTypes.ENUM('truck', 'van', 'bike'),
      defaultValue: 'van',
    },
    capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance'),
      defaultValue: 'available',
    },
  },
  {
    sequelize,
    modelName: 'Vehicle',
    tableName: 'vehicles',
    underscored: true,
  }
);

export default Vehicle;
