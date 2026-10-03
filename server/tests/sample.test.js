const request = require('supertest');
const mongoose = require('mongoose');
jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());
const app = require('../server');

// Mock User model for login tests
jest.mock('../models/User', () => {
  return {
    findOne: jest.fn()
  };
});
const User = require('../models/User');
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

// Mock Shipment model with constructor and static methods (all inside factory)
jest.mock('../models/Shipment', () => {
  const saveMock = jest.fn();
  function Shipment(data) {
    Object.assign(this, data);
    this.save = saveMock;
  }
  Shipment.findOne = jest.fn();
  Shipment.find = jest.fn();
  Shipment.countDocuments = jest.fn();
  Shipment.aggregate = jest.fn();
  Shipment.findOneAndDelete = jest.fn();
  Shipment.__saveMock = saveMock;
  return Shipment;
});
const Shipment = require('../models/Shipment');

const authorize = () => jwt.verify.mockReturnValue({ id: '123' });

// Mimics a mongoose query chain: find().sort().skip().limit()
const mockFindChain = (result) => {
  const chain = {
    sort: jest.fn(() => chain),
    skip: jest.fn(() => chain),
    limit: jest.fn(() => Promise.resolve(result)),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  Shipment.find.mockReturnValue(chain);
  return chain;
};

afterEach(() => {
  jest.clearAllMocks();
  Shipment.findOne.mockReset();
});

describe('Sample API Test', () => {
  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});

describe('Auth Login', () => {
  it('should return 401 for invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return token for valid credentials', async () => {
    User.findOne.mockResolvedValue({ _id: '123', comparePassword: jest.fn().mockResolvedValue(true) });
    jwt.sign.mockReturnValue('fake-jwt-token');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'correctpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('fake-jwt-token');
  });
});

describe('Shipment API', () => {
  it('should fetch a shipment by tracking number', async () => {
    const fakeShipment = { trackingNumber: 'ABC123', status: 'in transit', location: 'Delhi' };
    Shipment.findOne.mockResolvedValue(fakeShipment);
    const res = await request(app).get('/api/shipments/abc123');
    expect(res.statusCode).toBe(200);
    expect(res.body.trackingNumber).toBe('ABC123');
    expect(Shipment.findOne).toHaveBeenCalledWith({ trackingNumber: 'ABC123' });
  });

  it('should fall back to a case-insensitive match for legacy tracking numbers', async () => {
    Shipment.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ trackingNumber: 'abc123', status: 'delivered', location: 'Pune' });
    const res = await request(app).get('/api/shipments/ABC123');
    expect(res.statusCode).toBe(200);
    expect(res.body.trackingNumber).toBe('abc123');
  });

  it('should return 404 if shipment not found', async () => {
    Shipment.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/shipments/NOTFOUND');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Shipment not found');
  });

  it('should add a new shipment with a normalized tracking number and initial timeline entry', async () => {
    Shipment.findOne.mockResolvedValue(null);
    Shipment.__saveMock.mockResolvedValueOnce();
    authorize();
    const res = await request(app)
      .post('/api/shipments')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send({ trackingNumber: ' new123 ', status: 'Processing', location: 'Mumbai' });
    expect(res.statusCode).toBe(201);
    expect(res.body.trackingNumber).toBe('NEW123');
    expect(res.body.status).toBe('processing');
    expect(res.body.updates).toHaveLength(1);
    expect(res.body.updates[0]).toMatchObject({ status: 'processing', location: 'Mumbai' });
  });

  it('should reject a duplicate tracking number with 409', async () => {
    Shipment.findOne.mockResolvedValue({ trackingNumber: 'NEW123' });
    authorize();
    const res = await request(app)
      .post('/api/shipments')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send({ trackingNumber: 'NEW123', status: 'processing', location: 'Mumbai' });
    expect(res.statusCode).toBe(409);
    expect(Shipment.__saveMock).not.toHaveBeenCalled();
  });

  it('should reject an unknown status', async () => {
    authorize();
    const res = await request(app)
      .post('/api/shipments')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send({ trackingNumber: 'NEW123', status: 'teleported', location: 'Mumbai' });
    expect(res.statusCode).toBe(400);
  });

  it('should update status AND current location from the new event', async () => {
    const shipment = {
      trackingNumber: 'ABC123',
      status: 'in transit',
      location: 'Indore',
      updates: [{ date: new Date('2025-09-20T10:00:00Z'), location: 'Indore', status: 'in transit' }],
    };
    shipment.save = jest.fn().mockResolvedValue(shipment);
    Shipment.findOne.mockResolvedValue(shipment);
    authorize();
    const res = await request(app)
      .post('/api/shipments/ABC123/updates')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send({ status: 'Delivered', updateData: { date: '2025-09-21T10:00:00Z', location: 'Pune', remarks: 'Signed by owner' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Shipment updated successfully');
    expect(res.body.shipment.status).toBe('delivered');
    expect(res.body.shipment.location).toBe('Pune');
    expect(shipment.updates).toHaveLength(2);
    expect(shipment.updates[1]).toMatchObject({ status: 'delivered', location: 'Pune', remarks: 'Signed by owner' });
  });

  it('should not overwrite current status/location with a back-dated event', async () => {
    const shipment = {
      trackingNumber: 'ABC123',
      status: 'delivered',
      location: 'Pune',
      updates: [{ date: new Date('2025-09-21T10:00:00Z'), location: 'Pune', status: 'delivered' }],
    };
    shipment.save = jest.fn().mockResolvedValue(shipment);
    Shipment.findOne.mockResolvedValue(shipment);
    authorize();
    const res = await request(app)
      .post('/api/shipments/ABC123/updates')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send({ status: 'in transit', updateData: { date: '2025-09-19T10:00:00Z', location: 'Bhopal' } });
    expect(res.statusCode).toBe(200);
    expect(shipment.status).toBe('delivered');
    expect(shipment.location).toBe('Pune');
    expect(shipment.updates).toHaveLength(2);
  });

  it('should reject updates dated in the future', async () => {
    authorize();
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post('/api/shipments/ABC123/updates')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send({ status: 'delivered', updateData: { date: future, location: 'Pune' } });
    expect(res.statusCode).toBe(400);
  });

  it('should reject shipment updates without a token', async () => {
    const res = await request(app)
      .post('/api/shipments/ABC123/updates')
      .send({ status: 'Delivered' });
    expect(res.statusCode).toBe(401);
    expect(Shipment.findOne).not.toHaveBeenCalled();
  });
});

describe('Admin shipment routes', () => {
  it('should reject listing shipments without a token', async () => {
    const res = await request(app).get('/api/admin/shipments');
    expect(res.statusCode).toBe(401);
    expect(Shipment.find).not.toHaveBeenCalled();
  });

  it('should reject deleting a shipment without a token', async () => {
    const res = await request(app).delete('/api/admin/shipments/ABC123');
    expect(res.statusCode).toBe(401);
    expect(Shipment.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('should paginate with validated params and return the total', async () => {
    authorize();
    Shipment.countDocuments.mockResolvedValue(42);
    const chain = mockFindChain([{ trackingNumber: 'A' }]);
    const res = await request(app)
      .get('/api/admin/shipments?page=abc&limit=xyz&q=a.b&status=In Transit')
      .set('Authorization', 'Bearer fake-jwt-token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ total: 42, page: 1, limit: 10 });
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(10);
    expect(Shipment.find).toHaveBeenCalledWith({
      trackingNumber: { $regex: 'a\\.b', $options: 'i' },
      status: { $regex: '^in transit$', $options: 'i' },
    });
  });

  it('should cap the page size', async () => {
    authorize();
    Shipment.countDocuments.mockResolvedValue(0);
    const chain = mockFindChain([]);
    await request(app)
      .get('/api/admin/shipments?limit=100000')
      .set('Authorization', 'Bearer fake-jwt-token');
    expect(chain.limit).toHaveBeenCalledWith(100);
  });

  it('should return per-status stats', async () => {
    authorize();
    Shipment.aggregate.mockResolvedValue([
      { _id: 'delivered', count: 3 },
      { _id: 'in transit', count: 2 },
    ]);
    const res = await request(app)
      .get('/api/admin/shipments/stats')
      .set('Authorization', 'Bearer fake-jwt-token');
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.byStatus).toMatchObject({ delivered: 3, 'in transit': 2, delayed: 0 });
  });
});

describe('Update ordering', () => {
  it('treats an update in the same minute as the creation event as the latest', async () => {
    const shipment = {
      trackingNumber: 'ABC123',
      status: 'processing',
      location: 'Indore',
      updates: [{ date: new Date('2025-09-21T10:03:32Z'), location: 'Indore', status: 'processing' }],
    };
    shipment.save = jest.fn().mockResolvedValue(shipment);
    Shipment.findOne.mockResolvedValue(shipment);
    authorize();
    const res = await request(app)
      .post('/api/shipments/ABC123/updates')
      .set('Authorization', 'Bearer fake-jwt-token')
      .send({ status: 'picked up', updateData: { date: '2025-09-21T10:03:00Z', location: 'Indore Hub' } });
    expect(res.statusCode).toBe(200);
    expect(shipment.status).toBe('picked up');
    expect(shipment.location).toBe('Indore Hub');
  });
});
