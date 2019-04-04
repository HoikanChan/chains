module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      pic: DataTypes.STRING,
      phone: DataTypes.STRING,
    },
    {}
  );
  return User;
};
