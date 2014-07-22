/**
 * Encrypted Section: javascript for normal view (not in management mode)
 */
$(document).ready(function () {
    "use strict";

    if (ip.isManagementState) {
        console.log("isManagementState");
        return;
    }
    console.log("running");
    
    //Initialize all EncryptedSections on the page
    $(".encryptedSection").each(function() {
        //TODO: allow unlocking only for certain admin users.
        var encSectController = new EncryptedSectionController(this);
    });
    
});

/**
 * controller class for every Encrypted Section on the page
 */
var EncryptedSectionController = function(widget) {
    this.widget = wiget;
    this.data   = json_decode(widget.attr('data-widgetdata'));
    
    if (!data.encrypted || !data.iv || !data.salt) {
        console.log("ERROR: missing data for EncryptedSection. Maybe no attr 'data-widgetdata'? Will not be able to decrypt.");
        return;
    }
    
     // jQueryUI tooltip for lock symbol
    widget.find(".encUnlockSymbol").tooltip({
        content: data.encrypted ? "Click to unlock this section." : "Click to set initial password.",
        position: { my: "left center", at: "right+10 center"},
        hide: 0  // hide immideately, no fade
    });
   
    widget.find(".encUnlockSymbol").click(
        $.proxy(askForPassword, this, null)
    );
};

/** 
 * Unlock an encrypted section in readonly mode. (no TinyMCE Editor)
 * @param data  widgetdata needed for decryption (with encrypted, iv and salt)
 * @param newPassword   pasword that the user entered for decryption. If empty, user will be asked for password.
 * Will show alert if password id wrong.
 */
EncryptedSectionController.prototype.unlockSection = function(newPassword) {
    $(".encUnlockSymbol").tooltip("close");
    debout("TRACE", "unlockSection(data.encrypted='"+this.data.encrypted+"' "+(newPassword ? "with" : "without")+" password given)");
    if (!newPassword) {
        this.askForPassword();
        return;
    }
    try{
        var plainText = decrypt(data, newPassword); // MAY THROW exception if password is wrong.
        this.widget.html(plainText);
        //MAYBE: change background of .encryptedSection
    } catch (errorMsg) {
        debout("INFO: "+errorMsg);
        alert("Wrong password!");
    }
}; 


 /**
* Aks user for the password of an encrypted section.
* This will be called on unlock and when there already is some encrypted content in the section.
*/
EncryptedSectionController.prototype.askForPassword = function() {
    debout("TRACE", "askForPassword");
    var popup = $('#AskForPasswordPopup');
    var passwordInput = popup.find('#password');
    var confirmButton = popup.find('.ipsConfirm');
    
    // only enable confirm button if password length > 1 char
    passwordInput.val("");
    var evtData = {
        passwordInput: passwordInput,
        confirmButton: confirmButton
    };
    passwordInput.keyup(evtData, checkPassword);
    
    // onConfirm try to unlock section with the provided password.
    confirmButton.prop('disabled', true);
    confirmButton.off(); // ensure we will not bind second time
    confirmButton.on('click', $.proxy(function() {
        popup.modal('hide');
        this.unlockSection(passwordInput.val());
    }, this));
    
    // open modal popup with bootstrap
    popup.modal({
        backdrop : "static" // no close with click outside. Close with ESC is allowed.
    });
    passwordInput.focus();
};







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
