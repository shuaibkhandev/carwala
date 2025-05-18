const slugify = require("slugify");
const carModel = require("../models/carModel");
const orderModel = require("../models/orderModel");
const fs = require('fs');
const braintree = require("braintree");
const dotenv = require('dotenv');
const brandModel = require("../models/carBrand");
const multer = require('multer');
const path = require('path');

dotenv.config();

// Braintree setup
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Multer setup for local uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Create Car with local images
const createCar = async (req, res) => {
    try {
        const {
            name, description, brand, price, fuelType,
            transmission, engineSize, mileage, safetyrating,
            warranty, seater, size, fuelTank
        } = req.body;

        const requiredFields = [
            'name', 'description', 'brand', 'price', 'fuelType', 'transmission',
            'engineSize', 'mileage', 'safetyrating', 'warranty', 'seater', 'size', 'fuelTank'
        ];

        for (let field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).send({ success: false, message: `${field} is required` });
            }
        }

        // Store local file paths
        const uploadedFiles = req.files.map(file => file.filename);

        const slug = slugify(name);

        const car = new carModel({
            name,
            slug,
            description,
            brand,
            productPictures: uploadedFiles,
            price,
            fuelType,
            transmission,
            engineSize,
            mileage,
            safetyrating,
            warranty,
            seater,
            size,
            fuelTank
        });

        await car.save();

        // Associate car with brand
        const category = await brandModel.findById(brand);
        category.carInvoleInThisBrand.push(car);
        await category.save();

        res.status(201).send({
            success: true,
            message: 'Car created successfully',
            car
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: "Error in creating car",
            error: err.message
        });
    }
};

// Get all cars
const getAllCar = async (req, res) => {
    try {
        const cars = await carModel.find({}).populate('brand');
        res.status(200).send({
            success: true,
            totalCar: cars.length,
            message: "All cars",
            cars
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Error in getting cars",
            error: err.message
        });
    }
};

// Get single car by slug
const getCarById = async (req, res) => {
    try {
        const car = await carModel.findOne({ slug: req.params.slug }).populate('brand');

        res.status(200).send({
            success: true,
            message: "Car by this ID",
            car
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Error in finding car",
            err
        });
    }
};

// Delete a car and its local images
const deleteCar = async (req, res) => {
    try {
        const carDoc = await carModel.findById(req.params.pid);
        try {
            for (const imagePath of carDoc.productPictures) {
                fs.unlink(path.resolve(imagePath), (err) => {
                    if (err) {
                        console.error("Error deleting image:", err);
                    }
                });
            }
        } catch (e) {
            console.log("Delete: " + e);
        }
        await carModel.findByIdAndDelete(req.params.pid);
        res.status(200).send({
            success: true,
            message: "Car deleted successfully"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Error in deleting car",
            err
        });
    }
};

// Update car (text fields only)
const updatecar = async (req, res) => {
    try {
        const {
            name, description, fuelType, transmission,
            engineSize, mileage, safetyrating, warranty,
            seater, size, fuelTank, price
        } = req.fields;

        switch (true) {
            case !name: return res.send({ message: "Name is required" });
            case !description: return res.send({ message: "Description is required" });
            case !price: return res.send({ message: "Price is required" });
            case !fuelType: return res.send({ message: "FuelType is required" });
            case !transmission: return res.send({ message: "Transmission is required" });
            case !engineSize: return res.send({ message: "EngineSize is required" });
            case !mileage: return res.send({ message: "Mileage is required" });
            case !safetyrating: return res.send({ message: "Safetyrating is required" });
            case !warranty: return res.send({ message: "Warranty is required" });
            case !seater: return res.send({ message: "Seater is required" });
            case !size: return res.send({ message: "Size is required" });
            case !fuelTank: return res.send({ message: "Fuel Tank is required" });
        }

        const car = await carModel.findByIdAndUpdate(
            req.params.pid,
            { ...req.fields, slug: slugify(name) },
            { new: true }
        );

        res.status(201).send({
            success: true,
            message: 'Car updated successfully',
            car
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: "Error in updating car",
            err
        });
    }
};

// Related cars by brand
const relatedCar = async (req, res) => {
    try {
        const { cid, bid } = req.params;
        const cars = await carModel.find({
            brand: bid,
            _id: { $ne: cid }
        }).populate('brand');

        res.status(200).send({
            success: true,
            message: 'Related cars for this brand',
            cars
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: "Error while fetching related cars",
            err
        });
    }
};

// Braintree token
const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(response);
            }
        });
    } catch (error) {
        console.log(error);
    }
};

// Braintree payment
const brainTreePaymentController = async (req, res) => {
    try {
        const { nonce, cart } = req.body;
        let total = 0;
        cart.map((i) => {
            total += i.price;
        });

        gateway.transaction.sale(
            {
                amount: total,
                paymentMethodNonce: nonce,
                options: {
                    submitForSettlement: true,
                },
            },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id,
                    }).save();
                    res.json({ ok: true });
                } else {
                    res.status(500).send(error);
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    upload,
    createCar,
    getAllCar,
    getCarById,
    deleteCar,
    updatecar,
    relatedCar,
    braintreeTokenController,
    brainTreePaymentController
};
