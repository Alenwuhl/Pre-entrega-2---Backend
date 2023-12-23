import express from "express";
import handlebars from "express-handlebars";
import cartRouter from "./routes/carts.route.js";
import productRouter from "./routes/products.route.js";
import chatRouter from "./routes/chat.routes.js"
import viewRouter from "./routes/views.routes.js";
import __dirname from "./utils.js";
import { ProductManager } from "./daos/ProductManager.js";
import { CartManager } from "./daos/cartManager.js";
import mongoose from "mongoose";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import { Server } from "socket.io";
import Handlebars from 'handlebars';

const app = express();
const port = 5000;
const httpServer = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
);

const socketServer = new Server(httpServer);
const productManager = new ProductManager("mongodb://localhost:27017");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  "hbs",
  handlebars.engine({
    extname: "hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);

app.set("view engine", "hbs");
app.set("views", `${__dirname}/views`);


app.use(express.static(`${__dirname}/public`));
app.use("/", viewRouter);

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/chat", chatRouter);

//Mongoose
mongoose
  .connect("mongodb://127.0.0.1:27017/myapp")
  .then(() => console.log("Conectado a DB"))
  .catch((err) => console.log(err));

//Socket communication
socketServer.on("connection", async (socketClient) => {
  console.log("Nuevo cliente conectado");

  socketClient.on("message", (data) => {
    console.log(data);
  });

  //Socket del chat
  io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado");
    socket.broadcast.emit("newConnection", (data) => {
      console.log(data);
    });

    socket.on("message", (data) => {
      console.log(data);
      messages.push(data);
      io.emit("messages", messages);
    });

    socket.emit("messages", messages);
  });

  //Mensajes del form
  socketClient.on("boton_agregar", async (data) => {
    try {
      //console.log(data);
      const resultado = await productManager.addProduct(data);
      if (resultado) {
        const productList = await productManager.getProducts();
        console.log(productList);
        socketClient.emit("productsList", productList);
      } else {
        console.log("error al insertar el producto");
      }
    } catch (error) {
      console.log("Hubo un error al agregar el producto");
    }
  });

  socketClient.on("boton_eliminar", async (data) => {
    try {
      //console.log(data);
      const resultado = await productManager.deleteProductByCode(data);
      if (resultado) {
        console.log(await productManager.getProducts());
        socketClient.emit("productsList", await productManager.getProducts());
      } else {
        console.log("error al eliminar el producto");
      }
    } catch (error) {
      console.log("Hubo un error al eliminar el producto");
    }
  });
});
