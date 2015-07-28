Activates email verification on each login. Integrates with all meteor accounts-* packages.

- Can have some roles that are exempted from two factor auth.
- Can be used only if the user connects with a new IP address.

Possible configuration (in settings.json) :
```javascript
{
	twofactorauth-email:{
		active: true/false, (default : true)
		useOnlyIfNewIp: true/false, (default: false)
		exemptedRoles: ['admin', 'moderator'], (default: ['admin'])
	}
}
```
