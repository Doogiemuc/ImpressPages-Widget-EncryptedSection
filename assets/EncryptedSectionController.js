/**
 * Controller for an Encrpyted section when shown in normal view (not in management mode)
 * User can unlock the section, when he knows the password.
 */
$(document).ready(function () {
    "use strict";
    if (ip.isManagementState) {
        debout("INFO", "isManagementState == true");
        return;
    }
    
    //Initialize all EncryptedSections on the page
    $(".encryptedSection").each(function() {
        //TODO: allow unlocking only for certain admin users.
        var encSectController = new EncryptedSectionController(this);
    });
});

/**
 * Controller class for every Encrypted Section on the page
 */
var EncryptedSectionController = function(widget) {
    this.widget = $(widget);
    try {
        this.data = $.parseJSON(this.widget.attr('data-widgetdata'));
        if (!this.data.encrypted || !this.data.iv || !this.data.salt) throw "No IV or no salt";    
    } catch (e) {
        console.log("WARNING: No encrypted data for EncryptedSection: "+e);
        return;
    }
    console.log("TRACE: EncryptedSectionController data="+this.data.encrypted);
    
    // bootstrap tooltip for lock symbol
    this.widget.find(".encUnlockSymbol").tooltip({
        animation: false,
        placement: "right"
    });
   
    this.initPasswordModal();
};

/**
* Init popup where user can enter the password to unlock an encrypted section.
*/
EncryptedSectionController.prototype.initPasswordModal = function() {
    debout("TRACE", "initPasswordModal");
    var that = this;
    var unlockSymbol  = this.widget.find('.encUnlockSymbol');
    var passwordModal = $('#AskForPasswordPopup'); 
    
    /*
    // init form validation with http://bootstrapvalidator.com
    $('#passwordForm').bootstrapValidator({
        message: 'This value is not valid',
        fields: {
            password: {
                validators: {
                    notEmpty: {
                        message: 'Please enter a password'
                    }
                }
            }
        },
        submitButtons: ".btn-primary"
    });
    */    

    // add handlers (in a quite clever way inspinred by http://jsfiddle.net/jschr/3kgbG/)
    unlockSymbol.on('click', function (e) {
        unlockSymbol.tooltip('hide');
        //$('#passwordForm').bootstrapValidator('resetForm', true);
        passwordModal.find("[name='password']").val('');
        passwordModal.find('.help-error').css('visibility', 'hidden');
        passwordModal.modal({ backdrop: 'static', keyboard: false })
            .on('keyup', "[name='password']", function() {
                $('#passwordForm').find('.help-error').css('visibility', 'hidden');
            })
            .on('click', '.btn-default', function (e) {    // cancel button
                passwordModal.modal('hide');
            })
            .on('click', '.btn-primary', function (e) {     // "delegated event" for confirm button
                var password = passwordModal.find("[name='password']").val();
                that.onCommitPassword(password);
            });
        passwordModal.find("[name='password']").focus();
    });
};

/**
 * Called when confirm button is clicked. Will try to decrypt the section's content.
 * If password is wrong, then an help-error is shown and modal is not closed.
 */
EncryptedSectionController.prototype.onCommitPassword = function(password) {
    debout("TRACE", "onCommitPassword");
    try{
        var plainText = decrypt(this.data, password);  // MAY THROW exception if password is wrong.
    } catch (errorMsg) {
        console.log("INFO: User entered wrong password.");
        //$('#passwordForm').bootstrapValidator('updateStatus', 'password', 'INVALID');
        $('#passwordForm').find('.formGroup').addClass('has-error');
        $('#passwordForm').find('.help-error').css('visibility', 'visible');
        return;
    }
    //MAYBE: change background of .encryptedSection
    $('#AskForPasswordPopup').modal('hide');
    this.widget.html(plainText);
}


/**
 * Decrypt the encryptedData with AES. Will throw exception when password is wrong.
 * @param encryptedData an array with all the AES data that is needed for decryption, as returned by {encrypt()}
 *         {
 *            salt: salt,                    // the salt used for the PKCS5.PBKDF2() function
 *            numIterations: numIterations,  // num iterations for that function
 *            iv:  iv,                       // the AES initial vector passed to cipher.start()
 *            encrypted: encrypted           // the encryptedText in HEX representation
 *         } 
 * @param password the password for decryption
 * @throws Exception if the password is wrong or empty!
 * @return the decrypted plaintext
 * @see https://github.com/digitalbazaar/forge#cipher
 */
var decrypt = function(encryptedData, password) {
    if (!password) {
        throw "ERROR: empty password in decrypt()";
    }
    if (!encryptedData || !encryptedData.encrypted) {
        debout("INFO", "Decrypting empty content. Will return empty plaintext.");
        return "";
    }
    
    // generate a password-based 16-byte key with PBDKF2 
    // The salt and numIterations must be the same as used when encrypting.
    var forge = window.forge; 
    var secretKey = forge.pkcs5.pbkdf2(password, encryptedData.salt, encryptedData.numIterations, 16);

    // decrypt some bytes using CBC mode (w/no padding)
    var decipher = forge.cipher.createDecipher('AES-CBC', secretKey);
    decipher.start({iv: encryptedData.iv});
    decipher.update(forge.util.createBuffer(encryptedData.encrypted));
    var success = decipher.finish();
    
    if (!success) {
        var errorMsg = "Wrong password for encrypted section. Cannot decrypt()";
        debout("INFO", errorMsg);
        throw errorMsg;
    }
    
    var plainText = decipher.output.getBytes();
    return plainText;
};


// -----------------------------------------------------------------------------------

// set to true if you want some debuggin output in the browsers console.
var DEBUG = true;

/** poor man's debuggin output */
var debout = function(level, obj) {
    if (!DEBUG) return;
    level = level || "DEBOUT";
    var msg = "";

    if (typeof obj === "string") {
        msg = obj;
    } else if (typeof msg === "object") {
        for (var property in obj) {
            var value = obj[property];
            msg += property + "=" + value + ", ";
        }
    }
    
    console.log(level+": "+msg);
}
