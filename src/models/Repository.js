module.exports = (sequelize, DataTypes) => {
  const Repository = sequelize.define('Repository', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    abstract: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    npm_nidn: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pembimbing1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pembimbing2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending review', 'published', 'archived', 'rejected'),
      defaultValue: 'draft'
    },
    prodi_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'program_studi',
        key: 'id'
      }
    },
    doc_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'doc_types',
        key: 'id'
      }
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'repositories',
    timestamps: true,
    underscored: true
  });

  Repository.associate = (models) => {
    Repository.belongsTo(models.ProgramStudi, { foreignKey: 'prodi_id', as: 'prodi' });
    Repository.belongsTo(models.DocType, { foreignKey: 'doc_type_id', as: 'docType' });
    Repository.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'uploader' });
    Repository.hasMany(models.DownloadLog, { foreignKey: 'repository_id', as: 'downloadLogs' });
  };

  return Repository;
};
