import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { app } from './testServer.js'; // Import from testServer.js

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Mock JWT token generation
const token = jwt.sign({ username: 'testuser', tokenVersion: 1 }, JWT_SECRET);

const newPlay = {
    name: 'New Play',
    scenarios: []
};

const updatePlay = {
    name: 'Updated Play',
    scenarios: []
};

jest.mock('mongodb', () => {
    const mCollection = {
        find: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([
            { _id: '1', play: 'Play 1', scenarios: [] },
            { _id: '2', play: 'Play 2', scenarios: [] }
        ]),
        findOne: jest.fn().mockResolvedValue({ username: 'testuser', tokenVersion: 1 }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: '3' }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
    };
    const mDb = {
        collection: jest.fn(() => mCollection)
    };
    const mMongoClient = {
        connect: jest.fn(),
        db: jest.fn(() => mDb)
    };
    const mObjectId = jest.fn().mockImplementation(id => ({
        toString: () => id,
        isValid: true
    }));
    mObjectId.isValid = jest.fn().mockReturnValue(true);
    return {
        MongoClient: jest.fn(() => mMongoClient),
        ServerApiVersion: { v1: '1' },
        ObjectId: mObjectId
    };
});

jest.mock('jsonwebtoken', () => ({
    ...jest.requireActual('jsonwebtoken'), // Import actual methods
    verify: jest.fn(() => ({ username: 'testuser', tokenVersion: 1 })),
}));

describe('Test for CRUD operations', () => {
    it('should get all plays', async () => {
        const response = await request(app)
            .get('/admin/plays/get')
            .set('Cookie', `token=${token}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a new play', async () => {
        const response = await request(app)
            .post('/admin/plays/new')
            .set('Cookie', `token=${token}`)
            .send(newPlay);
        expect(response.status).toBe(201);
        expect(response.body.insertedId).toBeDefined();
    });

    it('should update a play', async () => {
        const playId = '1'; // Example ID, replace with a valid ID
        const response = await request(app)
            .put(`/admin/plays/${playId}`)
            .set('Cookie', `token=${token}`)
            .send(updatePlay);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Play updated successfully');
    });

    it('should delete a play', async () => {
        const playId = '1'; // Example ID, replace with a valid ID
        const response = await request(app)
            .delete(`/admin/plays/delete/${playId}`)
            .set('Cookie', `token=${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Play deleted successfully');
    });

    it('should verify that a admin has a token', async () => {
     const response = await request(app)
         .get('/admin')
         .set('Cookie', `token=${token}`);
     expect(token !== null);
    })
});
