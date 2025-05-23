import Tourist from "../models/tourist.model.js";
import Username from "../models/username.model.js";
import Email from "../models/email.model.js";
import Notification from "../models/notification.model.js";
import TouristActivityNotification from "../models/touristActivityNotification.model.js";
import bcrypt from "bcrypt";
import { assignCookies } from "./general.controller.js";
import Admin from "../models/admin.model.js";
import Complaint from "../models/complaint.model.js";
import Comment from "../models/comment.model.js";
import Booking from "../models/booking.model.js";
import TouristBookmark from "../models/touristBookmark.model.js";
import TouristWishlist from "../models/touristWishlist.model.js";
import TouristCart from "../models/touristCart.model.js";
import Order from "../models/order.model.js";

export const getTourists = async (req, res) => {
    try {
        const tourguides = await Tourist.find(req.body);
        res.json(tourguides);
    } catch (e) {
        res.json(e.message);
        //console.log(e.message);
    }
};

export const getTouristById = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(404).json({ e: "ID not found" });
        }

        const tourist = await Tourist.findById(userId);

        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }

        const age = tourist.age;
        const {
            cart,
            preferences,
            wishlist,
            deliveryAddresses,
            createdAt,
            updatedAt,
            __v,
            DOB,
            ...other
        } = tourist._doc;

        console.log(other);
        res.status(200).json({ ...other, age, preferences });
    } catch (e) {
        console.error(e.message); // Log the error for debugging
        res.status(400).json({ e: e.message });
    }
};

export const createTourist = async (req, res) => {
    console.log(req.body);
    const inputUsername = req.body.username;
    const inputEmail = req.body.email;
    const username = await Username.findById(inputUsername);
    const email = await Email.findById(inputEmail);
    try {
        if (!username && !email) {
            const newUsername = await Username.create({
                _id: inputUsername,
                userType: "Tourist",
            });
            const newEmail = await Email.create({
                _id: inputEmail,
            });

            // hashing password 10 times
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            const { address, ...body } = req.body;
            const newTourist = await Tourist.create(body);
            res.status(201).json({ message: "Sign up successful", user: newTourist });
        } else {
            if (username) {
                res.status(400).json({ e: "Username already exists" });
            } else {
                res.status(400).json({ e: "Email already exists" });
            }
        }
    } catch (e) {
        await Username.findByIdAndDelete(inputUsername);
        await Email.findByIdAndDelete(inputEmail);
        res.status(400).json({ e: e.message });
    }
};

export const updateTourist = async (req, res) => {
    try {
        let ID = req.user.userId;
        const admin = await Admin.findById(req.user.userId);
        if (admin) {
            ID = req.query.userId; // Admin can update any tourist
        }

        const tourist = await Tourist.findById(ID);
        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }

        if (req.body.email) {
            // Check if the email already exists
            const existingEmail = await Email.findById(req.body.email);
            if (existingEmail) {
                return res.status(400).json({ e: "Email already exists." });
            }

            // Proceed to update the email
            await Email.findByIdAndDelete(tourist.email); // Remove the old email
            try {
                await Email.create({
                    _id: req.body.email, // Create the new email
                });
            } catch (e) {
                await Email.create({
                    _id: tourist.email,
                });
                res.status(400).json({ e: e.message });
            }
        }

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10); // Hash the new password
        }

        const touristUpdated = await Tourist.findByIdAndUpdate(ID, req.body, {
            new: true,
        });

        res.cookie("currency", touristUpdated.currency, {
            maxAge: 60 * 60 * 24 * 1000,
        })
            .cookie("email", touristUpdated.email, {
                maxAge: 60 * 60 * 24 * 1000,
            })
            .status(200)
            .json({ message: "Tourist updated", tourist: touristUpdated });
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
};

