import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'noreply@sekar.net',
    pass: process.env.SMTP_PASS || 'your-email-password'
  }
});

// SMS configuration (Twilio)
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID || 'your-account-sid',
  process.env.TWILIO_AUTH_TOKEN || 'your-auth-token'
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationData {
  type: 'email' | 'sms' | 'both';
  to: string;
  subject?: string;
  message: string;
  template?: string;
  data?: any;
}

class NotificationService {
  // Email templates
  private emailTemplates = {
    welcome: (data: any): EmailTemplate => ({
      subject: 'Selamat Datang di SEKAR NET',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SEKAR NET</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Selamat Datang, ${data.fullName}!</h2>
            <p>Terima kasih telah mendaftar di SEKAR NET. Akun Anda telah berhasil dibuat.</p>
            <p><strong>Username:</strong> ${data.username}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p>Anda sekarang dapat mengakses semua fitur SEKAR NET melalui aplikasi kami.</p>
            <div style="margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Akses Aplikasi
              </a>
            </div>
            <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>
          </div>
        </div>
      `,
      text: `Selamat Datang di SEKAR NET\n\nHalo ${data.fullName},\n\nTerima kasih telah mendaftar di SEKAR NET. Akun Anda telah berhasil dibuat.\n\nUsername: ${data.username}\nEmail: ${data.email}\n\nAnda sekarang dapat mengakses semua fitur SEKAR NET melalui aplikasi kami.\n\nJika Anda memiliki pertanyaan, silakan hubungi tim support kami.`
    }),

    paymentReminder: (data: any): EmailTemplate => ({
      subject: 'Pengingat Pembayaran - SEKAR NET',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SEKAR NET</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Pengingat Pembayaran</h2>
            <p>Halo ${data.customerName},</p>
            <p>Tagihan Anda untuk periode <strong>${data.period}</strong> akan jatuh tempo dalam <strong>${data.daysUntilDue} hari</strong>.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Detail Tagihan:</strong></p>
              <p>Nomor Tagihan: ${data.billNumber}</p>
              <p>Jumlah: Rp ${data.amount.toLocaleString()}</p>
              <p>Jatuh Tempo: ${data.dueDate}</p>
            </div>
            <p>Silakan lakukan pembayaran melalui QRIS atau transfer bank untuk menghindari pemutusan layanan.</p>
            <div style="margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/billing" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Bayar Sekarang
              </a>
            </div>
          </div>
        </div>
      `,
      text: `Pengingat Pembayaran - SEKAR NET\n\nHalo ${data.customerName},\n\nTagihan Anda untuk periode ${data.period} akan jatuh tempo dalam ${data.daysUntilDue} hari.\n\nDetail Tagihan:\nNomor Tagihan: ${data.billNumber}\nJumlah: Rp ${data.amount.toLocaleString()}\nJatuh Tempo: ${data.dueDate}\n\nSilakan lakukan pembayaran melalui QRIS atau transfer bank untuk menghindari pemutusan layanan.`
    }),

    installationScheduled: (data: any): EmailTemplate => ({
      subject: 'Instalasi Dijadwalkan - SEKAR NET',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SEKAR NET</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Instalasi Dijadwalkan</h2>
            <p>Halo ${data.customerName},</p>
            <p>Permintaan instalasi internet Anda telah dijadwalkan.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Detail Instalasi:</strong></p>
              <p>Tanggal: ${data.scheduledDate}</p>
              <p>Alamat: ${data.address}</p>
              <p>Paket: ${data.packageName}</p>
              <p>Teknisi: ${data.technicianName}</p>
            </div>
            <p>Mohon pastikan ada orang di rumah pada waktu yang dijadwalkan.</p>
            <p>Jika ada perubahan jadwal, tim kami akan menghubungi Anda.</p>
          </div>
        </div>
      `,
      text: `Instalasi Dijadwalkan - SEKAR NET\n\nHalo ${data.customerName},\n\nPermintaan instalasi internet Anda telah dijadwalkan.\n\nDetail Instalasi:\nTanggal: ${data.scheduledDate}\nAlamat: ${data.address}\nPaket: ${data.packageName}\nTeknisi: ${data.technicianName}\n\nMohon pastikan ada orang di rumah pada waktu yang dijadwalkan.\n\nJika ada perubahan jadwal, tim kami akan menghubungi Anda.`
    }),

    supportTicketUpdate: (data: any): EmailTemplate => ({
      subject: 'Update Tiket Support - SEKAR NET',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SEKAR NET</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Update Tiket Support</h2>
            <p>Halo ${data.customerName},</p>
            <p>Tiket support Anda telah diperbarui.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Detail Tiket:</strong></p>
              <p>ID Tiket: #${data.ticketId}</p>
              <p>Subjek: ${data.subject}</p>
              <p>Status: ${data.status}</p>
              <p>Update: ${data.update}</p>
            </div>
            <p>Tim support kami akan terus mengupdate status tiket Anda.</p>
          </div>
        </div>
      `,
      text: `Update Tiket Support - SEKAR NET\n\nHalo ${data.customerName},\n\nTiket support Anda telah diperbarui.\n\nDetail Tiket:\nID Tiket: #${data.ticketId}\nSubjek: ${data.subject}\nStatus: ${data.status}\nUpdate: ${data.update}\n\nTim support kami akan terus mengupdate status tiket Anda.`
    }),

    maintenanceNotification: (data: any): EmailTemplate => ({
      subject: 'Pemeliharaan Sistem - SEKAR NET',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SEKAR NET</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Pemeliharaan Sistem</h2>
            <p>Halo ${data.customerName},</p>
            <p>Kami akan melakukan pemeliharaan sistem pada waktu berikut:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Jadwal Pemeliharaan:</strong></p>
              <p>Tanggal: ${data.date}</p>
              <p>Waktu: ${data.time}</p>
              <p>Durasi: ${data.duration}</p>
              <p>Dampak: ${data.impact}</p>
            </div>
            <p>Mohon maaf atas ketidaknyamanannya. Kami akan berusaha menyelesaikan pemeliharaan secepat mungkin.</p>
          </div>
        </div>
      `,
      text: `Pemeliharaan Sistem - SEKAR NET\n\nHalo ${data.customerName},\n\nKami akan melakukan pemeliharaan sistem pada waktu berikut:\n\nJadwal Pemeliharaan:\nTanggal: ${data.date}\nWaktu: ${data.time}\nDurasi: ${data.duration}\nDampak: ${data.impact}\n\nMohon maaf atas ketidaknyamanannya. Kami akan berusaha menyelesaikan pemeliharaan secepat mungkin.`
    })
  };

  // Send email notification
  async sendEmail(to: string, template: string, data: any): Promise<boolean> {
    try {
      const emailTemplate = this.emailTemplates[template as keyof typeof this.emailTemplates];
      if (!emailTemplate) {
        throw new Error(`Email template '${template}' not found`);
      }

      const { subject, html, text } = emailTemplate(data);

      const mailOptions = {
        from: `"SEKAR NET" <${process.env.SMTP_USER || 'noreply@sekar.net'}>`,
        to: to,
        subject: subject,
        html: html,
        text: text
      };

      const result = await emailTransporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send SMS notification
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // Remove any non-digit characters from phone number
      const cleanPhone = to.replace(/\D/g, '');
      
      // Add country code if not present (assuming Indonesia +62)
      const phoneNumber = cleanPhone.startsWith('62') ? `+${cleanPhone}` : `+62${cleanPhone}`;

      const result = await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log('SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Send notification (email, SMS, or both)
  async sendNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      const { type, to, subject, message, template, data } = notificationData;
      let success = true;

      if (type === 'email' || type === 'both') {
        if (template && data) {
          success = await this.sendEmail(to, template, data) && success;
        } else if (subject && message) {
          // Send simple email
          const emailTemplate = {
            subject: subject,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><p>${message}</p></div>`,
            text: message
          };
          success = await this.sendEmail(to, 'custom', { ...emailTemplate }) && success;
        }
      }

