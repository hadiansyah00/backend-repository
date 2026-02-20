module.exports = (sequelize, DataTypes) => {
  const DownloadLog = sequelize.define('DownloadLog', {
    repository_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'repositories',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    downloaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'download_logs',
    timestamps: false,
    underscored: true
  });

  DownloadLog.associate = (models) => {
    DownloadLog.belongsTo(models.Repository, { foreignKey: 'repository_id', as: 'repository' });
    DownloadLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return DownloadLog;
};
