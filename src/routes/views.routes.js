import { Router } from "express";
import { ProductManager } from "../daos/ProductManager.js";
import { productModel } from "../daos/models/product.model.js";

const router = Router();
const productManager = new ProductManager("./productos.json");

router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const options = {
      page,
      limit,
      sort: { price: -1 }
    };
    const products = await productModel.paginate({}, options);
    console.log(products);
    res.render("home", { products });
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).send("Ocurrió un error al obtener los productos.");
  }
});

// Form
router.get("/realTimeProducts", (req, res) => {
  res.render("realTimeProducts", {
    title: "Productos",
    fileCss: "styles.css",
  });
});

//Chat
router.get("/chat", (req, res) => {
  res.render("chat", {
    title: "Chat",
    fileCss: "styles.css",
  });
});

export default router;
