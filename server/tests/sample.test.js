
const request = require('supertest');
const mongoose = require('mongoose');
jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());
const app = require('../server');

// Mock Admin model and jwt for login test
jest.mock('../models/Admin', () => {
  return {
    findOne: jest.fn()
  };
});
const Admin = require('../models/Admin');
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
  Shipment.findByIdAndUpdate = jest.fn();
  Shipment.__saveMock = saveMock;
  return Shipment;
});
const Shipment = require('../models/Shipment');

describe('Sample API Test', () => {
  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});

describe('Admin Login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 for invalid credentials', async () => {
    Admin.findOne.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return token for valid credentials', async () => {
    const fakeAdmin = { _id: '123', username: 'admin', password: 'hashedpass' };
    Admin.findOne.mockResolvedValue(fakeAdmin);
    // Mock bcrypt.compare to return true
    jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'correctpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('fake-jwt-token');
  });
});


describe('Shipment API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a shipment by tracking number', async () => {
    const fakeShipment = { trackingNumber: 'ABC123', status: 'In Transit', location: 'Delhi' };
    Shipment.findOne.mockResolvedValue(fakeShipment);
    const res = await request(app).get('/api/shipments/ABC123');
    expect(res.statusCode).toBe(200);
    expect(res.body.trackingNumber).toBe('ABC123');
  });

  it('should return 404 if shipment not found', async () => {
    Shipment.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/shipments/NOTFOUND');
    expect(res.statusCode).toBe(404);
    // Accept empty object or message property
    expect(res.body.message === 'Shipment not found' || Object.keys(res.body).length === 0).toBe(true);
  });

  it('should add a new shipment', async () => {
    Shipment.__saveMock.mockResolvedValueOnce();
    const res = await request(app)
      .post('/api/shipments')
      .send({ trackingNumber: 'NEW123', status: 'Created', location: 'Mumbai' });
    expect(res.statusCode).toBe(201);
    expect(res.body.trackingNumber).toBe('NEW123');
  });

  it('should update a shipment', async () => {
    const updatedShipment = { trackingNumber: 'ABC123', status: 'Delivered', location: 'Pune', updates: [] };
    Shipment.findOne.mockResolvedValue(updatedShipment);
    updatedShipment.save = jest.fn().mockResolvedValue(updatedShipment);
    const res = await request(app)
      .post('/api/shipments/ABC123/updates')
      .send({ status: 'Delivered', updateData: { date: '2025-09-21', time: '10:00', location: 'Pune', status: 'Delivered' } });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Shipment updated successfully');
    expect(res.body.shipment.status).toBe('Delivered');
  });
});
