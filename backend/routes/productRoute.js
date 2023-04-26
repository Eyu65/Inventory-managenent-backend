const express = require("express");
const protectedRoute = require('../middlewares/authMiddleware');
const { createProduct, fetchProducts, fetchProduct, deleteProduct, editProduct } = require("../controllers/productController");
const { upload } = require("../utility/fileSystem");
const router = express.Router();

router.post("/", protectedRoute, upload.single("photo"), createProduct);
router.put("/", protectedRoute, upload.single("photo"), editProduct);
router.get("/", protectedRoute, fetchProducts);
router.get("/:id", protectedRoute, fetchProduct);
router.delete("/:id", protectedRoute, deleteProduct);

module.exports = router;