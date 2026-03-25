import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ClientAttributes } from '../types';

type ClientCreationAttributes = Optional<ClientAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public city!: string;
  public postalCode!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Client',
    tableName: 'clients',
    underscored: true,
  }
);

export default Client;
