import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderAttributes, OrderStatus } from '../types';
import Driver from './Driver';
import Vehicle from './Vehicle';

type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'driverId' | 'vehicleId' | 'description' | 'deliveryNotes' | 'deliveredAt' | 'createdAt' | 'updatedAt'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public orderNumber!: string;
  public clientId!: string;
  public driverId!: string | null;
  public vehicleId!: string | null;
  public status!: OrderStatus;
  public pickupAddress!: string;
  public pickupCity!: string;
  public deliveryAddress!: string;
  public deliveryCity!: string;
  public weight!: number;
  public description!: string | null;
  public deliveryNotes!: string | null;
  public scheduledDate!: Date;
  public deliveredAt!: Date | null;
  public companyId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly driver?: Driver;
  public readonly vehicle?: Vehicle;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'drivers',
        key: 'id',
      },
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'vehicles',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    pickupAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pickupCity: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deliveryCity: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deliveredAt: {
      type: DataTypes.DATE,
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
    modelName: 'Order',
    tableName: 'orders',
    underscored: true,
  }
);


Order.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
Driver.hasMany(Order, { foreignKey: 'driverId', as: 'orders' });

Order.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Vehicle.hasMany(Order, { foreignKey: 'vehicleId', as: 'orders' });

export default Order;
