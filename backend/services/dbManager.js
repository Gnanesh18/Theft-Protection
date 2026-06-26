const mongoose = require('mongoose');
const localDb = require('./localDb');
const User = require('../models/User');
const Case = require('../models/Case');
const Notification = require('../models/Notification');

let isMongoConnected = false;

const setMongoConnected = (connected) => {
  isMongoConnected = connected;
  console.log(`Database Manager: Switched to ${connected ? 'MongoDB Atlas' : 'Local JSON File DB'}`);
};

const getMongoStatus = () => isMongoConnected;

const users = {
  find: async (query = {}) => {
    if (isMongoConnected) {
      return await User.find(query).select('-password').lean();
    }
    return await localDb.users.find(query);
  },
  findOne: async (query = {}) => {
    if (isMongoConnected) {
      return await User.findOne(query).lean();
    }
    return await localDb.users.findOne(query);
  },
  findById: async (id) => {
    if (isMongoConnected) {
      return await User.findById(id).select('-password').lean();
    }
    return await localDb.users.findById(id);
  },
  create: async (userData) => {
    if (isMongoConnected) {
      const newUser = new User(userData);
      const saved = await newUser.save();
      const obj = saved.toObject();
      delete obj.password;
      return obj;
    }
    return await localDb.users.create(userData);
  },
  findByIdAndUpdate: async (id, updateData) => {
    if (isMongoConnected) {
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password').lean();
    }
    return await localDb.users.findByIdAndUpdate(id, updateData);
  },
  findByIdAndDelete: async (id) => {
    if (isMongoConnected) {
      return await User.findByIdAndDelete(id).lean();
    }
    return await localDb.users.findByIdAndDelete(id);
  }
};

const cases = {
  find: async (query = {}) => {
    if (isMongoConnected) {
      return await Case.find(query).sort({ createdAt: -1 }).lean();
    }
    return await localDb.cases.find(query);
  },
  findOne: async (query = {}) => {
    if (isMongoConnected) {
      return await Case.findOne(query).lean();
    }
    return await localDb.cases.findOne(query);
  },
  findById: async (id) => {
    if (isMongoConnected) {
      return await Case.findById(id).lean();
    }
    return await localDb.cases.findById(id);
  },
  create: async (caseData) => {
    if (isMongoConnected) {
      const newCase = new Case(caseData);
      const saved = await newCase.save();
      return saved.toObject();
    }
    return await localDb.cases.create(caseData);
  },
  findByIdAndUpdate: async (id, updateData) => {
    if (isMongoConnected) {
      return await Case.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    }
    return await localDb.cases.findByIdAndUpdate(id, updateData);
  }
};

const notifications = {
  find: async (query = {}) => {
    if (isMongoConnected) {
      return await Notification.find(query).sort({ createdAt: -1 }).lean();
    }
    return await localDb.notifications.find(query);
  },
  create: async (notifyData) => {
    if (isMongoConnected) {
      const newNotification = new Notification(notifyData);
      const saved = await newNotification.save();
      return saved.toObject();
    }
    return await localDb.notifications.create(notifyData);
  },
  updateMany: async (query = {}, updateData = {}) => {
    if (isMongoConnected) {
      const result = await Notification.updateMany(query, { $set: updateData });
      return { modifiedCount: result.modifiedCount };
    }
    return await localDb.notifications.updateMany(query, updateData);
  }
};

const SystemLog = require('../models/SystemLog');

const systemLogs = {
  find: async (query = {}) => {
    if (isMongoConnected) {
      return await SystemLog.find(query).sort({ createdAt: -1 }).lean();
    }
    return await localDb.systemLogs.find(query);
  },
  create: async (logData) => {
    if (isMongoConnected) {
      const newLog = new SystemLog(logData);
      const saved = await newLog.save();
      return saved.toObject();
    }
    return await localDb.systemLogs.create(logData);
  }
};

module.exports = {
  setMongoConnected,
  getMongoStatus,
  users,
  cases,
  notifications,
  systemLogs
};
