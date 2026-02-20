module.exports = (sequelize, DataTypes) => {
  const ProgramStudi = sequelize.define('ProgramStudi', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    head: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Aktif', 'Tidak Aktif'),
      defaultValue: 'Aktif'
    }
  }, {
    tableName: 'program_studi',
    timestamps: true,
    underscored: true
  });

  ProgramStudi.associate = (models) => {
    // 1 prodi bisa memiliki banyak user (mahasiswa/admin prodi)
    ProgramStudi.hasMany(models.User, { foreignKey: 'prodi_id', as: 'users' });
    ProgramStudi.hasMany(models.Repository, { foreignKey: 'prodi_id', as: 'repositories' });
  };

  return ProgramStudi;
};