      if (type === 'sms' || type === 'both') {
        success = await this.sendSMS(to, message) && success;
      }

      return success;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Specific notification methods
  async sendWelcomeEmail(email: string, userData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'email',
      to: email,
      message: `Selamat datang di SEKAR NET, ${userData.fullName}!`,
      template: 'welcome',
      data: userData
    });
  }

  async sendPaymentReminder(email: string, phone: string, billData: any): Promise<boolean> {
    const emailSuccess = await this.sendNotification({
      type: 'email',
      to: email,
      message: `Pengingat pembayaran untuk tagihan ${billData.billNumber}`,
      template: 'paymentReminder',
      data: billData
    });

    const smsSuccess = await this.sendNotification({
      type: 'sms',
      to: phone,
      message: `SEKAR NET: Tagihan Rp ${billData.amount.toLocaleString()} jatuh tempo dalam ${billData.daysUntilDue} hari. Bayar sekarang di aplikasi SEKAR NET.`
    });

    return emailSuccess && smsSuccess;
  }

  async sendInstallationScheduled(email: string, phone: string, installationData: any): Promise<boolean> {
    const emailSuccess = await this.sendNotification({
      type: 'email',
      to: email,
      message: `Instalasi dijadwalkan untuk ${installationData.scheduledDate}`,
      template: 'installationScheduled',
      data: installationData
    });

    const smsSuccess = await this.sendNotification({
      type: 'sms',
      to: phone,
      message: `SEKAR NET: Instalasi dijadwalkan pada ${installationData.scheduledDate}. Teknisi: ${installationData.technicianName}. Mohon pastikan ada orang di rumah.`
    });

    return emailSuccess && smsSuccess;
  }

  async sendSupportUpdate(email: string, ticketData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'email',
      to: email,
      message: `Update tiket support: ${ticketData.title}`,
      template: 'supportTicketUpdate',
      data: ticketData
    });
  }

  async sendMaintenanceNotification(email: string, maintenanceData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'email',
      to: email,
      message: `Notifikasi maintenance: ${maintenanceData.title}`,
      template: 'maintenanceNotification',
      data: maintenanceData
    });
  }

  // Broadcast notifications to multiple users
  async broadcastNotification(users: Array<{ email: string; phone?: string }>, notificationData: NotificationData): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const user of users) {
      const result = await this.sendNotification({
        ...notificationData,
        to: user.email
      });

      if (result) {
        success++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed };
  }
}

export default new NotificationService(); 