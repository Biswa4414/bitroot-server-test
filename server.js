const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Contact = require("./model/contact");
const fs = require("fs");
const json2csv = require("json2csv").Parser;
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use(express.json());

// Multer configuration for file upload (optional)
const upload = multer({ dest: "uploads/" });

// Create new contact
app.post("/contacts", upload.single("image"), async (req, res) => {
  try {
    // Check for duplicate phone numbers
    const existingContact = await Contact.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (existingContact) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number already exists" });
    }

    const contact = new Contact({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      image: req.file ? req.file.path : null,
    });

    await contact.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Contact created successfully",
        data: contact,
      });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Fetch all contacts
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update contact
app.put("/contacts/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Contact updated successfully",
        data: contact,
      });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Delete contact
app.delete("/contacts/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Search contacts by name or phone number
app.get("/contacts/search", async (req, res) => {
  try {
    const query = req.query.q;
    const contacts = await Contact.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Case-insensitive search by name
        { phoneNumber: { $regex: query, $options: "i" } }, // Case-insensitive search by phone number
      ],
    });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error searching contacts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Export contacts to CSV
app.get("/contacts/export/csv", async (req, res) => {
  try {
    const fields = ["name", "phoneNumber"];
    const contacts = await Contact.find({}, { _id: 0, __v: 0 });
    const json2csvParser = new json2csv({ fields });
    const csvData = json2csvParser.parse(contacts);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
    res.status(200).send(csvData);
  } catch (error) {
    console.error("Error exporting contacts to CSV:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
