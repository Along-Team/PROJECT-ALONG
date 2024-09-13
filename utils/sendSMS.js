// const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

// class SMSService {
//   constructor(region, accessKeyId, secretAccessKey) {
//     this.sns = new SNSClient({
//       region: region,
//       credentials: {
//         accessKeyId: accessKeyId,
//         secretAccessKey: secretAccessKey,
//       },
//     });
//   }

//   async sendSMS(contact, otp) {
//     const params = {
//       Message: `Your OTP code is: ${otp}`, // 5 digit code that can have a leading 0
//       PhoneNumber: contact,
//       MessageAttributes: {
//         "AWS.SNS.SMS.SenderID": {
//           DataType: "String",
//           StringValue: "AlongApp",
//         },
//       },
//     };

//     const command = new PublishCommand(params);
//     try {
//       const message = await this.sns.send(command);
//       return message;
//     } catch (error) {
//       console.error("Error sending SMS:", error);
//       throw error;
//     }
//   }
// }

// module.exports = SMSService;

const twilio = require("twilio");

class TwilioService {
  constructor(accountSid, authToken, fromNumber) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  async sendSMS(to, otp) {
    try {
      const message = await this.client.messages.create({
        body: `Your OTP code is: ${otp}`,
        from: this.fromNumber,
        to: to,
      });

      console.log("SMS sent successfully:", message.body);
      return message;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      throw error;
    }
  }
}

module.exports = TwilioService;
