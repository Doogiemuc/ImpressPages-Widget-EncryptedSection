/**
 * Encrypted Section Plugin for Impress Pages 4.
 * 
 * This plugin provides an encrypted section widget for the CMS ImpressPages4. The key feature of this widget is,
 * that its content is encrypted completely on the client, ie. in the browser. The plaintext is never sent to the server.
 * For strong client side encryption the AES algorythm is used.
 *
 * This javascript file contains the management JS which is only loaded in management state of impress pages.
 */
var IpWidget_EncryptedSectionWidget = function() {
    "use strict";

    this.widgetObject = null;
    this.data         = null;
    this.password     = null; // password is only kept in memory of this instance, to make editing easier

    /**
     * Initialize an encrypted section for editing in <b>admin mode</b>.
     * This will not be called when the section is only shown on a page.
     * Initially the section is always locked.
     * @param $widgetObject  jQuery DOM node of this widget
     * @param data parameters for AES algorythm. See {encrypt()}
     *   <pre>array(
     *       salt: salt,                   
     *       numIterations: numIterations,
     *       iv:  iv,
     *       encrypted: encryptedText
     *   )</pre>
     */
    this.init = function($widgetObject, data) {
        debout("INFO", "EncryptedSection.init(Password is "+(this.password ? "": "not")+" set. data.encrypted='"+data.encrypted+"')");
        this.widgetObject = $widgetObject;
        this.password = null;
        data.isLocked = true;
        this.data     = data;

        // jQueryUI tooltip for lock symbol
        $widgetObject.find(".encUnlockSymbol").tooltip({
            content: data.encrypted ? "Click to unlock this section." : "Click to set initial password.",
            position: { my: "left center", at: "right+10 center"},
            hide: 0  // hide immideately, no fade
        });
       
        $widgetObject.find(".encUnlockSymbol").click(
            $.proxy(this.unlockSection, this, null)
        );
    };
    
    /**
     * This is called, when an EncryptedSection is added for the first time.
     * In this case, init() is called first, and then onAdd() is called.
     */
    this.onAdd = function () {
        debout("TRACE", "EncryptedSection.onAdd()");
        this.password     = null;
        this.isLocked     = true;
        this.data.encrypted = "";
        this.askForInitialPassword();   //TOOD: make it configurable via admin settings, wheter to ask for password on add
    };



    /**
     * Initially every encrypted section is locked. When clicking the lock symbol, the section can be unlocked.
     * 
     * If the user alreay provided the password in this session, then the section is immidiately decrypted.
     * If the section contains encrypted content, then the user is asked for a password and the section is decrypted.
     * Otherwise the 
     * 
     * If the section is still empty, e.g. newly added, the user will be asked to set a password.
     * If the section already contains encrypted data, then the user will be asked for the password to decrypt.
     * If the password is already stored in this session, then the section will be decrypted immidiately.
     */
    this.unlockSection = function(newPassword) {
        $(".encUnlockSymbol").tooltip("close");
        debout("TRACE", "unlockSection(data.encrypted='"+this.data.encrypted+"' "+(newPassword ? "with" : "without")+" password given)");
        this.password = newPassword || this.password;
        if (this.password) {
            try{
                var plainText = decrypt(this.data, this.password);  // MAY THROW exception if password is wrong.
                this.isLocked = false;
                this.widgetObject.find('.encryptedSection').html(plainText);
                //MAYBE: change background of .encryptedSection
                this.initTinyMCE();
            } catch (errorMsg) {
                debout("INFO: "+errorMsg);
                this.password = null;
                alert("Wrong password!");
            }
        } else {
            if (this.data.encrypted) {
                if (!this.data.iv || !this.data.salt) {
                    debout("ERROR", "unlockSection(): no iv or salt for decrypting");
                    return;
                }
                this.askForPassword();         // ask for password for client side decryption
            } else {
                this.askForInitialPassword();  // set initial password => will delete content (if there was any)
            }
            // The calls above do not block! 
        }
     };   
     
     /**
      * encrypt the content of the section, save it and 
      * then replace the section's content with the original lock section by simly reloading it.
      */
     this.lockSection = function() {
         this.widgetObject.find('.encryptedSection').tinymce().remove();
         var newPlaintText = this.widgetObject.find('.encryptedSection').html();
         var encryptedData = encrypt(newPlaintText, this.password);
         console.log('EncryptedSection.lockSection(): data.encrypted='+encryptedData.encrypted);
         // Only send the encrypted data to the server! And we do not reload the widget, so that the user can keep editing.
         this.widgetObject.save(encryptedData, true);  // true -> reload section (in locked state)
     }
     
     /*
      * Prepare a fully featured TinyMCE for editing the section's content.
      * Precondition: this.password must be set!
      */
    this.initTinyMCE = function() {
        if (!this.password) {
            debout("ERROR", "Cannot initTinyMCE. Password is not set.");
            return;
        }     
         
        // prepare a fully featured TinyMce
        var customTinyMceConfig      = ipTinyMceConfig();
        //TODO: may be don't allow file_browser_callback, because  this is insecure. External files won't be encrypted.
        customTinyMceConfig.plugins  = customTinyMceConfig.plugins + " advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table contextmenu paste textcolor";
        customTinyMceConfig.menubar  = false;
        customTinyMceConfig.toolbar  = "lock | undo redo | styleselect forecolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image";
        customTinyMceConfig.toolbar1 = null;
        customTinyMceConfig.toolbar2 = null;

        // when content changes, encrypt it on the client, ie. in the browser, and autosave it to our impresspages backend
        var widgetObject = this.widgetObject;
        var password     = this.password;
        var that = this;
        customTinyMceConfig.setup = function(editor) { 
            editor.addButton('lock', {
                text: 'Lock',
                icon: "save",  // 'mce-save' is a TinyMCE default icon from http://icomoon.io
                style: "background: #B00",
                onclick: $.proxy(that.lockSection, that)
            });
            editor.on('change', $.proxy( function(evt) {
                var newPlaintText = widgetObject.find('.encryptedSection').html();
                var encryptedData = encrypt(newPlaintText, password);
                debout("DEBUG", 'EncryptedSection.onChange(): data.encrypted='+encryptedData.encrypted);
                // Only send the encrypted data to the server! And we do not reload the widget, so that the user can keep editing.
                widgetObject.save(encryptedData);  
            }), that);
        };
        
        this.widgetObject.find('.encryptedSection').tinymce(customTinyMceConfig);
        this.widgetObject.find('.encryptedSection').focus();
        
    };

    /**
     * Encrypt the given plaintext with AES.
     * @see https://github.com/digitalbazaar/forge#cipher
     * @param plainText the html contained in the widget
     * @param password the password to encrypt with
     * @return an array with all the AES data that is needed for later decryption
     *         {
     *            salt: salt,                    // the salt used for the PKCS5.PBKDF2() function
     *            numIterations: numIterations,  // num iterations for that function
     *            iv:  iv,                       // the AES initial vector passed to cipher.start()
     *            encrypted: encrypted           // the encryptedText
     *         }
     * 
     */
    var encrypt = function(plainText, password) {
        if (!password) {
            throw "ERROR: EncryptedSection: Empty password given for encryption.";
        }
        if (!plainText) {
            return "";
        }
        
        // generate a random initial vector (IV)
        var forge = window.forge;
        var iv = forge.random.getBytesSync(16);
        
        // generate a password-based 16-byte key with PBDKF2 
        // Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256
        var salt = forge.random.getBytesSync(128);
        var numIterations = 10; //TODO: ftp://ftp.rsasecurity.com/pub/pkcs/pkcs-5v2/pkcs5v2-0.pdf   suggests 1000 iterations (page 7)
        var secretKey = forge.pkcs5.pbkdf2(password, salt, numIterations, 16);
        
        // encrypt plainText using CBC mode    (other possible modes include: CFB, OFB, CTR, and GCM)
        var cipher = forge.cipher.createCipher('AES-CBC', secretKey);
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(plainText));
        cipher.finish();
        
        // save the data that will be needed for decryption
        var encryptedData = {
            salt: salt,
            numIterations: numIterations,
            iv:  iv,
            encrypted: cipher.output.getBytes()
            //Remark: Never ever include the secretKey or password in here!! :-)
        };
        
        debout("DEBUG", "encrypt(): encryptedData.encrypted="+encryptedData.encrypted);
        return encryptedData;            
    };

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
    
    /**
     * Ask user for an <b>initial</b> password of a <b>newly added</b> encrypted section.
     * The new password will be saved in the {this.password} instance variable.
     * Then the section's content will be cleared. (There should not have been any content anyway.)
     */
    this.askForInitialPassword = function() {
        debout("TRACE", "askForInitialPassword");
        var popup = $('#AskForInitialPasswordPopup');
        var confirmButton = popup.find('.ipsConfirm');
        var passwordInput = popup.find('#password');
        var passwordCheckInput = popup.find('#passwordCheck');
        
        // only enable confirm button if passwords match and contain at least one char
        passwordInput.val("");
        passwordCheckInput.val("");
        var evtData = {
            confirmButton: confirmButton, 
            pwd1: passwordInput, 
            pwd2: passwordCheckInput
        };
        passwordInput.keyup(evtData, checkNewPassword);
        passwordCheckInput.keyup(evtData, checkNewPassword);
        
        // set  this.password   on Confirm
        confirmButton.prop('disabled', true);
        confirmButton.off(); // ensure we will not bind second time
        
        var that = this;
        confirmButton.on('click', $.proxy( function(){
            // check passwords again, just to make sure
            if (passwordInput.val() == passwordCheckInput.val() &&
                passwordInput.val().length > 0) 
            { 
                popup.on('hidden.bs.modal', function (e) {
                   that.unlockSection(passwordInput.val());
                });
                popup.modal('hide');
            }
        }, this));
        
        // open modal popup with bootstrap
        popup.modal({
            backdrop : "static"
            //keyboard : false    // allow close with ESC. Then no password will be set
        }); 
        passwordInput.focus();
    };
    
    /**
     * Check if two JQuery text input fields for passwords match and contain at least 1 char.
     * If they do, then enable a confirmButton. This function is called onKeyUp of both passwords fields.
     * If any paramter is undefined or has no "value", always disable the confirm button.
     * @param evt JQuery event with the follwing attributes in evt.data:
     *          confirmButton: the confirm button
     *          pwd1: input field for password
     *          pwd2: second input field to check new password
     */
    var checkNewPassword = function(evt) {
        try {
            if (evt.data.pwd1.val().length > 0 && evt.data.pwd1.val() == evt.data.pwd2.val()) {
                evt.data.confirmButton.prop('disabled', false);
                if (evt.which == 13) {                    // click "Confirm" button on return key
                    evt.data.confirmButton.trigger("click");
                }
                return;
            }
        } catch(e) {
            // empty catch
        }
        evt.data.confirmButton.prop('disabled', true);
    };
    
    
    /**
     * Aks user for the password of an encrypted section.
     * This will be called on unlock and when there already is some encrypted content in the section.
     */
    this.askForPassword = function() {
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
            backdrop : "static"  // no close with click outside. Close with ESC is allowed.
        }); 
        passwordInput.focus();
    };
    
    /**
     * enable confirm button only, when at least one character is entered for password
     * @param evt jQuery event with <pre>evt.data = { passworInput, confirmButton }</pre>
     */
    var checkPassword = function(evt) {
        if (evt.data.passwordInput.val() && evt.data.passwordInput.val().length > 0) {
            evt.data.confirmButton.prop('disabled', false);
            /*
            if (evt.which == 13) {
                evt.data.confirmButton.trigger("click");  // click "Confirm" button on return
            }
            */
        } else {
            evt.data.confirmButton.prop('disabled', true);
        }
    };
    
    
    // set to true if you want some debuggin output in the browsers console.
    var DEBUG = true;
    
    /**
     * poor mans debuggin output 
     */
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
    
};


