const slugify = require('slugify');
const brandModel = require('../models/carBrand');
const multer = require('multer');
const path = require('path');

// Setup multer for local image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Create brand with image
const createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const brandPicturePath = req.file?.path;

        if (!name) {
            return res.status(400).send({ message: 'Brand name is required' });
        }

        if (!brandPicturePath) {
            return res.status(400).send({ message: 'Brand image is required' });
        }

        const existing = await brandModel.findOne({ name });
        if (existing) {
            return res.status(200).send({
                success: true,
                message: 'Brand name already exists',
            });
        }

        const brand = new brandModel({
            name,
            slug: slugify(name),
            brandPictures: brandPicturePath,
        });

        await brand.save();
        res.status(201).send({
            success: true,
            message: 'Brand created successfully',
            brand,
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: 'Error in creating brand',
            err,
        });
    }
};

// Get all brands
const getBrand = async (req, res) => {
    try {
        const brands = await brandModel.find({});
        res.status(200).send({
            success: true,
            totalBrand: brands.length,
            message: 'All Brands',
            brands,
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: 'Error in getting brands',
            err,
        });
    }
};

// Get brand by slug
const getBrandById = async (req, res) => {
    try {
        const brand = await brandModel.findOne({ slug: req.params.slug });

        if (!brand) {
            return res.status(404).send({
                success: false,
                message: 'Brand not found',
            });
        }

        res.status(200).send({
            success: true,
            message: 'Brand found',
            brand,
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: 'Error in getting brand',
            err,
        });
    }
};

// Update brand name only
const updateBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        const brand = await brandModel.findByIdAndUpdate(
            id,
            { name, slug: slugify(name) },
            { new: true }
        );

        res.status(200).send({
            success: true,
            message: 'Brand updated successfully',
            brand,
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: 'Error in updating brand',
            err,
        });
    }
};

// Delete brand by ID
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        await brandModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: 'Brand deleted successfully',
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: 'Error in deleting brand',
            err,
        });
    }
};

module.exports = {
    upload,
    createBrand,
    getBrand,
    getBrandById,
    updateBrand,
    deleteBrand,
};
