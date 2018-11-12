const product = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
      name: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      price: {
        type: DataTypes.FLOAT,
        validate: { notEmpty: true },
      },
    });
  
    Product.associate = models => {
      Product.belongsTo(models.User);
    };
  
    return Product;
  };
  
  export default product;