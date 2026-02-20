module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    underscored: true
  });

  Role.associate = (models) => {
    // Role has many Users
    Role.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
    
    // Role belongsToMany Permissions
    Role.belongsToMany(models.Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions'
    });
  };

  return Role;
};
