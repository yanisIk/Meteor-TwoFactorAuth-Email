Package.describe({
  name: 'yanisik:twofactorauth-email',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Activates email verification at each login. Integrates with all accounts-* packages.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('mizzao:user-status');
  api.use('accounts-base');
  api.use('alanning:roles');

  api.addFiles('twofactorauth-email-server.js', 'server');
  api.addFiles('twofactorauth-email-client.js', 'client');

  api.export('TwoFactorAuth_Email', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('yanisik:twofactorauth-email');
  api.addFiles('twofactorauth-email-tests.js');
});
