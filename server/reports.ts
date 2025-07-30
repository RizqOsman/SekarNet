import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { storage } from './storage';

interface ReportData {
  customers: any[];
  bills: any[];
  installations: any[];
  supportTickets: any[];
  subscriptions: any[];
  technicianJobs: any[];
  connectionStats: any[];
}

interface ReportOptions {
  format: 'excel' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    status?: string;
    type?: string;
    userId?: number;
  };
}

class ReportGenerator {
  private reportsDir: string;

  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Generate comprehensive report
  async generateReport(reportType: string, options: ReportOptions): Promise<string> {
    const data = await this.fetchReportData(options);
    
    switch (options.format) {
      case 'excel':
        return this.generateExcelReport(reportType, data, options);
      case 'pdf':
        return this.generatePDFReport(reportType, data, options);
      default:
        throw new Error('Unsupported report format');
    }
  }

  // Fetch data for reports
  private async fetchReportData(options: ReportOptions): Promise<ReportData> {
    const { dateRange, filters } = options;

    // Fetch all data (in real implementation, you would add date and filter conditions)
    const customers = await storage.getAllUsers();
    const bills = await storage.getAllBills();
    const installations = await storage.getAllInstallationRequests();
    const supportTickets = await storage.getAllSupportTickets();
    const subscriptions = await storage.getAllSubscriptions();
    const technicianJobs = await storage.getAllTechnicianJobs();
    const connectionStats = await storage.getAllConnectionStats();

    return {
      customers,
      bills,
      installations,
      supportTickets,
      subscriptions,
      technicianJobs,
      connectionStats
    };
  }

  // Generate Excel report
  private async generateExcelReport(reportType: string, data: ReportData, options: ReportOptions): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const filename = `sekar-net-${reportType}-${Date.now()}.xlsx`;
    const filepath = path.join(this.reportsDir, filename);

    // Add company info
    const companySheet = workbook.addWorksheet('Company Info');
    companySheet.columns = [
      { header: 'Property', key: 'property', width: 20 },
      { header: 'Value', key: 'value', width: 40 }
    ];
    companySheet.addRows([
      { property: 'Company Name', value: 'SEKAR NET' },
      { property: 'Report Type', value: reportType },
      { property: 'Generated Date', value: new Date().toLocaleString() },
      { property: 'Report Format', value: 'Excel' }
    ]);

    // Customer Report
    if (reportType === 'customers' || reportType === 'all') {
      const customerSheet = workbook.addWorksheet('Customers');
      customerSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Created Date', key: 'createdAt', width: 20 }
      ];

