import { DataTypes, Model } from "sequelize";
import sequelize from "./sequelize";
import MemberNeeds from "./MemberNeeds";
import HealthHistory from "./HealthHistory";
import { FamilyMemberAttributes } from "../config/types";
import { Gender, MaritalStatus } from "../config/enums";

class FamilyMember
  extends Model<FamilyMemberAttributes>
  implements FamilyMemberAttributes
{
  id!: number;
  FamilyId!: number;
  firstName!: string;
  lastName!: string;
  gender!: Gender;
  maritalStatus!: MaritalStatus;
  address!: string;
  email!: string;
  dateOfBirth!: Date;
  phoneNumber!: string;
  isWorking!: boolean;
  isPersonCharge!: boolean;
  proficient!: string;
  totalIncome!: number;
  educationLevel!: number;
}
FamilyMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    FamilyId: {
      type: DataTypes.INTEGER,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM(...Object.values(Gender)),
      allowNull: false,
      defaultValue: Gender.Male,
    },
    maritalStatus: {
      type: DataTypes.ENUM(...Object.values(MaritalStatus)),
      allowNull: false,
      defaultValue: MaritalStatus.Single,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Address cannot be empty",
        },
        len: {
          args: [5, 100],
          msg: "Address must be between 5 and 100 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Invalid email address",
        },
      },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: "Invalid date of birth",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [10, 15],
          msg: "Phone number must be between 10 and 15 digits",
        },
      },
    },
    isPersonCharge: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isWorking: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    proficient: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalIncome: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    educationLevel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "FamilyMember",
  }
);

FamilyMember.hasMany(MemberNeeds, {
  foreignKey: "familyMemberId",
  as: "memberNeeds",
});

MemberNeeds.belongsTo(FamilyMember, {
  foreignKey: "familyMemberId",
  as: "memberNeeds",
});

FamilyMember.hasMany(HealthHistory, {
  foreignKey: "familyMemberId",
  as: "healthHistory",
});

HealthHistory.belongsTo(FamilyMember, {
  foreignKey: "familyMemberId",
  as: "healthHistory",
});

export default FamilyMember;
