import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index';
import { storage } from '../server/storage';

// Test data
const testUsers = {
  admin: {
    username: 'admin_test',
    email: 'admin@test.com',
    password: 'admin123',
    fullName: 'Admin Test',
    role: 'admin'
  },
  customer: {
    username: 'customer_test',
    email: 'customer@test.com',
    password: 'customer123',
    fullName: 'Customer Test',
    role: 'customer'
  },
  technician: {
    username: 'technician_test',
    email: 'technician@test.com',
    password: 'technician123',
    fullName: 'Technician Test',
    role: 'technician'
  }
};

let adminToken: string;
let customerToken: string;
let technicianToken: string;
let testPackageId: number;
let testSubscriptionId: number;
let testInstallationId: number;
let testBillId: number;
let testTicketId: number;

describe('SEKAR NET API Tests', () => {
  beforeAll(async () => {
    // Clear test data
    await storage.clearTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await storage.clearTestData();
  });

  describe('Authentication', () => {
    it('should register a new admin user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.admin);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.role).toBe('admin');
      
      adminToken = response.body.token;
    });

    it('should register a new customer user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.customer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('customer');
      
      customerToken = response.body.token;
    });

    it('should register a new technician user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.technician);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('technician');
      
      technicianToken = response.body.token;
    });

    it('should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsers.customer.username,
          password: testUsers.customer.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe(testUsers.customer.username);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsers.customer.username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Packages', () => {
    it('should get all packages', async () => {
      const response = await request(app)
        .get('/api/packages');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create new package (admin only)', async () => {
      const newPackage = {
        name: 'Test Package',
        description: 'Test package description',
        speed: 100,
        uploadSpeed: 50,
        price: 500000,
        features: ['Unlimited', '24/7 Support']
      };

      const response = await request(app)
        .post('/api/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPackage);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newPackage.name);
      testPackageId = response.body.id;
    });

    it('should reject package creation for non-admin', async () => {
      const newPackage = {
        name: 'Unauthorized Package',
        description: 'This should fail',
        speed: 50,
        uploadSpeed: 25,
        price: 250000
      };

      const response = await request(app)
        .post('/api/packages')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(newPackage);

      expect(response.status).toBe(403);
    });
  });

  describe('Subscriptions', () => {
    it('should create subscription', async () => {
      const subscription = {
        userId: 2, // customer user id
        packageId: testPackageId
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(subscription);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('active');
      testSubscriptionId = response.body.id;
    });

    it('should get user subscriptions', async () => {
      const response = await request(app)
        .get('/api/subscriptions')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Installation Requests', () => {
    it('should create installation request', async () => {
      const installation = {
        userId: 2,
        packageId: testPackageId,
        address: 'Jl. Test No. 123, Jakarta',
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Test installation request'
      };

      const response = await request(app)
        .post('/api/installation-requests')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(installation);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('pending');
      testInstallationId = response.body.id;
    });

    it('should get installation requests', async () => {
      const response = await request(app)
        .get('/api/installation-requests')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update installation status (admin)', async () => {
      const update = {
        status: 'scheduled',
        technicianId: 3 // technician user id
      };

      const response = await request(app)
        .patch(`/api/installation-requests/${testInstallationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('scheduled');
    });
  });

  describe('Bills', () => {
    it('should create bill (admin only)', async () => {
      const bill = {
        userId: 2,
        subscriptionId: testSubscriptionId,
        amount: 500000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        period: 'December 2024'
      };

      const response = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bill);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('unpaid');
      testBillId = response.body.id;
    });

    it('should get user bills', async () => {
      const response = await request(app)
        .get('/api/bills')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update bill payment', async () => {
      const payment = {
        paymentProof: 'https://example.com/payment-proof.jpg'
      };

      const response = await request(app)
        .patch(`/api/bills/${testBillId}/payment`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(payment);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('paid');
    });
  });

  describe('Support Tickets', () => {
    it('should create support ticket', async () => {
      const ticket = {
        userId: 2,
        subject: 'Internet connection issue',
        description: 'My internet is very slow today',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/support-tickets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(ticket);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('new');
      testTicketId = response.body.id;
    });

    it('should get support tickets', async () => {
      const response = await request(app)
        .get('/api/support-tickets')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update ticket status (technician)', async () => {
      const update = {
        status: 'in_progress',
        technicianId: 3
      };

      const response = await request(app)
        .patch(`/api/support-tickets/${testTicketId}`)
        .set('Authorization', `Bearer ${technicianToken}`)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('in_progress');
    });
  });

  describe('Notifications', () => {
    it('should create notification (admin only)', async () => {
      const notification = {
        title: 'Scheduled Maintenance',
        message: 'We will perform maintenance on December 25th',
        type: 'maintenance',
        targetRole: 'customer'
      };

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notification);

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('maintenance');
    });

    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Technician Jobs', () => {
    it('should create technician job (admin only)', async () => {
      const job = {
        technicianId: 3,
        installationId: testInstallationId,
        jobType: 'installation',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Installation job for test customer'
      };

      const response = await request(app)
        .post('/api/technician-jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(job);

      expect(response.status).toBe(201);
      expect(response.body.jobType).toBe('installation');
    });

    it('should get technician jobs', async () => {
      const response = await request(app)
        .get('/api/technician-jobs')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Connection Stats', () => {
    it('should create connection stat', async () => {
      const stat = {
        userId: 2,
        downloadSpeed: 95.5,
        uploadSpeed: 45.2,
        ping: 15.3
      };

      const response = await request(app)
        .post('/api/connection-stats')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(stat);

      expect(response.status).toBe(201);
      expect(response.body.downloadSpeed).toBe(95.5);
    });

    it('should get connection stats', async () => {
      const response = await request(app)
        .get('/api/connection-stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('User Activities', () => {
    it('should get user activities', async () => {
      const response = await request(app)
        .get('/api/user-activities')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });

    it('should handle missing token', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
    });

    it('should handle invalid route', async () => {
      const response = await request(app)
        .get('/api/invalid-route');

      expect(response.status).toBe(404);
    });
  });
}); 