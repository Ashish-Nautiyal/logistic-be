import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { DispatchAttributes, DispatchStatus } from '../types';
import Order from './Order';
import Driver from './Driver';
import Vehicle from './Vehicle';

type DispatchCreationAttributes = Optional<DispatchAttributes, 'id' | 'startTime' | 'endTime' | 'notes' | 'createdAt' | 'updatedAt'>;

class Dispatch extends Model<DispatchAttributes, DispatchCreationAttributes> implements DispatchAttributes {
  public id!: string;
  public orderId!: string;
  public driverId!: string;
  public vehicleId!: string;
  public status!: DispatchStatus;
  public startTime!: Date | null;
  public endTime!: Date | null;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly order?: Order;
  public readonly driver?: Driver;
  public readonly vehicle?: Vehicle;
}

Dispatch.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'drivers',
        key: 'id',
      },
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'vehicles',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Dispatch',
    tableName: 'dispatches',
    underscored: true,
  }
);

Dispatch.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(Dispatch, { foreignKey: 'orderId', as: 'dispatches' });

Dispatch.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
Driver.hasMany(Dispatch, { foreignKey: 'driverId', as: 'dispatches' });

Dispatch.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Vehicle.hasMany(Dispatch, { foreignKey: 'vehicleId', as: 'dispatches' });

export default Dispatch;
