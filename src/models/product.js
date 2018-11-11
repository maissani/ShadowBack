const product = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
      text: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
    });
  
    Product.associate = models => {
      Product.belongsTo(models.User);
    };
  
    return Product;
  };
  
  export default product;