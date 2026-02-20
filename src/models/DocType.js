module.exports = (sequelize, DataTypes) => {
  const DocType = sequelize.define('DocType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'doc_types',
    timestamps: true,
    underscored: true
  });

  return DocType;
};
