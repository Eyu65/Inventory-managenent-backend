const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utility/fileSystem");
const cloudinary = require("cloudinary").v2;

const createProduct = asyncHandler (async(req, res) => {
    const {name, uin, category, price, description, quantity} = req.body;

    if(!name || !price || !category || !description || !quantity) {
        res.status(400)
        throw new Error("Please fill in all fields!")
    }

    let fileData = {}
    if(req.file) {

        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Inventory App", resource_type: "photo"})
        } catch (error) {
            res.status(500)
            throw new Error("Photo could not be uploaded!")
        }

        fileData = {
            fileName: req.file.originalname,
            fileName: uploadedFile.secure_url,
            fileName: req.file.mimetype,
            fileName: fileSizeFormatter(req.file.size, 2)
        }
    }

    const product = await Product.create({user: req.user.id, name, uin, quantity, price, category, description, image: fileData});
    res.status(200).json(product)
});

const fetchProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json(products);
});

const fetchProduct = asyncHandler (async(req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) {
        res.status(404)
        throw new Error("Product not found!")
    }

    if(product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("User not authorized")
    }
    res.status(200).json(product)
});

const deleteProduct = asyncHandler (async(req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) {
        res.status(404)
        throw new Error("Product not found!")
    }

    if(product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("User not authorized")
    }

    await product.remove();
    res.status(200).json({message: "Product deleted successfully!"});
});

const editProduct = asyncHandler (async(req, res) => {
    const {name, uin, category, price, description, quantity} = req.body;
    const { id } = req.params;

    const product = await Product.findById(id);

    if(!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if(product.user.toString() !== req.user.id) {
        res.status(404);
        throw new Error("Not authorized to perform this action!")
    }

    let fileData = {}
    if(req.file) {

        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Inventory App", resource_type: "photo"})
        } catch (error) {
            res.status(500)
            throw new Error("Photo could not be uploaded!")
        }

        fileData = {
            fileName: req.file.originalname,
            fileName: uploadedFile.secure_url,
            fileName: req.file.mimetype,
            fileName: fileSizeFormatter(req.file.size, 2)
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        {_id: id},
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length ===0 ? product?.image : fileData
        }, {
            new: true,
            runValidators: true
        }
    );
        res.status(200).json(updatedProduct);
});

module.exports = {
    createProduct,
    fetchProducts,
    fetchProduct,
    deleteProduct,
    editProduct
}