const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error(`Error reading database file for ${collection}:`, error);
    return [];
  }
};

const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing database file for ${collection}:`, error);
  }
};

// Seed default Admin, Officer, and Citizen if users.json is empty
const seedInitialUsers = () => {
  const users = readData('users');
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin', salt);

  let needsWrite = false;
  let admin = users.find(u => u.role === 'admin');

  if (!admin) {
    users.push({
      _id: 'admin-id-1',
      name: 'Command Admin',
      email: 'admin',
      password: adminPassword,
      role: 'admin',
      phoneNumber: '911-000-0001',
      isActive: true,
      createdAt: new Date().toISOString()
    });
    needsWrite = true;
    console.log('LocalDB: Admin user seeded.');
  } else {
    // Verify admin credentials
    if (admin.email !== 'admin' || !bcrypt.compareSync('admin', admin.password)) {
      admin.email = 'admin';
      admin.password = adminPassword;
      needsWrite = true;
      console.log('LocalDB: Admin credentials updated.');
    }
  }

  if (needsWrite) {
    writeData('users', users);
    console.log('LocalDB: Persistent mode active. No data cleared.');
  }
};

// Seed initial reports if empty
const seedInitialCases = () => {
  // Deprecated/Removed to keep database clean and empty
};

const localDb = {
  users: {
    find: async (query = {}) => {
      const users = readData('users');
      return users.filter(user => {
        for (let key in query) {
          if (user[key] !== query[key]) return false;
        }
        return true;
      });
    },
    findOne: async (query = {}) => {
      const users = readData('users');
      return users.find(user => {
        for (let key in query) {
          if (user[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    findById: async (id) => {
      const users = readData('users');
      return users.find(u => u._id === id) || null;
    },
    create: async (userData) => {
      const users = readData('users');
      const newUser = {
        _id: uuidv4(),
        createdAt: new Date().toISOString(),
        isActive: true,
        ...userData
      };
      users.push(newUser);
      writeData('users', users);
      return newUser;
    },
    findByIdAndUpdate: async (id, updateData) => {
      const users = readData('users');
      const idx = users.findIndex(u => u._id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updateData };
      writeData('users', users);
      return users[idx];
    },
    findByIdAndDelete: async (id) => {
      const users = readData('users');
      const idx = users.findIndex(u => u._id === id);
      if (idx === -1) return null;
      const deletedUser = users[idx];
      const updatedUsers = users.filter(u => u._id !== id);
      writeData('users', updatedUsers);
      return deletedUser;
    }
  },

  cases: {
    find: async (query = {}) => {
      let cases = readData('cases');
      return cases.filter(c => {
        for (let key in query) {
          if (query[key] && typeof query[key] === 'object' && query[key]._id) {
            // Support matching ID objects
            if (!c[key] || c[key]._id !== query[key]._id) return false;
          } else if (key === 'citizen._id') {
            if (!c.citizen || c.citizen._id !== query[key]) return false;
          } else if (key === 'assignedOfficer._id') {
            if (!c.assignedOfficer || c.assignedOfficer._id !== query[key]) return false;
          } else if (key === 'assignedOfficer') {
            // Checking for null
            if (query[key] === null && c.assignedOfficer !== null) return false;
          } else if (c[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    },
    findOne: async (query = {}) => {
      const cases = readData('cases');
      return cases.find(c => {
        for (let key in query) {
          if (c[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    findById: async (id) => {
      const cases = readData('cases');
      return cases.find(c => c._id === id) || null;
    },
    create: async (caseData) => {
      const cases = readData('cases');
      const newCase = {
        _id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        officerNotes: [],
        timeline: [],
        ...caseData
      };
      cases.push(newCase);
      writeData('cases', cases);
      return newCase;
    },
    findByIdAndUpdate: async (id, updateData) => {
      const cases = readData('cases');
      const idx = cases.findIndex(c => c._id === id);
      if (idx === -1) return null;
      
      // Handle nested structures properly if they exist in updates
      const updatedCase = {
        ...cases[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      cases[idx] = updatedCase;
      writeData('cases', cases);
      return updatedCase;
    }
  },

  notifications: {
    find: async (query = {}) => {
      const notifications = readData('notifications');
      return notifications.filter(n => {
        for (let key in query) {
          if (n[key] !== query[key]) return false;
        }
        return true;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (notifyData) => {
      const notifications = readData('notifications');
      const newNotification = {
        _id: uuidv4(),
        isRead: false,
        createdAt: new Date().toISOString(),
        ...notifyData
      };
      notifications.push(newNotification);
      writeData('notifications', notifications);
      return newNotification;
    },
    updateMany: async (query = {}, updateData = {}) => {
      const notifications = readData('notifications');
      let modifiedCount = 0;
      const updated = notifications.map(n => {
        let matches = true;
        for (let key in query) {
          if (n[key] !== query[key]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          modifiedCount++;
          return { ...n, ...updateData };
        }
        return n;
      });
      writeData('notifications', updated);
      return { modifiedCount };
    }
  },
  systemLogs: {
    find: async (query = {}) => {
      const logs = readData('system_logs');
      return logs.filter(l => {
        for (let key in query) {
          if (l[key] !== query[key]) return false;
        }
        return true;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (logData) => {
      const logs = readData('system_logs');
      const newLog = {
        _id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...logData
      };
      logs.push(newLog);
      writeData('system_logs', logs);
      return newLog;
    }
  }
};

// Initialize seeds
seedInitialUsers();
seedInitialCases();

module.exports = localDb;
