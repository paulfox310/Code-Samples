using Microsoft.Extensions.Options;
using Data.Providers;
using Models.Domain;
using Models.Requests;
using Models.Requests.ContactUs;
using SendGrid;
using SendGrid.Helpers.Mail;
using SendGrid.Helpers.Reliability;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class EmailService : IEmailService
    {
        private readonly SendGridConfig _config;
        private readonly SiteConfig _siteConfig;
        private IPasswordService _passwordService;

        public EmailService(IOptions<SendGridConfig> options, IOptions<SiteConfig> siteConfig, IPasswordService passwordService)
        {
            _config = options.Value;
            _siteConfig = siteConfig.Value;
            _passwordService = passwordService;
        }

        private async Task Send(SendGridMessage msg)
        {
            var apiKey = //protected
            var client = //protected
            await client.SendEmailAsync(msg);
        }

        //Waiting on Template
        public async Task Register(ConfirmationEmail model)
        {
            Register register = new Register();
            var msg = new SendGridMessage()
            {
                From = new EmailAddress(_config.Email, _config.Sender),
                Subject = register.Subject,
                HtmlContent = register.HtmlContent
            };
            Dictionary<string, string> subs = new Dictionary<string, string>
            {
                { "-subject-", "Thank you for Registering" },
                { "-fName-", model.FName },
                { "-lName-", model.LName },
                { "-token-", model.Token.ToString() },
                { "-siteUrl-", _siteConfig.SiteUrl }
            };
            msg.AddSubstitutions(subs);
            msg.AddTo(new EmailAddress(model.To, register.Recipient));
            msg.AddBcc(new EmailAddress(_config.Email));
            await Send(msg);
        }

        public async Task ForgotPassword(UserEmail model)
        {
            string tempPassword = _passwordService. //protected
            string salt = BCrypt.BCryptHelper.GenerateSalt();
            string hashedPassword = BCrypt.BCryptHelper.HashPassword(tempPassword, salt);

            _passwordService.Update(model.EmailAddress, hashedPassword);

            ForgotPassword email = new ForgotPassword();
            var msg = new SendGridMessage()
            {
                From = new EmailAddress(_config.Email, _config.Sender),
                Subject = email.Subject,
                HtmlContent = email.HtmlContent
            };
            Dictionary<string, string> subs = new Dictionary<string, string>
            {
                { "-subject-", "Forgot Password" },
                {"-tempPassword-",  tempPassword},
                {"-siteUrl-", _siteConfig.SiteUrl }
            };
            msg.AddSubstitutions(subs);
            msg.AddTo(new EmailAddress(model.EmailAddress, email.Recipient));
            await Send(msg);
        }

        //Removed
    }
}