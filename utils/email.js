const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (options) => {
  const email = process.env.EMAIL;
  const password = process.env.EMAIL_PASSWORD;
  const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: email,
      pass: password,
    },
    debug: true
  });

  const compileTemplate = (filePath, data) => {
    const source = fs.readFileSync(filePath, "utf-8"); 
    const template = handlebars.compile(source); 
    return template(data); 
  };

  const templatePath = path.join(
    __dirname,
    "../templates",
    `${options.template}.hbs`
  );

 
  const htmlToSend = compileTemplate(templatePath, options.data);

  
  const mailOptions = {
    from: "AREWAXTRA <samueliy185@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: htmlToSend,
  };


  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
