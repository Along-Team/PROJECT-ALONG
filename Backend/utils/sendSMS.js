const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

class SMSService {
  constructor(region, accessKeyId, secretAccessKey) {
    this.sns = new SNSClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async sendSMS(contact, otp) {
    const params = {
      Message: `Your OTP code is: ${otp}`, // 5 digit code that can have a leading 0
      PhoneNumber: contact,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "AlongApp",
        },
      },
    };

    const command = new PublishCommand(params);
    try {
      const message = await this.sns.send(command);
      return message;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw error;
    }
  }
}

module.exports = SMSService;
