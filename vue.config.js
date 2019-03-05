
module.exports = {
    
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
   
    devServer: {
      host: "localhost",
      port: 1111, // 端口号
      https: false, // https:{type:Boolean}
      open: true, //配置自动启动浏览器
    }
  };
  