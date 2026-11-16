<?php
/**
 * SMTP account for the contact form (public/api/contact.php).
 *
 * Copy this file to one of:
 *   - public/api/contact.config.php                  (local dev; git-ignored)
 *   - /home2/moadalms/portfolio-contact.config.php   (the server, one level above public_html)
 * then fill it in. Never commit the copy: it holds a password and this repository is public.
 *
 * Gmail: turn on 2-Step Verification, create an "App password" at
 * https://myaccount.google.com/apppasswords and paste its 16 characters as `pass`.
 * A cPanel mailbox works too: host = mail.<your-domain>, user = the full address.
 */
return [
    'host' => 'smtp.gmail.com',
    'port' => 465,                      // 465 = TLS from the start; 587 = STARTTLS
    'user' => 'you@gmail.com',          // the account that sends
    'pass' => 'xxxx xxxx xxxx xxxx',
    // 'to'   => 'you@gmail.com',       // where messages land; defaults to the address in contact.php
];
