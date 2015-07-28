Activates email verification at each login. Integrates with all accounts-* packages.

Possible configuration (in settings.json) :

{
	twofactorauth-email:{
		active: true/false, (default : true)
		useOnlyIfNewIp: true/false, (default: false)
		exemptedRoles: ['admin', 'moderator'], (default: ['admin'])
	}
}