export const deleteTourist = async (req, res) => {
    try {
        let touristID = req.user.userId;
        const admin = await Admin.findById(req.user.userId);
        if (admin) {
            touristID = req.query.userId;
        }
        const currentTourist = await Tourist.findById(touristID);

        // Check for bookings first
        if (currentTourist) {
            const hasBookings =
                (await Booking.find({
                    touristID: touristID,
                    eventStartDate: { $gt: new Date() },
                }).countDocuments()) > 0;
            if (hasBookings) {
                return res.status(400).json({
                    message: "Cannot delete a tourist account with upcoming bookings",
                });
            }

            const hasOrders =
                (await Order.find({
                    buyer: touristID,
                    status: "pending",
                }).countDocuments()) > 0;

            if (hasOrders) {
                return res.status(400).json({
                    message: "Cannot delete a tourist account with pending orders",
                });
            }
        }

        // If current tourist doesn't exist, check if the user is an admin
        const ID = touristID;

        const tourist = await Tourist.findByIdAndDelete(ID);
        if (tourist) {
            await Username.findByIdAndDelete(tourist.username);
            await Email.findByIdAndDelete(tourist.email);

            // Delete notifications
            if (tourist.notifications && tourist.notifications.length > 0) {
                await Promise.all(
                    tourist.notifications.map((notificationId) =>
                        Notification.findByIdAndDelete(notificationId)
                    )
                );
            }

            // Delete complaints
            const complaints = await Complaint.find({
                touristID: tourist._id,
            });

            for (let complaint of complaints) {
                for (let comment of complaint.replies) {
                    await deleteComplaintComments(comment);
                }
                await Complaint.findByIdAndDelete(complaint._id);
            }

            await TouristWishlist.deleteMany({
                touristID: tourist._id,
            });

            await TouristBookmark.deleteMany({
                touristID: tourist._id,
            });

            await TouristCart.deleteMany({
                touristID: tourist._id,
            });

            // Delete related tourist activity notifications
            await TouristActivityNotification.deleteMany({
                touristID: tourist._id,
            });

            return res.status(200).json({
                message: "Tourist deleted successfully",
            });
        } else {
            return res.status(404).json({ message: "Tourist not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message }); // Use 500 for internal server errors
    }
};

const deleteComplaintComments = async (commentId) => {
    const comment = await Comment.findById(commentId);
    for (let reply of comment.replies) {
        deleteComplaintComments(reply);
    }
    await Comment.findByIdAndDelete(commentId);
};

export const redeemPoints = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.user.userId);
        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }
        const { points } = req.body;
        if (points < 0 || points > (tourist.loyalityPoints || 0)) {
            return res.status(400).json({ e: "Not enough points" });
        }

        // Assuming the conversion is 10000 points = $100
        const cashValue = (points / 10000) * 100;

        tourist.loyalityPoints -= points; // Deducting points
        tourist.wallet += cashValue; // Adding cash value to the wallet
        await tourist.save(); // Save the updated tourist details

        res.status(200).json({
            message: "Points redeemed successfully",
            cashValue,
        });
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
};

export const addPreference = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.user.userId);
        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }
        const { preference } = req.body;
        if (!preference) {
            return res.status(400).json({ e: "Preference is required" }); // Check for missing preference
        }
        if (tourist.preferences.includes(preference)) {
            return res.status(400).json({ e: "Preference already exists" });
        }
        tourist.preferences.push(preference);
        await tourist.save();
        res.status(200).json({ message: "Preference added successfully" });
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
};
// I want a function to get the wishlist of a tourist
export const getWishlist = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.user.userId);
        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }

        res.status(200).json({ wishlist: tourist.wishlist });
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.user.userId);
        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }
        const { item } = req.body;
        if (!item) {
            return res.status(400).json({ e: "Item is required" });
        }
        if (tourist.wishlist.includes(item)) {
            return res.status(400).json({ e: "Item already exists in wishlist" });
        }
        tourist.wishlist.push(item);
        await tourist.save();
        res.status(200).json({
            message: "Item added to wishlist successfully",
        });
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
};
export const removeFromWishlist = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.user.userId);
        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }
        const { item } = req.body;
        const index = tourist.wishlist.indexOf(item);
        if (index === -1) {
            return res.status(400).json({ e: "Item does not exist in wishlist" });
        }
        tourist.wishlist.splice(index, 1);
        await tourist.save();
        res.status(200).json({
            message: "Item removed from wishlist successfully",
        });
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
};

export const removePreference = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.user.userId);
        if (!tourist) {
            return res.status(404).json({ e: "Tourist not found" });
        }
        const { preference } = req.body;
        const index = tourist.preferences.indexOf(preference);
        if (index === -1) {
            return res.status(400).json({ e: "Preference does not exist" });
        }
        tourist.preferences.splice(index, 1);
        await tourist.save();
        res.status(200).json({ message: "Preference removed successfully" });
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
};

export const changeTouristPassword = async (req, res) => {
    const touristId = req.user.userId; // Assuming userId is stored in the req.user object after authentication
    const { oldPassword, newPassword } = req.body;

    try {
        // Validate the input fields
        if (!oldPassword || !newPassword) {
            return res.status(400).json("Both old and new passwords are required");
        }

        // Find the tourist by ID
        const tourist = await Tourist.findById(touristId);
        if (!tourist) {
            return res.status(404).json("Tourist not found");
        }

        // Check if the old password matches
        const isMatch = await bcrypt.compare(oldPassword, tourist.password);
        if (!isMatch) {
            return res.status(400).json("Incorrect old password");
        }

        // Update the password
        tourist.password = await bcrypt.hash(newPassword, 10);
        await tourist.save();

        // Return success response
        return res.status(200).json("Password changed successfully!");
    } catch (err) {
        console.error("Error changing password:", err);
        return res.status(500).json("An error occurred while changing the password");
    }
};
