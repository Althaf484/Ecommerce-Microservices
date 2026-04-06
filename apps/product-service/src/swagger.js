import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Product Service API",
    description: "Automatically generated swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6002",
  schemes: ["http"],
};

const outputFile = "./swagge-output.json";
const endpointsFiles = ["./routes/product.route.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
