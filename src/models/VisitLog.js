module.exports = (sequelize, DataTypes) => {
  const VisitLog = sequelize.define('VisitLog', {
    repository_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null means a general site visit instead of a specific repository
      references: {
        model: 'repositories',
        key: 'id'
      }
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    visited_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'visit_logs',
    timestamps: false,
    underscored: true
  });

  VisitLog.associate = (models) => {
    VisitLog.belongsTo(models.Repository, { foreignKey: 'repository_id', as: 'repository' });
  };

  return VisitLog;
};