      data.customers.forEach(customer => {
        customerSheet.addRow({
          id: customer.id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone || 'N/A',
          address: customer.address || 'N/A',
          role: customer.role,
          createdAt: new Date(customer.createdAt).toLocaleDateString()
        });
      });
    }

    // Billing Report
    if (reportType === 'billing' || reportType === 'all') {
      const billingSheet = workbook.addWorksheet('Billing');
      billingSheet.columns = [
        { header: 'Bill ID', key: 'id', width: 10 },
        { header: 'Customer', key: 'customerName', width: 25 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Due Date', key: 'dueDate', width: 20 },
        { header: 'Period', key: 'period', width: 15 },
        { header: 'Payment Date', key: 'paymentDate', width: 20 }
      ];

      // Get customer names for bills
      const customerMap = new Map(data.customers.map(c => [c.id, c.fullName]));

      data.bills.forEach(bill => {
        billingSheet.addRow({
          id: bill.id,
          customerName: customerMap.get(bill.userId) || 'Unknown',
          amount: `Rp ${(bill.amount / 100).toLocaleString()}`,
          status: bill.status,
          dueDate: new Date(bill.dueDate).toLocaleDateString(),
          period: bill.period,
          paymentDate: bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : 'N/A'
        });
      });

      // Add summary
      const summarySheet = workbook.addWorksheet('Billing Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 }
      ];

      const totalBills = data.bills.length;
      const paidBills = data.bills.filter(b => b.status === 'paid').length;
      const unpaidBills = data.bills.filter(b => b.status === 'unpaid').length;
      const totalRevenue = data.bills
        .filter(b => b.status === 'paid')
        .reduce((sum, b) => sum + b.amount, 0);

      summarySheet.addRows([
        { metric: 'Total Bills', value: totalBills },
        { metric: 'Paid Bills', value: paidBills },
        { metric: 'Unpaid Bills', value: unpaidBills },
        { metric: 'Payment Rate', value: `${((paidBills / totalBills) * 100).toFixed(2)}%` },
        { metric: 'Total Revenue', value: `Rp ${(totalRevenue / 100).toLocaleString()}` }
      ]);
    }

    // Installation Report
    if (reportType === 'installations' || reportType === 'all') {
      const installationSheet = workbook.addWorksheet('Installations');
      installationSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Customer', key: 'customerName', width: 25 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Preferred Date', key: 'preferredDate', width: 20 },
        { header: 'Created Date', key: 'createdAt', width: 20 }
      ];

      const customerMap = new Map(data.customers.map(c => [c.id, c.fullName]));

      data.installations.forEach(installation => {
        installationSheet.addRow({
          id: installation.id,
          customerName: customerMap.get(installation.userId) || 'Unknown',
          address: installation.address,
          status: installation.status,
          preferredDate: installation.preferredDate ? new Date(installation.preferredDate).toLocaleDateString() : 'N/A',
          createdAt: new Date(installation.createdAt).toLocaleDateString()
        });
      });
    }

    // Support Tickets Report
    if (reportType === 'support' || reportType === 'all') {
      const supportSheet = workbook.addWorksheet('Support Tickets');
      supportSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Customer', key: 'customerName', width: 25 },
        { header: 'Subject', key: 'subject', width: 40 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Priority', key: 'priority', width: 15 },
        { header: 'Created Date', key: 'createdAt', width: 20 }
      ];

      const customerMap = new Map(data.customers.map(c => [c.id, c.fullName]));

      data.supportTickets.forEach(ticket => {
        supportSheet.addRow({
          id: ticket.id,
          customerName: customerMap.get(ticket.userId) || 'Unknown',
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: new Date(ticket.createdAt).toLocaleDateString()
        });
      });
    }

    // Save workbook
    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  // Generate PDF report
  private async generatePDFReport(reportType: string, data: ReportData, options: ReportOptions): Promise<string> {
    const filename = `sekar-net-${reportType}-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    const doc = new PDFDocument({ margin: 50 });

    // Pipe to file
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24)
       .text('SEKAR NET', { align: 'center' })
       .fontSize(16)
       .text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, { align: 'center' })
       .fontSize(12)
       .text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' })
       .moveDown(2);

    // Company Info
    doc.fontSize(14)
       .text('Company Information')
       .fontSize(10)
       .text(`Company: SEKAR NET`)
       .text(`Report Type: ${reportType}`)
       .text(`Format: PDF`)
       .moveDown(2);

    // Customer Report
    if (reportType === 'customers' || reportType === 'all') {
      doc.fontSize(14)
         .text('Customer List')
         .moveDown(1);

      data.customers.forEach((customer, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. ${customer.fullName}`)
           .fontSize(8)
           .text(`   Email: ${customer.email}`)
           .text(`   Phone: ${customer.phone || 'N/A'}`)
           .text(`   Role: ${customer.role}`)
           .moveDown(0.5);
      });
      doc.moveDown(2);
    }

    // Billing Report
    if (reportType === 'billing' || reportType === 'all') {
      doc.fontSize(14)
         .text('Billing Summary')
         .moveDown(1);

      const customerMap = new Map(data.customers.map(c => [c.id, c.fullName]));
      const totalBills = data.bills.length;
      const paidBills = data.bills.filter(b => b.status === 'paid').length;
      const totalRevenue = data.bills
        .filter(b => b.status === 'paid')
        .reduce((sum, b) => sum + b.amount, 0);

      doc.fontSize(10)
         .text(`Total Bills: ${totalBills}`)
         .text(`Paid Bills: ${paidBills}`)
         .text(`Payment Rate: ${((paidBills / totalBills) * 100).toFixed(2)}%`)
         .text(`Total Revenue: Rp ${(totalRevenue / 100).toLocaleString()}`)
         .moveDown(2);

      // Recent bills
      doc.fontSize(12)
         .text('Recent Bills')
         .moveDown(1);

      data.bills.slice(0, 10).forEach((bill, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. Bill #${bill.id}`)
           .fontSize(8)
           .text(`   Customer: ${customerMap.get(bill.userId) || 'Unknown'}`)
           .text(`   Amount: Rp ${(bill.amount / 100).toLocaleString()}`)
           .text(`   Status: ${bill.status}`)
           .text(`   Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`)
           .moveDown(0.5);
      });
      doc.moveDown(2);
    }

    // Installation Report
    if (reportType === 'installations' || reportType === 'all') {
      doc.fontSize(14)
         .text('Installation Requests')
         .moveDown(1);

      const customerMap = new Map(data.customers.map(c => [c.id, c.fullName]));

      data.installations.forEach((installation, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. Installation #${installation.id}`)
           .fontSize(8)
           .text(`   Customer: ${customerMap.get(installation.userId) || 'Unknown'}`)
           .text(`   Address: ${installation.address}`)
           .text(`   Status: ${installation.status}`)
           .moveDown(0.5);
      });
      doc.moveDown(2);
    }

    // Support Tickets Report
    if (reportType === 'support' || reportType === 'all') {
      doc.fontSize(14)
         .text('Support Tickets')
         .moveDown(1);

      const customerMap = new Map(data.customers.map(c => [c.id, c.fullName]));

      data.supportTickets.forEach((ticket, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. Ticket #${ticket.id}`)
           .fontSize(8)
           .text(`   Customer: ${customerMap.get(ticket.userId) || 'Unknown'}`)
           .text(`   Subject: ${ticket.subject}`)
           .text(`   Status: ${ticket.status}`)
           .text(`   Priority: ${ticket.priority}`)
           .moveDown(0.5);
      });
      doc.moveDown(2);
    }

    // Footer
    doc.fontSize(10)
       .text('This report was generated automatically by SEKAR NET system.', { align: 'center' });

    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  // Generate specific report types
  async generateCustomerReport(options: ReportOptions): Promise<string> {
    return this.generateReport('customers', options);
  }

  async generateBillingReport(options: ReportOptions): Promise<string> {
    return this.generateReport('billing', options);
  }

  async generateInstallationReport(options: ReportOptions): Promise<string> {
    return this.generateReport('installations', options);
  }

  async generateSupportReport(options: ReportOptions): Promise<string> {
    return this.generateReport('support', options);
  }

  async generateComprehensiveReport(options: ReportOptions): Promise<string> {
    return this.generateReport('all', options);
  }

  // Get available reports
  getAvailableReports(): Array<{ type: string; name: string; description: string }> {
    return [
      {
        type: 'customers',
        name: 'Customer Report',
        description: 'Complete list of all customers with their details'
      },
      {
        type: 'billing',
        name: 'Billing Report',
        description: 'Billing summary and payment statistics'
      },
      {
        type: 'installations',
        name: 'Installation Report',
        description: 'Installation requests and their status'
      },
      {
        type: 'support',
        name: 'Support Report',
        description: 'Support tickets and resolution statistics'
      },
      {
        type: 'all',
        name: 'Comprehensive Report',
        description: 'Complete system overview with all data'
      }
    ];
  }

  // Clean up old reports
  async cleanupOldReports(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const files = fs.readdirSync(this.reportsDir);
    
    for (const file of files) {
      const filepath = path.join(this.reportsDir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filepath);
        console.log(`Deleted old report: ${file}`);
      }
    }
  }
}

export default new ReportGenerator(); 