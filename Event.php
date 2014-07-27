<?php
/**
 * Event handler for Encrypted Section Plugin
 * Add JavaScript and CSS files for normal view of encrypted section widget. 
 */
namespace Plugin\EncryptedSection;
 
class Event
{
    /**
     * add links to EncryptedSection.css and EncryptedSection JavaScript for view mode.
     * before the plugin's controller is loaded.
     */
    public static function ipBeforeController()
    {
        // Bootstrap Javascript
        ipAddCss('assets/bootstrap.min.css');
        ipAddJs ('assets/bootstrap.min.js');
         
        // www.http://bootstrapvalidator.com  form validation library
        ipAddCss('assets/BootstrapValidator.min.css');
        ipAddJs ('assets/BootstrapValidator.min.js');
        
        // Controller for the Encrypted Section when shown to normal users (non admins)
        ipAddCss('Widget/EncryptedSectionWidget/assets/EncryptedSectionWidget.css');
        ipAddJs ('assets/EncryptedSectionController.js');
    }
 
}
