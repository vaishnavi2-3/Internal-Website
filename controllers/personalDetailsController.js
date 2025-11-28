const PersonalDetails = require("../models/personalDetails");
const { blobServiceClient, containerName } = require("../config/azureBlob");

// Upload to Azure
async function uploadToAzure(fileBuffer, originalname, mimetype) {
  try {
    if (!fileBuffer) return null;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    const blobName = Date.now() + "-" + originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimetype },
    });

    return {
      filename: originalname,
      path: blockBlobClient.url,
      mimetype,
      size: fileBuffer.length,
    };
  } catch (err) {
    console.error("❌ Azure upload failed:", err.message);
    return null;
  }
}

// 🌟 Save / Update Personal Details
exports.savePersonalDetails = async (req, res) => {
  try {
    const emailFromToken = req.user.email;
    const body = req.body;

    // Store official email
    body.officialEmail = emailFromToken;

    // Convert isMarried to boolean
    body.isMarried =
      body.isMarried === "true" || body.isMarried === true ? true : false;
          if (body.sameAddress === "true" || body.sameAddress === true) {
      body.permanentAddress = body.currentAddress;
      body.landmarkPermanent = body.landmarkCurrent;
      body.pincodePermanent = body.pincodeCurrent;
      body.villagePermanent = body.villageCurrent;
      body.statePermanent = body.stateCurrent;
    }


    // Convert children array
if (body.children) {
  try {
    // Case 1 → JSON array like ["a","b"]
    if (body.children.trim().startsWith("[")) {
      body.children = JSON.parse(body.children);
    }
    // Case 2 → comma separated values: a,b,c
    else {
      body.children = body.children
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  } catch {
    body.children = [];
  }
}

    // Marriage certificate optional
// Marriage certificate optional
let marriageFile = null;

// If married and file uploaded → upload
if (body.isMarried && req.files?.marriageCertificate) {
  const f = req.files.marriageCertificate[0];
  marriageFile = await uploadToAzure(
    f.buffer,
    f.originalname,
    f.mimetype
  );
}

// If married and NO file → remove empty values
if (body.isMarried && !req.files?.marriageCertificate) {
  delete body.marriageCertificate;
}

// If not married → never store this field
if (!body.isMarried) {
  delete body.marriageCertificate;
}

    // Upload helper
    const getFileObj = async (field) => {
      if (!req.files?.[field]) return null;
      const f = req.files[field][0];
      return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
    };

    const photoFile = await getFileObj("photo");
    const aadharFile = await getFileObj("aadharUpload");
    const panFile = await getFileObj("panUpload");

    const data = {
      ...body,
      ...(photoFile && { photo: photoFile.path }),
      ...(aadharFile && { aadharUpload: aadharFile }),
      ...(panFile && { panUpload: panFile }),
      ...(marriageFile && { marriageCertificate: marriageFile }),
    };

    const updated = await PersonalDetails.findOneAndUpdate(
      { officialEmail: emailFromToken },
      data,
      { new: true, upsert: true }
    );

    res.status(200).json({
      msg: "✅ Personal details saved successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error saving personal details:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🌟 Get logged-in employee personal details
exports.getMyPersonalDetails = async (req, res) => {
  try {
    const emailFromToken = req.user.email;

    const record = await PersonalDetails.findOne({
      officialEmail: emailFromToken,
    });

    if (!record) {
      return res.status(404).json({ msg: "No personal details found" });
    }

    res.status(200).json({
      msg: "Personal details fetched successfully",
      data: record,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🌟 Admin: Get All Personal Details
exports.getAllPersonalDetails = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ msg: "Forbidden: admin access required" });
    }

    const allDetails = await PersonalDetails.find().sort({ createdAt: -1 });

    res.status(200).json({
      msg: "✅ All personal details fetched successfully",
      count: allDetails.length,
      data: allDetails,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 🌟 Fetch personal details by email
exports.getPersonalDetailsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const record = await PersonalDetails.findOne({
      officialEmail: email,
    });

    if (!record) {
      return res.status(404).json({ msg: "Personal details not found" });
    }

    res.status(200).json({
      msg: "Personal details fetched successfully",
      data: record,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
// 🌟 Update Personal Details (Full Update)
exports.updatePersonalDetails = async (req, res) => {
  try {
    const emailFromToken = req.user.email;
    let body = req.body;

    // Convert values
    body.isMarried = body.isMarried === "true" || body.isMarried === true;

    if (body.children) {
      try {
        body.children =
          typeof body.children === "string"
            ? JSON.parse(body.children)
            : body.children;
      } catch {
        body.children = [];
      }
    }

    // Helper to upload file
    const getFileObj = async (field) => {
      if (!req.files || !req.files[field] || !req.files[field][0]) return null;
      const f = req.files[field][0];
      return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
    };

    // Upload new files if provided
    const photoObj = await getFileObj("photo");
    const aadharObj = await getFileObj("aadharUpload");
    const panObj = await getFileObj("panUpload");
    const marriageObj = await getFileObj("marriageCertificate");

    // Build update data
    const updateData = { ...body };

    // Replace ONLY if new file uploaded
    if (photoObj) updateData.photo = photoObj.path;
    if (aadharObj) updateData.aadharUpload = aadharObj;
    if (panObj) updateData.panUpload = panObj;

    if (body.isMarried) {
      if (marriageObj) updateData.marriageCertificate = marriageObj;
    } else {
      delete updateData.marriageCertificate;
    }

    const updated = await PersonalDetails.findOneAndUpdate(
      { officialEmail: emailFromToken },
      updateData,
      { new: true }
    );

    res.status(200).json({
      msg: "Personal details updated successfully",
      data: updated,
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
// 🌟 Partial Update Personal Details
exports.partialUpdatePersonalDetails = async (req, res) => {
  try {
    const emailFromToken = req.user.email;
    let body = req.body;

    if (body.isMarried !== undefined) {
      body.isMarried =
        body.isMarried === "true" || body.isMarried === true;
    }

    if (body.children) {
      try {
        body.children =
          typeof body.children === "string"
            ? JSON.parse(body.children)
            : body.children;
      } catch {
        body.children = [];
      }
    }

    const getFileObj = async (field) => {
      if (!req.files || !req.files[field] || !req.files[field][0]) return null;
      const f = req.files[field][0];
      return await uploadToAzure(f.buffer, f.originalname, f.mimetype);
    };

    const update = { ...body };

    if (req.files?.photo) update.photo = (await getFileObj("photo")).path;
    if (req.files?.aadharUpload) update.aadharUpload = await getFileObj("aadharUpload");
    if (req.files?.panUpload) update.panUpload = await getFileObj("panUpload");
    if (req.files?.marriageCertificate) update.marriageCertificate = await getFileObj("marriageCertificate");

    const updated = await PersonalDetails.findOneAndUpdate(
      { officialEmail: emailFromToken },
      update,
      { new: true }
    );

    res.status(200).json({
      msg: "Personal details partially updated",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
// 🌟 Delete Personal Details
exports.deletePersonalDetails = async (req, res) => {
  try {
    const emailFromToken = req.user.email;

    await PersonalDetails.findOneAndDelete({
      officialEmail: emailFromToken,
    });

    res.status(200).json({
      msg: "Personal details deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
