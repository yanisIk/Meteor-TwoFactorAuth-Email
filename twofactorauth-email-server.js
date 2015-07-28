// --------- CONFIGURATION -------------- //
TwoFactorAuth_Email = {
	
	settings: {
		active: true,
		useOnlyIfNewIp: false,
		exemptedRoles: ['admin'],
	},

	startup: function(){
		updateSettingsIfSpecified();
		setEmailVerificationTemplate();
	},

	updateSettingsIfSpecified: function(){
		if(Meteor.settings.twofactorauth-email){
			var active = Meteor.settings.twofactorauth-email.active || TwoFactorAuth_Email.settings.active;
			check(active, boolean);
			TwoFactorAuth_Email.settings.active = active;

			var useOnlyIfNewIp = Meteor.settings.twofactorauth-email.useOnlyIfNewIp || TwoFactorAuth_Email.settings.useOnlyIfNewIp;
			check(useOnlyIfNewIp, boolean);
			TwoFactorAuth_Email.settings.useOnlyIfNewIp = useOnlyIfNewIp;

			var exemptedRoles = Meteor.settings.twofactorauth-email.exemptedRoles || TwoFactorAuth_Email.settings.permittedRoles;
			check(exemptedRoles, Array);
			TwoFactorAuth_Email.settings.permittedRoles = exemptedRoles;
		}
	},

	setEmailVerificationTemplate: function(){
	  // A Function that takes a user object and returns a String for the subject line of the email.
	  Accounts.emailTemplates.verifyEmail.subject = function(user) {
	    return 'Two Factor Auth : Verify your identity';
	  };

	  // A Function that takes a user object and a url, and returns the body text for the email.
	  // Note: if you need to return HTML instead, use Accounts.emailTemplates.verifyEmail.html
	  Accounts.emailTemplates.verifyEmail.text = function(user, url) {
	    return 'Click on the following link to verify your identity and login: ' + url;
	  };
	},

	isTwoFactorAuthActivated: function(){
		return this.settings.active;
	},

	useOnlyIfNewIp: function(){
		return this.settings.useOnlyIfNewIp;
	},

	getTwoFactorAuthExemptedRoles: function(){
		return this.settings.exemptedRoles;
	},

}

Meteor.startup(function(){
	TwoFactorAuth_Email.startup;
});


// ----------------------- //




//On each login attempt
Accounts.validateLoginAttempt(function(attempt){
  
  if(attempt.user){
  	
  	var user = attempt.user;
  	
  	if(TwoFactorAuth_Email.isTwoFactorAuthActivated()){
	  	
	  	//If the user hasn't one of the exempted roles
	    if(!Roles.userIsInRole(user._id, TwoFactorAuth_Email.getTwoFactorAuthExemptedRoles)){

			if(TwoFactorAuth_Email.useOnlyIfNewIp()){

		  		//If the IP address is different from the last one and the user hasn't one of the exempted roles
		  		if(attempt.connection.clientAddress != user.status.lastLogin.ipAddr){
		  			console.log('[TwoFactorAuth-Email]: User: ',user.username,' connected from a new IP address. Sending email verification to '+user.emails[0].address);
			        Accounts.sendVerificationEmail(user._id);
			        //Throw error to signal to the user what is happening
			        throw new Meteor.Error(403, "Two Factor Auth: You connected from a new IP address, an email has been sent to verify your identity");
		  		}
		  		else{
		  			return true;
		  		}
	  		
	  		}
	  	
	      
	        //If the user hasn't its primary email verified
	        if (user.emails && !user.emails[0].verified ){     
	          console.log('[TwoFactorAuth-Email]: Identity not verified for user: ',user.username,'. Sending email verification to '+user.emails[0].address);
	          Accounts.sendVerificationEmail(user._id);	        
	          //Throw error to signal to the user what is happening
	          throw new Meteor.Error(403, "Two Factor Auth: An email has been sent to verify your identity");
	        }

	    }

	    return true;
	
	}
	else{
	    return true;
	}
  }

});


//On each logout, unverify email
UserStatus.events.on("connectionLogout", function(fields) { 
    if(TwoFactorAuth_Email.isTwoFactorAuthActivated()){
      unverifyEmailForUser(fields.userId);
      console.log("unverified email for userid "+fields.userId);
    } 
});

//Called at each logout
var unverifyEmailForUser = function(userId){
    check(userId, String);
    if(Meteor.users.find(userId).count() == 0){
        throw new Meteor.Error(500, "User not found");
    }
    Meteor.users.update({"_id": userId, "emails.verified": true}, {$set : {"emails.$.verified": false}});
}

