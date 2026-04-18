let users = [];
let idCounter = 1;

class User {
  constructor(data) {
    this._id = String(idCounter++);
    this.username = data.username;
    this.password = data.password; // In a real app, hash this password!
    this.createdAt = new Date();
  }

  async save() {
    users.push(this);
    return this;
  }

  static async findByUsername(username) {
    return users.find((u) => u.username === username) || null;
  }
  
  static async findById(id) {
    return users.find((u) => u._id === id) || null;
  }

  static async clear() {
      users = [];
      idCounter = 1;
  }
}

// Add the default admin user so existing tests/usage works
const adminUser = new User({ username: 'admin', password: '1234' });
users.push(adminUser);

module.exports = User;
